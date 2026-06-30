import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MediaType, RepoVisibility } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CreateMemoryDto } from './dto/create-memory.dto';
import { MemoryQueryDto } from './dto/memory-query.dto';

const memoryWithRelations = {
  user: {
    select: { id: true, nickname: true, avatarUrl: true },
  },
  media: { orderBy: { sortOrder: 'asc' as const } },
} as const;

@Injectable()
export class MemoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
  ) {}

  async create(userId: string, dto: CreateMemoryDto) {
    // Verify show exists
    const show = await this.prisma.show.findUnique({
      where: { id: dto.showId },
    });
    if (!show) throw new NotFoundException('演出不存在');

    // Check unique constraint: one memory per user per show
    const existing = await this.prisma.memory.findUnique({
      where: { userId_showId: { userId, showId: dto.showId } },
    });
    if (existing) {
      throw new ConflictException('本场演出已创建过记忆');
    }

    const memory = await this.prisma.memory.create({
      data: {
        userId,
        showId: dto.showId,
        text: dto.text,
        visibility: dto.visibility ?? RepoVisibility.PUBLIC,
        media: dto.media?.length
          ? {
              create: dto.media.map((m, i) => ({
                url: m.url,
                type: (m.type as MediaType) ?? MediaType.IMAGE,
                sortOrder: m.sortOrder ?? i,
              })),
            }
          : undefined,
      },
      include: memoryWithRelations,
    });

    return memory;
  }

  async findByShow(showId: string, query: MemoryQueryDto, viewerId?: string) {
    const blocked = viewerId
      ? await this.users.getBlockedIds(viewerId)
      : [];

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      showId,
      visibility: RepoVisibility.PUBLIC,
      userId: blocked.length ? { notIn: blocked } : undefined,
    };

    const [items, total] = await Promise.all([
      this.prisma.memory.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: memoryWithRelations,
      }),
      this.prisma.memory.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findMyMemory(showId: string, userId: string) {
    const memory = await this.prisma.memory.findUnique({
      where: { userId_showId: { userId, showId } },
      include: memoryWithRelations,
    });

    return memory;
  }

  async findById(id: string, viewerId?: string) {
    const memory = await this.prisma.memory.findUnique({
      where: { id },
      include: memoryWithRelations,
    });
    if (!memory) throw new NotFoundException('记忆不存在');

    if (!this.canView(memory, viewerId)) {
      throw new ForbiddenException('无权查看该记忆');
    }

    return memory;
  }

  async remove(id: string, userId: string) {
    const memory = await this.prisma.memory.findUnique({ where: { id } });
    if (!memory) throw new NotFoundException('记忆不存在');
    if (memory.userId !== userId) {
      throw new ForbiddenException('无权删除该记忆');
    }

    await this.prisma.memory.delete({ where: { id } });
    return { success: true };
  }

  private canView(
    memory: { userId: string; visibility: RepoVisibility },
    viewerId?: string,
  ) {
    if (memory.visibility === RepoVisibility.PUBLIC) return true;
    if (!viewerId) return false;
    if (memory.userId === viewerId) return true;
    return false;
  }
}
