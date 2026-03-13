import { Controller, Get, Post, Put, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('verifications')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() body: any) {
    return this.verificationService.create(body);
  }

  @Post(':id/process')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async process(@Param('id') id: string) {
    return this.verificationService.processVerification(id);
  }

  @Put(':id/review')
  @UseGuards(JwtAuthGuard)
  async review(
    @Param('id') id: string,
    @CurrentUser('id') reviewerId: string,
    @Body() body: { approved: boolean; notes?: string },
  ) {
    return this.verificationService.manualReview(id, reviewerId, body.approved, body.notes);
  }

  @Post(':id/appeal')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async appeal(@Param('id') id: string, @Body() body: { reason: string }) {
    return this.verificationService.appeal(id, body.reason);
  }

  @Get('challenge/:challengeId')
  async getChallengeVerifications(@Param('challengeId') challengeId: string) {
    return this.verificationService.getChallengeVerifications(challengeId);
  }
}
