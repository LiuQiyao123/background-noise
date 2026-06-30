/**
 * TornPaperShape — Torn-paper edge shape component
 * Ported from chopin/bnoise iOS (TornPaperShape.swift)
 *
 * Three modes:
 *   - fill: Renders as a filled shape with background color
 *   - stroke: Renders as a bordered outline with torn edges
 *   - clip: Clips children to torn-paper shape
 */
import { type FC, type ReactNode } from 'react';
import { tornPaperPath } from '@/theme/theme';
import { cn } from '@/lib/utils';

interface TornPaperShapeProps {
  seed?: number;
  jagAmplitude?: number;
  jagFrequency?: number;
  children?: ReactNode;
  className?: string;
  fill?: boolean;
  stroke?: boolean;
  clip?: boolean;
}

function generateTornPath(
  width: number,
  height: number,
  seed: number,
  jagAmplitude: number,
  jagFrequency: number,
): string {
  return tornPaperPath(width, height, seed, jagAmplitude, jagFrequency);
}

export const TornPaperShape: FC<TornPaperShapeProps> = ({
  seed = 0xCAFE,
  jagAmplitude = 5,
  jagFrequency = 16,
  children,
  className,
  fill: _isFill,
  stroke: isStroke,
  clip: isClip,
}) => {
  const mode: 'fill' | 'stroke' | 'clip' = isClip ? 'clip' : isStroke ? 'stroke' : 'fill';
  const uniqueId = `torn-paper-${seed}-${jagAmplitude}-${jagFrequency}`;
  const w = 400;
  const h = 400;
  const path = generateTornPath(w, h, seed, jagAmplitude, jagFrequency);

  if (mode === 'clip') {
    return (
      <div
        className={cn('overflow-hidden', className)}
        style={{ clipPath: `url(#${uniqueId})` }}
      >
        <svg width={0} height={0} style={{ position: 'absolute' }}>
          <defs>
            <clipPath id={uniqueId} clipPathUnits="objectBoundingBox">
              <path d={path} transform={`scale(${1 / w}, ${1 / h})`} />
            </clipPath>
          </defs>
        </svg>
        {children}
      </div>
    );
  }

  if (mode === 'stroke') {
    return (
      <div className={cn('relative', className)} style={{ width: '100%', height: '100%', minHeight: '1px' }}>
        <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="absolute inset-0 w-full h-full" fill="none">
          <path d={path} vectorEffect="non-scaling-stroke" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        {children}
      </div>
    );
  }

  // Fill mode
  return (
    <div className={cn('relative', className)}>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
        <path d={path} fill="currentColor" />
      </svg>
      <div className="relative z-10">{children}</div>
    </div>
  );
};

/**
 * TornPaperCard — Convenience: a card with torn paper background,
 * paper grain texture, and content inside.
 * 
 * Ported from chopin/bnoise iOS TicketStubCard structure
 */
interface TornPaperCardProps {
  seed?: number;
  jagAmplitude?: number;
  jagFrequency?: number;
  children: ReactNode;
  className?: string;
  dark?: boolean;
}

export const TornPaperCard: FC<TornPaperCardProps> = ({
  seed = 0xCAFE,
  jagAmplitude = 4,
  jagFrequency = 22,
  children,
  className,
  dark = false,
}) => {
  const uniqueId = `torn-card-${seed}`;
  const w = 400;
  const h = 400;
  const path = tornPaperPath(w, h, seed, jagAmplitude, jagFrequency);

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={{ clipPath: `url(#${uniqueId})` }}
    >
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <defs>
          <clipPath id={uniqueId} clipPathUnits="objectBoundingBox">
            <path d={path} transform={`scale(${1 / w}, ${1 / h})`} />
          </clipPath>
        </defs>
      </svg>
      <div className={cn('relative p-4', dark ? 'bg-ink text-bone' : 'bg-bone text-ink')}>
        {/* Paper grain overlay - chopin intensity: 0.18 */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.18'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
          }}
        />
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
};
