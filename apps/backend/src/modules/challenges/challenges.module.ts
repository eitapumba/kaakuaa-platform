import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Challenge } from './challenge.entity';
import { ChallengeParticipant } from './challenge-participant.entity';
import { ChallengesService } from './challenges.service';
import { ChallengesController } from './challenges.controller';
import { ChallengesGateway } from './challenges.gateway';
import { SmartFeedService } from './smart-feed.service';
import { MatchmakingService } from './matchmaking.service';
import { UsersModule } from '../users/users.module';
import { VitaModule } from '../vita/vita.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Challenge, ChallengeParticipant]),
    UsersModule,
    VitaModule,
    PaymentsModule,
  ],
  controllers: [ChallengesController],
  providers: [ChallengesService, ChallengesGateway, SmartFeedService, MatchmakingService],
  exports: [ChallengesService, ChallengesGateway, MatchmakingService],
})
export class ChallengesModule {}
