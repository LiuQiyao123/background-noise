import { Injectable, NotFoundException } from '@nestjs/common';
import { ReportTargetType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(reporterId: string, dto: CreateReportDto) {
    await this.validateTarget(dto.targetType, dto.targetId);
    return this.prisma.report.create({
      data: {
        reporterId,
        targetType: dto.targetType,
        targetId: dto.targetId,
        reason: dto.reason.trim(),
      },
    });
  }

  private async validateTarget(type: ReportTargetType, id: string) {
    let exists = false;
    switch (type) {
      case ReportTargetType.REPO:
        exists = !!(await this.prisma.repo.findUnique({ where: { id }, select: { id: true } }));
        break;
      case ReportTargetType.COMMENT:
        exists = !!(await this.prisma.comment.findUnique({ where: { id }, select: { id: true } }));
        break;
      case ReportTargetType.USER:
        exists = !!(await this.prisma.user.findUnique({ where: { id }, select: { id: true } }));
        break;
    }
    if (!exists) throw new NotFoundException('举报目标不存在');
  }
}
