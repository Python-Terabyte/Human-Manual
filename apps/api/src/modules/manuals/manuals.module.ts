import { Module } from '@nestjs/common';
import { ManualsController } from './manuals.controller';
import { ManualsService } from './manuals.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ManualsController],
  providers: [ManualsService],
  exports: [ManualsService],
})
export class ManualsModule {}
