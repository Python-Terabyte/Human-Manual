import { pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', [
  'super_admin',
  'company_admin',
  'employee',
  'individual',
]);

export const visibilityEnum = pgEnum('visibility', [
  'public',
  'private',
  'friends',
  'company',
  'department',
  'team',
  'invite',
]);

export const sectionTypeEnum = pgEnum('section_type', [
  'basic_info',
  'about_me',
  'my_story',
  'work_with_me',
  'strengths',
  'weaknesses',
  'things_love',
  'things_hate',
  'fun_facts',
  'quotes',
  'goals',
  'skills',
  'hobbies',
  'travel',
  'books',
  'movies',
  'games',
  'music',
  'memes',
  'gifs',
  'photos',
  'videos',
  'voice_notes',
  'personality',
  'custom',
]);

export const reactionTypeEnum = pgEnum('reaction_type', [
  'like',
  'love',
  'fire',
  'clap',
  'laugh',
  'wow',
]);

export const orgPlanEnum = pgEnum('org_plan', [
  'starter',
  'growth',
  'enterprise',
]);
