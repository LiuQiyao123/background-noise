/**
 * 底噪 Design System — inspired by chopinshown/bnoise iOS app
 *
 * Colors, utilities, and helpers ported from SWIFT BNTheme → Web
 */

export const BN = {
  ink: '#121212',
  bone: '#F5EDE0',
  boneDark: '#E0D6C2',
  concrete: '#BCBAB5',
  concreteDark: '#8C8A84',
  danger: '#D42E2E',
  stamp: '#9E2121',
  highlight: '#F2C82E',
} as const;

/** Deterministic pseudo-random from a seed (ported from SeededRandom.swift) */
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

/** Generate a torn-paper SVG path string */
export function tornPaperPath(
  width: number,
  height: number,
  seed: number = 0xCAFE,
  jagAmplitude: number = 5,
  jagFrequency: number = 16,
): string {
  const rng = seededRandom(seed);
  const topInset = jagAmplitude;
  const bottomInset = jagAmplitude;

  let path = `M0,${topInset}`;

  // Top edge
  let x = 0;
  while (x < width) {
    const dx = jagFrequency * (0.55 + rng() * 0.85);
    x = Math.min(x + dx, width);
    const dy = (rng() * 2 - 1) * jagAmplitude;
    path += ` L${x},${topInset + dy}`;
  }

  // Right edge
  path += ` L${width},${height - bottomInset}`;

  // Bottom edge
  x = width;
  while (x > 0) {
    const dx = jagFrequency * (0.55 + rng() * 0.85);
    x = Math.max(x - dx, 0);
    const dy = (rng() * 2 - 1) * jagAmplitude;
    path += ` L${x},${height - bottomInset + dy}`;
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

/** Generate SVG barcode bars */
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
