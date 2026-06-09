import {
  IsEnum, IsOptional, IsString, IsBoolean,
  IsNumber, Min, Max, IsObject, MaxLength,
} from 'class-validator';

export class CreateSectionDto {
  @IsEnum([
    'basic_info','about_me','my_story','work_with_me','strengths','weaknesses',
    'things_love','things_hate','fun_facts','quotes','goals','skills','hobbies',
    'travel','books','movies','games','music','memes','gifs','photos','videos',
    'voice_notes','personality','custom',
  ])
  sectionType: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  subtitle?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  position?: number;

  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;
}

export class UpdateSectionDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  subtitle?: string;

  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @IsOptional()
  @IsEnum(['public','private','friends','company','invite'])
  visibility?: string;

  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;
}

export class ReorderSectionsDto {
  // Array of { id, position } pairs
  sections: Array<{ id: string; position: number }>;
}
