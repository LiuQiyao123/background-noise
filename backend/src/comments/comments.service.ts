import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RepoVisibility, ShowInterestType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  /** 获取评论列表（含回复嵌套 + 同场标识） */
  async list(repoId: string, page = 1, limit = 20, viewerId?: string) {
    const repo = await this.prisma.repo.findUnique({ where: { id: repoId } });
    if (!repo) throw new NotFoundException('记录不存在');
    if (repo.visibility !== RepoVisibility.PUBLIC) {
      throw new ForbiddenException('仅可评论公开记录');
    }

    const skip = (page - 1) * limit;
    // 获取顶级评论（parentId = null）
    const where = { repoId, parentId: null };
    const [items, total] = await Promise.all([
      this.prisma.comment.findMany({
        where,
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, nickname: true, avatarUrl: true } },
          replies: {
            orderBy: { createdAt: 'asc' },
            include: {
              user: { select: { id: true, nickname: true, avatarUrl: true } },
            },
          },
        },
      }),
      this.prisma.comment.count({ where }),
    ]);

    // 同场用户检测（S-05）
    const sameShowUsers = viewerId
      ? await this.getSameShowUserIds(repo.showId, repo.userId, viewerId)
      : new Set<string>();

    const enrichedItems = items.map((c) => ({
      id: c.id,
      body: c.body,
      createdAt: c.createdAt,
      user: c.user,
      isSameShowUser: sameShowUsers.has(c.userId),
      replies: (c.replies || []).map((r) => ({
        id: r.id,
        body: r.body,
        createdAt: r.createdAt,
        user: r.user,
        isSameShowUser: sameShowUsers.has(r.userId),
      })),
    }));

    return { items: enrichedItems, total, page, limit };
  }

  async create(userId: string, repoId: string, dto: CreateCommentDto) {
    const repo = await this.prisma.repo.findUnique({ where: { id: repoId } });
    if (!repo) throw new NotFoundException('记录不存在');
    if (repo.visibility !== RepoVisibility.PUBLIC) {
      throw new ForbiddenException('仅可评论公开记录');
    }

    // 如果是回复，验证父评论存在且在同一 Repo 下
    if (dto.parentId) {
      const parent = await this.prisma.comment.findUnique({ where: { id: dto.parentId } });
      if (!parent || parent.repoId !== repoId) throw new NotFoundException('父评论不存在');
      // 只支持单层回复
      if (parent.parentId) throw new ForbiddenException('不支持多层回复');
    }

    const comment = await this.prisma.$transaction(async (tx) => {
      const created = await tx.comment.create({
        data: { repoId, userId, body: dto.body.trim(), parentId: dto.parentId || null },
        include: {
          user: { select: { id: true, nickname: true, avatarUrl: true } },
        },
      });
      await tx.repo.update({
        where: { id: repoId },
        data: { commentCount: { increment: 1 } },
      });
      return created;
    });
    return comment;
  }

  async remove(commentId: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) throw new NotFoundException('评论不存在');
    if (comment.userId !== userId) {
      throw new ForbiddenException('无权删除该评论');
    }
    await this.prisma.$transaction([
      this.prisma.comment.delete({ where: { id: commentId } }),
      this.prisma.repo.update({
        where: { id: comment.repoId },
        data: { commentCount: { decrement: 1 } },
      }),
    ]);
    return { success: true };
  }

  /** 获取当前用户与 Repo 作者同场演出的所有用户 ID 集合 */
  private async getSameShowUserIds(showId: string, repoAuthorId: string, viewerId: string) {
    const interests = await this.prisma.showInterest.findMany({
      where: {
        showId,
        type: ShowInterestType.ATTENDED,
        userId: { in: [repoAuthorId, viewerId] },
      },
      select: { userId: true },
    });
    // 如果 viewer 和 author 都参加了这场演出，返回两个 ID
    const userIds = new Set(interests.map((i) => i.userId));
    if (userIds.has(repoAuthorId) && userIds.has(viewerId)) {
      // 获取所有参加同场的用户
      const allSameShow = await this.prisma.showInterest.findMany({
        where: { showId, type: ShowInterestType.ATTENDED },
        select: { userId: true },
      });
      return new Set(allSameShow.map((i) => i.userId));
    }
    return new Set<string>();
  }
}
