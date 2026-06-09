import {
  Controller, Get, Patch, Delete, Param, Body,
  UseGuards, Query, Post, HttpCode, HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { FirebaseAuthGuard, Public } from '../../common/guards/firebase-auth.guard';
import { CurrentUser, FirebaseUser } from '../../common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { UpdateUserDto } from './dto/update-user.dto';
import type { DecodedIdToken } from 'firebase-admin/auth';

@Controller('users')
@UseGuards(FirebaseAuthGuard)
export class UsersController {
  constructor(
    private users: UsersService,
    private auth: AuthService,
  ) {}

  /**
   * GET /api/v1/users/me
   * Returns the current authenticated user's full profile.
   *
   * Example response:
   * { id: "uuid", username: "asim_saleem", email: "asim@example.com",
   *   displayName: "Asim Saleem", role: "individual", onboardingStep: 2 }
   */
  @Get('me')
  async getMe(@FirebaseUser() firebaseUser: DecodedIdToken) {
    return this.auth.syncUser(firebaseUser);
  }

  /**
   * PATCH /api/v1/users/me
   * Update the current user's profile fields.
   *
   * Example body: { "displayName": "Asim Saleem", "bio": "Builder. INTJ.", "username": "asim_saleem" }
   */
  @Patch('me')
  async updateMe(
    @FirebaseUser() firebaseUser: DecodedIdToken,
    @Body() dto: UpdateUserDto,
  ) {
    const user = await this.auth.syncUser(firebaseUser);
    return this.users.update(user.id, dto);
  }

  /**
   * DELETE /api/v1/users/me
   * Soft-deletes the account.
   */
  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMe(@FirebaseUser() firebaseUser: DecodedIdToken) {
    const user = await this.auth.syncUser(firebaseUser);
    await this.users.softDelete(user.id);
  }

  /**
   * GET /api/v1/users/search?q=asim
   * Search users by name or username.
   *
   * Example: GET /api/v1/users/search?q=asim&limit=20
   */
  @Get('search')
  @Public()
  async search(
    @Query('q') q: string,
    @Query('limit') limit = '20',
    @Query('offset') offset = '0',
  ) {
    if (!q || q.length < 2) return { users: [], total: 0 };
    const results = await this.users.searchUsers(q, +limit, +offset);
    return { users: results, total: results.length };
  }

  /**
   * GET /api/v1/users/:username
   * Public profile with stats.
   *
   * Example: GET /api/v1/users/asim_saleem
   */
  @Get(':username')
  @Public()
  async getProfile(@Param('username') username: string) {
    const profile = await this.users.getProfileWithStats(username);
    if (!profile) throw new NotFoundException('User not found');
    return profile;
  }

  /**
   * POST /api/v1/users/:id/follow
   * Follow a user.
   */
  @Post(':id/follow')
  @HttpCode(HttpStatus.OK)
  async follow(
    @Param('id') targetId: string,
    @FirebaseUser() firebaseUser: DecodedIdToken,
  ) {
    const me = await this.auth.syncUser(firebaseUser);
    await this.users.followUser(me.id, targetId);
    return { following: true };
  }

  /**
   * Delete /api/v1/users/:id/follow
   * Unfollow a user.
   */
  @Delete(':id/follow')
  @HttpCode(HttpStatus.OK)
  async unfollow(
    @Param('id') targetId: string,
    @FirebaseUser() firebaseUser: DecodedIdToken,
  ) {
    const me = await this.auth.syncUser(firebaseUser);
    await this.users.unfollowUser(me.id, targetId);
    return { following: false };
  }
}
