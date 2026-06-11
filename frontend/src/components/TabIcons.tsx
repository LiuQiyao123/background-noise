import { memo } from 'react';

type IconName = 'live' | 'discover' | 'record' | 'profile';

const icons: Record<IconName, string> = {
  live: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M9 18V5l12-2v13"/>
    <circle cx="6" cy="18" r="3"/>
    <circle cx="18" cy="16" r="3"/>
  </svg>`,

  discover: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/>
    <path d="m8 16 3-7 3 7-3-1.5z"/>
  </svg>`,

  record: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 9v3l2 2"/>
  </svg>`,

  profile: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 21a8 8 0 0 1 16 0"/>
  </svg>`,
};

export const TabIcon = memo(function TabIcon({ name }: { name: IconName }) {
  return (
    <span
      className="tab-svg-icon"
      dangerouslySetInnerHTML={{ __html: icons[name] }}
    />
  );
});
