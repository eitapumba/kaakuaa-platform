import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get()
  healthCheck() {
    return {
      status: 'ok',
      app: 'Kaa Kuaa Backend API',
      timestamp: new Date().toISOString(),
    };
  }
}
