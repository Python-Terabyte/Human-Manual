import {
  Controller, Get, Post, Patch, Delete, Param, Body,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { FirebaseAuthGuard, Public } from '../../common/guards/firebase-auth.guard';
import { FirebaseUser } from '../../common/decorators/current-user.decorator';
import { AuthService } from '../auth/auth.service';
import { SectionsService } from './sections.service';
import { CreateSectionDto, UpdateSectionDto, ReorderSectionsDto } from './dto/section.dto';
import type { DecodedIdToken } from 'firebase-admin/auth';

@Controller()
@UseGuards(FirebaseAuthGuard)
export class SectionsController {
  constructor(
    private sections: SectionsService,
    private auth: AuthService,
  ) {}

  /**
   * GET /api/v1/manuals/:manualId/sections
   * List all sections for a manual.
   *
   * Example response:
   * [{ id: "uuid", sectionType: "basic_info", position: 0, data: { fullName: "Asim Saleem", ... } }]
   */
  @Get('manuals/:manualId/sections')
  @Public()
  list(@Param('manualId') manualId: string) {
    return this.sections.listByManual(manualId);
  }

  /**
   * POST /api/v1/manuals/:manualId/sections
   * Add a new section to the manual.
   *
   * Example body:
   * { "sectionType": "skills", "data": { "skills": [{ "name": "TypeScript", "level": 5, "yearsExp": 4 }] } }
   *
   * Example body for basic_info:
   * { "sectionType": "basic_info", "data": { "fullName": "Asim Saleem", "occupation": "Senior Engineer",
   *   "locationCity": "Lahore", "locationCountry": "Pakistan", "pronouns": "he/him" } }
   *
   * Example body for my_story:
   * { "sectionType": "my_story", "data": { "events": [
   *   { "id": "1", "year": 2018, "title": "Started CS at FAST-NUCES", "emoji": "🎓" },
   *   { "id": "2", "year": 2022, "title": "Joined TechCorp", "emoji": "💼" }
   * ]}}
   *
   * Example body for personality:
   * { "sectionType": "personality", "data": { "system": "mbti", "typeCode": "INTJ",
   *   "typeName": "The Architect", "traits": ["strategic","independent","analytical"] } }
   */
  @Post('manuals/:manualId/sections')
  async create(
    @Param('manualId') manualId: string,
    @Body() dto: CreateSectionDto,
    @FirebaseUser() firebaseUser: DecodedIdToken,
  ) {
    const user = await this.auth.syncUser(firebaseUser);
    return this.sections.create(manualId, user.id, dto);
  }

  /**
   * PATCH /api/v1/manuals/:manualId/sections/reorder
   * Reorder sections (drag-and-drop).
   *
   * Example body: { "sections": [{ "id": "uuid1", "position": 0 }, { "id": "uuid2", "position": 1 }] }
   */
  @Patch('manuals/:manualId/sections/reorder')
  async reorder(
    @Param('manualId') manualId: string,
    @Body() dto: ReorderSectionsDto,
    @FirebaseUser() firebaseUser: DecodedIdToken,
  ) {
    const user = await this.auth.syncUser(firebaseUser);
    return this.sections.reorder(manualId, user.id, dto);
  }

  /**
   * PATCH /api/v1/sections/:id
   * Update section content or settings.
   *
   * Example body:
   * { "data": { "fullName": "Asim Saleem", "nickname": "Sim", "occupation": "Tech Lead" } }
   */
  @Patch('sections/:id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSectionDto,
    @FirebaseUser() firebaseUser: DecodedIdToken,
  ) {
    const user = await this.auth.syncUser(firebaseUser);
    return this.sections.update(id, user.id, dto);
  }

  /**
   * DELETE /api/v1/sections/:id
   * Remove a section from the manual.
   */
  @Delete('sections/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id') id: string,
    @FirebaseUser() firebaseUser: DecodedIdToken,
  ) {
    const user = await this.auth.syncUser(firebaseUser);
    await this.sections.delete(id, user.id);
  }
}
