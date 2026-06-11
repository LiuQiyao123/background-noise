import { ReportTargetType } from '@prisma/client';
import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateReportDto {
  @IsEnum(ReportTargetType)
  targetType!: ReportTargetType;

  @IsString()
  @MinLength(1)
  targetId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  reason!: string;
}
