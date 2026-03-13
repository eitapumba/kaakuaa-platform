import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async myPayments(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const [payments, total] = await this.paymentsService.getUserPayments(userId, page || 1, limit || 20);
    return { payments, total };
  }

  @Post('webhook/stripe')
  async stripeWebhook(@Body() body: any) {
    // TODO: Handle Stripe webhook events
    // payment_intent.succeeded, charge.refunded, etc.
    return { received: true };
  }
}
