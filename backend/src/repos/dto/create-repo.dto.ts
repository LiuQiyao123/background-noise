import { RepoVisibility } from '@prisma/client';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RepoMediaInputDto {
  @IsString()
  url!: string;

  @IsOptional()
  @IsString()
  type?: 'IMAGE' | 'VIDEO';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class CreateRepoDto {
  @IsString()
  showId!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  body?: string;

  @IsString()
  @MaxLength(20)
  memoryHook!: string;

  @IsOptional()
  @IsString()
  @IsIn(['A', 'B', 'C', 'D'])
  memoryTemplate?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  vibeBand!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  vibeSound!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  vibeAtmosphere!: number;

  @IsOptional()
  @IsEnum(RepoVisibility)
  visibility?: RepoVisibility;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RepoMediaInputDto)
  @ArrayMaxSize(20)
  media?: RepoMediaInputDto[];
}
