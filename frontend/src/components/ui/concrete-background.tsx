/**
 * ConcreteBackground — Dark textured concrete background with vignette
 * Ported from chopin/bnoise iOS (ConcreteBackground.swift)
 *
 * Features: concrete base + radial vignette + speckles + fibers + light spots
 */
import { type FC } from 'react';
import { seededRandom } from '@/theme/theme';
import { cn } from '@/lib/utils';

interface ConcreteBackgroundProps {
  seed?: number;
  className?: string;
  vignetteOpacity?: number;
}

export const ConcreteBackground: FC<ConcreteBackgroundProps> = ({
  seed = 0xC0FFEE,
  className,
  vignetteOpacity = 0.22,
}) => {
  const rng = seededRandom(seed);
  const width = 400;
  const height = 400;

  // Speckles (chopin: count = (w*h)/220)
  const speckleCount = Math.floor((width * height) / 220);
  const speckles = Array.from({ length: speckleCount }, () => ({
    x: rng() * width,
    y: rng() * height,
    r: 0.4 + rng() * 1.0,
    alpha: rng() * 0.18,
  }));

  // Fibers (chopin: 14 lines)
  const fiberCount = 14;
  const fibers = Array.from({ length: fiberCount }, () => {
    const cx = rng() * width;
    const cy = rng() * height;
    const w = 40 + rng() * 180;
    const angle = rng() * Math.PI;
    const alpha = 0.03 + rng() * 0.07;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x1: cx - (w / 2) * cos,
      y1: cy - (w / 2) * sin,
      x2: cx + (w / 2) * cos,
      y2: cy + (w / 2) * sin,
      alpha,
    };
  });

  // Light spots (chopin: 5 spots)
  const lightSpots = Array.from({ length: 5 }, () => ({
    x: rng() * width,
    y: rng() * height,
    r: 8 + rng() * 16,
    alpha: 0.04 + rng() * 0.04,
  }));

  return (
    <svg
      className={cn('pointer-events-none absolute inset-0 w-full h-full', className)}
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <defs>
        <radialGradient id={`concrete-vignette-${seed}`}>
          <stop offset="25%" stopColor="black" stopOpacity={0} />
          <stop offset="85%" stopColor="black" stopOpacity={vignetteOpacity} />
        </radialGradient>
      </defs>

      {/* Base concrete color */}
      <rect width={width} height={height} fill="#BCBAB5" />

      {/* Vignette overlay */}
      <rect width={width} height={height} fill={`url(#concrete-vignette-${seed})`} />

      {/* Speckles */}
      {speckles.map((s, i) => (
        <ellipse key={`s${i}`} cx={s.x} cy={s.y} rx={s.r} ry={s.r} fill="black" opacity={s.alpha} />
      ))}

      {/* Fibers */}
      {fibers.map((f, i) => (
        <line key={`f${i}`} x1={f.x1} y1={f.y1} x2={f.x2} y2={f.y2} stroke="black" strokeWidth="1" opacity={f.alpha} />
      ))}

      {/* Light spots */}
      {lightSpots.map((ls, i) => (
        <ellipse key={`l${i}`} cx={ls.x} cy={ls.y} rx={ls.r} ry={ls.r} fill="white" opacity={ls.alpha} />
      ))}
    </svg>
  );
};
