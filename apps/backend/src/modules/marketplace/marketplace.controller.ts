import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ProductCategory } from '../../common/types';

@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Get('products')
  async listProducts(
    @Query('category') category?: ProductCategory,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const [products, total] = await this.marketplaceService.listProducts(
      category, page || 1, limit || 20,
    );
    return { products, total };
  }

  @Get('products/:id')
  async getProduct(@Param('id') id: string) {
    return this.marketplaceService.getProduct(id);
  }

  @Post('products')
  @UseGuards(JwtAuthGuard)
  async createProduct(@Body() body: any) {
    return this.marketplaceService.createProduct(body);
  }

  @Post('orders')
  @UseGuards(JwtAuthGuard)
  async createOrder(
    @CurrentUser('id') userId: string,
    @Body() body: { productId: string; quantity?: number; payWithVita?: boolean },
  ) {
    return this.marketplaceService.createOrder(
      userId, body.productId, body.quantity || 1, body.payWithVita,
    );
  }

  @Get('orders/my')
  @UseGuards(JwtAuthGuard)
  async myOrders(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
  ) {
    const [orders, total] = await this.marketplaceService.getUserOrders(userId, page || 1);
    return { orders, total };
  }
}
