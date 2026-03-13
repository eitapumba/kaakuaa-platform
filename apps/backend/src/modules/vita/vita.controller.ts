import { Controller, Get, Post, Body, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { VitaService } from './vita.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('vita')
export class VitaController {
  constructor(private readonly vitaService: VitaService) {}

  @Get('balance')
  @UseGuards(JwtAuthGuard)
  async getBalance(@CurrentUser('id') userId: string) {
    const balance = await this.vitaService.getBalance(userId);
    return { balance };
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getHistory(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const [transactions, total] = await this.vitaService.getHistory(userId, page || 1, limit || 50);
    return { transactions, total };
  }

  @Post('transfer')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async transfer(
    @CurrentUser('id') fromUserId: string,
    @Body() body: { toUserId: string; amount: number; description?: string },
  ) {
    return this.vitaService.transfer(fromUserId, body.toUserId, body.amount, body.description);
  }
}
