import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule implements OnModuleInit {
  private readonly logger = new Logger(AuthModule.name);

  constructor(private config: ConfigService) {}

  onModuleInit() {
    if (admin.apps.length > 0) return; // Already initialized (warm lambda)

    const projectId   = this.config.getOrThrow('FIREBASE_PROJECT_ID');
    const clientEmail = this.config.getOrThrow('FIREBASE_CLIENT_EMAIL');
    const privateKey  = this.config
      .getOrThrow<string>('FIREBASE_PRIVATE_KEY')
      .replace(/\\n/g, '\n');

    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });

    this.logger.log(`Firebase Admin initialized (project: ${projectId})`);
  }
}
