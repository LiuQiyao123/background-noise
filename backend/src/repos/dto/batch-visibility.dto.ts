import { RepoVisibility } from '@prisma/client';
import { ArrayMaxSize, IsArray, IsEnum, IsString } from 'class-validator';

export class BatchVisibilityDto {
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(50)
  repoIds!: string[];

  @IsEnum(RepoVisibility)
  visibility!: RepoVisibility;
}
