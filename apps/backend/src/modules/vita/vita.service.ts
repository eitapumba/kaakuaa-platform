import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { VitaTransaction } from './vita-transaction.entity';
import { VitaTransactionType } from '../../common/types';
import { UsersService } from '../users/users.service';

const BURN_RATE = 0.20; // 20% burn on spend
const DECAY_RATE = 0.05; // 5% decay per 90 days inactive
const DECAY_DAYS = 90;

@Injectable()
export class VitaService {
  constructor(
    @InjectRepository(VitaTransaction)
    private readonly txRepo: Repository<VitaTransaction>,
    private readonly usersService: UsersService,
  ) {}

  async credit(
    userId: string,
    amount: number,
    type: VitaTransactionType,
    opts?: { referenceType?: string; referenceId?: string; description?: string; fromUserId?: string },
  ): Promise<VitaTransaction> {
    const user = await this.usersService.updateVitaBalance(userId, amount);

    const tx = this.txRepo.create({
      userId,
      type,
      amount,
      balanceAfter: user.vitaBalance,
      referenceType: opts?.referenceType,
      referenceId: opts?.referenceId,
      description: opts?.description,
      fromUserId: opts?.fromUserId,
    });
    return this.txRepo.save(tx);
  }

  async debit(
    userId: string,
    amount: number,
    type: VitaTransactionType,
    opts?: { referenceType?: string; referenceId?: string; description?: string; toUserId?: string },
  ): Promise<{ transaction: VitaTransaction; burnTransaction?: VitaTransaction }> {
    const user = await this.usersService.findByIdOrFail(userId);
    if (Number(user.vitaBalance) < amount) {
      throw new BadRequestException('Saldo VITA insuficiente');
    }

    // Apply burn
    const burnAmount = amount * BURN_RATE;
    const totalDeducted = amount + burnAmount;

    if (Number(user.vitaBalance) < totalDeducted) {
      throw new BadRequestException('Saldo VITA insuficiente (incluindo burn de 20%)');
    }

    const updatedUser = await this.usersService.updateVitaBalance(userId, -totalDeducted);

    const tx = this.txRepo.create({
      userId,
      type,
      amount: -amount,
      burnAmount,
      balanceAfter: updatedUser.vitaBalance,
      referenceType: opts?.referenceType,
      referenceId: opts?.referenceId,
      description: opts?.description,
      toUserId: opts?.toUserId,
    });
    const savedTx = await this.txRepo.save(tx);

    // Record burn transaction separately
    let burnTx: VitaTransaction | undefined;
    if (burnAmount > 0) {
      burnTx = this.txRepo.create({
        userId,
        type: VitaTransactionType.BURN,
        amount: -burnAmount,
        balanceAfter: updatedUser.vitaBalance,
        referenceType: 'vita_transaction',
        referenceId: savedTx.id,
        description: `20% burn de transação ${type}`,
      });
      burnTx = await this.txRepo.save(burnTx);
    }

    return { transaction: savedTx, burnTransaction: burnTx };
  }

  async transfer(fromUserId: string, toUserId: string, amount: number, description?: string) {
    const { transaction: debitTx } = await this.debit(fromUserId, amount, VitaTransactionType.TRANSFER, {
      toUserId,
      description: description || `Transferência para ${toUserId}`,
    });

    const creditTx = await this.credit(toUserId, amount, VitaTransactionType.TRANSFER, {
      fromUserId,
      description: description || `Transferência de ${fromUserId}`,
    });

    return { debitTransaction: debitTx, creditTransaction: creditTx };
  }

  async getBalance(userId: string): Promise<number> {
    const user = await this.usersService.findByIdOrFail(userId);
    return Number(user.vitaBalance);
  }

  async getHistory(userId: string, page = 1, limit = 50) {
    return this.txRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  // Cron job: run daily to apply decay
  async applyDecay(): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - DECAY_DAYS);

    // Find users inactive for 90+ days with positive balance
    const inactiveUsers = await this.usersService['userRepo'].find({
      where: {
        vitaLastActivity: LessThan(cutoffDate),
        isActive: true,
      },
    });

    let decayCount = 0;
    for (const user of inactiveUsers) {
      if (Number(user.vitaBalance) > 0) {
        const decayAmount = Number(user.vitaBalance) * DECAY_RATE;
        await this.usersService.updateVitaBalance(user.id, -decayAmount);

        await this.txRepo.save(this.txRepo.create({
          userId: user.id,
          type: VitaTransactionType.DECAY,
          amount: -decayAmount,
          balanceAfter: Number(user.vitaBalance) - decayAmount,
          description: `Decay de ${DECAY_RATE * 100}% por ${DECAY_DAYS} dias de inatividade`,
        }));
        decayCount++;
      }
    }
    return decayCount;
  }
}
