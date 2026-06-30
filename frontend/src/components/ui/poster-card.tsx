/**
 * PosterCard — Riso-print show poster (inline Tailwind values)
 */
import { type FC } from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { hashSeed } from '@/theme/theme';

interface ShowData {
  id: string; artist: string; title: string; venue: string;
  dateLine1: string; dateLine2?: string; city?: string;
  attendPercent: number; attendCount: number;
  poster?: string; bandVibe?: number; soundVibe?: number; atmosVibe?: number;
}

const VibeBar: FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => {
  const pct = Math.min(100, (value / 5) * 100);
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[9px] font-mono font-bold text-[#55505c] w-6">{label}</span>
      <div className="flex-1 h-1.5 bg-[#1a1224]">
        <div className="h-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
};

const PosterPhoto: FC<{ src?: string; seed: number; artistName: string }> = ({ src, seed, artistName }) => {
  const colors = [
    ['#0f0a15', '#1a0a00'], ['#0a0f15', '#0a150f'],
    ['#0f0a15', '#150a0f'], ['#0a0f10', '#100a15'],
    ['#0f100a', '#0a0f15'], ['#0f0a10', '#100a0f'],
  ];
  const [c1, c2] = colors[seed % colors.length];

  if (src) {
    return (
      <div className="absolute inset-0">
        <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(15,10,21,0.95) 0%, rgba(15,10,21,0.35) 50%, rgba(15,10,21,0.55) 100%)' }}
        />
      </div>
    );
  }

  return (
    <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
      <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full bg-[#00e676] opacity-20" />
      <div className="absolute -left-4 -bottom-8 w-36 h-36 rounded-full bg-[#ff6d00] opacity-15" />
      <div className="absolute right-4 bottom-2 text-[120px] font-black text-[#f0edf2] opacity-5 select-none leading-none" style={{ fontFamily: 'system-ui, sans-serif' }}>
        {artistName.charAt(0)}
      </div>
    </div>
  );
};

export const PosterCard: FC<PosterCardProps> = ({ show, linkTo, className }) => {
  const seed = hashSeed(show.id);
  const bandV = show.bandVibe ?? (3 + (seed % 20) / 10);
  const soundV = show.soundVibe ?? (3 + ((seed * 7) % 20) / 10);
  const atmosV = show.atmosVibe ?? (3 + ((seed * 13) % 20) / 10);

  const card = (
    <div className={cn(
      'relative w-full h-[180px] overflow-hidden group cursor-pointer transition-transform duration-300 hover:scale-[1.01]',
      className
    )}>
      <PosterPhoto src={show.poster} seed={seed} artistName={show.artist} />

      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none"
        style={{ background: 'linear-gradient(0deg, rgba(0,230,118,0.06) 50%, rgba(255,109,0,0.06) 50%)', backgroundSize: '100% 4px' }}
      />

      <div className="relative z-10 h-full flex flex-col justify-end p-4">
        <h3 className="text-2xl font-black text-[#f0edf2] leading-none mb-1"
          style={{ textShadow: '-2px -2px 0 #0f0a15, 2px -2px 0 #0f0a15, -2px 2px 0 #0f0a15, 2px 2px 0 #0f0a15' }}>
          {show.artist}
        </h3>

        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-3 h-3 text-[#00e676]" strokeWidth={2.5} />
          <span className="text-xs font-mono font-bold text-[#8b8692]">{show.venue}</span>
          <span className="text-[10px] font-mono text-[#ff6d00]">{show.dateLine1}</span>
          {show.city && <span className="text-[10px] font-mono text-[#55505c]">{show.city}</span>}
        </div>

        <div className="flex flex-col gap-0.5 mb-1.5">
          <VibeBar label="乐队" value={bandV} color="#e5ff00" />
          <VibeBar label="音响" value={soundV} color="#00e676" />
          <VibeBar label="氛围" value={atmosV} color="#ff6d00" />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-[#55505c]">已到场 {show.attendCount}人</span>
          {show.dateLine2 && <span className="text-[10px] font-mono font-bold text-[#ff6d00]">{show.dateLine2}</span>}
        </div>
      </div>
    </div>
  );

  if (linkTo) return <Link to={linkTo}>{card}</Link>;
  return card;
};

interface PosterCardProps { show: ShowData; linkTo?: string; className?: string; }
