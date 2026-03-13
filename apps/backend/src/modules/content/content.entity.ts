import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { ContentType } from '../../common/types';
import { User } from '../users/user.entity';

@Entity('contents')
export class Content {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ContentType })
  @Index()
  type: ContentType;

  // Creator
  @Column()
  @Index()
  creatorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  // Media
  @Column({ type: 'text' })
  mediaUrl: string;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({ type: 'int', nullable: true })
  durationSeconds: number;

  @Column({ nullable: true })
  resolution: string; // '1080p', '4k', etc.

  // Reference
  @Column({ nullable: true })
  challengeId: string; // Desafio relacionado

  // Engagement
  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  likeCount: number;

  @Column({ default: 0 })
  shareCount: number;

  @Column({ default: 0 })
  commentCount: number;

  // Monetization (royalties para investors)
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalRoyaltiesGenerated: number;

  @Column({ type: 'decimal', precision: 8, scale: 6, default: 0 })
  revenuePerView: number; // R$ por view

  // Status
  @Column({ default: true })
  isPublished: boolean;

  @Column({ default: false })
  isFeatured: boolean; // Destaque na TV Kaa Kuaa

  // Tags & SEO
  @Column({ type: 'text', array: true, default: '{}' })
  tags: string[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
