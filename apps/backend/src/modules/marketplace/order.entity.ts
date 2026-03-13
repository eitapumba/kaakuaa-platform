import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { OrderStatus } from '../../common/types';
import { User } from '../users/user.entity';
import { Product } from './product.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  @Index()
  status: OrderStatus;

  // Pricing
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalReal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalVita: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  vitaBurned: number; // 20% burn

  // Payment
  @Column({ nullable: true })
  paymentId: string;

  @Column({ nullable: true })
  stripePaymentIntentId: string;

  // Shipping (para produtos físicos)
  @Column({ type: 'jsonb', nullable: true })
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  @Column({ nullable: true })
  trackingCode: string;

  // Experience booking
  @Column({ type: 'timestamp', nullable: true })
  scheduledAt: Date; // Para experiências agendadas

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
