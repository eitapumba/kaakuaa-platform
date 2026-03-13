import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Challenge } from './challenge.entity';
import { ChallengeParticipant, ParticipantStatus } from './challenge-participant.entity';
import { ChallengesGateway } from './challenges.gateway';
import { UsersService } from '../users/users.service';
import {
  ChallengeCategory, ChallengeStatus, ChallengeType,
  LeagueTier, VerificationMethod,
} from '../../common/types';
import { User } from '../users/user.entity';

interface QueueEntry {
  userId: string;
  user: User;
  category: ChallengeCategory;
  tier: LeagueTier;
  stakeAmount: number;
  joinedAt: number;
  preferLive: boolean;
}

@Injectable()
export class MatchmakingService {
  private readonly logger = new Logger(MatchmakingService.name);

  // Fila de matchmaking em memória (para MVP)
  // Em produção: Redis sorted sets por category+tier
  private queues = new Map<string, QueueEntry[]>();

  constructor(
    @InjectRepository(Challenge)
    private readonly challengeRepo: Repository<Challenge>,
    @InjectRepository(ChallengeParticipant)
    private readonly participantRepo: Repository<ChallengeParticipant>,
    private readonly gateway: ChallengesGateway,
    private readonly usersService: UsersService,
  ) {}

  /**
   * FLOW PRINCIPAL:
   *
   * 1. Usuário escolhe categoria no card
   * 2. Tap "Buscar Desafio" → entra na fila
   * 3. Backend procura oponente na mesma categoria+tier
   * 4. Se achou → cria Challenge, faz match, emite WebSocket pros dois
   * 5. Se não achou → fica na fila, emite "searching..." via WebSocket
   * 6. Quando alguém entra e faz match → emite pros dois
   */
  async joinQueue(
    userId: string,
    category: ChallengeCategory,
    stakeAmount: number,
    preferLive = true,
  ): Promise<{ status: 'matched' | 'searching'; challenge?: Challenge }> {
    const user = await this.usersService.findByIdOrFail(userId);
    const tier = this.getUserTier(user);
    const queueKey = this.getQueueKey(category, tier);

    // Verificar se já está na fila
    const existingQueue = this.queues.get(queueKey) || [];
    if (existingQueue.some(e => e.userId === userId)) {
      return { status: 'searching' };
    }

    // Tentar match imediato com alguém na fila
    const opponent = this.findBestMatch(queueKey, userId, stakeAmount);

    if (opponent) {
      // MATCH ENCONTRADO! Criar desafio e notificar ambos
      this.removeFromQueue(queueKey, opponent.userId);

      const challenge = await this.createMatchedChallenge(
        user, opponent.user, category, tier, stakeAmount, preferLive,
      );

      this.logger.log(
        `⚡ MATCH! ${user.displayName} vs ${opponent.user.displayName} | ${category} | R$${stakeAmount}`,
      );

      return { status: 'matched', challenge };
    }

    // Sem match, entrar na fila
    const entry: QueueEntry = {
      userId,
      user,
      category,
      tier,
      stakeAmount,
      joinedAt: Date.now(),
      preferLive,
    };

    if (!this.queues.has(queueKey)) {
      this.queues.set(queueKey, []);
    }
    this.queues.get(queueKey)!.push(entry);

    // Notificar o usuário que está buscando
    this.gateway.emitToUser(userId, 'matchmaking.searching', {
      category,
      tier,
      stakeAmount,
      queuePosition: this.queues.get(queueKey)!.length,
      estimatedWait: this.estimateWaitTime(queueKey),
    });

    this.logger.log(
      `🔍 ${user.displayName} entrou na fila | ${category} ${tier} R$${stakeAmount} | Fila: ${this.queues.get(queueKey)!.length}`,
    );

    return { status: 'searching' };
  }

  async leaveQueue(userId: string, category: ChallengeCategory): Promise<void> {
    // Remover de todas as filas dessa categoria
    for (const [key, queue] of this.queues.entries()) {
      if (key.startsWith(category)) {
        this.removeFromQueue(key, userId);
      }
    }
    this.gateway.emitToUser(userId, 'matchmaking.cancelled', { category });
  }

  // --- Match Logic ---

  private findBestMatch(queueKey: string, userId: string, stakeAmount: number): QueueEntry | null {
    const queue = this.queues.get(queueKey) || [];

    // Prioridade:
    // 1. Stake amount similar (tolerância de 20%)
    // 2. Tempo na fila (quem está esperando mais)
    const tolerance = stakeAmount * 0.2;

    const candidates = queue
      .filter(e => e.userId !== userId)
      .filter(e => Math.abs(e.stakeAmount - stakeAmount) <= tolerance)
      .sort((a, b) => a.joinedAt - b.joinedAt); // Mais antigo primeiro

    return candidates[0] || null;
  }

  private async createMatchedChallenge(
    player1: User,
    player2: User,
    category: ChallengeCategory,
    tier: LeagueTier,
    stakeAmount: number,
    preferLive: boolean,
  ): Promise<Challenge> {
    // Determinar métodos de verificação pela categoria
    const verificationMethods = this.getVerificationMethods(category, preferLive);

    // Criar o desafio
    const challenge = this.challengeRepo.create({
      title: this.generateChallengeTitle(category),
      category,
      type: ChallengeType.ONE_VS_ONE,
      tier,
      stakeAmount,
      totalPool: stakeAmount * 2,
      status: ChallengeStatus.MATCHED,
      creatorId: player1.id,
      maxParticipants: 2,
      currentParticipants: 2,
      matchedAt: new Date(),
      verificationMethods,
    });

    const savedChallenge = await this.challengeRepo.save(challenge);

    // Criar participantes
    const p1 = this.participantRepo.create({
      challengeId: savedChallenge.id,
      userId: player1.id,
      status: ParticipantStatus.ACTIVE,
      stakeDeposited: stakeAmount,
    });
    const p2 = this.participantRepo.create({
      challengeId: savedChallenge.id,
      userId: player2.id,
      status: ParticipantStatus.ACTIVE,
      stakeDeposited: stakeAmount,
    });
    await this.participantRepo.save([p1, p2]);

    // Emitir match via WebSocket para ambos jogadores
    this.gateway.emitChallengeMatched(savedChallenge.id, [
      {
        userId: player1.id,
        displayName: player1.displayName,
        stats: {
          rank: player1.rank,
          won: player1.challengesWon,
          completed: player1.challengesCompleted,
          winRate: player1.challengesCompleted > 0
            ? Math.round((player1.challengesWon / player1.challengesCompleted) * 100)
            : 0,
          streak: player1.currentStreak,
        },
      },
      {
        userId: player2.id,
        displayName: player2.displayName,
        stats: {
          rank: player2.rank,
          won: player2.challengesWon,
          completed: player2.challengesCompleted,
          winRate: player2.challengesCompleted > 0
            ? Math.round((player2.challengesWon / player2.challengesCompleted) * 100)
            : 0,
          streak: player2.currentStreak,
        },
      },
    ]);

    return savedChallenge;
  }

  private getVerificationMethods(category: ChallengeCategory, preferLive: boolean): VerificationMethod[] {
    // Categorias de games = screen capture/recording
    if (category === ChallengeCategory.ESPORTS) {
      return [VerificationMethod.SCREEN_CAPTURE, VerificationMethod.SCREEN_RECORDING];
    }

    // Categorias visuais/físicas = live stream primeiro, photo+GPS fallback
    if (preferLive) {
      return [VerificationMethod.LIVE_STREAM, VerificationMethod.PHOTO_GPS];
    }

    // Regeneração = satellite + photo
    if (category === ChallengeCategory.REGENERATION) {
      return [VerificationMethod.PHOTO_GPS, VerificationMethod.SATELLITE];
    }

    // Default: live + photo
    return [VerificationMethod.LIVE_STREAM, VerificationMethod.PHOTO_GPS];
  }

  private generateChallengeTitle(category: ChallengeCategory): string {
    const titles: Record<string, string[]> = {
      sports: ['Desafio Físico', 'Challenge Esportivo', 'Prova de Força'],
      personal_evolution: ['Evolução Pessoal', 'Desafio Mental', 'Superação'],
      esports: ['Battle Royale', 'Ranked Match', 'E-Sports Clash'],
      rap_battle: ['Batalha de Rimas', 'Freestyle Battle', 'Mic Drop'],
      culinary: ['Chef Challenge', 'Desafio Culinário', 'Cook Off'],
      acting: ['Cena Aberta', 'Improv Battle', 'Acting Challenge'],
      visual_arts: ['Arte Visual', 'Creative Clash', 'Design Battle'],
      crazy_race: ['Corrida Maluca', 'Race Challenge', 'Crazy Race'],
      regeneration: ['Missão Regeneração', 'Plante & Prove', 'Green Mission'],
    };
    const options = titles[category] || ['Desafio Kaa Kuaa'];
    return options[Math.floor(Math.random() * options.length)];
  }

  // --- Queue Helpers ---

  private getQueueKey(category: ChallengeCategory, tier: LeagueTier): string {
    return `${category}:${tier}`;
  }

  private removeFromQueue(queueKey: string, userId: string): void {
    const queue = this.queues.get(queueKey);
    if (queue) {
      this.queues.set(queueKey, queue.filter(e => e.userId !== userId));
    }
  }

  private estimateWaitTime(queueKey: string): number {
    // Estimativa simples baseada no tamanho da fila
    const queue = this.queues.get(queueKey) || [];
    if (queue.length === 0) return 30; // 30 sec se fila vazia
    return Math.max(5, 30 - queue.length * 5); // Mais gente na fila = match mais rápido
  }

  private getUserTier(user: User): LeagueTier {
    const rankToTier: Record<string, LeagueTier> = {
      recruta: LeagueTier.BRONZE,
      guardiao: LeagueTier.SILVER,
      mestre: LeagueTier.GOLD,
      diamante: LeagueTier.DIAMOND,
      fundador: LeagueTier.FOUNDER,
    };
    return rankToTier[user.rank] || LeagueTier.BRONZE;
  }

  // --- Stats ---

  getQueueStats() {
    const stats: Record<string, number> = {};
    for (const [key, queue] of this.queues.entries()) {
      stats[key] = queue.length;
    }
    return stats;
  }
}
