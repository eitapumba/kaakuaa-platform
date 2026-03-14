import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Challenge } from './challenge.entity';
import { ChallengeParticipant, ParticipantStatus } from './challenge-participant.entity';
import { ChallengeStatus } from '../../common/types';
import { UsersService } from '../users/users.service';

@Injectable()
export class ChallengesService {
  private readonly logger = new Logger(ChallengesService.name);

  constructor(
    @InjectRepository(Challenge)
    private readonly challengeRepo: Repository<Challenge>,
    @InjectRepository(ChallengeParticipant)
    private readonly participantRepo: Repository<ChallengeParticipant>,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async create(userId: string, data: Partial<Challenge>): Promise<Challenge> {
    const challenge = this.challengeRepo.create({
      ...data,
      creatorId: userId,
      status: ChallengeStatus.DRAFT,
    });
    return this.challengeRepo.save(challenge);
  }

  async findById(id: string): Promise<Challenge> {
    const challenge = await this.challengeRepo.findOne({
      where: { id },
      relations: ['creator', 'winner'],
    });
    if (!challenge) throw new NotFoundException('Desafio não encontrado');
    return challenge;
  }

  async listOpen(category?: string, tier?: string, page = 1, limit = 20) {
    const qb = this.challengeRepo.createQueryBuilder('c')
      .leftJoinAndSelect('c.creator', 'creator')
      .where('c.status = :status', { status: ChallengeStatus.OPEN });

    if (category) qb.andWhere('c.category = :category', { category });
    if (tier) qb.andWhere('c.tier = :tier', { tier });

    return qb
      .orderBy('c.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
  }

  async depositStakeAndOpen(challengeId: string, userId: string): Promise<Challenge> {
    const challenge = await this.findById(challengeId);
    if (challenge.creatorId !== userId) throw new ForbiddenException();
    if (challenge.status !== ChallengeStatus.DRAFT) {
      throw new BadRequestException('Desafio precisa estar em DRAFT');
    }

    // Add creator as participant
    const participant = this.participantRepo.create({
      challengeId,
      userId,
      status: ParticipantStatus.STAKE_DEPOSITED,
      stakeDeposited: challenge.stakeAmount,
    });
    await this.participantRepo.save(participant);

    challenge.status = ChallengeStatus.OPEN;
    challenge.totalPool = Number(challenge.stakeAmount);
    challenge.currentParticipants = 1;
    return this.challengeRepo.save(challenge);
  }

  async joinChallenge(challengeId: string, userId: string): Promise<Challenge> {
    const challenge = await this.findById(challengeId);
    if (challenge.status !== ChallengeStatus.OPEN) {
      throw new BadRequestException('Desafio não está aberto');
    }
    if (challenge.currentParticipants >= challenge.maxParticipants) {
      throw new BadRequestException('Desafio lotado');
    }

    const existing = await this.participantRepo.findOne({
      where: { challengeId, userId },
    });
    if (existing) throw new BadRequestException('Você já está neste desafio');

    const participant = this.participantRepo.create({
      challengeId,
      userId,
      status: ParticipantStatus.STAKE_DEPOSITED,
      stakeDeposited: challenge.stakeAmount,
    });
    await this.participantRepo.save(participant);

    challenge.currentParticipants += 1;
    challenge.totalPool = Number(challenge.totalPool) + Number(challenge.stakeAmount);

    // Auto-match se 1v1
    if (challenge.currentParticipants >= challenge.maxParticipants) {
      challenge.status = ChallengeStatus.MATCHED;
      challenge.matchedAt = new Date();
    }

    return this.challengeRepo.save(challenge);
  }

  async startChallenge(challengeId: string): Promise<Challenge> {
    const challenge = await this.findById(challengeId);
    if (challenge.status !== ChallengeStatus.MATCHED) {
      throw new BadRequestException('Desafio precisa estar MATCHED');
    }

    challenge.status = ChallengeStatus.ACTIVE;
    challenge.startsAt = new Date();

    // Update all participants to ACTIVE
    await this.participantRepo.update(
      { challengeId, status: ParticipantStatus.STAKE_DEPOSITED },
      { status: ParticipantStatus.ACTIVE },
    );

    return this.challengeRepo.save(challenge);
  }

  async submitEvidence(challengeId: string, userId: string, evidence: any) {
    const participant = await this.participantRepo.findOne({
      where: { challengeId, userId },
    });
    if (!participant) throw new NotFoundException('Participação não encontrada');

    participant.evidence = [
      ...(participant.evidence || []),
      { ...evidence, submittedAt: new Date().toISOString() },
    ];
    participant.status = ParticipantStatus.SUBMITTED;
    await this.participantRepo.save(participant);

    // Check if all participants submitted
    const allSubmitted = await this.participantRepo.count({
      where: { challengeId, status: ParticipantStatus.SUBMITTED },
    });
    const total = await this.participantRepo.count({ where: { challengeId } });

    if (allSubmitted >= total) {
      await this.challengeRepo.update(challengeId, {
        status: ChallengeStatus.PENDING_VERIFICATION,
      });
    }

    return participant;
  }

  async completeChallenge(challengeId: string, winnerId: string): Promise<Challenge> {
    const challenge = await this.findById(challengeId);

    challenge.status = ChallengeStatus.COMPLETED;
    challenge.winnerId = winnerId;
    challenge.completedAt = new Date();

    // Update participant statuses
    await this.participantRepo.update(
      { challengeId, userId: winnerId },
      { status: ParticipantStatus.WON },
    );
    await this.participantRepo
      .createQueryBuilder()
      .update()
      .set({ status: ParticipantStatus.LOST })
      .where('challengeId = :challengeId AND userId != :winnerId', { challengeId, winnerId })
      .execute();

    // Update user stats
    await this.usersService.incrementStats(winnerId, 'challengesWon');
    const participants = await this.participantRepo.find({ where: { challengeId } });
    for (const p of participants) {
      await this.usersService.incrementStats(p.userId, 'challengesCompleted');
    }

    return this.challengeRepo.save(challenge);
  }

  async getParticipants(challengeId: string) {
    return this.participantRepo.find({
      where: { challengeId },
      relations: ['user'],
    });
  }

  async getUserChallenges(userId: string, status?: ChallengeStatus) {
    const qb = this.participantRepo.createQueryBuilder('p')
      .leftJoinAndSelect('p.challenge', 'challenge')
      .where('p.userId = :userId', { userId });

    if (status) {
      qb.andWhere('challenge.status = :status', { status });
    }

    return qb.orderBy('p.joinedAt', 'DESC').getMany();
  }

  // ═══════════════════════════════════
  // AI JUDGING — Claude Vision analyzes evidence
  // ═══════════════════════════════════

  async judgeWithAI(challengeId: string, data: {
    player1Evidence: { frames: string[]; screenRecording?: boolean; uploadedResult?: string };
    player2Evidence: { frames: string[]; screenRecording?: boolean; uploadedResult?: string };
    subcategory: string;
    theme?: string;
    challengeMode: string;
    viewerVotes?: { player1: number; player2: number };
  }) {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');

    if (!apiKey) {
      this.logger.warn('ANTHROPIC_API_KEY not set — using viewer votes only for judgment');
      // Fallback to viewer votes
      const p1Votes = data.viewerVotes?.player1 || 0;
      const p2Votes = data.viewerVotes?.player2 || 0;
      return {
        winner: p1Votes >= p2Votes ? 'player1' : 'player2',
        confidence: 0.6,
        aiAnalysis: 'AI unavailable — decision based on viewer votes',
        viewerVotes: data.viewerVotes,
        method: 'viewer_votes_only',
      };
    }

    try {
      // Dynamic import to avoid issues if module not installed
      const Anthropic = (await import('@anthropic-ai/sdk')).default;
      const client = new Anthropic({ apiKey });

      // Build the prompt with context about the challenge
      const systemPrompt = `Você é um juiz imparcial da plataforma Kaa Kuaa — uma plataforma de desafios ao vivo entre pessoas.
Sua tarefa é analisar as evidências visuais de dois competidores e determinar quem venceu o desafio.

REGRAS:
- Analise a qualidade, criatividade, execução e aderência ao tema (se houver)
- Considere os votos dos espectadores como um fator (peso 30%)
- Sua análise visual vale 70%
- Seja justo e objetivo
- Responda SEMPRE em formato JSON válido`;

      const userPrompt = `DESAFIO: ${data.subcategory} — Modo: ${data.challengeMode}
${data.theme ? `TEMA: ${data.theme}` : ''}
${data.viewerVotes ? `VOTOS DOS ESPECTADORES: Player 1 = ${data.viewerVotes.player1}, Player 2 = ${data.viewerVotes.player2}` : ''}

Analise as imagens dos dois competidores e determine quem venceu.

Responda SOMENTE com este JSON:
{
  "winner": "player1" ou "player2",
  "confidence": 0.0 a 1.0,
  "player1Score": 0 a 100,
  "player2Score": 0 a 100,
  "analysis": "Breve explicação da decisão em português",
  "player1Feedback": "Feedback para jogador 1",
  "player2Feedback": "Feedback para jogador 2"
}`;

      // Build content blocks with images
      const contentBlocks: any[] = [{ type: 'text', text: userPrompt }];

      // Add player 1 frames (up to 3)
      const p1Frames = (data.player1Evidence.frames || []).slice(0, 3);
      if (p1Frames.length > 0) {
        contentBlocks.push({ type: 'text', text: '\n--- EVIDÊNCIA PLAYER 1 ---' });
        for (const frame of p1Frames) {
          if (frame.startsWith('data:image')) {
            const [header, base64] = frame.split(',');
            const mediaType = header.match(/data:(.*);/)?.[1] || 'image/jpeg';
            contentBlocks.push({
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64 },
            });
          }
        }
      }

      // Add player 2 frames (up to 3)
      const p2Frames = (data.player2Evidence.frames || []).slice(0, 3);
      if (p2Frames.length > 0) {
        contentBlocks.push({ type: 'text', text: '\n--- EVIDÊNCIA PLAYER 2 ---' });
        for (const frame of p2Frames) {
          if (frame.startsWith('data:image')) {
            const [header, base64] = frame.split(',');
            const mediaType = header.match(/data:(.*);/)?.[1] || 'image/jpeg';
            contentBlocks.push({
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64 },
            });
          }
        }
      }

      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: contentBlocks }],
      });

      // Parse AI response
      const responseText = response.content
        .filter((b: any) => b.type === 'text')
        .map((b: any) => b.text)
        .join('');

      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const aiResult = JSON.parse(jsonMatch[0]);
        this.logger.log(`[AI Judge] Challenge ${challengeId}: Winner=${aiResult.winner} (${aiResult.confidence})`);

        return {
          ...aiResult,
          viewerVotes: data.viewerVotes,
          method: 'ai_vision_analysis',
        };
      }

      // Fallback if JSON parse fails
      return {
        winner: (data.viewerVotes?.player1 || 0) >= (data.viewerVotes?.player2 || 0) ? 'player1' : 'player2',
        confidence: 0.5,
        aiAnalysis: responseText,
        viewerVotes: data.viewerVotes,
        method: 'ai_fallback',
      };

    } catch (err) {
      this.logger.error(`[AI Judge] Error: ${err.message}`);
      // Graceful fallback to viewer votes
      return {
        winner: (data.viewerVotes?.player1 || 0) >= (data.viewerVotes?.player2 || 0) ? 'player1' : 'player2',
        confidence: 0.5,
        aiAnalysis: `AI error: ${err.message}`,
        viewerVotes: data.viewerVotes,
        method: 'error_fallback',
      };
    }
  }
}
