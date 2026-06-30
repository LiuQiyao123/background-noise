/**
 * 底噪数据库 Seed 脚本
 * 运行：npx prisma db seed
 */

const { PrismaClient } = require('@prisma/client');
const { shows: showData, users: userData, repos: repoData } = require('./seed-data');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始导入底噪测试数据...\n');

  // 1. 导入演出
  console.log('📅 导入演出数据...');
  let showCount = 0;
  for (const show of showData) {
    try {
      await prisma.show.upsert({
        where: {
          artistName_venueName_showDate: {
            artistName: show.artistName,
            venueName: show.venueName,
            showDate: show.showDate,
          },
        },
        update: {},
        create: show,
      });
      showCount++;
      console.log(`  ✓ ${show.artistName} @ ${show.venueName} (${show.city})`);
    } catch (err) {
      console.log(`  ✗ ${show.artistName}: ${err.message}`);
    }
  }
  console.log(`  已导入 ${showCount} 场演出\n`);

  // 2. 导入用户
  console.log('👤 导入用户数据...');
  const userMap = {};
  let userCount = 0;
  for (const [index, user] of userData.entries()) {
    try {
      const created = await prisma.user.upsert({
        where: { phone: user.phone },
        update: {},
        create: user,
      });
      userMap[`user${index + 1}`] = created.id;
      userCount++;
      console.log(`  ✓ ${user.nickname} (${user.phone})`);
    } catch (err) {
      console.log(`  ✗ ${user.nickname}: ${err.message}`);
    }
  }
  console.log(`  已导入 ${userCount} 个用户\n`);

  // 3. 导入记忆记录
  console.log('📝 导入记忆记录...');
  let repoCount = 0;
  for (const repo of repoData) {
    try {
      // 先找到对应的演出
      const show = await prisma.show.findFirst({
        where: {
          artistName: repo.artistName,
          venueName: repo.venueName,
          showDate: repo.showDate,
        },
      });

      if (!show) {
        console.log(`  ✗ ${repo.memoryHook}: 演出未找到`);
        continue;
      }

      const userId = userMap[repo.userId];
      if (!userId) {
        console.log(`  ✗ ${repo.memoryHook}: 用户未找到`);
        continue;
      }

      await prisma.repo.create({
        data: {
          userId,
          showId: show.id,
          memoryHook: repo.memoryHook,
          body: repo.body,
          memoryTemplate: 'D',
          vibeBand: repo.vibeBand,
          vibeSound: repo.vibeSound,
          vibeAtmosphere: repo.vibeAtmosphere,
          visibility: repo.visibility,
        },
      });
      repoCount++;
      console.log(`  ✓ 「${repo.memoryHook}」 - ${repo.artistName}`);
    } catch (err) {
      console.log(`  ✗ ${repo.memoryHook}: ${err.message}`);
    }
  }
  console.log(`  已导入 ${repoCount} 条记忆记录\n`);

  // 4. 统计
  const totalShows = await prisma.show.count();
  const totalUsers = await prisma.user.count();
  const totalRepos = await prisma.repo.count();

  console.log('✅ 导入完成！');
  console.log(`   总演出数：${totalShows}`);
  console.log(`   总用户数：${totalUsers}`);
  console.log(`   总记录数：${totalRepos}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed 失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
