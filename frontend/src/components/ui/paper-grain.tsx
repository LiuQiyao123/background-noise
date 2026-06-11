/**
 * PaperGrain — SVG noise texture overlay
 * Ported from chopinshown/bnoise iOS (PaperGrain.swift)
 */
import { type FC } from 'react';
import { seededRandom } from '@/theme/theme';

interface PaperGrainProps {
  seed?: number;
  intensity?: number;
  className?: string;
}

export const PaperGrain: FC<PaperGrainProps> = ({
  seed = 0xFADE,
  intensity = 0.18,
  className = '',
}) => {
  const rng = seededRandom(seed);
  const width = 400;
  const height = 400;
  const dotCount = Math.floor((width * height) / 180);

  // Generate random dots
  const dots = Array.from({ length: dotCount }, () => ({
    x: rng() * width,
    y: rng() * height,
    r: 0.4 + rng() * 0.6,
    alpha: rng() * intensity,
  }));

  // Generate fiber lines
  const fibers = Array.from({ length: 8 }, () => {
    const x0 = rng() * width;
    const y0 = rng() * height;
    const len = 20 + rng() * 70;
    const angle = rng() * Math.PI;
    return {
      x1: x0 - (len / 2) * Math.cos(angle),
      y1: y0 - (len / 2) * Math.sin(angle),
      x2: x0 + (len / 2) * Math.cos(angle),
      y2: y0 + (len / 2) * Math.sin(angle),
      alpha: 0.04 + rng() * 0.06,
    };
  });

  return (
    <svg
      className={`pointer-events-none absolute inset-0 w-full h-full ${className}`}
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <defs>
        <filter id={`paper-noise-${seed}`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.04"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>
      {/* Base noise */}
      <rect
        width={width}
        height={height}
        filter={`url(#paper-noise-${seed})`}
        opacity={intensity * 0.5}
      />
      {/* Dots */}
      {dots.map((dot, i) => (
        <ellipse
          key={i}
          cx={dot.x}
          cy={dot.y}
          rx={dot.r}
          ry={dot.r}
          fill="black"
          opacity={dot.alpha}
        />
      ))}
      {/* Fibers */}
      {fibers.map((f, i) => (
        <line
          key={`f${i}`}
          x1={f.x1}
          y1={f.y1}
          x2={f.x2}
          y2={f.y2}
          stroke="black"
          strokeWidth="0.8"
          opacity={f.alpha}
        />
      ))}
    </svg>
  );
};

/**
 * CSS-only paper texture using a simpler approach.
 * Use PaperGrain for full SVG texture, or PaperTexture for a pure-CSS overlay.
 */
export const PaperTexture: FC<{ intensity?: number; className?: string }> = ({
  intensity = 0.08,
  className = '',
}) => (
  <div
    className={`pointer-events-none absolute inset-0 ${className}`}
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='${intensity}'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'repeat',
      opacity: 1,
    }}
  />
);
