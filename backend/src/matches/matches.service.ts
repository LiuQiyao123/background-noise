import { Injectable, NotFoundException } from '@nestjs/common';
import { MatchStatus, ShowInterestType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MatchesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 触发匹配检测：用户发布 Repo 后调用
   * 三层匹配：Lv1 撞演出 → Lv2 撞记忆 → Lv3 撞 vibe
   */
  async triggerMatch(repoId: string) {
    const repo = await this.prisma.repo.findUnique({
      where: { id: repoId },
      include: { show: true, user: true },
    });
    if (!repo || repo.visibility !== 'PUBLIC') throw new NotFoundException('Repo not found');

    const { userId, showId } = repo;
    let matchCount = 0;

    // Lv1：找到同场其他用户（标记了 ATTENDED 的非本人）
    const sameShowUsers = await this.prisma.showInterest.findMany({
      where: { showId, type: ShowInterestType.ATTENDED, userId: { not: userId } },
      select: { userId: true },
    });
    const otherUserIds = [...new Set(sameShowUsers.map((s) => s.userId))];

    for (const otherUserId of otherUserIds) {
      // 检查是否已有匹配
      const existing = await this.prisma.match.findFirst({
        where: {
          OR: [
            { userAId: userId, userBId: otherUserId, showId },
            { userAId: otherUserId, userBId: userId, showId },
          ],
        },
      });
      if (existing) continue;

      let matchLevel = 1;
      let similarityScore = null;
      let memoryHookA = repo.memoryHook;
      let memoryHookB: string | null = null;

      // Lv2：检查一句话记忆是否相似（关键词重合度）
      const otherRepo = await this.prisma.repo.findFirst({
        where: { userId: otherUserId, showId, visibility: 'PUBLIC' },
        orderBy: { createdAt: 'desc' },
      });
      if (otherRepo) {
        memoryHookB = otherRepo.memoryHook;
        const keywordMatch = this.calcKeywordOverlap(repo.memoryHook, otherRepo.memoryHook);
        const someoneLikedOther = await this.prisma.memoryHookLike.findFirst({
          where: { userId, repoId: otherRepo.id },
        });
        if (keywordMatch >= 0.3 || someoneLikedOther) {
          matchLevel = 2;

          // Lv3：三维评分差 ≤ 1
          const vibeDiff =
            Math.abs(repo.vibeBand - otherRepo.vibeBand) +
            Math.abs(repo.vibeSound - otherRepo.vibeSound) +
            Math.abs(repo.vibeAtmosphere - otherRepo.vibeAtmosphere);
          if (vibeDiff <= 3) {
            // 每个维度差 ≤ 1
            const eachDimensionOk =
              Math.abs(repo.vibeBand - otherRepo.vibeBand) <= 1 &&
              Math.abs(repo.vibeSound - otherRepo.vibeSound) <= 1 &&
              Math.abs(repo.vibeAtmosphere - otherRepo.vibeAtmosphere) <= 1;
            if (eachDimensionOk) {
              matchLevel = 3;
              // 审美重合度 = 同感记忆数 / 同场总数（简化版）
              const totalSameShow = sameShowUsers.length;
              similarityScore = totalSameShow > 0 ? Math.round(((matchCount + 1) / totalSameShow) * 100) : 50;
            }
          }
        }
      }

      // 创建匹配记录
      const [aId, bId] = userId < otherUserId ? [userId, otherUserId] : [otherUserId, userId];
      const hookA = aId === userId ? memoryHookA : memoryHookB;
      const hookB = aId === userId ? memoryHookB : memoryHookA;
      await this.prisma.match.create({
        data: {
          userAId: aId,
          userBId: bId,
          showId,
          matchLevel,
          similarityScore,
          memoryHookA: hookA,
          memoryHookB: hookB,
        },
      });
      matchCount++;
    }

    return { matches: matchCount };
  }

  /** 获取我的匹配列表 */
  async getMyMatches(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.match.findMany({
        where: {
          OR: [{ userAId: userId }, { userBId: userId }],
          status: { not: MatchStatus.DISMISSED },
        },
        orderBy: { matchedAt: 'desc' },
        skip,
        take: limit,
        include: {
          show: { select: { id: true, artistName: true, venueName: true, showDate: true } },
          userA: { select: { id: true, nickname: true, avatarUrl: true } },
          userB: { select: { id: true, nickname: true, avatarUrl: true } },
        },
      }),
      this.prisma.match.count({
        where: {
          OR: [{ userAId: userId }, { userBId: userId }],
          status: { not: MatchStatus.DISMISSED },
        },
      }),
    ]);
    return {
      items: items.map((m) => ({
        id: m.id,
        matchLevel: m.matchLevel,
        similarityScore: m.similarityScore,
        show: m.show,
        otherUser: m.userAId === userId ? m.userB : m.userA,
        otherMemoryHook: m.userAId === userId ? m.memoryHookB : m.memoryHookA,
        matchedAt: m.matchedAt,
        status: m.status,
      })),
      total,
      page,
      limit,
    };
  }

  /** 匹配操作（建立联系/忽略） */
  async updateMatch(matchId: string, status: MatchStatus) {
    return this.prisma.match.update({ where: { id: matchId }, data: { status } });
  }

  /** 同场盲盒：每日随机推送一个匿名匹配 */
  async getBlindBox(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const match = await this.prisma.match.findFirst({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
        status: MatchStatus.PENDING,
        lastSeenAt: { lt: today }, // 今天未看过
      },
      orderBy: { matchedAt: 'desc' },
      include: {
        show: { select: { artistName: true, venueName: true, showDate: true } },
      },
    });
    if (!match) return null;
    // 标记已看过
    await this.prisma.match.update({ where: { id: match.id }, data: { lastSeenAt: new Date() } });
    return {
      id: match.id,
      matchLevel: match.matchLevel,
      show: match.show,
      memoryHook: match.userAId === userId ? match.memoryHookB : match.memoryHookA,
    };
  }

  /** 关键词重合度 */
  private calcKeywordOverlap(a: string, b: string): number {
    if (!a || !b) return 0;
    const wordsA = new Set(a.replace(/[，。！？、]/g, ' ').split(/\s+/).filter(Boolean));
    const wordsB = new Set(b.replace(/[，。！？、]/g, ' ').split(/\s+/).filter(Boolean));
    const intersection = [...wordsA].filter((w) => wordsB.has(w)).length;
    const union = new Set([...wordsA, ...wordsB]).size;
    return union === 0 ? 0 : intersection / union;
  }
}
