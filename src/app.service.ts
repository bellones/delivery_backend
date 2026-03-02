import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Delivery API - Sistema de delivery estilo iFood';
  }

  health(): { status: string } {
    return { status: 'ok' };
  }
}
