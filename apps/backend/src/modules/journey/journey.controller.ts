import {
  Controller, Get, Post, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { JourneyService } from './journey.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { LeagueTier, SubmissionType } from '../../common/types';

@Controller('journeys')
export class JourneyController {
  constructor(private readonly journeyService: JourneyService) {}

  // ============================================
  // CRIAR JORNADA
  // POST /journeys
  // ============================================
  @Post()
  @UseGuards(JwtAuthGuard)
  async createJourney(
    @CurrentUser('id') userId: string,
    @Body() body: {
      title?: string;
      description?: string;
      tier: LeagueTier;
      stakePerStage: number;
    },
  ) {
    return this.journeyService.createJourney(userId, body);
  }

  // ============================================
  // LISTAR JORNADAS ATIVAS
  // GET /journeys
  // ============================================
  @Get()
  async listJourneys(
    @Query('tier') tier?: LeagueTier,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const [journeys, total] = await this.journeyService.listActive(
      tier, page || 1, limit || 20,
    );
    return { journeys, total, page: page || 1 };
  }

  // ============================================
  // MINHAS JORNADAS
  // GET /journeys/my
  // ============================================
  @Get('my')
  @UseGuards(JwtAuthGuard)
  async myJourneys(@CurrentUser('id') userId: string) {
    return this.journeyService.getUserJourneys(userId);
  }

  // ============================================
  // DETALHES DA JORNADA
  // GET /journeys/:id
  // ============================================
  @Get(':id')
  async getJourney(@Param('id') id: string) {
    return this.journeyService.findById(id);
  }

  // ============================================
  // PARTICIPAR DE UM ESTÁGIO
  // POST /journeys/:id/stages/:stageId/join
  // ============================================
  @Post(':id/stages/:stageId/join')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async joinStage(
    @Param('id') journeyId: string,
    @Param('stageId') stageId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.journeyService.joinStage(journeyId, stageId, userId);
  }

  // ============================================
  // INICIAR ESTÁGIO
  // POST /journeys/:id/stages/:stageId/start
  // ============================================
  @Post(':id/stages/:stageId/start')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async startStage(
    @Param('id') journeyId: string,
    @Param('stageId') stageId: string,
  ) {
    return this.journeyService.startStage(journeyId, stageId);
  }

  // ============================================
  // SUBMETER TRABALHO
  // POST /journeys/:id/stages/:stageId/submit
  // ============================================
  @Post(':id/stages/:stageId/submit')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async submitWork(
    @Param('id') journeyId: string,
    @Param('stageId') stageId: string,
    @CurrentUser('id') userId: string,
    @Body() body: {
      type: SubmissionType;
      url?: string;
      text?: string;
      metadata?: Record<string, any>;
    },
  ) {
    return this.journeyService.submitWork(journeyId, stageId, userId, body);
  }

  // ============================================
  // VER SUBMISSÕES DO ESTÁGIO (para votação)
  // GET /journeys/:id/stages/:stageId/submissions
  // ============================================
  @Get(':id/stages/:stageId/submissions')
  async getSubmissions(@Param('stageId') stageId: string) {
    return this.journeyService.getStageSubmissions(stageId);
  }

  // ============================================
  // VOTAR
  // POST /journeys/:id/stages/:stageId/vote
  // ============================================
  @Post(':id/stages/:stageId/vote')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async vote(
    @Param('stageId') stageId: string,
    @CurrentUser('id') voterId: string,
    @Body() body: { participantId: string; vitaAmount?: number },
  ) {
    return this.journeyService.vote(stageId, voterId, body.participantId, body.vitaAmount);
  }

  // ============================================
  // RESULTADOS DA VOTAÇÃO
  // GET /journeys/:id/stages/:stageId/results
  // ============================================
  @Get(':id/stages/:stageId/results')
  async getVotingResults(@Param('stageId') stageId: string) {
    return this.journeyService.getVotingResults(stageId);
  }

  // ============================================
  // FINALIZAR ESTÁGIO (admin ou automático)
  // POST /journeys/:id/stages/:stageId/complete
  // ============================================
  @Post(':id/stages/:stageId/complete')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async completeStage(
    @Param('id') journeyId: string,
    @Param('stageId') stageId: string,
  ) {
    return this.journeyService.completeStage(journeyId, stageId);
  }
}
