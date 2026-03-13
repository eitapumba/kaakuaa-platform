import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // CORS — aceita origens configuradas + localhost para dev
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:19006',
    'capacitor://localhost',
    'tauri://localhost',
  ];
  // Adicionar URL de produção se configurada
  const prodOrigin = process.env.FRONTEND_URL;
  if (prodOrigin) allowedOrigins.push(prodOrigin);

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir requests sem origin (mobile, Postman, server-to-server)
      if (!origin) return callback(null, true);
      // Permitir qualquer *.vercel.app para facilitar deploys
      if (origin.endsWith('.vercel.app') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(null, false);
    },
    credentials: true,
  });

  // Validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  const port = config.get('app.port') || 4000;
  await app.listen(port);

  logger.log(`
  ╔═══════════════════════════════════════════════╗
  ║            KAA KUAA — Backend API             ║
  ║                                               ║
  ║  🌿  Ambiente: ${config.get('app.nodeEnv')}
  ║  🚀  Porta: ${port}
  ║  📡  API: http://localhost:${port}/api/v1
  ║                                               ║
  ║  Regeneração começa aqui.                     ║
  ╚═══════════════════════════════════════════════╝
  `);
}

bootstrap();
