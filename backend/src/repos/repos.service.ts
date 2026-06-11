import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DefaultVisibility, MediaType, RepoVisibility } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MatchesService } from '../matches/matches.service';
import { UsersService } from '../users/users.service';
import { BatchVisibilityDto } from './dto/batch-visibility.dto';
import { CreateRepoDto } from './dto/create-repo.dto';
import { ListReposDto, RepoSort } from './dto/list-repos.dto';
import { UpdateRepoDto } from './dto/update-repo.dto';
import { repoWithRelations } from './repos.mapper';

@Injectable()
export class ReposService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
    private readonly matches: MatchesService,
  ) {}

  async create(userId: string, dto: CreateRepoDto) {
    const show = await this.prisma.show.findUnique({
      where: { id: dto.showId },
    });
    if (!show) throw new NotFoundException('演出不存在');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const visibility =
      dto.visibility ??
      (user?.defaultVisibility === 'PUBLIC_TO_SHOW'
        ? RepoVisibility.PUBLIC
        : RepoVisibility.PRIVATE);

    const repo = await this.prisma.repo.create({
      data: {
        userId,
        showId: dto.showId,
        body: dto.body,
        memoryHook: dto.memoryHook.trim(),
        memoryTemplate: dto.memoryTemplate || null,
        vibeBand: dto.vibeBand,
        vibeSound: dto.vibeSound,
        vibeAtmosphere: dto.vibeAtmosphere,
        visibility,
        media: dto.media?.length
          ? {
              create: dto.media.map((m, i) => ({
                url: m.url,
                type: (m.type as MediaType) ?? MediaType.IMAGE,
                sortOrder: m.sortOrder ?? i,
                tags: m.tags?.length ? JSON.stringify(m.tags) : '[]',
              })),
            }
          : undefined,
      },
      include: repoWithRelations,
    });
    // 公开 Repo 发布后触发匹配检测
    if (repo.visibility === RepoVisibility.PUBLIC) {
      this.matches.triggerMatch(repo.id).catch(() => {});
    }
    return repo;
  }

  async findById(id: string, viewerId?: string) {
    const repo = await this.prisma.repo.findUnique({
      where: { id },
      include: repoWithRelations,
    });
    if (!repo) throw new NotFoundException('记录不存在');
    if (!(await this.canView(repo, viewerId))) {
      throw new ForbiddenException('无权查看该记录');
    }
    const likedByMe = viewerId
      ? !!(await this.prisma.repoLike.findUnique({
          where: { userId_repoId: { userId: viewerId, repoId: id } },
        }))
      : false;
    return { ...repo, likedByMe };
  }

  async update(id: string, userId: string, dto: UpdateRepoDto) {
    const repo = await this.ensureOwner(id, userId);
    return this.prisma.repo.update({
      where: { id: repo.id },
      data: {
        ...dto,
        memoryHook: dto.memoryHook?.trim(),
      },
      include: repoWithRelations,
    });
  }

  async remove(id: string, userId: string) {
    await this.ensureOwner(id, userId);
    await this.prisma.repo.delete({ where: { id } });
    return { success: true };
  }

  async listByShow(showId: string, dto: ListReposDto, viewerId?: string) {
    const blocked = viewerId
      ? await this.users.getBlockedIds(viewerId)
      : [];
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const skip = (page - 1) * limit;
    const where = {
      showId,
      visibility: RepoVisibility.PUBLIC,
      userId: blocked.length ? { notIn: blocked } : undefined,
      memoryHook: dto.memoryHook?.trim(),
    };
    const orderBy =
      dto.sort === RepoSort.HOT
        ? [{ likeCount: 'desc' as const }, { createdAt: 'desc' as const }]
        : [{ createdAt: 'desc' as const }];
    const [items, total] = await Promise.all([
      this.prisma.repo.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: repoWithRelations,
      }),
      this.prisma.repo.count({ where }),
    ]);
    const withLikes = await this.attachLikedByMe(items, viewerId);
    return { items: withLikes, total, page, limit };
  }

  async memoryWall(showId: string) {
    const hooks = await this.prisma.repo.groupBy({
      by: ['memoryHook'],
      where: { showId, visibility: RepoVisibility.PUBLIC },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 50,
    });
    return hooks.map((h) => ({
      memoryHook: h.memoryHook,
      count: h._count.id,
    }));
  }

  async myTimeline(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = { userId };
    const [items, total] = await Promise.all([
      this.prisma.repo.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: repoWithRelations,
      }),
      this.prisma.repo.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async myMapSummary(userId: string) {
    const repos = await this.prisma.repo.findMany({
      where: { userId },
      include: {
        show: { select: { venueName: true, city: true } },
      },
    });
    const map = new Map<
      string,
      { venueName: string; city: string | null; count: number }
    >();
    for (const r of repos) {
      const key = `${r.show.venueName}|${r.show.city ?? ''}`;
      const cur = map.get(key);
      if (cur) cur.count += 1;
      else
        map.set(key, {
          venueName: r.show.venueName,
          city: r.show.city,
          count: 1,
        });
    }
    return Array.from(map.values());
  }

  async batchVisibility(userId: string, dto: BatchVisibilityDto) {
    const result = await this.prisma.repo.updateMany({
      where: {
        id: { in: dto.repoIds },
        userId,
      },
      data: { visibility: dto.visibility },
    });
    return { updated: result.count };
  }

  private async ensureOwner(id: string, userId: string) {
    const repo = await this.prisma.repo.findUnique({ where: { id } });
    if (!repo) throw new NotFoundException('记录不存在');
    if (repo.userId !== userId) {
      throw new ForbiddenException('无权操作该记录');
    }
    return repo;
  }

  private async canView(
    repo: { userId: string; visibility: RepoVisibility },
    viewerId?: string,
  ) {
    if (repo.visibility === RepoVisibility.PUBLIC) return true;
    if (!viewerId) return false;
    if (repo.userId === viewerId) return true;
    return false;
  }

  private async attachLikedByMe<T extends { id: string }>(
    items: T[],
    viewerId?: string,
  ) {
    if (!viewerId) return items.map((i) => ({ ...i, likedByMe: false }));
    const likes = await this.prisma.repoLike.findMany({
      where: {
        userId: viewerId,
        repoId: { in: items.map((i) => i.id) },
      },
      select: { repoId: true },
    });
    const set = new Set(likes.map((l) => l.repoId));
    return items.map((i) => ({ ...i, likedByMe: set.has(i.id) }));
  }

  // ────────── S-04: 一句话记忆点赞 ──────────

  async likeMemoryHook(userId: string, repoId: string) {
    const repo = await this.prisma.repo.findUnique({ where: { id: repoId } });
    if (!repo) throw new NotFoundException('记录不存在');
    if (repo.userId === userId) throw new ForbiddenException('不可给自己的记忆点赞');
    if (repo.visibility !== RepoVisibility.PUBLIC) throw new ForbiddenException('仅可赞公开记录');

    const existing = await this.prisma.memoryHookLike.findUnique({
      where: { userId_repoId: { userId, repoId } },
    });
    if (existing) return { liked: true };

    await this.prisma.$transaction([
      this.prisma.memoryHookLike.create({ data: { userId, repoId } }),
      this.prisma.repo.update({ where: { id: repoId }, data: { memoryHookLikeCount: { increment: 1 } } }),
    ]);
    return { liked: true };
  }

  async unlikeMemoryHook(userId: string, repoId: string) {
    const existing = await this.prisma.memoryHookLike.findUnique({
      where: { userId_repoId: { userId, repoId } },
    });
    if (!existing) return { liked: false };

    await this.prisma.$transaction([
      this.prisma.memoryHookLike.delete({ where: { id: existing.id } }),
      this.prisma.repo.update({ where: { id: repoId }, data: { memoryHookLikeCount: { decrement: 1 } } }),
    ]);
    return { liked: false };
  }
}
