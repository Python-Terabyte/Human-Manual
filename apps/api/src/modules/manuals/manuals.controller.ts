import {
  Controller, Get, Post, Patch, Delete, Param, Body,
  UseGuards, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { FirebaseAuthGuard, Public } from '../../common/guards/firebase-auth.guard';
import { FirebaseUser } from '../../common/decorators/current-user.decorator';
import { AuthService } from '../auth/auth.service';
import { ManualsService } from './manuals.service';
import { CreateManualDto, UpdateManualDto } from './dto/create-manual.dto';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { IsOptional, IsString, IsEnum } from 'class-validator';

class AddReactionDto {
  @IsEnum(['like','love','fire','clap','laugh','wow'])
  type: string;
}

class AddCommentDto {
  @IsString() content: string;
  @IsOptional() @IsString() parentId?: string;
}

@Controller('manuals')
@UseGuards(FirebaseAuthGuard)
export class ManualsController {
  constructor(
    private manuals: ManualsService,
    private auth: AuthService,
  ) {}

  /**
   * GET /api/v1/manuals
   * List public manuals (no auth required).
   *
   * Example: GET /api/v1/manuals?limit=20&offset=0
   */
  @Get()
  @Public()
  list(
    @Query('limit') limit = '20',
    @Query('offset') offset = '0',
  ) {
    return this.manuals.listPublic(+limit, +offset);
  }

  /**
   * GET /api/v1/manuals/me
   * Get the current user's manual.
   */
  @Get('me')
  async getMine(@FirebaseUser() firebaseUser: DecodedIdToken) {
    const user = await this.auth.syncUser(firebaseUser);
    return this.manuals.findByUserId(user.id);
  }

  /**
   * GET /api/v1/manuals/:slug
   * View a manual by slug (increments view count).
   *
   * Example: GET /api/v1/manuals/asim-saleem
   */
  @Get(':slug')
  @Public()
  async getBySlug(@Param('slug') slug: string) {
    const manual = await this.manuals.findBySlug(slug);
    if (manual) {
      this.manuals.incrementView(manual.id); // fire-and-forget
    }
    return manual;
  }

  /**
   * POST /api/v1/manuals
   * Create a new manual for the current user.
   *
   * Example body: { "title": "Asim's Manual", "tagline": "Builder. INTJ.", "visibility": "public" }
   */
  @Post()
  create(
    @FirebaseUser() firebaseUser: DecodedIdToken,
    @Body() dto: CreateManualDto,
  ) {
    return this.auth.syncUser(firebaseUser).then((user) =>
      this.manuals.create(user.id, dto, user.displayName ?? user.username ?? undefined),
    );
  }

  /**
   * PATCH /api/v1/manuals/:id
   * Update manual metadata.
   *
   * Example body: { "title": "Asim's Manual", "themeColor": "#6366F1" }
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @FirebaseUser() firebaseUser: DecodedIdToken,
    @Body() dto: UpdateManualDto,
  ) {
    const user = await this.auth.syncUser(firebaseUser);
    return this.manuals.update(id, user.id, dto);
  }

  /**
   * POST /api/v1/manuals/:id/publish
   * Publish the manual (makes it visible publicly).
   */
  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  async publish(
    @Param('id') id: string,
    @FirebaseUser() firebaseUser: DecodedIdToken,
  ) {
    const user = await this.auth.syncUser(firebaseUser);
    return this.manuals.publish(id, user.id);
  }

  /**
   * POST /api/v1/manuals/:id/unpublish
   */
  @Post(':id/unpublish')
  @HttpCode(HttpStatus.OK)
  async unpublish(
    @Param('id') id: string,
    @FirebaseUser() firebaseUser: DecodedIdToken,
  ) {
    const user = await this.auth.syncUser(firebaseUser);
    return this.manuals.unpublish(id, user.id);
  }

  /**
   * DELETE /api/v1/manuals/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id') id: string,
    @FirebaseUser() firebaseUser: DecodedIdToken,
  ) {
    const user = await this.auth.syncUser(firebaseUser);
    await this.manuals.delete(id, user.id);
  }

  // ── Reactions ──────────────────────────────────────────────────────────────

  @Get(':id/reactions')
  @Public()
  getReactions(@Param('id') id: string) {
    return this.manuals.getReactions(id);
  }

  @Post(':id/reactions')
  @HttpCode(HttpStatus.OK)
  async addReaction(
    @Param('id') id: string,
    @Body() dto: AddReactionDto,
    @FirebaseUser() firebaseUser: DecodedIdToken,
  ) {
    const user = await this.auth.syncUser(firebaseUser);
    await this.manuals.addReaction(id, user.id, dto.type);
    return { reacted: true, type: dto.type };
  }

  @Delete(':id/reactions/:type')
  @HttpCode(HttpStatus.OK)
  async removeReaction(
    @Param('id') id: string,
    @Param('type') type: string,
    @FirebaseUser() firebaseUser: DecodedIdToken,
  ) {
    const user = await this.auth.syncUser(firebaseUser);
    await this.manuals.removeReaction(id, user.id, type);
    return { reacted: false };
  }

  // ── Comments ───────────────────────────────────────────────────────────────

  @Get(':id/comments')
  @Public()
  getComments(@Param('id') id: string) {
    return this.manuals.getComments(id);
  }

  @Post(':id/comments')
  async addComment(
    @Param('id') id: string,
    @Body() dto: AddCommentDto,
    @FirebaseUser() firebaseUser: DecodedIdToken,
  ) {
    const user = await this.auth.syncUser(firebaseUser);
    return this.manuals.addComment(id, user.id, dto.content, dto.parentId);
  }
}
