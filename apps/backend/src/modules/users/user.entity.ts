import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToMany, Index,
} from 'typeorm';
import { UserRole, UserRank } from '../../common/types';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  email: string;

  @Column({ nullable: true })
  passwordHash: string;

  @Column()
  displayName: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.PLAYER })
  role: UserRole;

  @Column({ type: 'enum', enum: UserRank, default: UserRank.RECRUTA })
  rank: UserRank;

  // VITA Balance
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  vitaBalance: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  vitaLifetimeEarned: number;

  @Column({ type: 'timestamp', nullable: true })
  vitaLastActivity: Date;

  // Stats
  @Column({ default: 0 })
  challengesCompleted: number;

  @Column({ default: 0 })
  challengesWon: number;

  @Column({ default: 0 })
  currentStreak: number;

  @Column({ default: 0 })
  longestStreak: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalEarnings: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalImpactContributed: number; // R$ sent to Regeneration Fund

  // Social
  @Column({ nullable: true })
  guildId: string;

  @Column({ default: 0 })
  investorsCount: number; // Quantas pessoas investiram neste player

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalInvestmentReceived: number;

  // Auth
  @Column({ nullable: true })
  googleId: string;

  @Column({ nullable: true })
  appleId: string;

  @Column({ nullable: true })
  refreshToken: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
