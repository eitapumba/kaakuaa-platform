import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import {
  JourneyStageType, JourneyStageStatus, SubmissionType,
} from '../../common/types';
import { User } from '../users/user.entity';
import { Journey } from './journey.entity';
import { Challenge } from '../challenges/challenge.entity';

@Entity('journey_stages')
export class JourneyStage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Referência à Jornada
  @Column()
  journeyId: string;

  @ManyToOne(() => Journey, journey => journey.stages)
  @JoinColumn({ name: 'journeyId' })
  journey: Journey;

  // Tipo e ordem do estágio
  @Column({ type: 'enum', enum: JourneyStageType })
  stageType: JourneyStageType;

  @Column({ type: 'int' })
  @Index()
  stageOrder: number; // 1-5

  @Column({ type: 'enum', enum: JourneyStageStatus, default: JourneyStageStatus.PENDING })
  @Index()
  status: JourneyStageStatus;

  // Desafio associado (criado quando o estágio abre)
  @Column({ nullable: true })
  challengeId: string;

  @ManyToOne(() => Challenge, { nullable: true })
  @JoinColumn({ name: 'challengeId' })
  challenge: Challenge;

  // Tipos de submissão aceitos
  @Column({
    type: 'enum',
    enum: SubmissionType,
    array: true,
  })
  acceptedSubmissionTypes: SubmissionType[];

  @Column({ type: 'int' })
  maxParticipants: number;

  @Column({ type: 'int', default: 0 })
  currentParticipants: number;

  // Votação pública
  @Column({ type: 'int', default: 48 })
  votingDurationHours: number;

  @Column({ type: 'timestamp', nullable: true })
  votingStartsAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  votingEndsAt: Date;

  // Vencedor do estágio
  @Column({ nullable: true })
  winnerId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'winnerId' })
  winner: User;

  // Material do estágio anterior (input para este estágio)
  @Column({ type: 'jsonb', nullable: true })
  previousStageOutput: {
    stageType: JourneyStageType;
    winnerId: string;
    winnerName: string;
    content: {
      type: SubmissionType;
      url?: string;
      text?: string;
      metadata?: Record<string, any>;
    };
  };

  // Objetivos/regras específicas do estágio
  @Column({ type: 'jsonb', nullable: true })
  objectives: string[];

  // Nome e descrição do estágio
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
