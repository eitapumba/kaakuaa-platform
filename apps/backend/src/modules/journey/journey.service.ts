import {
  Injectable, NotFoundException, BadRequestException,
  ForbiddenException, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThanOrEqual } from 'typeorm';
import { Journey } from './journey.entity';
import { JourneyStage } from './journey-stage.entity';
import { JourneyVote } from './journey-vote.entity';
import { Challenge } from '../challenges/challenge.entity';
import { ChallengeParticipant, ParticipantStatus } from '../challenges/challenge-participant.entity';
import { ChallengesGateway } from '../challenges/challenges.gateway';
import { UsersService } from '../users/users.service';
import {
  JourneyStatus, JourneyStageType, JourneyStageStatus,
  SubmissionType, ChallengeCategory, ChallengeType,
  ChallengeStatus, LeagueTier, VerificationMethod,
  JOURNEY_STAGE_CONFIG,
} from '../../common/types';

@Injectable()
export class JourneyService {
  private readonly logger = new Logger(JourneyService.name);

  constructor(
    @InjectRepository(Journey)
    private readonly journeyRepo: Repository<Journey>,
    @InjectRepository(JourneyStage)
    private readonly stageRepo: Repository<JourneyStage>,
    @InjectRepository(JourneyVote)
    private readonly voteRepo: Repository<JourneyVote>,
    @InjectRepository(Challenge)
    private readonly challengeRepo: Repository<Challenge>,
    @InjectRepository(ChallengeParticipant)
    private readonly participantRepo: Repository<ChallengeParticipant>,
    private readonly gateway: ChallengesGateway,
    private readonly usersService: UsersService,
  ) {}

  // ============================================
  // CRIAR JORNADA — Cria a jornada com todos os 5 estágios
  // ============================================
  async createJourney(
    userId: string,
    data: { title?: string; description?: string; tier: LeagueTier; stakePerStage: number },
  ): Promise<Journey> {
    const journey = this.journeyRepo.create({
      title: data.title || 'Jornada do Herói',
      description: data.description || 'Uma jornada cinematográfica colaborativa — do roteiro ao curta-metragem',
      tier: data.tier,
      stakePerStage: data.stakePerStage,
      creatorId: userId,
      status: JourneyStatus.RECRUITING,
      currentStageOrder: 1,
    });

    const savedJourney = await this.journeyRepo.save(journey);

    // Criar os 5 estágios
    const stageTypes = [
      JourneyStageType.SCREENPLAY,
      JourneyStageType.STORYBOARD,
      JourneyStageType.CINEMATOGRAPHY,
      JourneyStageType.SOUNDTRACK,
      JourneyStageType.ACTING,
    ];

    const stages: JourneyStage[] = [];
    for (const stageType of stageTypes) {
      const config = JOURNEY_STAGE_CONFIG[stageType];
      const stage = this.stageRepo.create({
        journeyId: savedJourney.id,
        stageType,
        stageOrder: config.order,
        status: config.order === 1 ? JourneyStageStatus.OPEN : JourneyStageStatus.PENDING,
        acceptedSubmissionTypes: config.submissionTypes,
        maxParticipants: config.maxParticipants,
        votingDurationHours: config.votingDurationHours,
        objectives: config.objectives,
        name: config.name,
        description: config.description,
      });
      stages.push(stage);
    }

    await this.stageRepo.save(stages);

    // Criar Challenge para o primeiro estágio
    await this.createStageChallenge(savedJourney, stages[0]);

    this.logger.log(`🎬 Jornada criada: ${savedJourney.id} por userId ${userId}`);

    return this.findById(savedJourney.id);
  }

  // ============================================
  // BUSCAR JORNADA
  // ============================================
  async findById(id: string): Promise<Journey> {
    const journey = await this.journeyRepo.findOne({
      where: { id },
      relations: ['creator', 'stages', 'stages.winner', 'stages.challenge'],
      order: { stages: { stageOrder: 'ASC' } },
    });
    if (!journey) throw new NotFoundException('Jornada não encontrada');
    return journey;
  }

  async listActive(tier?: LeagueTier, page = 1, limit = 20) {
    const qb = this.journeyRepo.createQueryBuilder('j')
      .leftJoinAndSelect('j.creator', 'creator')
      .leftJoinAndSelect('j.stages', 'stages')
      .where('j.status IN (:...statuses)', {
        statuses: [JourneyStatus.RECRUITING, JourneyStatus.STAGE_ACTIVE, JourneyStatus.VOTING],
      });

    if (tier) qb.andWhere('j.tier = :tier', { tier });

    return qb
      .orderBy('j.createdAt', 'DESC')
      .addOrderBy('stages.stageOrder', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
  }

  // ============================================
  // PARTICIPAR DE UM ESTÁGIO
  // ============================================
  async joinStage(journeyId: string, stageId: string, userId: string): Promise<ChallengeParticipant> {
    const stage = await this.stageRepo.findOne({
      where: { id: stageId, journeyId },
      relations: ['challenge'],
    });
    if (!stage) throw new NotFoundException('Estágio não encontrado');
    if (stage.status !== JourneyStageStatus.OPEN) {
      throw new BadRequestException('Estágio não está aberto para inscrições');
    }
    if (stage.currentParticipants >= stage.maxParticipants) {
      throw new BadRequestException('Estágio está lotado');
    }
    if (!stage.challengeId) {
      throw new BadRequestException('Desafio do estágio ainda não foi criado');
    }

    // Verificar se já está participando
    const existing = await this.participantRepo.findOne({
      where: { challengeId: stage.challengeId, userId },
    });
    if (existing) throw new BadRequestException('Você já está neste estágio');

    // Criar participante
    const journey = await this.journeyRepo.findOne({ where: { id: journeyId } });
    const participant = this.participantRepo.create({
      challengeId: stage.challengeId,
      userId,
      status: ParticipantStatus.STAKE_DEPOSITED,
      stakeDeposited: journey!.stakePerStage,
    });
    await this.participantRepo.save(participant);

    // Atualizar contadores
    stage.currentParticipants += 1;
    await this.stageRepo.save(stage);

    const challenge = await this.challengeRepo.findOne({ where: { id: stage.challengeId } });
    if (challenge) {
      challenge.currentParticipants += 1;
      challenge.totalPool = Number(challenge.totalPool) + Number(journey!.stakePerStage);
      await this.challengeRepo.save(challenge);
    }

    // Atualizar pool total da jornada
    journey!.totalPool = Number(journey!.totalPool) + Number(journey!.stakePerStage);
    await this.journeyRepo.save(journey!);

    this.logger.log(`🎭 Usuário ${userId} entrou no estágio ${stage.name} da jornada ${journeyId}`);

    return participant;
  }

  // ============================================
  // INICIAR ESTÁGIO (quando tem participantes suficientes)
  // ============================================
  async startStage(journeyId: string, stageId: string): Promise<JourneyStage> {
    const stage = await this.stageRepo.findOne({
      where: { id: stageId, journeyId },
    });
    if (!stage) throw new NotFoundException('Estágio não encontrado');
    if (stage.status !== JourneyStageStatus.OPEN) {
      throw new BadRequestException('Estágio não está aberto');
    }
    if (stage.currentParticipants < 2) {
      throw new BadRequestException('Precisa de pelo menos 2 participantes');
    }

    // Atualizar estágio e desafio
    stage.status = JourneyStageStatus.ACTIVE;
    await this.stageRepo.save(stage);

    if (stage.challengeId) {
      await this.challengeRepo.update(stage.challengeId, {
        status: ChallengeStatus.ACTIVE,
        startsAt: new Date(),
      });
      await this.participantRepo.update(
        { challengeId: stage.challengeId, status: ParticipantStatus.STAKE_DEPOSITED },
        { status: ParticipantStatus.ACTIVE },
      );
    }

    // Atualizar jornada
    await this.journeyRepo.update(journeyId, {
      status: JourneyStatus.STAGE_ACTIVE,
    });

    this.logger.log(`🎬 Estágio ${stage.name} iniciado na jornada ${journeyId}`);

    return stage;
  }

  // ============================================
  // SUBMETER TRABALHO (evidência)
  // ============================================
  async submitWork(
    journeyId: string,
    stageId: string,
    userId: string,
    submission: {
      type: SubmissionType;
      url?: string;
      text?: string;
      metadata?: Record<string, any>;
    },
  ) {
    const stage = await this.stageRepo.findOne({
      where: { id: stageId, journeyId },
    });
    if (!stage) throw new NotFoundException('Estágio não encontrado');
    if (stage.status !== JourneyStageStatus.ACTIVE) {
      throw new BadRequestException('Estágio não está ativo');
    }

    // Validar tipo de submissão
    if (!stage.acceptedSubmissionTypes.includes(submission.type)) {
      throw new BadRequestException(
        `Tipo de submissão '${submission.type}' não aceito. Aceitos: ${stage.acceptedSubmissionTypes.join(', ')}`,
      );
    }

    // Buscar participante
    const participant = await this.participantRepo.findOne({
      where: { challengeId: stage.challengeId!, userId },
    });
    if (!participant) throw new NotFoundException('Você não está participando deste estágio');
    if (participant.status === ParticipantStatus.SUBMITTED) {
      throw new BadRequestException('Você já submeteu seu trabalho');
    }

    // Salvar evidência
    participant.evidence = [
      ...(participant.evidence || []),
      {
        type: submission.type,
        url: submission.url || '',
        metadata: {
          ...submission.metadata,
          text: submission.text,
          submissionType: submission.type,
        },
        submittedAt: new Date().toISOString(),
      },
    ];
    participant.status = ParticipantStatus.SUBMITTED;
    await this.participantRepo.save(participant);

    // Verificar se todos submeteram → iniciar votação
    const totalParticipants = await this.participantRepo.count({
      where: { challengeId: stage.challengeId! },
    });
    const submittedCount = await this.participantRepo.count({
      where: { challengeId: stage.challengeId!, status: ParticipantStatus.SUBMITTED },
    });

    if (submittedCount >= totalParticipants) {
      await this.startVoting(journeyId, stageId);
    }

    this.logger.log(`📝 Submissão de ${userId} no estágio ${stage.name} (${submittedCount}/${totalParticipants})`);

    return participant;
  }

  // ============================================
  // INICIAR VOTAÇÃO PÚBLICA
  // ============================================
  async startVoting(journeyId: string, stageId: string): Promise<JourneyStage> {
    const stage = await this.stageRepo.findOne({
      where: { id: stageId, journeyId },
    });
    if (!stage) throw new NotFoundException('Estágio não encontrado');

    const now = new Date();
    const votingEnd = new Date(now.getTime() + stage.votingDurationHours * 60 * 60 * 1000);

    stage.status = JourneyStageStatus.VOTING;
    stage.votingStartsAt = now;
    stage.votingEndsAt = votingEnd;
    await this.stageRepo.save(stage);

    // Atualizar status da jornada
    await this.journeyRepo.update(journeyId, {
      status: JourneyStatus.VOTING,
    });

    // Atualizar status do desafio
    if (stage.challengeId) {
      await this.challengeRepo.update(stage.challengeId, {
        status: ChallengeStatus.PENDING_VERIFICATION,
      });
    }

    this.logger.log(`🗳️ Votação iniciada para ${stage.name} — até ${votingEnd.toISOString()}`);

    return stage;
  }

  // ============================================
  // VOTAR — Público vota no melhor participante
  // ============================================
  async vote(
    stageId: string,
    voterId: string,
    participantId: string,
    vitaAmount = 1,
  ): Promise<JourneyVote> {
    const stage = await this.stageRepo.findOne({ where: { id: stageId } });
    if (!stage) throw new NotFoundException('Estágio não encontrado');
    if (stage.status !== JourneyStageStatus.VOTING) {
      throw new BadRequestException('Estágio não está em período de votação');
    }

    // Verificar se votação ainda está aberta
    if (stage.votingEndsAt && new Date() > stage.votingEndsAt) {
      throw new BadRequestException('Período de votação encerrado');
    }

    // Verificar se participante existe neste estágio
    const participant = await this.participantRepo.findOne({
      where: { id: participantId, challengeId: stage.challengeId! },
    });
    if (!participant) throw new NotFoundException('Participante não encontrado neste estágio');

    // Verificar voto duplicado
    const existingVote = await this.voteRepo.findOne({
      where: { stageId, voterId },
    });
    if (existingVote) throw new BadRequestException('Você já votou neste estágio');

    // Criar voto
    const vote = this.voteRepo.create({
      stageId,
      voterId,
      participantId,
      vitaSpent: vitaAmount,
    });

    return this.voteRepo.save(vote);
  }

  // ============================================
  // OBTER RESULTADOS DA VOTAÇÃO
  // ============================================
  async getVotingResults(stageId: string) {
    const stage = await this.stageRepo.findOne({
      where: { id: stageId },
    });
    if (!stage) throw new NotFoundException('Estágio não encontrado');

    // Agregar votos por participante
    const results = await this.voteRepo
      .createQueryBuilder('v')
      .select('v.participantId', 'participantId')
      .addSelect('COUNT(v.id)', 'voteCount')
      .addSelect('SUM(v.vitaSpent)', 'totalVita')
      .where('v.stageId = :stageId', { stageId })
      .groupBy('v.participantId')
      .orderBy('totalVita', 'DESC')
      .getRawMany();

    // Enriquecer com dados do participante
    const enriched = await Promise.all(
      results.map(async (r) => {
        const participant = await this.participantRepo.findOne({
          where: { id: r.participantId },
          relations: ['user'],
        });
        return {
          participantId: r.participantId,
          userId: participant?.userId,
          displayName: participant?.user?.displayName,
          voteCount: parseInt(r.voteCount, 10),
          totalVita: parseFloat(r.totalVita),
          evidence: participant?.evidence,
        };
      }),
    );

    return {
      stageId,
      stageName: stage.name,
      status: stage.status,
      votingEndsAt: stage.votingEndsAt,
      results: enriched,
    };
  }

  // ============================================
  // FINALIZAR ESTÁGIO — Declarar vencedor e avançar
  // ============================================
  async completeStage(journeyId: string, stageId: string): Promise<Journey> {
    const stage = await this.stageRepo.findOne({
      where: { id: stageId, journeyId },
    });
    if (!stage) throw new NotFoundException('Estágio não encontrado');
    if (stage.status !== JourneyStageStatus.VOTING) {
      throw new BadRequestException('Estágio precisa estar em votação para ser finalizado');
    }

    // Pegar resultado da votação
    const votingResults = await this.getVotingResults(stageId);
    if (votingResults.results.length === 0) {
      throw new BadRequestException('Nenhum voto registrado');
    }

    // Vencedor = quem tem mais VITA de votos
    const winner = votingResults.results[0];
    stage.winnerId = winner.userId!;
    stage.status = JourneyStageStatus.COMPLETED;
    await this.stageRepo.save(stage);

    // Atualizar challenge
    if (stage.challengeId) {
      await this.challengeRepo.update(stage.challengeId, {
        status: ChallengeStatus.COMPLETED,
        winnerId: winner.userId,
        completedAt: new Date(),
      });

      // Atualizar status dos participantes
      await this.participantRepo.update(
        { challengeId: stage.challengeId, userId: winner.userId! },
        { status: ParticipantStatus.WON },
      );
      await this.participantRepo
        .createQueryBuilder()
        .update()
        .set({ status: ParticipantStatus.LOST })
        .where('challengeId = :challengeId AND userId != :winnerId', {
          challengeId: stage.challengeId,
          winnerId: winner.userId,
        })
        .execute();
    }

    // Salvar output do vencedor no produto final da jornada
    const journey = await this.findById(journeyId);
    await this.saveWinnerOutput(journey, stage, winner);

    // Avançar para próximo estágio ou completar jornada
    const nextStage = journey.stages.find(s => s.stageOrder === stage.stageOrder + 1);

    if (nextStage) {
      // Preparar próximo estágio com input do anterior
      nextStage.previousStageOutput = {
        stageType: stage.stageType,
        winnerId: winner.userId!,
        winnerName: winner.displayName || 'Vencedor',
        content: {
          type: winner.evidence?.[0]?.type as SubmissionType || SubmissionType.TEXT,
          url: winner.evidence?.[0]?.url,
          text: winner.evidence?.[0]?.metadata?.text,
          metadata: winner.evidence?.[0]?.metadata,
        },
      };
      nextStage.status = JourneyStageStatus.OPEN;
      await this.stageRepo.save(nextStage);

      // Criar challenge para o próximo estágio
      await this.createStageChallenge(journey, nextStage);

      // Atualizar jornada
      journey.currentStageOrder = nextStage.stageOrder;
      journey.status = JourneyStatus.RECRUITING;
      await this.journeyRepo.save(journey);

      this.logger.log(`🎬 Estágio ${stage.name} completo! Avançando para ${nextStage.name}`);
    } else {
      // Jornada completa!
      journey.status = JourneyStatus.COMPLETED;
      journey.completedAt = new Date();
      await this.journeyRepo.save(journey);

      this.logger.log(`🏆 Jornada ${journeyId} COMPLETA! Curta-metragem finalizado!`);
    }

    return this.findById(journeyId);
  }

  // ============================================
  // HELPERS
  // ============================================

  private async createStageChallenge(journey: Journey, stage: JourneyStage): Promise<Challenge> {
    const challenge = this.challengeRepo.create({
      title: `${stage.name} — ${journey.title}`,
      description: stage.description,
      category: ChallengeCategory.ACTING,
      type: ChallengeType.TOURNAMENT,
      tier: journey.tier,
      stakeAmount: journey.stakePerStage,
      totalPool: 0,
      status: ChallengeStatus.OPEN,
      creatorId: journey.creatorId,
      maxParticipants: stage.maxParticipants,
      verificationMethods: [VerificationMethod.PUBLIC_VOTING],
      rules: {
        journeyId: journey.id,
        stageId: stage.id,
        stageType: stage.stageType,
        acceptedSubmissionTypes: stage.acceptedSubmissionTypes,
        objectives: stage.objectives,
        previousStageOutput: stage.previousStageOutput,
      },
      metadata: {
        isJourneyChallenge: true,
        journeyId: journey.id,
        stageOrder: stage.stageOrder,
      },
    });

    const saved = await this.challengeRepo.save(challenge);

    stage.challengeId = saved.id;
    await this.stageRepo.save(stage);

    return saved;
  }

  private async saveWinnerOutput(
    journey: Journey,
    stage: JourneyStage,
    winner: { evidence?: any[]; userId?: string },
  ) {
    const finalProduct = journey.finalProduct || {};
    const evidence = winner.evidence?.[0];

    switch (stage.stageType) {
      case JourneyStageType.SCREENPLAY:
        if (evidence?.metadata?.text) {
          finalProduct.screenplayText = evidence.metadata.text;
        }
        if (evidence?.url) {
          finalProduct.screenplayVideoUrl = evidence.url;
        }
        break;
      case JourneyStageType.STORYBOARD:
        finalProduct.storyboardImages = winner.evidence
          ?.map(e => e.url)
          .filter(Boolean) || [];
        break;
      case JourneyStageType.CINEMATOGRAPHY:
        finalProduct.cinematographyUrl = evidence?.url;
        break;
      case JourneyStageType.SOUNDTRACK:
        finalProduct.soundtrackUrl = evidence?.url;
        break;
      case JourneyStageType.ACTING:
        finalProduct.finalFilmUrl = evidence?.url;
        break;
    }

    await this.journeyRepo.update(journey.id, { finalProduct });
  }

  // Obter submissões de um estágio (para votação pública)
  async getStageSubmissions(stageId: string) {
    const stage = await this.stageRepo.findOne({ where: { id: stageId } });
    if (!stage || !stage.challengeId) throw new NotFoundException('Estágio não encontrado');

    const participants = await this.participantRepo.find({
      where: {
        challengeId: stage.challengeId,
        status: In([ParticipantStatus.SUBMITTED, ParticipantStatus.WON, ParticipantStatus.LOST]),
      },
      relations: ['user'],
    });

    return participants.map(p => ({
      participantId: p.id,
      userId: p.userId,
      displayName: p.user?.displayName,
      evidence: p.evidence,
      status: p.status,
    }));
  }

  // Listar jornadas de um usuário
  async getUserJourneys(userId: string) {
    return this.journeyRepo.find({
      where: { creatorId: userId },
      relations: ['stages'],
      order: { createdAt: 'DESC', stages: { stageOrder: 'ASC' } },
    });
  }
}
