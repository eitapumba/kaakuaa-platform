import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { InvestmentsService } from './investments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('investments')
export class InvestmentsController {
  constructor(private readonly investmentsService: InvestmentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async invest(@CurrentUser('id') investorId: string, @Body() body: any) {
    return this.investmentsService.invest({ investorId, ...body });
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async myInvestments(@CurrentUser('id') investorId: string) {
    return this.investmentsService.getMyInvestments(investorId);
  }

  @Get('player/:playerId')
  async playerInvestors(@Param('playerId') playerId: string) {
    return this.investmentsService.getPlayerInvestors(playerId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getOne(@Param('id') id: string) {
    return this.investmentsService.getInvestmentById(id);
  }
}
