import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Payment, PaymentType } from './payment.entity';
import { PaymentStatus, SPLIT } from '../../common/types';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    private readonly configService: ConfigService,
  ) {}

  async createStakePayment(userId: string, challengeId: string, amount: number): Promise<Payment> {
    const payment = this.paymentRepo.create({
      userId,
      type: PaymentType.CHALLENGE_STAKE,
      amount,
      status: PaymentStatus.PENDING,
      referenceType: 'challenge',
      referenceId: challengeId,
    });

    // TODO: Create Stripe PaymentIntent for escrow
    // const paymentIntent = await stripe.paymentIntents.create({ ... });
    // payment.stripePaymentIntentId = paymentIntent.id;

    return this.paymentRepo.save(payment);
  }

  async holdInEscrow(paymentId: string): Promise<Payment> {
    const payment = await this.paymentRepo.findOneOrFail({ where: { id: paymentId } });
    payment.status = PaymentStatus.HELD_IN_ESCROW;
    payment.escrowHeldAt = new Date();
    return this.paymentRepo.save(payment);
  }

  async distributeChallengePayout(challengeId: string, winnerId: string, totalPool: number) {
    const winnerAmount = totalPool * SPLIT.WINNER_NET;  // 59.5%
    const fundAmount = totalPool * SPLIT.FUND;          // 30%
    const feeAmount = totalPool * SPLIT.KAAKUAA_NET;    // 10.5%

    // Winner payout
    const winnerPayment = this.paymentRepo.create({
      userId: winnerId,
      type: PaymentType.CHALLENGE_PAYOUT,
      amount: winnerAmount,
      status: PaymentStatus.RELEASED_TO_WINNER,
      referenceType: 'challenge',
      referenceId: challengeId,
      winnerAmount,
      fundAmount,
      feeAmount,
      escrowReleasedAt: new Date(),
    });

    // Regeneration Fund payment
    const fundPayment = this.paymentRepo.create({
      userId: 'system', // System account
      type: PaymentType.REGENERATION_FUND,
      amount: fundAmount,
      status: PaymentStatus.SENT_TO_FUND,
      referenceType: 'challenge',
      referenceId: challengeId,
    });

    // Kaa Kuaa fee
    const feePayment = this.paymentRepo.create({
      userId: 'system',
      type: PaymentType.KAAKUAA_FEE,
      amount: feeAmount,
      status: PaymentStatus.RELEASED_TO_WINNER, // Released to Kaa Kuaa
      referenceType: 'challenge',
      referenceId: challengeId,
    });

    await this.paymentRepo.save([winnerPayment, fundPayment, feePayment]);

    this.logger.log(
      `Challenge ${challengeId} payout: Winner=${winnerAmount} Fund=${fundAmount} Fee=${feeAmount}`,
    );

    // TODO: Execute Stripe transfers
    return { winnerPayment, fundPayment, feePayment };
  }

  async getUserPayments(userId: string, page = 1, limit = 20) {
    return this.paymentRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async refund(paymentId: string): Promise<Payment> {
    const payment = await this.paymentRepo.findOneOrFail({ where: { id: paymentId } });
    payment.status = PaymentStatus.REFUNDED;
    // TODO: Process Stripe refund
    return this.paymentRepo.save(payment);
  }
}
