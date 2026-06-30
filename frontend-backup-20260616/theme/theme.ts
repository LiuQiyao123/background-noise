/**
 * 底噪 Design System — Chopin 风格复刻
 * 参考：chopin/bnoise iOS (SwiftUI)
 */

export const BN = {
  // 核心色系 — 高对比度票根美学
  ink: '#121212',          // 炭黑 - 撕纸背衬/文字
  bone: '#F5EDE0',         // 暖米白 - 票根主色 (RGB: 0.96, 0.93, 0.87)
  boneDark: '#E0D6C2',     // 深米色 - hover 态 (RGB: 0.88, 0.84, 0.76)
  
  // 混凝土系（背景用）
  concrete: '#BCBAB5',     // 浅灰混凝土 (RGB: 0.74, 0.73, 0.71)
  concreteDark: '#8C8A84', // 深灰混凝土 (RGB: 0.55, 0.54, 0.52)
  
  // 强调色
  danger: '#D42E2E',       // 危险红 (RGB: 0.83, 0.18, 0.18)
  stamp: '#9E2121',        // 印章暗红 (RGB: 0.62, 0.13, 0.13)
  highlight: '#F2C82E',    // 荧光黄 (RGB: 0.95, 0.78, 0.18)
  
  // Vibe 三维
  vibeBand: '#c9a227',     // 琥珀 - 乐队表现
  vibeSound: '#6b8cae',    // 灰蓝 - 音响效果
  vibeAtmosphere: '#9b6b9e', // 灰紫 - 现场氛围
  
  // 功能色
  private: '#7a7585',
  public: '#6bcf8a',
  success: '#4ade80',
  warning: '#fbbf24',
} as const;

/**
 * Deterministic pseudo-random from a seed
 * Ported from chopin/bnoise iOS SeededRandom.swift
 */
export function seededRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s * 1664525 + 1013904223) | 0;
    return (s >>> 0) / 4294967296;
  };
}

/** Generate a string hash as a number seed */
export function hashSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return hash;
}

/**
 * Generate torn-paper SVG path string
 * Ported from chopin/bnoise iOS TornPaperShape.swift
 * 
 * @param width - Shape width
 * @param height - Shape height
 * @param seed - Random seed
 * @param jagAmplitude - Edge roughness (chopin default: 4-7)
 * @param jagFrequency - Edge frequency (chopin default: 14-22)
 * @param rough - Enable rough edges (default: true)
 */
export function tornPaperPath(
  width: number,
  height: number,
  seed: number = 0xCAFE,
  jagAmplitude: number = 5,
  jagFrequency: number = 16,
  rough: boolean = true,
): string {
  const rng = seededRandom(seed);
  const topInset = rough ? jagAmplitude : 0;
  const bottomInset = rough ? jagAmplitude : 0;

  let path = `M0,${topInset}`;

  // Top edge
  if (rough) {
    let x = 0;
    while (x < width) {
      const dx = jagFrequency * (0.55 + rng() * 0.85);
      x = Math.min(x + dx, width);
      const dy = (rng() * 2 - 1) * jagAmplitude;
      path += ` L${x},${topInset + dy}`;
    }
  } else {
    path += ` L${width},${topInset}`;
  }

  // Right edge
  path += ` L${width},${height - bottomInset}`;

  // Bottom edge
  if (rough) {
    let x = width;
    while (x > 0) {
      const dx = jagFrequency * (0.55 + rng() * 0.85);
      x = Math.max(x - dx, 0);
      const dy = (rng() * 2 - 1) * jagAmplitude;
      path += ` L${x},${height - bottomInset + dy}`;
    }
  } else {
    path += ` L0,${height - bottomInset}`;
  }

  path += ' Z';
  return path;
}

/** Generate CSS clip-path polygon for torn-paper effect */
export function tornPaperClipPath(seed: number = 0xCAFE): string {
  const rng = seededRandom(seed);
  const points: string[] = [];
  const n = 12;

  for (let i = 0; i < n; i++) {
    const pct = (i / n) * 100;
    const jitter = (rng() * 2 - 1) * 1.5;
    points.push(`${(pct + jitter).toFixed(1)}% ${(rng() * 3).toFixed(1)}%`);
  }
  for (let i = n; i > 0; i--) {
    const pct = (i / n) * 100;
    const jitter = (rng() * 2 - 1) * 1.5;
    points.push(`${(pct + jitter).toFixed(1)}% ${(100 - rng() * 3).toFixed(1)}%`);
  }

  return `polygon(${points.join(', ')})`;
}

/**
 * Generate SVG barcode bars
 * Ported from chopin/bnoise iOS Barcode.swift
 */
export function barcodeBars(
  width: number,
  _height: number,
  seed: number = 0x42,
): { x: number; w: number }[] {
  const rng = seededRandom(seed);
  const bars: { x: number; w: number }[] = [];
  let x = 0;

  while (x < width) {
    const bw = 0.6 + rng() * 2.6;
    if (rng() < 0.55) {
      bars.push({ x, w: bw });
    }
    x += bw + (0.5 + rng() * 1.1);
    if (x >= width) break;
  }

  return bars;
}
