import { Prisma } from '@prisma/client';

export const repoWithRelations = {
  user: {
    select: { id: true, nickname: true, avatarUrl: true },
  },
  media: { orderBy: { sortOrder: 'asc' as const } },
  show: {
    select: {
      id: true,
      artistName: true,
      venueName: true,
      showDate: true,
      city: true,
    },
  },
} satisfies Prisma.RepoInclude;

export type RepoWithRelations = Prisma.RepoGetPayload<{
  include: typeof repoWithRelations;
}>;
