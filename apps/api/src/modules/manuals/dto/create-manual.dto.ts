import {
  IsOptional, IsString, MaxLength, IsEnum, IsBoolean, IsHexColor,
} from 'class-validator';

export class CreateManualDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  tagline?: string;

  @IsOptional()
  @IsEnum(['public', 'private', 'friends', 'company', 'invite'])
  visibility?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  themePreset?: string;

  @IsOptional()
  @IsHexColor()
  themeColor?: string;
}

export class UpdateManualDto extends CreateManualDto {
  @IsOptional()
  @IsString()
  coverUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  seoTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  seoDescription?: string;
}
