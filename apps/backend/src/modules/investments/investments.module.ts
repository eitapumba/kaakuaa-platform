import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Investment } from './investment.entity';
import { InvestmentsService } from './investments.service';
import { InvestmentsController } from './investments.controller';
import { UsersModule } from '../users/users.module';
import { VitaModule } from '../vita/vita.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Investment]),
    UsersModule,
    VitaModule,
  ],
  controllers: [InvestmentsController],
  providers: [InvestmentsService],
  exports: [InvestmentsService],
})
export class InvestmentsModule {}
