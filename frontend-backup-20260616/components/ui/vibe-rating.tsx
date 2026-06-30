/**
 * VibeRating — 3-axis rating system (band / sound / vibe)
 * Ported from chopinshown/bnoise iOS (VibeRatingView.swift)
 */
import { type FC, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Music, Volume2, Flame } from 'lucide-react';

export interface VibeAxisDef {
  key: 'band' | 'sound' | 'vibe';
  label: string;
  icon: typeof Music;
}

export const VIBE_AXES: VibeAxisDef[] = [
  { key: 'band', label: '乐队表现', icon: Music },
  { key: 'sound', label: '音响效果', icon: Volume2 },
  { key: 'vibe', label: '现场氛围', icon: Flame },
];

const ANCHORS: Record<number, string> = {
  0: '灾难级',
  1: '不太行',
  2: '还凑合',
  3: '挺不错',
  4: '太棒了',
  5: '掀翻屋顶',
};

/** Single vibe axis slider */
interface VibeSliderProps {
  axis: VibeAxisDef;
  value: number; // 0–5, in 0.5 steps
  onChange: (value: number) => void;
  disabled?: boolean;
}

export const VibeSlider: FC<VibeSliderProps> = ({
  axis,
  value,
  onChange,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging || disabled) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const frac = Math.max(0, Math.min(1, x / rect.width));
      const raw = Math.round(frac * 5 * 2) / 2; // 0.5 steps
      onChange(raw);
    },
    [isDragging, disabled, onChange],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (disabled) return;
      setIsDragging(true);
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const frac = Math.max(0, Math.min(1, x / rect.width));
      const raw = Math.round(frac * 5 * 2) / 2;
      onChange(raw);
    },
    [disabled, onChange],
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Click on a step number directly
  const handleClick = useCallback(
    (step: number) => {
      if (disabled) return;
      onChange(step);
    },
    [disabled, onChange],
  );

  const Icon = axis.icon;
  const fillPct = (value / 5) * 100;

  return (
    <div className="flex flex-col gap-1.5">
      {/* Label + Value */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon className="w-[13px] h-[13px] text-ink" strokeWidth={2.5} />
          <span className="font-semibold text-[13px] text-ink">
            {axis.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[15px] font-black text-ink">
            {value.toFixed(1)}
          </span>
          <span className="text-[10px] font-medium text-ink/55 w-16 text-right">
            {ANCHORS[Math.round(value)]}
          </span>
        </div>
      </div>

      {/* Slider track */}
      <div
        className="relative h-8 flex items-center cursor-pointer touch-none select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Background track */}
        <div className="absolute inset-x-0 h-1 rounded-full bg-ink/15" />
        {/* Filled track */}
        <div
          className="absolute left-0 h-1 rounded-full bg-ink transition-all duration-100"
          style={{ width: `${Math.max(2, fillPct)}%` }}
        />

        {/* Step markers */}
        <div className="absolute inset-x-0 flex justify-between px-0">
          {[0, 1, 2, 3, 4, 5].map((step) => (
            <button
              key={step}
              type="button"
              className={cn(
                'w-4 h-4 -mt-2 flex items-center justify-center',
                disabled && 'cursor-default',
              )}
              onClick={(e) => {
                e.stopPropagation();
                handleClick(step);
              }}
            >
              <span
                className={cn(
                  'text-[8px] font-mono transition-colors',
                  value === step
                    ? 'text-ink font-black'
                    : 'text-ink/30 hover:text-ink/60',
                )}
              >
                {step}
              </span>
            </button>
          ))}
        </div>

        {/* Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 transition-all duration-100"
          style={{ left: `calc(${fillPct}% - 9px)` }}
        >
          <div className="w-[18px] h-[18px] rounded-full bg-bone border-2 border-ink shadow-[0_1px_3px_rgba(0,0,0,0.2)]" />
        </div>
      </div>
    </div>
  );
};

/** Readonly vibe display (for charts, community stats) */
interface VibeReadoutProps {
  band: number;
  sound: number;
  vibe: number;
  compact?: boolean;
}

export const VibeReadout: FC<VibeReadoutProps> = ({
  band,
  sound,
  vibe,
  compact = false,
}) => {
  const pairs: [VibeAxisDef, number][] = [
    [VIBE_AXES[0], band],
    [VIBE_AXES[1], sound],
    [VIBE_AXES[2], vibe],
  ];

  return (
    <div
      className={cn(
        'flex',
        compact ? 'gap-2.5' : 'gap-[18px]',
      )}
    >
      {pairs.map(([axis, value]) => {
        const Icon = axis.icon;
        return (
          <div
            key={axis.key}
            className={cn(
              'flex flex-col items-center text-ink',
              compact ? 'gap-0.5' : 'gap-1',
            )}
          >
            <Icon
              className={cn(
                'font-bold',
                compact ? 'w-3 h-3' : 'w-3.5 h-3.5',
              )}
              strokeWidth={2.5}
            />
            <span
              className={cn(
                'font-mono font-black',
                compact ? 'text-[13px]' : 'text-[18px]',
              )}
            >
              {value.toFixed(1)}
            </span>
            {!compact && (
              <span className="text-[10px] font-semibold text-ink/55">
                {axis.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};
