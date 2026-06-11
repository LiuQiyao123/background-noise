import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export enum RepoSort {
  HOT = 'hot',
  LATEST = 'latest',
}

export class ListReposDto {
  @IsOptional()
  @IsEnum(RepoSort)
  sort?: RepoSort = RepoSort.LATEST;

  @IsOptional()
  @IsString()
  memoryHook?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;
}
