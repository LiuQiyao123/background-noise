/**
 * TabBar — Bottom navigation with bone background + paper grain + torn top edge
 * Ported from chopinshown/bnoise iOS (BNTabBar.swift)
 */
import { type FC, type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { PaperTexture } from './paper-grain';
import { tornPaperClipPath } from '@/theme/theme';

interface TabItem {
  icon: ReactNode;
  label: string;
  path: string;
}

interface TabBarProps {
  tabs: TabItem[];
  className?: string;
  clipSeed?: number;
}

export const TabBar: FC<TabBarProps> = ({
  tabs,
  className,
  clipSeed = 0xCAFE,
}) => (
  <nav
    className={cn(
      'fixed bottom-0 left-0 right-0 z-50',
      'max-w-[420px] mx-auto',
      className,
    )}
  >
    {/* Torn paper top edge decoration */}
    <div
      className="relative h-2 bg-bone -mb-[1px]"
      style={{ clipPath: tornPaperClipPath(clipSeed) }}
    />

    {/* Main bar */}
    <div className="relative bg-bone pt-2.5 pb-2 border-t border-ink/18">
      <PaperTexture intensity={0.06} />

      {/* Top border accent */}
      <div className="absolute top-0 inset-x-0 h-[0.5px] bg-ink/18" />

      <div className="relative z-10 flex justify-around items-center h-14 px-1">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-1 px-2 py-1',
                'w-full h-full',
                'text-xs transition-all duration-200',
                'rounded-md',
                isActive
                  ? 'text-ink font-bold'
                  : 'text-ink/45 font-normal hover:text-ink/70',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'transition-all duration-200',
                    isActive ? 'scale-110' : '',
                  )}
                >
                  {tab.icon}
                </span>
                <span className="text-[11px]">{tab.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  </nav>
);
