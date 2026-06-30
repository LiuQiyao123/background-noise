/**
 * RisoBackground — Halftone dot pattern overlay for dark pages
 * Used in DiscoverPage (方案B 赛博Riso美学)
 * Derived from risoHalftonePattern() in theme.ts
 */
import { type FC } from 'react';
import { seededRandom } from '@/theme/theme';
import { cn } from '@/lib/utils';

interface RisoBackgroundProps {
  seed?: number;
  className?: string;
  dotDensity?: number;
  vignetteOpacity?: number;
  /** @default 'void' — base color for dark pages */
  baseColor?: string;
}

export const RisoBackground: FC<RisoBackgroundProps> = ({
  seed = 0xCAFE,
  className,
  dotDensity = 0.55,
  vignetteOpacity = 0.35,
  baseColor = '#0f0a15',
}) => {
  const rng = seededRandom(seed);
  const width = 400;
  const height = 400;

  // Halftone dots
  const dots: { x: number; y: number; r: number; a: number }[] = [];
  for (let y = 0; y < height; y += 4) {
    for (let x = 0; x < width; x += 4) {
      if (rng() > dotDensity) continue;
      dots.push({
        x: x + 2,
        y: y + 2,
        r: 0.3 + rng() * 2.5,
        a: 0.08 + rng() * 0.25,
      });
    }
  }

  // Glow spots — soft neon pools
  const glowSpots = Array.from({ length: 6 }, () => ({
    cx: rng() * width,
    cy: rng() * height,
    r: 30 + rng() * 60,
    alpha: 0.03 + rng() * 0.04,
    hue: [280, 340, 150, 45][Math.floor(rng() * 4)],
  }));

  return (
    <svg
      className={cn('pointer-events-none absolute inset-0 w-full h-full', className)}
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <defs>
        <radialGradient id={`riso-vignette-${seed}`}>
          <stop offset="20%" stopColor="black" stopOpacity={0} />
          <stop offset="90%" stopColor="black" stopOpacity={vignetteOpacity} />
        </radialGradient>

        {/* Displacement filter for noisy edges */}
        <filter id={`riso-noise-${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>

      {/* Base color */}
      <rect width={width} height={height} fill={baseColor} />

      {/* Subtle noise */}
      <rect width={width} height={height} filter={`url(#riso-noise-${seed})`} opacity={0.04} />

      {/* Glow pools */}
      {glowSpots.map((g, i) => (
        <radialGradient key={`glow-${i}`} id={`glow-${seed}-${i}`}>
          <stop offset="0%" stopColor={`hsl(${g.hue}, 70%, 50%)`} stopOpacity={g.alpha} />
          <stop offset="100%" stopColor={`hsl(${g.hue}, 70%, 50%)`} stopOpacity={0} />
        </radialGradient>
      ))}
      {glowSpots.map((g, i) => (
        <ellipse
          key={`spot-${i}`}
          cx={g.cx}
          cy={g.cy}
          rx={g.r}
          ry={g.r}
          fill={`url(#glow-${seed}-${i})`}
        />
      ))}

      {/* Vignette */}
      <rect width={width} height={height} fill={`url(#riso-vignette-${seed})`} />

      {/* Halftone dots */}
      {dots.map((dot, i) => (
        <circle
          key={i}
          cx={dot.x}
          cy={dot.y}
          r={dot.r}
          fill="#00e676"
          opacity={dot.a}
        />
      ))}
    </svg>
  );
};
