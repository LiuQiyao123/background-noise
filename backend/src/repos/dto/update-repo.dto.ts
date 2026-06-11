import { RepoVisibility } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateRepoDto {
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  body?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  memoryHook?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  vibeBand?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  vibeSound?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  vibeAtmosphere?: number;

  @IsOptional()
  @IsEnum(RepoVisibility)
  visibility?: RepoVisibility;
}
