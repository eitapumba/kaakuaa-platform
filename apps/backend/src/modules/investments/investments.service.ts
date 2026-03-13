import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Investment } from './investment.entity';
import { InvestmentContractType, InvestmentStatus, VitaTransactionType } from '../../common/types';
import { UsersService } from '../users/users.service';
import { VitaService } from '../vita/vita.service';

@Injectable()
export class InvestmentsService {
  constructor(
    @InjectRepository(Investment)
    private readonly investmentRepo: Repository<Investment>,
    private readonly usersService: UsersService,
    private readonly vitaService: VitaService,
  ) {}

  async invest(data: {
    investorId: string;
    playerId: string;
    contractType: InvestmentContractType;
    amountInvested: number;
    vitaInvested?: number;
    returnPercentage: number;
    durationDays: number;
  }): Promise<Investment> {
    if (data.investorId === data.playerId) {
      throw new BadRequestException('Não é possível investir em si mesmo');
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + data.durationDays);

    const investment = this.investmentRepo.create({
      ...data,
      status: InvestmentStatus.ACTIVE,
      expiresAt,
      returnHistory: [],
    });

    const saved = await this.investmentRepo.save(investment);

    // Transfer VITA if applicable
    if (data.vitaInvested && data.vitaInvested > 0) {
      await this.vitaService.debit(data.investorId, data.vitaInvested, VitaTransactionType.INVEST, {
        referenceType: 'investment',
        referenceId: saved.id,
        toUserId: data.playerId,
      });
      await this.vitaService.credit(data.playerId, data.vitaInvested, VitaTransactionType.INVEST, {
        referenceType: 'investment',
        referenceId: saved.id,
        fromUserId: data.investorId,
      });
    }

    // Update player investment stats
    await this.usersService.update(data.playerId, {
      investorsCount: () => 'investorsCount + 1',
      totalInvestmentReceived: () => `totalInvestmentReceived + ${data.amountInvested}`,
    } as any);

    return saved;
  }

  async distributeReturn(investmentId: string, returnAmount: number, source: string, referenceId: string) {
    const investment = await this.investmentRepo.findOneOrFail({
      where: { id: investmentId },
    });

    if (investment.status !== InvestmentStatus.ACTIVE) {
      throw new BadRequestException('Investimento não está ativo');
    }

    // Calculate investor's share
    const investorReturn = returnAmount * (Number(investment.returnPercentage) / 100);

    investment.totalReturned = Number(investment.totalReturned) + investorReturn;
    investment.returnHistory = [
      ...(investment.returnHistory || []),
      {
        date: new Date().toISOString(),
        amount: investorReturn,
        source,
        referenceId,
      },
    ];

    if (source === 'challenge_win') {
      investment.challengeReturns = Number(investment.challengeReturns) + investorReturn;
    } else if (source === 'content_royalty') {
      investment.contentReturns = Number(investment.contentReturns) + investorReturn;
    }

    await this.investmentRepo.save(investment);

    // Credit VITA to investor
    await this.vitaService.credit(investment.investorId, investorReturn, VitaTransactionType.INVESTMENT_RETURN, {
      referenceType: 'investment',
      referenceId: investmentId,
      description: `Retorno de investimento: ${source}`,
    });

    return investment;
  }

  async getPlayerInvestors(playerId: string) {
    return this.investmentRepo.find({
      where: { playerId, status: InvestmentStatus.ACTIVE },
      relations: ['investor'],
      order: { createdAt: 'DESC' },
    });
  }

  async getMyInvestments(investorId: string) {
    return this.investmentRepo.find({
      where: { investorId },
      relations: ['player'],
      order: { createdAt: 'DESC' },
    });
  }

  async getInvestmentById(id: string) {
    const investment = await this.investmentRepo.findOne({
      where: { id },
      relations: ['investor', 'player'],
    });
    if (!investment) throw new NotFoundException('Investimento não encontrado');
    return investment;
  }

  // Cron: expire investments
  async expireInvestments(): Promise<number> {
    const result = await this.investmentRepo
      .createQueryBuilder()
      .update()
      .set({ status: InvestmentStatus.COMPLETED })
      .where('status = :status AND expiresAt < :now', {
        status: InvestmentStatus.ACTIVE,
        now: new Date(),
      })
      .execute();
    return result.affected || 0;
  }
}
