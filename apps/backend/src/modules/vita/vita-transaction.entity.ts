import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { VitaTransactionType } from '../../common/types';
import { User } from '../users/user.entity';

@Entity('vita_transactions')
export class VitaTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'enum', enum: VitaTransactionType })
  @Index()
  type: VitaTransactionType;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number; // Positivo = crédito, Negativo = débito

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  balanceAfter: number; // Saldo após transação

  // Burn tracking
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  burnAmount: number; // 20% burn em gastos

  // Reference
  @Column({ nullable: true })
  referenceType: string; // 'challenge', 'product', 'investment', etc.

  @Column({ nullable: true })
  referenceId: string; // ID da entidade relacionada

  // From/To (para transfers e investments)
  @Column({ nullable: true })
  fromUserId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'fromUserId' })
  fromUser: User;

  @Column({ nullable: true })
  toUserId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'toUserId' })
  toUser: User;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  @Index()
  createdAt: Date;
}
