import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VitaTransaction } from './vita-transaction.entity';
import { VitaService } from './vita.service';
import { VitaController } from './vita.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VitaTransaction]),
    forwardRef(() => UsersModule),
  ],
  controllers: [VitaController],
  providers: [VitaService],
  exports: [VitaService],
})
export class VitaModule {}
