import { memo } from 'react';

interface BrandLogoProps {
  size?: number;
  variant?: 'full' | 'mark' | 'compact';
  animated?: boolean;
}

function BrandLogoInner({ size = 48, variant = 'full', animated = true }: BrandLogoProps) {
  const markSize = variant === 'compact' ? 28 : size;

  if (variant === 'mark') {
    return (
      <svg
        width={markSize}
        height={markSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block' }}
      >
        <defs>
          <linearGradient id="logo-grad-mark" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#e85d4c" />
            <stop offset="100%" stopColor="#c94d3f" />
          </linearGradient>
          <filter id="logo-glow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Record disc */}
        <circle cx="24" cy="24" r="20" fill="url(#logo-grad-mark)" opacity="0.12" />
        <circle cx="24" cy="24" r="16" stroke="url(#logo-grad-mark)" strokeWidth="1.5" opacity="0.4" />
        <circle cx="24" cy="24" r="10" stroke="url(#logo-grad-mark)" strokeWidth="0.5" opacity="0.25" />

        {/* Needle arm */}
        <line
          x1="24"
          y1="24"
          x2="8"
          y2="6"
          stroke="#e85d4c"
          strokeWidth="2"
          strokeLinecap="round"
          filter={animated ? 'url(#logo-glow)' : undefined}
          opacity={0.85}
        >
          {animated && (
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 24 24;-3 24 24;0 24 24"
              dur="4s"
              repeatCount="indefinite"
            />
          )}
        </line>

        {/* Center dot */}
        <circle cx="24" cy="24" r="2.5" fill="#e85d4c" />
        <circle cx="24" cy="24" r="1" fill="#fff" opacity={0.8} />
      </svg>
    );
  }

  return (
    <svg
      width={variant === 'compact' ? markSize + 120 : variant === 'full' ? size * 4.2 : size * 3}
      height={markSize}
      viewBox="0 0 200 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id="logo-grad-full" x1="0" y1="0" x2="200" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e85d4c" />
          <stop offset="60%" stopColor="#d44a3a" />
        </linearGradient>
        <linearGradient id="logo-accent-wave" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e85d4c" />
          <stop offset="100%" stopColor="#c94d3f" />
        </linearGradient>
        <filter id="logo-needle-glow">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Record disc */}
      <circle cx="24" cy="24" r="20" fill="url(#logo-accent-wave)" opacity="0.1" />
      <circle cx="24" cy="24" r="16" stroke="url(#logo-accent-wave)" strokeWidth="1.2" opacity="0.35" />
      <circle cx="24" cy="24" r="9" stroke="url(#logo-accent-wave)" strokeWidth="0.4" opacity="0.2" />

      {/* Needle arm */}
      <line
        x1="24" y1="24"
        x2="8" y2="7"
        stroke="#e85d4c"
        strokeWidth="1.8"
        strokeLinecap="round"
        filter={animated ? 'url(#logo-needle-glow)' : undefined}
        opacity={0.8}
      >
        {animated && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 24 24;-2 24 24;0 24 24"
            dur="5s"
            repeatCount="indefinite"
          />
        )}
      </line>

      {/* Center dot */}
      <circle cx="24" cy="24" r="2" fill="#e85d4c" />
      <circle cx="24" cy="24" r="0.8" fill="#fff" opacity={0.7} />

      {/* Text — 底噪 */}
      <text
        x={52}
        y={28}
        fontFamily="'Noto Serif SC', 'Noto Sans SC', system-ui, sans-serif"
        fontSize={24}
        fontWeight={900}
        fill="url(#logo-grad-full)"
        letterSpacing={2}
      >
        底噪
      </text>

      {/* Subtitle */}
      <text
        x={52}
        y={42}
        fontFamily="'DM Sans', 'Inter', sans-serif"
        fontSize={9}
        fontWeight={600}
        fill="#8b8b96"
        letterSpacing={4}
      >
        BACKGROUND NOISE
      </text>
    </svg>
  );
}

export const BrandLogo = memo(BrandLogoInner);
