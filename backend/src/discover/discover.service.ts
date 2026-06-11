import { Injectable } from '@nestjs/common';
import { MatchesService } from '../matches/matches.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DiscoverService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly matches: MatchesService,
  ) {}

  async feed(limit = 10, viewerId?: string) {
    const upcoming = await this.prisma.show.findMany({
      where: { showDate: { gte: new Date() } },
      orderBy: { showDate: 'asc' },
      take: limit,
    });
    const hotShows = await this.prisma.repo.groupBy({
      by: ['showId'],
      where: { visibility: 'PUBLIC' },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit,
    });
    const hotShowIds = hotShows.map((h) => h.showId);
    const shows = await this.prisma.show.findMany({
      where: { id: { in: hotShowIds } },
    });
    const recentPublicRepos = await this.prisma.repo.findMany({
      where: { visibility: 'PUBLIC' },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: { select: { id: true, nickname: true, avatarUrl: true } },
        show: {
          select: { id: true, artistName: true, venueName: true, showDate: true },
        },
        media: { orderBy: { sortOrder: 'asc' }, take: 1 },
      },
    });

    // C-05: 同场盲盒 + 匹配推荐
    let blindBox = null;
    let matches = null;
    if (viewerId) {
      blindBox = await this.matches.getBlindBox(viewerId);
      matches = await this.matches.getMyMatches(viewerId, 1, 3);
    }

    return { upcoming, hotShows: shows, recentRepos: recentPublicRepos, blindBox, matches: matches?.items || [] };
  }
}
