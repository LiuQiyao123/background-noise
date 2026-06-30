/**
 * TicketStubCard — Signature card component for bnoise
 * Ported from chopin/bnoise iOS (TicketStubCard.swift)
 *
 * Layout: [Barcode | Dashed Divider | Info | Dashed Divider | Photo]
 * All on warm bone background with paper grain, torn edges, and subtle rotation.
 */
import { type FC } from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BarcodeStrip } from './barcode';
import { PaperGrain } from './paper-grain';
import { hashSeed } from '@/theme/theme';

interface ShowData {
  id: string;
  artist: string;
  title: string;
  venue: string;
  dateLine1: string;
  dateLine2?: string;
  serialShort?: string;
  attendPercent: number;
  attendCount: number;
  poster?: string;
  tilt?: number;
}

interface TicketStubCardProps {
  show: ShowData;
  linkTo?: string;
  className?: string;
  compact?: boolean;
}

/** SVG dashed vertical divider — chopin style */
const DashedDivider: FC = () => (
  <svg width="1" height="100%" className="mx-0 flex-shrink-0" preserveAspectRatio="none">
    <line x1="0.5" y1="0" x2="0.5" y2="100%" stroke="rgba(18,18,18,0.55)" strokeWidth="1" strokeDasharray="3 3" />
    <line x1="0" y1="0" x2="0" y2="100%" stroke="rgba(18,18,18,0.45)" strokeWidth="0.5" />
  </svg>
);

/** SVG photo placeholder with overlay gradient — chopin style */
const PhotoSection: FC<{ src?: string; seed: number }> = ({ src, seed }) => {
  const hue = (seed % 360 + 360) % 360;
  const gradient = `linear-gradient(135deg, hsl(${hue},20%,35%), hsl(${hue},30%,25%))`;

  return (
    <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden my-2 mr-2">
      {src ? (
        <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
      ) : (
        <div className="w-full h-full" style={{ background: gradient }}>
          <svg viewBox="0 0 96 96" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <circle cx="48" cy="36" r="18" fill="rgba(255,255,255,0.15)" />
            <ellipse cx="48" cy="72" rx="36" ry="12" fill="rgba(255,255,255,0.08)" />
          </svg>
        </div>
      )}
    </div>
  );
};

/** AttendBadge — chopin style: black background, bone text, mono font */
const AttendBadge: FC<{ percent: number }> = ({ percent }) => (
  <span className="font-mono text-[10px] font-black bg-ink text-bone px-1.5 py-0.5">
    {percent}%
  </span>
);

export const TicketStubCard: FC<TicketStubCardProps> = ({
  show,
  linkTo,
  className,
  compact = false,
}) => {
  const ticketSeed = hashSeed(show.id);
  // Chopin tilt: random between -0.2 and 0.2 degrees
  const tilt = show.tilt ?? ((ticketSeed % 41) / 100 - 0.2);

  const card = (
    <div
      className={cn(
        'relative inline-block group cursor-pointer',
        'transition-transform duration-200',
        className,
      )}
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      {/* Black torn-paper backing — chopin: amplitude 7, frequency 14 */}
      <div
        className="absolute -inset-[7px] bg-ink rounded-sm"
        style={{
          filter: 'drop-shadow(3px 7px 10px rgba(0,0,0,0.45))',
        }}
      />

      {/* Main ticket body — warm bone background */}
      <div className="relative flex bg-bone rounded-sm overflow-hidden">
        {/* Paper grain — chopin intensity: 0.18 */}
        <PaperGrain seed={(ticketSeed ^ 0xFADE) >>> 0} intensity={0.18} />

        {/* Content */}
        <div className="relative flex flex-row z-10 w-full">
          {!compact && (
            <>
              {/* Left stub — barcode */}
              <div className="flex items-center py-2 px-1.5 w-[30px] flex-shrink-0">
                <BarcodeStrip seed={ticketSeed} color="#121212" width={22} height={70} />
              </div>

              {/* Divider */}
              <div className="py-1">
                <DashedDivider />
              </div>
            </>
          )}

          {/* Middle — info */}
          <div className="flex-1 flex flex-col justify-center px-2.5 py-3 gap-1.5 min-w-0">
            {/* Artist + Date — chopin: serif font for artist */}
            <div className="flex items-baseline justify-between gap-1">
              <span className="font-serif text-[18px] font-black leading-tight truncate text-ink">
                {show.artist}
              </span>
              <span className="font-mono text-[11px] font-bold flex-shrink-0 text-ink/70">
                {show.dateLine1}
              </span>
            </div>

            {/* Title */}
            <span className="text-[11px] font-medium truncate text-ink/65">
              {show.title}
            </span>

            {/* Venue */}
            <div className="flex items-center gap-1.5">
              <MapPin className="w-[9px] h-[9px] text-ink/75" strokeWidth={2.5} />
              <span className="text-[11px] font-semibold truncate text-ink/75">
                {show.venue}
              </span>
            </div>

            <div className="flex-1" />

            {/* Bottom row */}
            <div className="flex items-center justify-between gap-1.5 mt-auto">
              <div className="flex items-center gap-1.5">
                <AttendBadge percent={show.attendPercent} />
                <span className="text-[9px] text-ink/55 whitespace-nowrap">
                  已到场 · {show.attendCount}人
                </span>
              </div>
              {show.dateLine2 && (
                <span className="font-mono text-[13px] font-black text-ink/75 flex-shrink-0">
                  {show.dateLine2}
                </span>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="py-1">
            <DashedDivider />
          </div>

          {/* Right — photo */}
          <PhotoSection src={show.poster} seed={ticketSeed} />
        </div>
      </div>
    </div>
  );

  if (linkTo) {
    return <Link to={linkTo}>{card}</Link>;
  }

  return card;
};
