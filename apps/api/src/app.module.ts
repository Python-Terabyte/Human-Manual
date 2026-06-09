import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { DrizzleModule } from './database/drizzle.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ManualsModule } from './modules/manuals/manuals.module';
import { SectionsModule } from './modules/sections/sections.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env', '../../.env.local', '../../.env'],
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    DrizzleModule,
    AuthModule,
    UsersModule,
    ManualsModule,
    SectionsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
