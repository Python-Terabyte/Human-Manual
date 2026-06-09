import { Controller, Post, UseGuards, Request } from '@nestjs/common';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { FirebaseUser } from '../../common/decorators/current-user.decorator';
import { AuthService } from './auth.service';
import type { DecodedIdToken } from 'firebase-admin/auth';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  /**
   * POST /api/v1/auth/sync
   * Called by the frontend after Firebase sign-in.
   * Ensures the user exists in Neon DB and returns the DB user row.
   *
   * Example request:
   *   Authorization: Bearer <firebase-id-token>
   *
   * Example response:
   *   { id: "uuid", username: "asim_saleem", email: "asim@example.com", role: "individual", onboardingStep: 0 }
   */
  @Post('sync')
  @UseGuards(FirebaseAuthGuard)
  async sync(@FirebaseUser() firebaseUser: DecodedIdToken) {
    return this.auth.syncUser(firebaseUser);
  }
}
