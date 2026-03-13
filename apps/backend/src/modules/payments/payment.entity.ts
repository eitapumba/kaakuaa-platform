import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { PaymentStatus } from '../../common/types';
import { User } from '../users/user.entity';

export enum PaymentType {
  CHALLENGE_STAKE = 'challenge_stake',
  CHALLENGE_PAYOUT = 'challenge_payout',
  REGENERATION_FUND = 'regeneration_fund',
  KAAKUAA_FEE = 'kaakuaa_fee',
  MARKETPLACE_PURCHASE = 'marketplace_purchase',
  INVESTMENT_DEPOSIT = 'investment_deposit',
  INVESTMENT_RETURN = 'investment_return',
  SUBSCRIPTION = 'subscription',
  REFUND = 'refund',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'enum', enum: PaymentType })
  type: PaymentType;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  @Index()
  status: PaymentStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number; // R$

  @Column({ default: 'BRL' })
  currency: string;

  // Stripe
  @Column({ nullable: true })
  stripePaymentIntentId: string;

  @Column({ nullable: true })
  stripeTransferId: string;

  // Reference
  @Column({ nullable: true })
  referenceType: string; // 'challenge', 'order', 'investment'

  @Column({ nullable: true })
  referenceId: string;

  // Split tracking (for challenge payouts)
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  winnerAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  fundAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  feeAmount: number;

  // Escrow
  @Column({ type: 'timestamp', nullable: true })
  escrowHeldAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  escrowReleasedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
