import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index,
} from 'typeorm';
import { JourneyStatus, LeagueTier } from '../../common/types';
import { User } from '../users/user.entity';
import { JourneyStage } from './journey-stage.entity';

@Entity('journeys')
export class Journey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'Jornada do Herói' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: JourneyStatus, default: JourneyStatus.RECRUITING })
  @Index()
  status: JourneyStatus;

  @Column({ type: 'enum', enum: LeagueTier })
  tier: LeagueTier;

  // Stake por estágio — cada participante paga isso ao entrar em um estágio
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  stakePerStage: number;

  // Pool total acumulado de todos os estágios
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalPool: number;

  // Estágio atual (1-5)
  @Column({ type: 'int', default: 1 })
  currentStageOrder: number;

  // Criador da Jornada
  @Column()
  creatorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  // Estágios da jornada
  @OneToMany(() => JourneyStage, stage => stage.journey, { cascade: true })
  stages: JourneyStage[];

  // Metadata para o produto final (curta-metragem)
  @Column({ type: 'jsonb', nullable: true })
  finalProduct: {
    screenplayText?: string;       // Roteiro vencedor
    screenplayVideoUrl?: string;   // Vídeo do roteiro (se narrado)
    storyboardImages?: string[];   // Storyboard vencedor
    cinematographyUrl?: string;    // Vídeo filmado vencedor
    soundtrackUrl?: string;        // Trilha sonora vencedora
    finalFilmUrl?: string;         // Curta-metragem final
  };

  // Engagement
  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  followerCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;
}
