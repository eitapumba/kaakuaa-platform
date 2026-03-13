import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, Index,
} from 'typeorm';
import { ProductCategory } from '../../common/types';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ProductCategory })
  @Index()
  category: ProductCategory;

  // Pricing
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  priceReal: number; // R$

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  priceVita: number; // Preço em VITA (alternativo)

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  discountedPrice: number;

  // Inventory (para produtos físicos)
  @Column({ type: 'int', default: 0 })
  stockQuantity: number;

  @Column({ default: true })
  isAvailable: boolean;

  // Images
  @Column({ type: 'text', array: true, default: '{}' })
  imageUrls: string[];

  @Column({ nullable: true })
  thumbnailUrl: string;

  // Experience fields (spas, surf clubs, retiros)
  @Column({ nullable: true })
  location: string;

  @Column({ type: 'jsonb', nullable: true })
  coordinates: { lat: number; lng: number };

  @Column({ type: 'int', nullable: true })
  durationMinutes: number; // Duração da experiência

  @Column({ type: 'int', nullable: true })
  maxCapacity: number;

  // Subscription fields
  @Column({ type: 'int', nullable: true })
  billingCycleDays: number; // 30 = mensal

  @Column({ nullable: true })
  stripeProductId: string;

  @Column({ nullable: true })
  stripePriceId: string;

  // Rank requirement
  @Column({ nullable: true })
  minRankRequired: string; // Rank mínimo para comprar

  // Stats
  @Column({ default: 0 })
  totalSold: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  averageRating: number;

  @Column({ default: 0 })
  reviewCount: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
