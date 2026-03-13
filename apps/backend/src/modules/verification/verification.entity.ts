import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { VerificationMethod, VerificationStatus } from '../../common/types';
import { User } from '../users/user.entity';
import { Challenge } from '../challenges/challenge.entity';

@Entity('verifications')
export class Verification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  challengeId: string;

  @ManyToOne(() => Challenge)
  @JoinColumn({ name: 'challengeId' })
  challenge: Challenge;

  @Column()
  @Index()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'enum', enum: VerificationMethod })
  method: VerificationMethod;

  @Column({ type: 'enum', enum: VerificationStatus, default: VerificationStatus.PENDING })
  @Index()
  status: VerificationStatus;

  // AI Scoring
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  aiScore: number; // 0-100

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  finalScore: number; // Score final (após revisão manual se aplicável)

  // Evidence
  @Column({ type: 'text', nullable: true })
  evidenceUrl: string; // URL do arquivo (foto, video, recording)

  @Column({ type: 'jsonb', nullable: true })
  evidenceData: {
    gpsCoordinates?: { lat: number; lng: number };
    timestamp?: string;
    deviceInfo?: string;
    gameData?: Record<string, any>; // OCR results, game stats
    wearableData?: Record<string, any>; // Heart rate, steps, etc
    satelliteData?: Record<string, any>; // NDVI scores
  };

  // AI Analysis
  @Column({ type: 'jsonb', nullable: true })
  aiAnalysis: {
    confidence: number;
    findings: string[];
    flags: string[];        // Red flags detectados
    modelUsed: string;      // Qual modelo AI analisou
    processingTime: number; // ms
  };

  // Manual Review
  @Column({ nullable: true })
  reviewerId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewerId' })
  reviewer: User;

  @Column({ type: 'text', nullable: true })
  reviewNotes: string;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date;

  // Appeal
  @Column({ type: 'text', nullable: true })
  appealReason: string;

  @Column({ type: 'timestamp', nullable: true })
  appealedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
