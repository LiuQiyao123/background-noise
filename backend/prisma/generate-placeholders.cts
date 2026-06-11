// Generate local placeholder SVG images for the background-noise app
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const UPLOAD_DIR = path.resolve(__dirname, '..', 'uploads');
const PUBLIC_URL = 'http://localhost:3005';

// Vibrant color palettes for concert-themed placeholders
const PALETTES = [
  { bg: '#1a0a0a', accent: '#e85d4c', icon: '🎸' },  // Rock red
  { bg: '#0a0a1a', accent: '#6b8cae', icon: '🎵' },  // Blue
  { bg: '#1a0a1a', accent: '#9b6b9e', icon: '🎤' },  // Purple
  { bg: '#1a1a0a', accent: '#c9a227', icon: '🎶' },  // Gold
  { bg: '#0a1a0a', accent: '#4ade80', icon: '🤘' },  // Green
  { bg: '#1a0f0a', accent: '#c9783a', icon: '🔥' },  // Orange
  { bg: '#0a0f1a', accent: '#6bcf8a', icon: '💫' },  // Teal
  { bg: '#1a1215', accent: '#e85d4c', icon: '⚡' },  // Dark warm
  { bg: '#12121a', accent: '#8b8b96', icon: '🌙' },  // Silver
  { bg: '#150a1a', accent: '#b84a3d', icon: '🎭' },  // Maroon
];

const VENUE_NAMES = [
  'MAO Livehouse', '疆进酒', '育音堂', '凯迪拉克',
  'VOX Livehouse', 'NU Space', 'ModernSky LAB',
  '现场', '舞台', '观众席', '调音台视角', '门口',
];

function svgPlaceholder(palette, title, subtitle) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <defs>
    <radialGradient id="g" cx="50%" cy="40%" r="70%">
      <stop offset="0%" stop-color="${lighten(palette.bg, 30)}"/>
      <stop offset="100%" stop-color="${palette.bg}"/>
    </radialGradient>
    <filter id="n">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.06"/>
      </feComponentTransfer>
    </filter>
  </defs>
  <rect width="400" height="300" fill="url(#g)" rx="8"/>
  <rect width="400" height="300" fill="url(#g)" opacity="0.3" rx="8"/>
  <rect width="400" height="300" filter="url(#n)" rx="8"/>
  <text x="200" y="110" text-anchor="middle" font-size="48" fill="${palette.accent}" opacity="0.6">${palette.icon}</text>
  <text x="200" y="170" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="700" fill="${palette.accent}" opacity="0.9">${escapeXml(title)}</text>
  ${subtitle ? `<text x="200" y="200" text-anchor="middle" font-family="sans-serif" font-size="12" fill="${palette.accent}" opacity="0.5">${escapeXml(subtitle)}</text>` : ''}
  <line x1="150" y1="225" x2="250" y2="225" stroke="${palette.accent}" stroke-width="1" opacity="0.2"/>
  <text x="200" y="255" text-anchor="middle" font-family="monospace" font-size="10" fill="#ffffff" opacity="0.15">background-noise</text>
</svg>`;
}

function lighten(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + Math.round(255 * percent / 100));
  const g = Math.min(255, ((num >> 8) & 0x00FF) + Math.round(255 * percent / 100));
  const b = Math.min(255, (num & 0x0000FF) + Math.round(255 * percent / 100));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const shows = [
  '痛仰乐队 · MAO Livehouse',
  '万能青年旅店 · 疆进酒',
  '九连真人 · 育音堂',
  '新裤子 · 凯迪拉克中心',
  '刺猬 · VOX Livehouse',
  '草东没有派对 · NU Space',
  '海朋森 · ModernSky LAB',
];

const specificTitles = [
  'Pogo 瞬间', '吉他 Solo', '鼓手爆裂', '灯光炸场',
  '合唱时刻', '跳水瞬间', '开火车经过', '金属礼',
  '场地全景', '调音台视角', '门口排队', '周边摊位',
  '散场后', '门票特写', '贝斯律动', '主唱嘶吼',
  '大合唱', '返场安可', '暖场乐队', '雨中摇滚',
];

// Ensure uploads dir exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const generated = [];

// Generate show cover images
shows.forEach((showName, i) => {
  const palette = PALETTES[i % PALETTES.length];
  const svg = svgPlaceholder(palette, showName.split('·')[0].trim(), showName.split('·')[1]?.trim() || '');
  const filename = `placeholder-show-${i + 1}.svg`;
  fs.writeFileSync(path.join(UPLOAD_DIR, filename), svg);
  generated.push({ filename, url: `/uploads/${filename}`, label: showName });
});

// Generate random scene images
for (let i = 0; i < 20; i++) {
  const palette = PALETTES[i % PALETTES.length];
  const title = specificTitles[i % specificTitles.length];
  const subtitle = VENUE_NAMES[Math.floor(Math.random() * VENUE_NAMES.length)];
  const svg = svgPlaceholder(palette, title, subtitle);
  const filename = `placeholder-scene-${i + 1}.svg`;
  fs.writeFileSync(path.join(UPLOAD_DIR, filename), svg);
  generated.push({ filename, url: `/uploads/${filename}`, label: `${title} @ ${subtitle}` });
}

// Generate a few more for good measure
for (let i = 0; i < 10; i++) {
  const palette = PALETTES[(i + 3) % PALETTES.length];
  const title = VENUE_NAMES[i % VENUE_NAMES.length];
  const svg = svgPlaceholder(palette, title, '');
  const filename = `placeholder-extra-${i + 1}.svg`;
  fs.writeFileSync(path.join(UPLOAD_DIR, filename), svg);
  generated.push({ filename, url: `/uploads/${filename}`, label: title });
}

console.log(`✅ Generated ${generated.length} placeholder SVGs in ${UPLOAD_DIR}`);
console.log('Available URLs (for seed script):');
generated.slice(0, 30).forEach((g, i) => {
  console.log(`  [${i}] ${g.url}  ← ${g.label}`);
});
