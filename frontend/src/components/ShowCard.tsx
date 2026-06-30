import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { Show } from '../api/types';

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

const thumbColors = ['#e85d4c', '#3498db', '#9b59b6', '#f39c12', '#2ecc71', '#e67e22', '#1abc9c', '#e84393', '#6c5ce7'];

function ShowThumbnail({ url, artistName }: { url: string | null | undefined; artistName: string }) {
  const [failed, setFailed] = useState(false);

  if (!url || failed) {
    const hash = artistName.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
    const color = thumbColors[hash % thumbColors.length];
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-[10px]"
        style={{
          width: 64, height: 64,
          background: `linear-gradient(135deg, ${color}, ${color}dd)`,
        }}
      >
        <span className="text-[1.5rem] text-white/85">🎸</span>
      </div>
    );
  }
  return (
    <img
      src={url}
      alt=""
      onError={() => setFailed(true)}
      className="w-16 h-16 shrink-0 rounded-[10px] object-cover"
    />
  );
}

export function ShowCard({ show }: { show: Show }) {
  return (
    <Link
      to={`/shows/${show.id}`}
      className="flex items-center gap-3.5 rounded-xl bg-card px-4 py-3 ring-1 ring-ink/5 min-w-0"
    >
      <ShowThumbnail url={show.coverUrl} artistName={show.artistName} />
      <div className="min-w-0 flex-1">
        <strong className="block truncate text-sm font-bold">
          {show.artistName}
        </strong>
        <p className="mt-0.5 truncate text-xs text-text-muted">
          {formatDate(show.showDate)} · {show.venueName}
          {show.city ? ` · ${show.city}` : ''}
        </p>
        {show.stats?.publicRepoCount > 0 && (
          <p className="mt-1 text-xs text-text-dim">
            🎸 {show.stats.publicRepoCount} 条现场记录
            {show.stats.avgVibe.band ? ` · ⭐ ${show.stats.avgVibe.band.toFixed(1)}` : ''}
          </p>
        )}
      </div>
      {show.stats?.publicRepoCount > 0 && (
        <span className="shrink-0 inline-flex items-center rounded-full bg-muted/30 px-2 py-0.5 text-[10px]">
          {show.stats.publicRepoCount} 条
        </span>
      )}
    </Link>
  );
}
