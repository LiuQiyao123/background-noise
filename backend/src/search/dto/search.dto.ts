import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export enum SearchType {
  ALL = 'all',
  SHOW = 'show',
  ARTIST = 'artist',
  VENUE = 'venue',
}

export class SearchQueryDto {
  @IsString()
  @MinLength(1)
  q!: string;

  @IsOptional()
  @IsEnum(SearchType)
  type?: SearchType = SearchType.ALL;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;
}
