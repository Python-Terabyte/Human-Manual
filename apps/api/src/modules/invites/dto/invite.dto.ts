import {
  IsArray, ArrayNotEmpty, ArrayMaxSize,
  IsEmail, IsOptional, IsString, MaxLength,
} from 'class-validator';

export class CreateInviteDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(10)
  @IsEmail({}, { each: true })
  emails: string[];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}
