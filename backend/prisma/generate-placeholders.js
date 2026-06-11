// Generate bright, colorful SVG placeholders for background-noise
const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = path.resolve(__dirname, '..', 'uploads');

// Bright, vibrant color palettes - each with distinctive look
const PALETTES = [
  { bg1: '#e85d4c', bg2: '#c0392b', icon: '🎸', label: 'Rock' },
  { bg1: '#3498db', bg2: '#2980b9', icon: '🎵', label: 'Blue' },
  { bg1: '#9b59b6', bg2: '#8e44ad', icon: '🎤', label: 'Purple' },
  { bg1: '#f39c12', bg2: '#e67e22', icon: '🔥', label: 'Gold' },
  { bg1: '#2ecc71', bg2: '#27ae60', icon: '🤘', label: 'Green' },
  { bg1: '#e67e22', bg2: '#d35400', icon: '⚡', label: 'Orange' },
  { bg1: '#1abc9c', bg2: '#16a085', icon: '💫', label: 'Teal' },
  { bg1: '#e84393', bg2: '#c44569', icon: '🎭', label: 'Pink' },
  { bg1: '#0984e3', bg2: '#074b8c', icon: '🌊', label: 'Deep' },
  { bg1: '#6c5ce7', bg2: '#5b4cc4', icon: '✨', label: 'Indigo' },
];

const SCENES = [
  { icon: '🤘', label: 'Pogo 瞬间' },
  { icon: '🎸', label: '吉他 Solo' },
  { icon: '🥁', label: '鼓手爆裂' },
  { icon: '💡', label: '灯光炸场' },
  { icon: '🎤', label: '合唱时刻' },
  { icon: '🏊', label: '跳水瞬间' },
  { icon: '🚂', label: '开火车经过' },
  { icon: '🤟', label: '金属礼' },
  { icon: '🏟️', label: '场地全景' },
  { icon: '🔊', label: '调音台视角' },
  { icon: '🚪', label: '门口排队' },
  { icon: '👕', label: '周边摊位' },
  { icon: '🌙', label: '散场后' },
  { icon: '🎫', label: '门票特写' },
  { icon: '🎻', label: '贝斯律动' },
  { icon: '📢', label: '主唱嘶吼' },
  { icon: '👥', label: '大合唱' },
  { icon: '🔄', label: '返场安可' },
  { icon: '🌡️', label: '暖场乐队' },
  { icon: '🌧️', label: '雨中摇滚' },
  { icon: '🎯', label: '前排激战' },
  { icon: '📸', label: '自拍打卡' },
  { icon: '🎪', label: '舞台全景' },
  { icon: '🍺', label: '散场啤酒' },
  { icon: '🌅', label: '演出后凌晨' },
];

function svgPlaceholder(bg1, bg2, icon, title, subtitle) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bg1}"/>
      <stop offset="100%" stop-color="${bg2}"/>
    </linearGradient>
  </defs>
  <rect width="400" height="300" fill="url(#g)" rx="8"/>
  <!-- Diagonal stripes pattern -->
  <g opacity="0.08">
    <line x1="0" y1="0" x2="400" y2="300" stroke="#fff" stroke-width="2"/>
    <line x1="50" y1="0" x2="400" y2="350" stroke="#fff" stroke-width="1.5"/>
    <line x1="100" y1="0" x2="400" y2="300" stroke="#fff" stroke-width="1"/>
    <line x1="0" y1="50" x2="350" y2="400" stroke="#fff" stroke-width="1"/>
    <line x1="0" y1="100" x2="300" y2="400" stroke="#fff" stroke-width="1.5"/>
  </g>
  <!-- Larger icon -->
  <text x="200" y="110" text-anchor="middle" font-size="56" fill="rgba(255,255,255,0.7)">${icon}</text>
  <text x="200" y="170" text-anchor="middle" font-family="sans-serif" font-size="22" font-weight="700" fill="rgba(255,255,255,0.95)">${escapeXml(title)}</text>
  ${subtitle ? `<text x="200" y="202" text-anchor="middle" font-family="sans-serif" font-size="14" fill="rgba(255,255,255,0.55)">${escapeXml(subtitle)}</text>` : ''}
  <line x1="140" y1="225" x2="260" y2="225" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
  <text x="200" y="255" text-anchor="middle" font-family="monospace" font-size="10" fill="rgba(255,255,255,0.25)">background-noise</text>
</svg>`;
}

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Create uploads dir
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Remove old placeholders
const existing = fs.readdirSync(UPLOAD_DIR).filter(f => f.startsWith('placeholder-'));
for (const f of existing) {
  fs.unlinkSync(path.join(UPLOAD_DIR, f));
}

const generated = [];

// Show covers (one per show, distinctive)
const shows = [
  '痛仰乐队', '万能青年旅店', '九连真人',
  '新裤子', '刺猬', '草东没有派对', '海朋森',
];
shows.forEach((name, i) => {
  const p = PALETTES[i % PALETTES.length];
  const svg = svgPlaceholder(p.bg1, p.bg2, p.icon, name, '🎵 点击查看详情');
  const fn = `placeholder-show-${i + 1}.svg`;
  fs.writeFileSync(path.join(UPLOAD_DIR, fn), svg);
  generated.push(`/uploads/${fn}`);
});

// Scene images (25 bright scene cards)
SCENES.forEach((scene, i) => {
  const p = PALETTES[i % PALETTES.length];
  const svg = svgPlaceholder(p.bg1, p.bg2, scene.icon, scene.label, '底噪 · 现场记录');
  const fn = `placeholder-scene-${i + 1}.svg`;
  fs.writeFileSync(path.join(UPLOAD_DIR, fn), svg);
  generated.push(`/uploads/${fn}`);
});

// Extra venue images
const extras = ['MAO Livehouse', '疆进酒', '育音堂', '凯迪拉克中心', 'VOX Livehouse', 'NU Space', 'ModernSky LAB', '五棵松', '武汉', '成都', '上海', '北京'];
extras.forEach((name, i) => {
  const p = PALETTES[(i + 2) % PALETTES.length];
  const svg = svgPlaceholder(p.bg1, p.bg2, '🎵', name, '');
  const fn = `placeholder-extra-${i + 1}.svg`;
  fs.writeFileSync(path.join(UPLOAD_DIR, fn), svg);
  generated.push(`/uploads/${fn}`);
});

console.log(`✅ Generated ${generated.length} bright placeholders in ${UPLOAD_DIR}`);
generated.forEach((url, i) => console.log(`  [${i}] ${url}`));
