import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ShowInterestType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShowDto } from './dto/create-show.dto';
import { ListShowsDto } from './dto/list-shows.dto';

@Injectable()
export class ShowsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateShowDto) {
    const showDate = new Date(dto.showDate);
    try {
      return await this.prisma.show.create({
        data: {
          artistName: dto.artistName.trim(),
          venueName: dto.venueName.trim(),
          showDate,
          city: dto.city?.trim(),
          description: dto.description,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        const existing = await this.prisma.show.findFirst({
          where: {
            artistName: dto.artistName.trim(),
            venueName: dto.venueName.trim(),
            showDate,
          },
        });
        if (existing) return existing;
      }
      throw new ConflictException('演出条目已存在');
    }
  }

  async findById(id: string, viewerId?: string) {
    const show = await this.prisma.show.findUnique({ where: { id } });
    if (!show) throw new NotFoundException('演出不存在');
    const stats = await this.getShowStats(id);
    let myInterests: ShowInterestType[] = [];
    if (viewerId) {
      const interests = await this.prisma.showInterest.findMany({
        where: { showId: id, userId: viewerId },
        select: { type: true },
      });
      myInterests = interests.map((i) => i.type);
    }
    const coverUrl = await this.getCoverUrl(id);
    return { ...show, stats, myInterests, coverUrl };
  }

  async list(dto: ListShowsDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.show.findMany({
        orderBy: { showDate: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.show.count(),
    ]);
    const enriched = items.length > 0 ? await this.batchEnrich(items) : [];
    return { items: enriched, total, page, limit };
  }

  async upcoming(dto: ListShowsDto) {
    const now = new Date();
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const skip = (page - 1) * limit;
    const where = { showDate: { gte: now } };
    const [items, total] = await Promise.all([
      this.prisma.show.findMany({
        where,
        orderBy: { showDate: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.show.count({ where }),
    ]);
    const enriched = items.length > 0 ? await this.batchEnrich(items) : [];
    return { items: enriched, total, page, limit };
  }

  async hot(dto: ListShowsDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const skip = (page - 1) * limit;
    const [totalGrouped, grouped] = await Promise.all([
      this.prisma.repo.groupBy({
        by: ['showId'],
        where: { visibility: 'PUBLIC' },
        _count: { id: true },
      }),
      this.prisma.repo.groupBy({
        by: ['showId'],
        where: { visibility: 'PUBLIC' },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        skip,
        take: limit,
      }),
    ]);
    const total = totalGrouped.length;
    const showIds = grouped.map((g) => g.showId);
    const shows = await this.prisma.show.findMany({
      where: { id: { in: showIds } },
    });
    const enriched = await this.batchEnrich(shows, grouped);
    return { items: enriched, total, page, limit };
  }

  async setInterest(userId: string, showId: string, type: ShowInterestType) {
    await this.ensureShow(showId);
    return this.prisma.showInterest.upsert({
      where: {
        userId_showId_type: { userId, showId, type },
      },
      create: { userId, showId, type },
      update: {},
    });
  }

  async removeInterest(userId: string, showId: string, type: ShowInterestType) {
    await this.prisma.showInterest.deleteMany({
      where: { userId, showId, type },
    });
    return { success: true };
  }

  async coPresenceUsers(showId: string, viewerId: string, limit = 20) {
    const blocked = await this.getBlockedSet(viewerId);
    const userIds = await this.prisma.repo.findMany({
      where: {
        showId,
        visibility: 'PUBLIC',
        userId: { notIn: [...blocked, viewerId] },
      },
      select: { userId: true },
      distinct: ['userId'],
      take: limit,
    });
    return this.prisma.user.findMany({
      where: { id: { in: userIds.map((u) => u.userId) } },
      select: { id: true, nickname: true, avatarUrl: true },
    });
  }

  private async ensureShow(showId: string) {
    const show = await this.prisma.show.findUnique({ where: { id: showId } });
    if (!show) throw new NotFoundException('演出不存在');
    return show;
  }

  /** Batch enrich shows with stats and cover URLs (replaces N+1 pattern) */
  private async batchEnrich(
    shows: { id: string }[],
    repoCountGroup?: { showId: string; _count: { id: number } }[],
  ) {
    const ids = shows.map((s) => s.id);
    if (ids.length === 0) return [];

    // 1. Batch get all public repos for vibe stats
    const allRepos = await this.prisma.repo.findMany({
      where: { showId: { in: ids }, visibility: 'PUBLIC' },
      select: { showId: true, vibeBand: true, vibeSound: true, vibeAtmosphere: true },
    });
    const reposByShow = new Map<string, typeof allRepos>();
    for (const r of allRepos) {
      if (!reposByShow.has(r.showId)) reposByShow.set(r.showId, []);
      reposByShow.get(r.showId)!.push(r);
    }

    // 2. Batch interest counts
    const [wantGroups, attendedGroups] = await Promise.all([
      this.prisma.showInterest.groupBy({
        by: ['showId'],
        where: { showId: { in: ids }, type: 'WANT_TO_SEE' },
        _count: true,
      }),
      this.prisma.showInterest.groupBy({
        by: ['showId'],
        where: { showId: { in: ids }, type: 'ATTENDED' },
        _count: true,
      }),
    ]);
    const wantMap = new Map(wantGroups.map((g) => [g.showId, g._count]));
    const attendedMap = new Map(attendedGroups.map((g) => [g.showId, g._count]));

    // 3. Batch covers: top liked repo's first media per show
    const topRepos = await this.prisma.repo.findMany({
      where: { showId: { in: ids }, visibility: 'PUBLIC' },
      orderBy: [{ likeCount: 'desc' }, { createdAt: 'desc' }],
      select: { id: true, showId: true },
    });
    const coverMap = new Map<string, string | null>();
    const seenShows = new Set<string>();
    const firstRepoIds: string[] = [];
    for (const r of topRepos) {
      if (!seenShows.has(r.showId)) {
        seenShows.add(r.showId);
        firstRepoIds.push(r.id);
        coverMap.set(r.showId, null); // placeholder
      }
    }
    if (firstRepoIds.length > 0) {
      const allMedia = await this.prisma.repoMedia.findMany({
        where: { repoId: { in: firstRepoIds } },
        orderBy: { sortOrder: 'asc' },
        select: { url: true, repoId: true },
      });
      const mediaByRepo = new Map<string, string>();
      for (const m of allMedia) {
        if (!mediaByRepo.has(m.repoId)) mediaByRepo.set(m.repoId, m.url);
      }
      for (const r of topRepos) {
        if (coverMap.get(r.showId) === null && mediaByRepo.has(r.id)) {
          coverMap.set(r.showId, mediaByRepo.get(r.id)!);
        }
      }
    }

    // Build publicRepoCount map
    const publicRepoCountMap = new Map<string, number>();
    if (repoCountGroup) {
      for (const g of repoCountGroup) {
        publicRepoCountMap.set(g.showId, g._count.id);
      }
    } else {
      for (const [showId, repos] of reposByShow) {
        publicRepoCountMap.set(showId, repos.length);
      }
    }

    return shows.map((s) => {
      const repos = reposByShow.get(s.id) ?? [];
      const n = repos.length;
      return {
        ...s,
        stats: {
          publicRepoCount: publicRepoCountMap.get(s.id) ?? n,
          wantToSeeCount: wantMap.get(s.id) ?? 0,
          attendedCount: attendedMap.get(s.id) ?? 0,
          avgVibe: {
            band: n === 0 ? null : repos.reduce((sum, r) => sum + r.vibeBand, 0) / n,
            sound: n === 0 ? null : repos.reduce((sum, r) => sum + r.vibeSound, 0) / n,
            atmosphere: n === 0 ? null : repos.reduce((sum, r) => sum + r.vibeAtmosphere, 0) / n,
          },
        },
        coverUrl: coverMap.get(s.id) ?? null,
        ...(repoCountGroup ? { publicRepoCount: publicRepoCountMap.get(s.id) ?? 0 } : {}),
      };
    });
  }

  /** Single-show stats (used by findById) */
  private async getShowStats(showId: string) {
    const publicRepos = await this.prisma.repo.findMany({
      where: { showId, visibility: 'PUBLIC' },
      select: {
        vibeBand: true,
        vibeSound: true,
        vibeAtmosphere: true,
      },
    });
    const [wantCount, attendedCount] = await Promise.all([
      this.prisma.showInterest.count({
        where: { showId, type: 'WANT_TO_SEE' },
      }),
      this.prisma.showInterest.count({
        where: { showId, type: 'ATTENDED' },
      }),
    ]);
    const n = publicRepos.length;
    const avg = (field: 'vibeBand' | 'vibeSound' | 'vibeAtmosphere') =>
      n === 0 ? null : publicRepos.reduce((s, r) => s + r[field], 0) / n;
    return {
      publicRepoCount: n,
      wantToSeeCount: wantCount,
      attendedCount,
      avgVibe: {
        band: avg('vibeBand'),
        sound: avg('vibeSound'),
        atmosphere: avg('vibeAtmosphere'),
      },
      // M-04: 集体评分气质分布（各维度各分值的人数统计）
      vibeDistribution: {
        band: this.countVibeDistribution(publicRepos, 'vibeBand'),
        sound: this.countVibeDistribution(publicRepos, 'vibeSound'),
        atmosphere: this.countVibeDistribution(publicRepos, 'vibeAtmosphere'),
      },
    };
  }

  /** 统计每个分值的数量 */
  private countVibeDistribution(repos: any[], field: string): Record<number, number> {
    const dist: Record<number, number> = {};
    for (let i = 1; i <= 5; i++) dist[i] = 0;
    for (const r of repos) {
      const val = r[field] as number;
      if (val >= 1 && val <= 5) dist[val]++;
    }
    return dist;
  }

  /** Single-show cover (used by findById) */
  private async getCoverUrl(showId: string): Promise<string | null> {
    const top = await this.prisma.repo.findFirst({
      where: { showId, visibility: 'PUBLIC' },
      orderBy: [{ likeCount: 'desc' }, { createdAt: 'desc' }],
      include: {
        media: { orderBy: { sortOrder: 'asc' }, take: 1 },
      },
    });
    return top?.media[0]?.url ?? null;
  }

  private async getBlockedSet(userId: string): Promise<string[]> {
    const [a, b] = await Promise.all([
      this.prisma.userBlock.findMany({
        where: { blockerId: userId },
        select: { blockedId: true },
      }),
      this.prisma.userBlock.findMany({
        where: { blockedId: userId },
        select: { blockerId: true },
      }),
    ]);
    return [...a.map((x) => x.blockedId), ...b.map((x) => x.blockerId)];
  }
}
