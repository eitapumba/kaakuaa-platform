import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Challenge } from './challenge.entity';
import { ChallengeParticipant, ParticipantStatus } from './challenge-participant.entity';
import { ChallengeStatus } from '../../common/types';
import { UsersService } from '../users/users.service';

@Injectable()
export class ChallengesService {
  constructor(
    @InjectRepository(Challenge)
    private readonly challengeRepo: Repository<Challenge>,
    @InjectRepository(ChallengeParticipant)
    private readonly participantRepo: Repository<ChallengeParticipant>,
    private readonly usersService: UsersService,
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
}
