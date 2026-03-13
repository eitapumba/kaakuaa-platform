import { Controller, Get, Post, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ContentService } from './content.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ContentType } from '../../common/types';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get('feed')
  async getFeed(
    @Query('type') type?: ContentType,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const [content, total] = await this.contentService.listFeed(type, page || 1, limit || 20);
    return { content, total };
  }

  @Get('featured')
  async getFeatured(@Query('limit') limit?: number) {
    return this.contentService.getFeatured(limit || 10);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@CurrentUser('id') creatorId: string, @Body() body: any) {
    return this.contentService.create({ ...body, creatorId });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.contentService.findById(id);
  }

  @Post(':id/view')
  @HttpCode(HttpStatus.OK)
  async view(@Param('id') id: string) {
    await this.contentService.incrementView(id);
    return { ok: true };
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async like(@Param('id') id: string) {
    await this.contentService.incrementLike(id);
    return { ok: true };
  }

  @Get('challenge/:challengeId')
  async getChallengeContent(@Param('challengeId') challengeId: string) {
    return this.contentService.getChallengeContent(challengeId);
  }

  @Get('user/:userId')
  async getUserContent(@Param('userId') userId: string, @Query('page') page?: number) {
    const [content, total] = await this.contentService.getUserContent(userId, page || 1);
    return { content, total };
  }
}
