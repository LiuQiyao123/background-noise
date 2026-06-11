import { DefaultVisibility } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdatePrivacyDto {
  @IsEnum(DefaultVisibility)
  defaultVisibility!: DefaultVisibility;
}
