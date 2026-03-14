import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Journey } from './journey.entity';
import { JourneyStage } from './journey-stage.entity';
import { JourneyVote } from './journey-vote.entity';
import { Challenge } from '../challenges/challenge.entity';
import { ChallengeParticipant } from '../challenges/challenge-participant.entity';
import { JourneyService } from './journey.service';
import { JourneyController } from './journey.controller';
import { ChallengesModule } from '../challenges/challenges.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Journey,
      JourneyStage,
      JourneyVote,
      Challenge,
      ChallengeParticipant,
    ]),
    ChallengesModule,
    UsersModule,
  ],
  controllers: [JourneyController],
  providers: [JourneyService],
  exports: [JourneyService],
})
export class JourneyModule {}
