import { Controller, Get, Put, Body, Param, UseGuards, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser('id') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  async updateMe(
    @CurrentUser('id') userId: string,
    @Body() body: { displayName?: string; bio?: string; avatarUrl?: string },
  ) {
    return this.usersService.update(userId, body);
  }

  @Get('leaderboard')
  async getLeaderboard(@Query('limit') limit?: number) {
    return this.usersService.getLeaderboard(limit || 50);
  }

  @Get(':id/profile')
  async getPublicProfile(@Param('id') id: string) {
    return this.usersService.getProfile(id);
  }
}
