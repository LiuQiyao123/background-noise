import { RepoVisibility } from '@prisma/client';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MemoryMediaInputDto {
  @IsString()
  url!: string;

  @IsOptional()
  @IsString()
  type?: 'IMAGE' | 'VIDEO' | 'AUDIO';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class CreateMemoryDto {
  @IsString()
  showId!: string;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MemoryMediaInputDto)
  @ArrayMaxSize(20)
  media?: MemoryMediaInputDto[];

  @IsOptional()
  @IsEnum(RepoVisibility)
  visibility?: RepoVisibility;
}
