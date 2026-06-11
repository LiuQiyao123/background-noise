import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePrivacyDto } from './dto/update-privacy.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nickname: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('用户不存在');
    // M-02: 表达人格统计
    const expressionPersona = await this.getExpressionPersona(userId);
    return { ...user, expressionPersona };
  }

  /** 统计用户各模板占比，返回主要表达人格 */
  private async getExpressionPersona(userId: string): Promise<string | null> {
    const repos = await this.prisma.repo.findMany({
      where: { userId, memoryTemplate: { not: null } },
      select: { memoryTemplate: true },
    });
    if (!repos.length) return null;
    const counts: Record<string, number> = {};
    for (const r of repos) {
      const t = r.memoryTemplate!;
      counts[t] = (counts[t] || 0) + 1;
    }
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    const personas: Record<string, string> = {
      A: '感性派', B: '比喻狂魔', C: '行动派', D: '自由人',
    };
    return personas[top[0]] || null;
  }

  async getStats(userId: string) {
    const [attendedCount, wantToSeeCount, venueGroups, repoCount] = await Promise.all([
      this.prisma.showInterest.count({
        where: { userId, type: 'ATTENDED' },
      }),
      this.prisma.showInterest.count({
        where: { userId, type: 'WANT_TO_SEE' },
      }),
      this.prisma.repo.findMany({
        where: { userId },
        select: { show: { select: { venueName: true } } },
        distinct: ['showId'],
      }),
      this.prisma.repo.count({ where: { userId } }),
    ]);
    const venueSet = new Set(venueGroups.map((r) => r.show.venueName));
    return {
      attendedShows: attendedCount,
      wantToSeeCount,
      uniqueVenues: venueSet.size,
      repoCount,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        nickname: true,
        avatarUrl: true,
        defaultVisibility: true,
      },
    });
  }

  async updatePrivacy(userId: string, dto: UpdatePrivacyDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { defaultVisibility: dto.defaultVisibility },
      select: {
        id: true,
        defaultVisibility: true,
      },
    });
  }

  async blockUser(blockerId: string, blockedId: string) {
    if (blockerId === blockedId) {
      throw new BadRequestException('不能屏蔽自己');
    }
    const target = await this.prisma.user.findUnique({
      where: { id: blockedId },
    });
    if (!target) throw new NotFoundException('用户不存在');
    await this.prisma.userBlock.upsert({
      where: {
        blockerId_blockedId: { blockerId, blockedId },
      },
      create: { blockerId, blockedId },
      update: {},
    });
    return { success: true };
  }

  async unblockUser(blockerId: string, blockedId: string) {
    await this.prisma.userBlock.deleteMany({
      where: { blockerId, blockedId },
    });
    return { success: true };
  }

  async getBlockedIds(blockerId: string): Promise<string[]> {
    const rows = await this.prisma.userBlock.findMany({
      where: { blockerId },
      select: { blockedId: true },
    });
    return rows.map((r) => r.blockedId);
  }

  async isBlocked(blockerId: string, blockedId: string): Promise<boolean> {
    const row = await this.prisma.userBlock.findUnique({
      where: {
        blockerId_blockedId: { blockerId, blockedId },
      },
    });
    return !!row;
  }
}
