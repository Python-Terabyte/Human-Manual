import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'human-manual-api',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  @Get()
  root() {
    return {
      message: '📖 Human Manual API',
      docs: '/api/v1',
      health: '/health',
    };
  }
}
