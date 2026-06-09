import {
  Injectable, Inject, NotFoundException, ForbiddenException,
} from '@nestjs/common';
import { eq, and, asc, sql } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDb } from '../../database/drizzle.module';
import { manualSections, manuals } from '../../../../../packages/db/src/schema';
import type { CreateSectionDto, UpdateSectionDto, ReorderSectionsDto } from './dto/section.dto';

// Core sections are weighed for completion % calculation
const CORE_SECTIONS = ['basic_info','about_me','personality','skills','work_with_me'];
const SECTION_WEIGHT = 100 / CORE_SECTIONS.length; // 20 points each

@Injectable()
export class SectionsService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDb) {}

  async listByManual(manualId: string) {
    return this.db
      .select()
      .from(manualSections)
      .where(eq(manualSections.manualId, manualId))
      .orderBy(asc(manualSections.position));
  }

  async create(manualId: string, userId: string, dto: CreateSectionDto) {
    await this.assertManualOwner(manualId, userId);

    // Auto-assign next position
    const [maxPos] = await this.db
      .select({ max: sql<number>`coalesce(max(${manualSections.position}), -1)` })
      .from(manualSections)
      .where(eq(manualSections.manualId, manualId));

    const position = dto.position ?? (maxPos.max + 1);

    const [section] = await this.db
      .insert(manualSections)
      .values({
        manualId,
        sectionType: dto.sectionType as any,
        title:       dto.title,
        subtitle:    dto.subtitle,
        position,
        isVisible:   dto.isVisible ?? true,
        data:        dto.data ?? {},
      })
      .returning();

    await this.recalculateCompletion(manualId);
    return section;
  }

  async update(sectionId: string, userId: string, dto: UpdateSectionDto) {
    const section = await this.getWithOwnerCheck(sectionId, userId);

    const [updated] = await this.db
      .update(manualSections)
      .set({
        ...dto,
        visibility: dto.visibility as any,
        updatedAt: new Date(),
      })
      .where(eq(manualSections.id, sectionId))
      .returning();

    await this.recalculateCompletion(section.manualId);
    return updated;
  }

  async delete(sectionId: string, userId: string) {
    const section = await this.getWithOwnerCheck(sectionId, userId);
    await this.db.delete(manualSections).where(eq(manualSections.id, sectionId));
    await this.recalculateCompletion(section.manualId);
  }

  async reorder(manualId: string, userId: string, dto: ReorderSectionsDto) {
    await this.assertManualOwner(manualId, userId);

    // Batch update positions
    await Promise.all(
      dto.sections.map(({ id, position }) =>
        this.db
          .update(manualSections)
          .set({ position, updatedAt: new Date() })
          .where(and(eq(manualSections.id, id), eq(manualSections.manualId, manualId))),
      ),
    );

    return this.listByManual(manualId);
  }

  /** Recalculate manual.completion_pct based on which core sections have content */
  private async recalculateCompletion(manualId: string) {
    const sections = await this.listByManual(manualId);
    const coreFilled = CORE_SECTIONS.filter((type) => {
      const section = sections.find((s) => s.sectionType === type);
      if (!section) return false;
      const data = section.data as Record<string, unknown>;
      return data && Object.keys(data).length > 0;
    }).length;

    const pct = Math.min(100, Math.round(coreFilled * SECTION_WEIGHT));

    await this.db
      .update(manuals)
      .set({ completionPct: pct, updatedAt: new Date() })
      .where(eq(manuals.id, manualId));
  }

  private async assertManualOwner(manualId: string, userId: string) {
    const [manual] = await this.db
      .select({ userId: manuals.userId })
      .from(manuals)
      .where(eq(manuals.id, manualId))
      .limit(1);

    if (!manual) throw new NotFoundException('Manual not found');
    if (manual.userId !== userId) throw new ForbiddenException('Not your manual');
  }

  private async getWithOwnerCheck(sectionId: string, userId: string) {
    const [section] = await this.db
      .select()
      .from(manualSections)
      .where(eq(manualSections.id, sectionId))
      .limit(1);

    if (!section) throw new NotFoundException('Section not found');
    await this.assertManualOwner(section.manualId, userId);
    return section;
  }
}
