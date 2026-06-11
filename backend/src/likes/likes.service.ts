import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RepoVisibility } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LikesService {
  constructor(private readonly prisma: PrismaService) {}

  async like(userId: string, repoId: string) {
    const repo = await this.prisma.repo.findUnique({ where: { id: repoId } });
    if (!repo) throw new NotFoundException('记录不存在');
    if (repo.visibility !== RepoVisibility.PUBLIC) {
      throw new ForbiddenException('仅可点赞公开记录');
    }
    if (repo.userId === userId) {
      throw new BadRequestException('不能给自己的记录点赞');
    }
    const existing = await this.prisma.repoLike.findUnique({
      where: { userId_repoId: { userId, repoId } },
    });
    if (existing) return { liked: true, likeCount: repo.likeCount };
    await this.prisma.$transaction(async (tx) => {
      await tx.repoLike.create({ data: { userId, repoId } });
      await tx.repo.update({
        where: { id: repoId },
        data: { likeCount: { increment: 1 } },
      });
    });
    const updated = await this.prisma.repo.findUnique({
      where: { id: repoId },
      select: { likeCount: true },
    });
    return { liked: true, likeCount: updated!.likeCount };
  }

  async unlike(userId: string, repoId: string) {
    const result = await this.prisma.$transaction(async (tx) => {
      const deleted = await tx.repoLike.deleteMany({
        where: { userId, repoId },
      });
      if (deleted.count > 0) {
        await tx.repo.update({
          where: { id: repoId },
          data: { likeCount: { decrement: 1 } },
        });
      }
      const repo = await tx.repo.findUnique({
        where: { id: repoId },
        select: { likeCount: true },
      });
      return { liked: false, likeCount: repo?.likeCount ?? 0 };
    });
    return result;
  }
}
