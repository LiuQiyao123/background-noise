import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  health() {
    return {
      ok: true,
      name: 'background-noise-api',
      version: '0.1.0',
      docs: 'See backend/README.md for endpoints',
    };
  }
}
