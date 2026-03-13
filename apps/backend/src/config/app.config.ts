import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || 'api/v1',
}));

export const databaseConfig = registerAs('database', () => ({
  // Suporta DATABASE_URL (Neon/Railway) ou variáveis individuais
  url: process.env.DATABASE_URL || '',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  name: process.env.DATABASE_NAME || 'kaakuaa',
  username: process.env.DATABASE_USER || 'kaakuaa',
  password: process.env.DATABASE_PASSWORD || '',
  ssl: process.env.DATABASE_SSL === 'true' || !!process.env.DATABASE_URL,
}));

export const redisConfig = registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
}));

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'dev-secret-change-me',
  expiresIn: process.env.JWT_EXPIRATION || '7d',
}));

export const stripeConfig = registerAs('stripe', () => ({
  secretKey: process.env.STRIPE_SECRET_KEY || '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
}));

export const vitaConfig = registerAs('vita', () => ({
  burnRate: parseFloat(process.env.VITA_BURN_RATE || '0.20'),
  decayDays: parseInt(process.env.VITA_DECAY_DAYS || '90', 10),
  decayRate: parseFloat(process.env.VITA_DECAY_RATE || '0.05'),
  dailyCap: parseInt(process.env.VITA_DAILY_CAP || '10000', 10),
}));

export const challengeConfig = registerAs('challenge', () => ({
  winnerSplit: parseFloat(process.env.CHALLENGE_WINNER_SPLIT || '0.70'),
  fundSplit: parseFloat(process.env.CHALLENGE_FUND_SPLIT || '0.30'),
  feeRate: parseFloat(process.env.CHALLENGE_FEE_RATE || '0.15'),
}));

// Default export for ConfigModule.load
export default () => ({
  ...appConfig(),
  ...databaseConfig(),
  ...redisConfig(),
  ...jwtConfig(),
  ...stripeConfig(),
  ...vitaConfig(),
  ...challengeConfig(),
});
