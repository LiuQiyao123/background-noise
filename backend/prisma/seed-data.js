/**
 * 底噪测试数据 Seed
 * 包含：20+ 场演出 + 用户 + 带照片的记忆记录
 */

const shows = [
  // 已存在的演出
  { artistName: '海朋森', venueName: 'ModernSky LAB', showDate: '2026-06-28T12:30:00.000Z', city: '上海', description: '海朋森「成长小说」专辑巡演' },
  
  // 新增演出 - 摇滚/独立乐队
  { artistName: '刺猬乐队', venueName: 'VOX Livehouse', showDate: '2026-06-15T20:00:00.000Z', city: '武汉', description: '刺猬乐队 2026 夏季巡演' },
  { artistName: '痛仰乐队', venueName: 'MAO Livehouse', showDate: '2026-06-20T19:30:00.000Z', city: '北京', description: '痛仰乐队「在路上」巡演' },
  { artistName: '新裤子', venueName: '愚公移山', showDate: '2026-06-25T20:00:00.000Z', city: '北京', description: '新裤子乐队特别专场' },
  { artistName: '五条人', venueName: 'TU凸空间', showDate: '2026-07-01T20:00:00.000Z', city: '广州', description: '五条人「地球仪」巡演' },
  { artistName: '万能青年旅店', venueName: '河北大剧院', showDate: '2026-07-05T19:30:00.000Z', city: '石家庄', description: '万青「冀西南林路行」专场' },
  { artistName: '草东没有派对', venueName: 'Legacy Taipei', showDate: '2026-07-10T20:00:00.000Z', city: '台北', description: '草东「瓦合」巡演' },
  { artistName: '告五人', venueName: 'TAXX', showDate: '2026-07-15T20:00:00.000Z', city: '上海', description: '告五人「我肯定在几百年前就说过爱你」巡演' },
  { artistName: 'Deca Joins', venueName: 'B10 Live', showDate: '2026-07-20T20:00:00.000Z', city: '深圳', description: 'Deca Joins 浴室巡回演唱会' },
  { artistName: '声音玩具', venueName: '小酒馆', showDate: '2026-07-25T20:00:00.000Z', city: '成都', description: '声音玩具「明天你依旧在我身旁」' },
  { artistName: '重塑雕像的权利', venueName: 'HOU Live', showDate: '2026-08-01T20:00:00.000Z', city: '深圳', description: '重塑「Before The Applause」巡演' },
  { artistName: '福禄寿', venueName: '疆进酒', showDate: '2026-08-05T20:00:00.000Z', city: '北京', description: '福禄寿「如何》巡演' },
  { artistName: '单依纯', venueName: '国家会议中心', showDate: '2026-08-10T19:00:00.000Z', city: '北京', description: '单依纯个人演唱会' },
  { artistName: '窦唯', venueName: '愚公移山', showDate: '2026-08-15T20:00:00.000Z', city: '北京', description: '窦唯「山河水」特别演出' },
  { artistName: '崔健', venueName: '工人体育馆', showDate: '2026-08-20T19:30:00.000Z', city: '北京', description: '崔健「飞狗」巡演' },
  { artistName: '朴树', venueName: '上海大舞台', showDate: '2026-08-25T19:00:00.000Z', city: '上海', description: '朴树「猎户星座」巡演' },
  { artistName: '许巍', venueName: '深圳湾体育中心', showDate: '2026-09-01T19:30:00.000Z', city: '深圳', description: '许巍「无尽光芒」巡演' },
  { artistName: '李志', venueName: '奥体中心', showDate: '2026-09-05T20:00:00.000Z', city: '南京', description: '李志「相信未来」义演' },
  { artistName: '左小祖咒', venueName: 'MAO Livehouse', showDate: '2026-09-10T20:00:00.000Z', city: '北京', description: '左小祖咒「我不能悲伤地坐在你身旁」' },
  { artistName: '谢天笑', venueName: '糖果 TANGO', showDate: '2026-09-15T20:00:00.000Z', city: '北京', description: '谢天笑「那不是我」巡演' },
  { artistName: '苏阳', venueName: '愚公移山', showDate: '2026-09-20T20:00:00.000Z', city: '北京', description: '苏阳「贤良」巡演' },
];

const users = [
  { phone: '13800138001', passwordHash: '$2b$10$test', nickname: '乐迷小王', avatarUrl: null },
  { phone: '13800138002', passwordHash: '$2b$10$test', nickname: '摇滚小李', avatarUrl: null },
  { phone: '13800138003', passwordHash: '$2b$10$test', nickname: '现场狂人', avatarUrl: null },
];

const repos = [
  // 刺猬乐队 - 武汉 VOX
  {
    userId: 'user1',
    artistName: '刺猬乐队',
    venueName: 'VOX Livehouse',
    showDate: '2026-06-15T20:00:00.000Z',
    memoryHook: '跳水那一刻',
    body: '今天去了刺猬的演出，现场太炸了！子健的吉他 solo 简直封神，石璐的鼓点稳得一批。最后全场大合唱「火车驶向云外」，直接哭成狗。',
    vibeBand: 5,
    vibeSound: 4,
    vibeAtmosphere: 5,
    visibility: 'PUBLIC',
  },
  {
    userId: 'user2',
    artistName: '刺猬乐队',
    venueName: 'VOX Livehouse',
    showDate: '2026-06-15T20:00:00.000Z',
    memoryHook: '全场大合唱',
    body: '第一次在 VOX 看刺猬，氛围太好了。唱到「阳光彩虹小白马」的时候全场一起跳，pogo 开起来根本停不下来。',
    vibeBand: 5,
    vibeSound: 4,
    vibeAtmosphere: 5,
    visibility: 'PUBLIC',
  },
  // 痛仰乐队 - 北京 MAO
  {
    userId: 'user3',
    artistName: '痛仰乐队',
    venueName: 'MAO Livehouse',
    showDate: '2026-06-20T19:30:00.000Z',
    memoryHook: '高虎唱哭了',
    body: '痛仰的现场真的太稳了，高虎一开口我就哭了。「再见杰克」「公路之歌」全场合唱，感觉回到了十年前。',
    vibeBand: 5,
    vibeSound: 5,
    vibeAtmosphere: 5,
    visibility: 'PUBLIC',
  },
  // 新裤子 - 北京愚公移山
  {
    userId: 'user1',
    artistName: '新裤子',
    venueName: '愚公移山',
    showDate: '2026-06-25T20:00:00.000Z',
    memoryHook: '彭磊还是那么皮',
    body: '新裤子的现场永远是快乐就完事了。彭磊在台上各种耍宝，唱到「你要跳舞吗」的时候全场一起蹦迪，太嗨了。',
    vibeBand: 4,
    vibeSound: 4,
    vibeAtmosphere: 5,
    visibility: 'PUBLIC',
  },
  // 五条人 - 广州 TU 凸
  {
    userId: 'user2',
    artistName: '五条人',
    venueName: 'TU 凸空间',
    showDate: '2026-07-01T20:00:00.000Z',
    memoryHook: '塑料普通话太地道了',
    body: '五条人的现场真的太有味道了，仁科的塑料普通话听得我笑死。「阿珍爱上了阿强」全场合唱，太浪漫了。',
    vibeBand: 5,
    vibeSound: 3,
    vibeAtmosphere: 5,
    visibility: 'PUBLIC',
  },
  // 万能青年旅店 - 石家庄
  {
    userId: 'user3',
    artistName: '万能青年旅店',
    venueName: '河北大剧院',
    showDate: '2026-07-05T19:30:00.000Z',
    memoryHook: '杀死那个石家庄人',
    body: '万青的现场真的太震撼了，「杀死那个石家庄人」前奏一响全场就炸了。董亚千的吉他太稳了，听完直接封神。',
    vibeBand: 5,
    vibeSound: 5,
    vibeAtmosphere: 5,
    visibility: 'PUBLIC',
  },
];

module.exports = { shows, users, repos };
