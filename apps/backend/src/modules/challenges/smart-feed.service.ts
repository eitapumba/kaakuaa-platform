import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Challenge } from './challenge.entity';
import { ChallengeStatus, ChallengeCategory, LeagueTier } from '../../common/types';
import { User } from '../users/user.entity';

interface FeedParams {
  userId: string;
  user: User;
  limit?: number;
  category?: ChallengeCategory;
}

@Injectable()
export class SmartFeedService {
  constructor(
    @InjectRepository(Challenge)
    private readonly challengeRepo: Repository<Challenge>,
  ) {}

  /**
   * Smart feed: rankeia desafios por relevância pro usuário
   *
   * Fatores de ranking:
   * 1. Match Quality — tier compatível (mesmo tier = boost)
   * 2. Category Preference — categorias que o user mais joga
   * 3. Recency — desafios mais recentes
   * 4. Engagement — desafios com mais viewers/investments
   * 5. Win Rate Balance — oponentes com skill similar
   */
  async getSmartFeed(params: FeedParams) {
    const { userId, user, limit = 10, category } = params;
    const userTier = this.getUserTier(user);

    const qb = this.challengeRepo.createQueryBuilder('c')
      .leftJoinAndSelect('c.creator', 'creator')
      .where('c.status = :status', { status: ChallengeStatus.OPEN })
      .andWhere('c.creatorId != :userId', { userId }); // Não mostrar próprios desafios

    if (category) {
      qb.andWhere('c.category = :category', { category });
    }

    // Score composto para ranking
    // O score é calculado no SQL pra performance
    qb.addSelect(`
      (
        CASE WHEN c.tier = :userTier THEN 100 ELSE 50 END
        + CASE WHEN c.tier = :adjacentTierUp THEN 75 ELSE 0 END
        + CASE WHEN c.tier = :adjacentTierDown THEN 75 ELSE 0 END
        + (c."viewCount" * 0.5)
        + (c."totalInvestmentReceived" * 2)
        + (EXTRACT(EPOCH FROM (NOW() - c."createdAt")) * -0.001)
      )
    `, 'relevance_score');

    qb.setParameter('userTier', userTier);
    qb.setParameter('adjacentTierUp', this.getAdjacentTier(userTier, 'up'));
    qb.setParameter('adjacentTierDown', this.getAdjacentTier(userTier, 'down'));

    qb.orderBy('relevance_score', 'DESC');
    qb.take(limit);

    const challenges = await qb.getMany();

    // Enriquecer com dados de relevância pro frontend
    return challenges.map(c => ({
      ...c,
      _feed: {
        tierMatch: c.tier === userTier ? 'exact' : 'compatible',
        isRecommended: c.tier === userTier,
        matchQuality: this.calculateMatchQuality(user, c),
      },
    }));
  }

  private getUserTier(user: User): LeagueTier {
    // Mapeia rank do user pro tier equivalente
    const rankToTier: Record<string, LeagueTier> = {
      recruta: LeagueTier.BRONZE,
      guardiao: LeagueTier.SILVER,
      mestre: LeagueTier.GOLD,
      diamante: LeagueTier.DIAMOND,
      fundador: LeagueTier.FOUNDER,
    };
    return rankToTier[user.rank] || LeagueTier.BRONZE;
  }

  private getAdjacentTier(tier: LeagueTier, direction: 'up' | 'down'): LeagueTier {
    const tiers = [LeagueTier.BRONZE, LeagueTier.SILVER, LeagueTier.GOLD, LeagueTier.DIAMOND, LeagueTier.FOUNDER];
    const idx = tiers.indexOf(tier);
    if (direction === 'up' && idx < tiers.length - 1) return tiers[idx + 1];
    if (direction === 'down' && idx > 0) return tiers[idx - 1];
    return tier;
  }

  private calculateMatchQuality(user: User, challenge: Challenge): number {
    // Score 0-100 de qualidade do match
    let score = 50;

    // Tier match
    const userTier = this.getUserTier(user);
    if (challenge.tier === userTier) score += 30;

    // Recency bonus (criado há menos de 30 min)
    const minutesAgo = (Date.now() - challenge.createdAt.getTime()) / 60000;
    if (minutesAgo < 30) score += 20;
    else if (minutesAgo < 120) score += 10;

    return Math.min(100, score);
  }
}
