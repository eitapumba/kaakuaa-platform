import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index,
} from 'typeorm';
import {
  ChallengeCategory, ChallengeStatus, ChallengeType, LeagueTier,
  VerificationMethod,
} from '../../common/types';
import { User } from '../users/user.entity';

@Entity('challenges')
export class Challenge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ChallengeCategory })
  @Index()
  category: ChallengeCategory;

  @Column({ type: 'enum', enum: ChallengeType, default: ChallengeType.ONE_VS_ONE })
  type: ChallengeType;

  @Column({ type: 'enum', enum: ChallengeStatus, default: ChallengeStatus.DRAFT })
  @Index()
  status: ChallengeStatus;

  @Column({ type: 'enum', enum: LeagueTier })
  tier: LeagueTier;

  // Stakes
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  stakeAmount: number; // Valor por participante (R$)

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalPool: number; // Pool total acumulado

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  vitaPool: number; // VITA depositada no desafio

  // Creator
  @Column()
  creatorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  // Winner
  @Column({ nullable: true })
  winnerId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'winnerId' })
  winner: User;

  // Rules & Verification
  @Column({ type: 'jsonb', nullable: true })
  rules: Record<string, any>; // Regras específicas do desafio

  @Column({
    type: 'enum',
    enum: VerificationMethod,
    array: true,
    default: [VerificationMethod.PHOTO_GPS],
  })
  verificationMethods: VerificationMethod[];

  @Column({ type: 'int', default: 85 })
  verificationThreshold: number; // Score mínimo pra aprovar automático

  // Timing
  @Column({ type: 'timestamp', nullable: true })
  startsAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  endsAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  matchedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  // Participants
  @Column({ type: 'int', default: 2 })
  maxParticipants: number;

  @Column({ type: 'int', default: 0 })
  currentParticipants: number;

  // Content & Engagement
  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  likeCount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalInvestmentReceived: number; // Investimento de espectadores

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Game-specific data (ex: nome do jogo, rank, etc)

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
