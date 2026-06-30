import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface MemoryCardUser {
  id: string;
  nickname: string;
  avatarUrl: string | null;
}

interface MemoryCardShow {
  id: string;
  artistName: string;
  venueName: string;
}

export interface MemoryCardData {
  id: string;
  text: string;
  media?: { url: string; type: string }[];
  createdAt: string;
  user?: MemoryCardUser;
  show?: MemoryCardShow;
}

export function MemoryCard({ memory, compact }: { memory: MemoryCardData; compact?: boolean }) {
  const [imgError, setImgError] = useState(false);

  const heroMedia = memory.media?.[0];
  const textSnippet = memory.text.length > 80 ? memory.text.slice(0, 80) + '…' : memory.text;

  const timeAgo = (() => {
    const diff = Date.now() - new Date(memory.createdAt).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return '刚刚';
    if (mins < 60) return `${mins}分钟前`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}小时前`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}天前`;
    const months = Math.floor(days / 30);
    return `${months}个月前`;
  })();

  return (
    <Link
      to={`/memories/${memory.id}`}
      className={cn(
        'flex flex-col gap-2 rounded-xl bg-card px-4 py-3 ring-1 ring-ink/5',
        compact && 'py-2',
      )}
    >
      {/* Hero media */}
      {heroMedia && !compact && (
        <div className="relative -mx-4 -mt-3 mb-1 overflow-hidden rounded-t-xl">
          {heroMedia.type === 'video' ? (
            <div className="flex h-32 items-center justify-center bg-bg-elevated">
              <svg className="h-8 w-8 text-concrete-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9A2.25 2.25 0 0 0 13.5 5.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z" />
              </svg>
            </div>
          ) : (
            !imgError ? (
              <img
                src={heroMedia.url}
                alt=""
                className="h-32 w-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex h-32 items-center justify-center bg-bg-elevated">
                <span className="text-2xl text-text-disabled">📷</span>
              </div>
            )
          )}
          {memory.media && memory.media.length > 1 && (
            <span className="absolute bottom-1.5 right-1.5 rounded bg-ink/60 px-1.5 py-0.5 text-[10px] text-bone">
              +{memory.media.length - 1}
            </span>
          )}
        </div>
      )}

      {/* Text snippet */}
      <p className={cn('text-sm leading-relaxed text-ink/85', compact && 'line-clamp-1')}>
        {textSnippet || '（空）'}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between text-[11px] text-text-muted">
        <span>
          {memory.user?.nickname ?? '乐迷'}
          {memory.show && !compact && (
            <span className="ml-1 text-concrete-dark">
              · {memory.show.artistName} @ {memory.show.venueName}
            </span>
          )}
        </span>
        <span>{timeAgo}</span>
      </div>
    </Link>
  );
}
