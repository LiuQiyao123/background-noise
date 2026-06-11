/**
 * SectionHeader — # + serif title + optional subtitle
 * Ported from chopinshown/bnoise iOS
 */
import { type FC, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  className?: string;
}

export const SectionHeader: FC<SectionHeaderProps> = ({
  title,
  subtitle,
  trailing,
  className,
}) => (
  <div
    className={cn(
      'flex items-end justify-between px-4 sm:px-[18px]',
      className,
    )}
  >
    <div className="flex flex-col gap-0.5">
      <h2 className="flex items-baseline gap-1.5 font-serif text-[28px] font-black leading-none text-ink">
        <span className="opacity-85 font-heavy">#</span>
        <span>{title}</span>
      </h2>
      {subtitle && (
        <p className="font-medium text-[11px] tracking-[2px] text-ink/55 uppercase">
          {subtitle}
        </p>
      )}
    </div>
    {trailing && <div>{trailing}</div>}
  </div>
);
