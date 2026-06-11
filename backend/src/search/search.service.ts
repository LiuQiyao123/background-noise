import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SearchQueryDto, SearchType } from './dto/search.dto';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(dto: SearchQueryDto) {
    const q = dto.q.trim();
    const limit = dto.limit ?? 20;
    const type = dto.type ?? SearchType.ALL;

    const shows =
      type === SearchType.ALL ||
      type === SearchType.SHOW ||
      type === SearchType.ARTIST ||
      type === SearchType.VENUE
        ? await this.searchShows(q, type, limit)
        : [];

    return { query: q, type, shows };
  }

  private async searchShows(q: string, type: SearchType, limit: number) {
    const contains = { contains: q };
    let where: Prisma.ShowWhereInput = {
      OR: [
        { artistName: contains },
        { venueName: contains },
        { city: contains },
      ],
    };
    if (type === SearchType.ARTIST) {
      where = { artistName: contains };
    } else if (type === SearchType.VENUE) {
      where = { OR: [{ venueName: contains }, { city: contains }] };
    }
    return this.prisma.show.findMany({
      where,
      orderBy: { showDate: 'desc' },
      take: limit,
    });
  }
}
