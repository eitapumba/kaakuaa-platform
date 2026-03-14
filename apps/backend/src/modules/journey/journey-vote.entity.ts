import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Unique,
} from 'typeorm';
import { User } from '../users/user.entity';
import { JourneyStage } from './journey-stage.entity';
import { ChallengeParticipant } from '../challenges/challenge-participant.entity';

@Entity('journey_votes')
@Unique(['stageId', 'voterId']) // Um voto por pessoa por estágio
export class JourneyVote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Estágio votado
  @Column()
  stageId: string;

  @ManyToOne(() => JourneyStage)
  @JoinColumn({ name: 'stageId' })
  stage: JourneyStage;

  // Quem votou
  @Column()
  voterId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'voterId' })
  voter: User;

  // Participante que recebeu o voto
  @Column()
  participantId: string;

  @ManyToOne(() => ChallengeParticipant)
  @JoinColumn({ name: 'participantId' })
  participant: ChallengeParticipant;

  // VITA gasta no voto (voto com peso)
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 1 })
  vitaSpent: number;

  @CreateDateColumn()
  votedAt: Date;
}
