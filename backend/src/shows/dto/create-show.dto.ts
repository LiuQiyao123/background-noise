import { IsDateString, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateShowDto {
  @IsString()
  @MaxLength(128)
  artistName!: string;

  @IsString()
  @MaxLength(128)
  venueName!: string;

  @IsDateString()
  showDate!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}
