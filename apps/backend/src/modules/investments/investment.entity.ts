import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { InvestmentContractType, InvestmentStatus } from '../../common/types';
import { User } from '../users/user.entity';

@Entity('investments')
export class Investment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Investidor
  @Column()
  @Index()
  investorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'investorId' })
  investor: User;

  // Player que recebe investimento
  @Column()
  @Index()
  playerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'playerId' })
  player: User;

  @Column({ type: 'enum', enum: InvestmentContractType })
  contractType: InvestmentContractType;

  @Column({ type: 'enum', enum: InvestmentStatus, default: InvestmentStatus.ACTIVE })
  @Index()
  status: InvestmentStatus;

  // Valores
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amountInvested: number; // R$ investido

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  vitaInvested: number; // VITA investida

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalReturned: number; // Total retornado até agora

  // Termos do contrato
  @Column({ type: 'decimal', precision: 5, scale: 2 })
  returnPercentage: number; // % de retorno (ex: 5% das vitórias)

  @Column({ type: 'int' })
  durationDays: number; // Duração do contrato em dias

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  // Returns breakdown
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  challengeReturns: number; // De vitórias em desafios

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  contentReturns: number; // De royalties de conteúdo

  @Column({ type: 'int', default: 0 })
  experienceAccessCount: number; // Experiências acessadas

  // Payment tracking
  @Column({ nullable: true })
  stripeSubscriptionId: string; // Se investimento recorrente

  @Column({ type: 'jsonb', nullable: true })
  returnHistory: {
    date: string;
    amount: number;
    source: string; // 'challenge_win', 'content_royalty', 'experience'
    referenceId: string;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
