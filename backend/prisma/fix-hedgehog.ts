import { PrismaClient, RepoVisibility } from '@prisma/client';

const prisma = new PrismaClient();

async function fixHedgehog() {
  const show = await prisma.show.findFirst({ where: { artistName: '刺猬' } });
  if (!show) { console.log('刺猬 show not found'); return; }

  // Count existing public repos
  const existingCount = await prisma.repo.count({ where: { showId: show.id, visibility: 'PUBLIC' } });
  if (existingCount > 0) {
    console.log(`刺猬 already has ${existingCount} public repos, skipping`);
    return;
  }

  // Create a repo with images
  const repo = await prisma.repo.create({
    data: {
      showId: show.id,
      userId: (await prisma.user.findFirst({ where: { phone: '13800000001' } }))!.id,
      body: '刺猬的现场就是青春本身。子健的破音和石璐的鼓声交织在一起，噪音里全是真诚。',
      memoryHook: '这是我见过最燃的现场',
      memoryTemplate: 'C',
      vibeBand: 5,
      vibeSound: 4,
      vibeAtmosphere: 5,
      visibility: RepoVisibility.PUBLIC,
      media: {
        create: [
          { url: '/uploads/placeholder-scene-2.svg', type: 'IMAGE', sortOrder: 0, tags: '["guitar-solo","chorus"]' },
          { url: '/uploads/placeholder-scene-9.svg', type: 'IMAGE', sortOrder: 1, tags: '["venue-panorama"]' },
        ],
      },
    },
  });

  // Add some likes to make it the top cover
  const users = await prisma.user.findMany({ take: 3, skip: 1 });
  for (const u of users) {
    await prisma.repoLike.create({ data: { userId: u.id, repoId: repo.id } });
    await prisma.repo.update({ where: { id: repo.id }, data: { likeCount: { increment: 1 } } });
  }

  console.log(`✅ Added hedgehog repo (${repo.id}) with cover images + ${users.length} likes`);
  await prisma.$disconnect();
}

fixHedgehog().catch(e => { console.error(e); process.exit(1); });
