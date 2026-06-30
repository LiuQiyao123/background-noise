/**
 * Seed script — populate DB with demo data for UI verification
 * Run: node scripts/seed.js (from backend directory)
 * or: npx ts-node scripts/seed.ts
 *
 * Creates:
 * - 3 demo users
 * - 8 shows (mix of past/upcoming/hot)
 * - 15+ repos (public + private) with varied vibes
 * - Comments + replies
 * - Likes + same-show interactions
 * - Match entries
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding demo data...\n');

  // Clean existing data (in dependency order)
  await prisma.comment.deleteMany();
  await prisma.like.deleteMany();
  await prisma.memoryHookLike.deleteMany();
  await prisma.match.deleteMany();
  await prisma.repoMedia.deleteMany();
  await prisma.repo.deleteMany();
  await prisma.showInterest.deleteMany();
  await prisma.show.deleteMany();
  await prisma.user.deleteMany();
  console.log('  ✅ Cleaned existing data\n');

  // ── Users ──
  const hash = await bcrypt.hash('demo123456', 10);
  const users = await Promise.all([
    prisma.user.create({ data: { phone: '13800000001', password: hash, nickname: '小姚' } }),
    prisma.user.create({ data: { phone: '13800000002', password: hash, nickname: '摇滚小猫' } }),
    prisma.user.create({ data: { phone: '13800000003', password: hash, nickname: '声音猎人' } }),
    prisma.user.create({ data: { phone: '13800000004', password: hash, nickname: '后摇青年' } }),
    prisma.user.create({ data: { phone: '13800000005', password: hash, nickname: '鼓手老刘' } }),
    prisma.user.create({ data: { phone: '13800000006', password: hash, nickname: '贝斯手小王' } }),
  ]);
  console.log(`  ✅ ${users.length} users created`);

  // ── Shows — mix of past (with repos) and upcoming ──
  const shows = await Promise.all([
    // Past shows (hot, lots of repos)
    prisma.show.create({
      data: {
        artistName: '痛仰乐队', venueName: 'MAO Livehouse', city: '北京',
        showDate: new Date('2026-06-15T20:00:00Z'),
        description: '痛仰「在路上」全国巡演北京站',
        coverUrl: '/uploads/placeholder-scene-12.svg',
      },
    }),
    prisma.show.create({
      data: {
        artistName: '万能青年旅店', venueName: '疆进酒', city: '北京',
        showDate: new Date('2026-05-20T20:30:00Z'),
        description: '万青「冀西南林路行」专场',
        coverUrl: '/uploads/placeholder-show-5.svg',
      },
    }),
    prisma.show.create({
      data: {
        artistName: '九连真人', venueName: '育音堂音乐公园', city: '上海',
        showDate: new Date('2026-06-03T20:00:00Z'),
        description: '九连真人「六连」新专辑巡演',
        coverUrl: '/uploads/placeholder-scene-1.svg',
      },
    }),
    prisma.show.create({
      data: {
        artistName: '草东没有派对', venueName: 'NU Space', city: '成都',
        showDate: new Date('2026-04-15T20:00:00Z'),
        description: '草东「瓦合」巡演成都站',
        coverUrl: '/uploads/placeholder-scene-5.svg',
      },
    }),
    // Upcoming shows (evening this week / next week)
    prisma.show.create({
      data: {
        artistName: '新裤子', venueName: '凯迪拉克中心', city: '北京',
        showDate: new Date('2026-07-10T19:30:00Z'),
        description: '新裤子「最后的乐队」巡回演唱会',
        coverUrl: '/uploads/placeholder-scene-3.svg',
      },
    }),
    prisma.show.create({
      data: {
        artistName: '海朋森', venueName: 'ModernSky LAB', city: '上海',
        showDate: new Date('2026-06-28T20:00:00Z'),
        description: '海朋森「成長小說」专辑巡演',
        coverUrl: '/uploads/placeholder-scene-7.svg',
      },
    }),
    prisma.show.create({
      data: {
        artistName: '刺猬', venueName: 'VOX Livehouse', city: '武汉',
        showDate: new Date('2026-08-05T20:00:00Z'),
        description: '刺猬「赤子白仙」夏季巡演',
        coverUrl: '/uploads/placeholder-scene-2.svg',
      },
    }),
    // New hot upcoming show
    prisma.show.create({
      data: {
        artistName: '法兹乐队', venueName: '191Livehouse', city: '广州',
        showDate: new Date('2026-07-25T20:30:00Z'),
        description: '法兹「折叠」新专辑巡演广州站',
        coverUrl: '/uploads/placeholder-scene-4.svg',
      },
    }),
  ]);
  console.log(`  ✅ ${shows.length} shows created`);

  // ── Show Interests ──
  await prisma.showInterest.createMany({
    data: [
      { userId: users[0].id, showId: shows[0].id, type: 'ATTENDED' },
      { userId: users[1].id, showId: shows[0].id, type: 'ATTENDED' },
      { userId: users[2].id, showId: shows[0].id, type: 'ATTENDED' },
      { userId: users[3].id, showId: shows[0].id, type: 'ATTENDED' },
      { userId: users[4].id, showId: shows[0].id, type: 'WANT_TO_SEE' },
      { userId: users[1].id, showId: shows[1].id, type: 'ATTENDED' },
      { userId: users[2].id, showId: shows[1].id, type: 'ATTENDED' },
      { userId: users[3].id, showId: shows[1].id, type: 'ATTENDED' },
      { userId: users[1].id, showId: shows[2].id, type: 'ATTENDED' },
      { userId: users[2].id, showId: shows[2].id, type: 'ATTENDED' },
      { userId: users[3].id, showId: shows[2].id, type: 'ATTENDED' },
      { userId: users[1].id, showId: shows[3].id, type: 'ATTENDED' },
      { userId: users[2].id, showId: shows[3].id, type: 'ATTENDED' },
      { userId: users[3].id, showId: shows[3].id, type: 'ATTENDED' },
      { userId: users[5].id, showId: shows[4].id, type: 'WANT_TO_SEE' },
      { userId: users[2].id, showId: shows[5].id, type: 'WANT_TO_SEE' },
      { userId: users[3].id, showId: shows[6].id, type: 'WANT_TO_SEE' },
    ],
  });
  console.log('  ✅ Show interests created');

  // ── Repos (records) ──
  //痛仰 5 repos
  const repoData = [
    // Show 0: 痛仰
    { showId: shows[0].id, userId: users[0].id, body: '今夜 MAO 炸了！吉他手在最后一段 solo 直接弹哭了我。全场大合唱「西湖」的时候忍不住哭了。', memoryHook: '西湖大合唱到泪崩', memoryTemplate: 'A', vibeBand: 5, vibeSound: 4, vibeAtmosphere: 5, visibility: 'PUBLIC' },
    { showId: shows[0].id, userId: users[1].id, body: '高虎的声音状态真好，跟 CD 一样稳。现场氛围第一名，pogo 到全身湿透。', memoryHook: '全程 pogo 到飞起', memoryTemplate: 'A', vibeBand: 4, vibeSound: 5, vibeAtmosphere: 5, visibility: 'PUBLIC' },
    { showId: shows[0].id, userId: users[2].id, body: '第一次看痛仰，被「再见杰克」的前奏击中了。这个现场氛围绝了。', memoryHook: '「再见杰克」击中灵魂', memoryTemplate: 'A', vibeBand: 5, vibeSound: 4, vibeAtmosphere: 5, visibility: 'PUBLIC' },
    { showId: shows[0].id, userId: users[3].id, body: '音响前几首歌有点糊，后面调好了。整体还是很燃的，毕竟经典曲目太多了。', memoryHook: '经典太多根本听不够', memoryTemplate: 'A', vibeBand: 3, vibeSound: 3, vibeAtmosphere: 4, visibility: 'PUBLIC' },
    { showId: shows[0].id, userId: users[0].id, body: '重温一下现场照片。前排的 vibe 真的太对了。', memoryHook: '前排的感受就不一样', memoryTemplate: 'B', vibeBand: 5, vibeSound: 4, vibeAtmosphere: 5, visibility: 'PRIVATE' },
    // Show 1: 万青
    { showId: shows[1].id, userId: users[1].id, body: '万青的现场完全是另一种维度的体验。秦皇岛的小号一响起，全身起鸡皮疙瘩。', memoryHook: '秦皇岛小号一响眼泪就下来了', memoryTemplate: 'A', vibeBand: 5, vibeSound: 5, vibeAtmosphere: 4, visibility: 'PUBLIC' },
    { showId: shows[1].id, userId: users[2].id, body: '整场像一场两小时的电影。从「采石」到「山雀」再到「河北墨麒麟」，叙事感太强了。', memoryHook: '一场两小时的电影', memoryTemplate: 'B', vibeBand: 5, vibeSound: 4, vibeAtmosphere: 4, visibility: 'PUBLIC' },
    { showId: shows[1].id, userId: users[3].id, body: '音响稍微有点混，但瑕不掩瑜。两千人在一个空间里安静听歌的感觉太奇妙了。', memoryHook: '两千人一起安静听歌', memoryTemplate: 'C', vibeBand: 4, vibeSound: 4, vibeAtmosphere: 5, visibility: 'PUBLIC' },
    // Show 2: 九连真人
    { showId: shows[2].id, userId: users[1].id, body: '九连的现场真的太猛了，客家话 rap 太带感了！阿龙台风一级棒。', memoryHook: '客家话 rap 直接炸穿屋顶', memoryTemplate: 'A', vibeBand: 4, vibeSound: 3, vibeAtmosphere: 5, visibility: 'PUBLIC' },
    { showId: shows[2].id, userId: users[2].id, body: '第一次知道这个乐队，被圈粉了。现场编排很有想法，屏幕视觉也很用心。', memoryHook: '被圈粉了，视觉编排很用心', memoryTemplate: 'A', vibeBand: 4, vibeSound: 3, vibeAtmosphere: 5, visibility: 'PUBLIC' },
    { showId: shows[2].id, userId: users[3].id, body: '音响真的需要改进，低频糊成一团。但氛围很好，大家都玩得很开心。', memoryHook: '低频糊了但玩得很开心', memoryTemplate: 'C', vibeBand: 3, vibeSound: 2, vibeAtmosphere: 4, visibility: 'PUBLIC' },
    // Show 3: 草东
    { showId: shows[3].id, userId: users[1].id, body: '草东是我看过最压抑又最释放的现场。全场一起喊「杀了它」的时候太震撼了。', memoryHook: '全场嘶吼「杀了它」', memoryTemplate: 'C', vibeBand: 5, vibeSound: 4, vibeAtmosphere: 5, visibility: 'PUBLIC' },
    { showId: shows[3].id, userId: users[2].id, body: '如履薄冰的前奏一出来整个人都麻了。凡凡的鼓太稳了。', memoryHook: '「如履薄冰」前奏麻了', memoryTemplate: 'A', vibeBand: 5, vibeSound: 5, vibeAtmosphere: 4, visibility: 'PUBLIC' },
    { showId: shows[3].id, userId: users[3].id, body: '成都场的气氛太好了，circle pit 了好几次。', memoryHook: 'circle pit 了好几次', memoryTemplate: 'C', vibeBand: 4, vibeSound: 4, vibeAtmosphere: 5, visibility: 'PUBLIC' },
  ];

  const repos = await Promise.all(
    repoData.map((r) => prisma.repo.create({ data: r }))
  );
  console.log(`  ✅ ${repos.length} repos created`);

  // ── Likes on repos ──
  await prisma.like.createMany({
    data: [
      { userId: users[1].id, repoId: repos[0].id },
      { userId: users[2].id, repoId: repos[0].id },
      { userId: users[3].id, repoId: repos[0].id },
      { userId: users[0].id, repoId: repos[1].id },
      { userId: users[2].id, repoId: repos[1].id },
      { userId: users[0].id, repoId: repos[5].id },
      { userId: users[2].id, repoId: repos[5].id },
      { userId: users[3].id, repoId: repos[5].id },
      { userId: users[1].id, repoId: repos[11].id },
      { userId: users[2].id, repoId: repos[11].id },
    ],
  });
  console.log('  ✅ Likes created');

  // ── Memory Hook Likes ──
  await prisma.memoryHookLike.createMany({
    data: [
      { userId: users[1].id, repoId: repos[0].id },
      { userId: users[2].id, repoId: repos[0].id },
      { userId: users[3].id, repoId: repos[0].id },
      { userId: users[0].id, repoId: repos[1].id },
      { userId: users[2].id, repoId: repos[5].id },
      { userId: users[3].id, repoId: repos[12].id },
    ],
  });
  console.log('  ✅ Memory hook likes created');

  // ── Comments (with replies) ──
  const comments = await Promise.all([
    prisma.comment.create({
      data: {
        repoId: repos[0].id, userId: users[1].id,
        body: '同场！我在第二排，你看到那个穿痛仰T恤的胖子了吗就是我',
        isSameShowUser: true,
      },
    }),
    prisma.comment.create({
      data: {
        repoId: repos[0].id, userId: users[0].id,
        body: '西湖真的太好哭了，每次听都忍不住',
      },
    }),
    prisma.comment.create({
      data: {
        repoId: repos[5].id, userId: users[0].id,
        body: '小号一响确实绝了，秦老师永远的神',
        isSameShowUser: true,
      },
    }),
    prisma.comment.create({
      data: {
        repoId: repos[11].id, userId: users[2].id,
        body: '「杀了它」那一段我直接喊到失声',
        isSameShowUser: true,
      },
    }),
  ]);

  // Replies to comments
  await prisma.comment.createMany({
    data: [
      { repoId: repos[0].id, userId: users[0].id, body: '哈哈哈我看到你了！哥们 pogo 真猛', parentId: comments[0].id },
      { repoId: repos[0].id, userId: users[1].id, body: '下次一起冲前排！', parentId: comments[0].id },
      { repoId: repos[11].id, userId: users[1].id, body: '我也在！嗓子两天没缓过来😂', parentId: comments[3].id, isSameShowUser: true },
    ],
  });
  console.log('  ✅ Comments created');

  // ── Matches (for discover page) ──
  await prisma.match.createMany({
    data: [
      { userId: users[0].id, otherUserId: users[1].id, showId: shows[0].id, matchLevel: 3, similarityScore: 85, status: 'PENDING' },
      { userId: users[0].id, otherUserId: users[2].id, showId: shows[0].id, matchLevel: 2, similarityScore: null, status: 'CONNECTED' },
      { userId: users[0].id, otherUserId: users[3].id, showId: shows[1].id, matchLevel: 3, similarityScore: 72, status: 'PENDING' },
      { userId: users[1].id, otherUserId: users[2].id, showId: shows[2].id, matchLevel: 2, similarityScore: null, status: 'PENDING' },
      { userId: users[0].id, otherUserId: users[4].id, showId: shows[4].id, matchLevel: 1, similarityScore: null, status: 'PENDING' },
    ],
  });
  console.log('  ✅ Matches created');

  // ── Demo user blind box entry ──
  // A blind box match requires a match with status=PENDING that the current user hasn't seen
  // The discover endpoint looks for matches we created above
  console.log('\n🌱 Seeding complete!\n');
  console.log('📱 Demo accounts:');
  console.log('  13800000001 / demo123456 — 小姚 (main demo)');
  console.log('  13800000002 / demo123456 — 摇滚小猫');
  console.log('  13800000003 / demo123456 — 声音猎人');
  console.log('');
  console.log(`🎸 ${shows.length} shows, ${repos.length} repos ready`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
