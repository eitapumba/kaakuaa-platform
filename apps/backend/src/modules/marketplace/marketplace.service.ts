import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { Order } from './order.entity';
import { OrderStatus, ProductCategory, VitaTransactionType } from '../../common/types';
import { VitaService } from '../vita/vita.service';

@Injectable()
export class MarketplaceService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    private readonly vitaService: VitaService,
  ) {}

  // --- Products ---

  async createProduct(data: Partial<Product>): Promise<Product> {
    const product = this.productRepo.create(data);
    return this.productRepo.save(product);
  }

  async listProducts(category?: ProductCategory, page = 1, limit = 20) {
    const where: any = { isAvailable: true };
    if (category) where.category = category;

    return this.productRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async getProduct(id: string): Promise<Product> {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Produto não encontrado');
    return product;
  }

  // --- Orders ---

  async createOrder(userId: string, productId: string, quantity = 1, payWithVita = false): Promise<Order> {
    const product = await this.getProduct(productId);

    if (!product.isAvailable) {
      throw new BadRequestException('Produto não disponível');
    }

    if (product.stockQuantity > 0 && product.stockQuantity < quantity) {
      throw new BadRequestException('Estoque insuficiente');
    }

    let totalReal = Number(product.priceReal) * quantity;
    let totalVita = 0;
    let vitaBurned = 0;

    if (payWithVita && product.priceVita) {
      totalVita = Number(product.priceVita) * quantity;
      totalReal = 0;

      // Debit VITA (includes 20% burn)
      const { transaction } = await this.vitaService.debit(
        userId, totalVita, VitaTransactionType.SPEND_MARKETPLACE,
        { referenceType: 'product', referenceId: productId },
      );
      vitaBurned = Number(transaction.burnAmount);
    }

    const order = this.orderRepo.create({
      userId,
      productId,
      quantity,
      status: OrderStatus.PENDING,
      totalReal,
      totalVita,
      vitaBurned,
    });

    // Decrease stock
    if (product.stockQuantity > 0) {
      product.stockQuantity -= quantity;
      await this.productRepo.save(product);
    }

    // Increment sales count
    await this.productRepo.increment({ id: productId }, 'totalSold', quantity);

    return this.orderRepo.save(order);
  }

  async getUserOrders(userId: string, page = 1, limit = 20) {
    return this.orderRepo.findAndCount({
      where: { userId },
      relations: ['product'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const order = await this.orderRepo.findOneOrFail({ where: { id: orderId } });
    order.status = status;
    return this.orderRepo.save(order);
  }
}
