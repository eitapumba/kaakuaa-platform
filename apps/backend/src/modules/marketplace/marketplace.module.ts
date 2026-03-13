import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { Order } from './order.entity';
import { MarketplaceService } from './marketplace.service';
import { MarketplaceController } from './marketplace.controller';
import { UsersModule } from '../users/users.module';
import { VitaModule } from '../vita/vita.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Order]),
    UsersModule,
    VitaModule,
  ],
  controllers: [MarketplaceController],
  providers: [MarketplaceService],
  exports: [MarketplaceService],
})
export class MarketplaceModule {}
