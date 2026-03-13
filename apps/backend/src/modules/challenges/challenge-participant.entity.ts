import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Unique,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Challenge } from './challenge.entity';

export enum ParticipantStatus {
  JOINED = 'joined',
  STAKE_DEPOSITED = 'stake_deposited',
  ACTIVE = 'active',
  SUBMITTED = 'submitted',   // Evidências enviadas
  WON = 'won',
  LOST = 'lost',
  WITHDRAWN = 'withdrawn',
  DISQUALIFIED = 'disqualified',
}

@Entity('challenge_participants')
@Unique(['challengeId', 'userId'])
export class ChallengeParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  challengeId: string;

  @ManyToOne(() => Challenge)
  @JoinColumn({ name: 'challengeId' })
  challenge: Challenge;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'enum', enum: ParticipantStatus, default: ParticipantStatus.JOINED })
  status: ParticipantStatus;

  // Stake
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  stakeDeposited: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  vitaDeposited: number;

  // Results
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  verificationScore: number; // Score final de verificação

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  amountWon: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  vitaEarned: number;

  // Evidence
  @Column({ type: 'jsonb', nullable: true })
  evidence: {
    type: string;
    url: string;
    metadata?: Record<string, any>;
    submittedAt: string;
  }[];

  @CreateDateColumn()
  joinedAt: Date;
}
