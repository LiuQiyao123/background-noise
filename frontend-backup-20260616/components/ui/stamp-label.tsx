/**
 * StampLabel — Rotated stamp text badge
 * Ported from chopinshown/bnoise iOS (StampLabel in SectionHeader.swift)
 */
import { type FC } from 'react';
import { cn } from '@/lib/utils';

interface StampLabelProps {
  text: string;
  color?: string;
  className?: string;
}

export const StampLabel: FC<StampLabelProps> = ({
  text,
  color,
  className,
}) => (
  <span
    className={cn(
      'inline-block font-serif font-black text-[11px] px-2 py-0.5 opacity-85 -rotate-6',
      className,
    )}
    style={{
      color: color || '#9E2121',
      border: `1.5px solid ${color || '#9E2121'}`,
    }}
  >
    {text}
  </span>
);

/**
 * AttendBadge — ink background + bone text badge
 * Ported from chopinshown/bnoise iOS
 */
export const AttendBadge: FC<{
  percent: number;
  className?: string;
}> = ({ percent, className }) => (
  <span
    className={cn(
      'inline-flex font-mono text-[10px] font-black px-1.5 py-0.5',
      'bg-ink text-bone',
      className,
    )}
  >
    {percent}%
  </span>
);
