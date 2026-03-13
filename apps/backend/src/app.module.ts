import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

// Config
import { appConfig, databaseConfig, redisConfig, jwtConfig, stripeConfig, vitaConfig, challengeConfig } from './config/app.config';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ChallengesModule } from './modules/challenges/challenges.module';
import { VitaModule } from './modules/vita/vita.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { VerificationModule } from './modules/verification/verification.module';
import { InvestmentsModule } from './modules/investments/investments.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { ContentModule } from './modules/content/content.module';

// Entities
import { User } from './modules/users/user.entity';
import { Challenge } from './modules/challenges/challenge.entity';
import { ChallengeParticipant } from './modules/challenges/challenge-participant.entity';
import { VitaTransaction } from './modules/vita/vita-transaction.entity';
import { Payment } from './modules/payments/payment.entity';
import { Verification } from './modules/verification/verification.entity';
import { Investment } from './modules/investments/investment.entity';
import { Product } from './modules/marketplace/product.entity';
import { Order } from './modules/marketplace/order.entity';
import { Content } from './modules/content/content.entity';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig, jwtConfig, stripeConfig, vitaConfig, challengeConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService): any => {
        const dbUrl = config.get('database.url');
        const baseConfig = {
          type: 'postgres' as const,
          entities: [
            User, Challenge, ChallengeParticipant,
            VitaTransaction, Payment, Verification,
            Investment, Product, Order, Content,
          ],
          synchronize: true, // Para MVP — em produção usar migrations
          logging: config.get('app.nodeEnv') === 'development',
        };

        // Se DATABASE_URL existe (Neon/Railway), usar connection string
        if (dbUrl) {
          return {
            ...baseConfig,
            url: dbUrl,
            ssl: { rejectUnauthorized: false },
          };
        }

        // Senão, usar variáveis individuais (local dev)
        return {
          ...baseConfig,
          host: config.get<string>('database.host'),
          port: config.get<number>('database.port'),
          username: config.get<string>('database.username'),
          password: config.get<string>('database.password'),
          database: config.get<string>('database.name'),
        };
      },
      inject: [ConfigService],
    }),

    // Scheduled tasks (decay, investment expiry, etc)
    ScheduleModule.forRoot(),

    // Feature modules
    AuthModule,
    UsersModule,
    ChallengesModule,
    VitaModule,
    PaymentsModule,
    VerificationModule,
    InvestmentsModule,
    MarketplaceModule,
    ContentModule,
  ],
})
export class AppModule {}
