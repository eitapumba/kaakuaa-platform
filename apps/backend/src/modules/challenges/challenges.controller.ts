import {
  Controller, Get, Post, Delete, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ChallengesService } from './challenges.service';
import { SmartFeedService } from './smart-feed.service';
import { MatchmakingService } from './matchmaking.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ChallengeCategory, ChallengeStatus } from '../../common/types';

@Controller('challenges')
export class ChallengesController {
  constructor(
    private readonly challengesService: ChallengesService,
    private readonly smartFeedService: SmartFeedService,
    private readonly matchmakingService: MatchmakingService,
    private readonly usersService: UsersService,
  ) {}

  // ============================================
  // MATCHMAKING — FLOW PRINCIPAL
  // Usuário escolhe categoria → entra na fila → match automático
  //
  // POST /challenges/matchmaking/join  { category, stakeAmount }
  // DELETE /challenges/matchmaking/leave  { category }
  // GET /challenges/matchmaking/stats
  // ============================================

  @Post('matchmaking/join')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async joinMatchmaking(
    @CurrentUser('id') userId: string,
    @Body() body: {
      category: ChallengeCategory;
      stakeAmount: number;
      preferLive?: boolean;
    },
  ) {
    return this.matchmakingService.joinQueue(
      userId,
      body.category,
      body.stakeAmount,
      body.preferLive ?? true,
    );
  }

  @Delete('matchmaking/leave')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async leaveMatchmaking(
    @CurrentUser('id') userId: string,
    @Body() body: { category: ChallengeCategory },
  ) {
    await this.matchmakingService.leaveQueue(userId, body.category);
    return { ok: true };
  }

  @Get('matchmaking/stats')
  async matchmakingStats() {
    return this.matchmakingService.getQueueStats();
  }

  // ============================================
  // FEED — Desafios abertos (para quem quer escolher manualmente)
  // ============================================

  @Get()
  async list(
    @Query('category') category?: ChallengeCategory,
    @Query('tier') tier?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const [challenges, total] = await this.challengesService.listOpen(
      category, tier, page || 1, limit || 20,
    );
    return { challenges, total, page: page || 1 };
  }

  @Get('feed')
  @UseGuards(JwtAuthGuard)
  async smartFeed(
    @CurrentUser('id') userId: string,
    @Query('category') category?: ChallengeCategory,
    @Query('limit') limit?: number,
  ) {
    const user = await this.usersService.findByIdOrFail(userId);
    const feed = await this.smartFeedService.getSmartFeed({
      userId,
      user,
      limit: limit || 10,
      category,
    });
    return { challenges: feed, smart: true };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@CurrentUser('id') userId: string, @Body() body: any) {
    return this.challengesService.create(userId, body);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async myChallenges(
    @CurrentUser('id') userId: string,
    @Query('status') status?: ChallengeStatus,
  ) {
    return this.challengesService.getUserChallenges(userId, status);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.challengesService.findById(id);
  }

  @Post(':id/open')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async openChallenge(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.challengesService.depositStakeAndOpen(id, userId);
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async joinChallenge(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.challengesService.joinChallenge(id, userId);
  }

  @Post(':id/start')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async startChallenge(@Param('id') id: string) {
    return this.challengesService.startChallenge(id);
  }

  @Post(':id/evidence')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async submitEvidence(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() body: { type: string; url: string; metadata?: any },
  ) {
    return this.challengesService.submitEvidence(id, userId, body);
  }

  @Get(':id/participants')
  async getParticipants(@Param('id') id: string) {
    return this.challengesService.getParticipants(id);
  }
}
