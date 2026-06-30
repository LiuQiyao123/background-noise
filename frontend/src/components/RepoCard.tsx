import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { Repo } from '../api/types';

function PrivacyBadge({ visibility }: { visibility: 'PRIVATE' | 'PUBLIC' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium',
        visibility === 'PRIVATE'
          ? 'bg-concrete/20 text-concrete-dark'
          : 'bg-highlight/15 text-highlight/80',
      )}
    >
      {visibility === 'PRIVATE' ? '🔒 仅自己' : '✅ 已公开'}
    </span>
  );
}

export function RepoCard({ repo, compact }: { repo: Repo; compact?: boolean }) {
  return (
    <Link
      to={`/repos/${repo.id}`}
      className={cn(
        'flex flex-col gap-1.5 rounded-xl bg-card px-4 py-3 ring-1 ring-ink/5',
        repo.visibility === 'PRIVATE' && 'opacity-85',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="flex-1 text-sm font-semibold leading-tight">
          「{repo.memoryHook}」
        </p>
        {repo.visibility === 'PRIVATE' && <PrivacyBadge visibility="PRIVATE" />}
      </div>
      {repo.body && !compact && (
        <p className="line-clamp-2 text-sm text-text-muted">
          {repo.body}
        </p>
      )}
      <p className="text-xs text-text-muted">
        {repo.user?.nickname ?? '乐迷'}
        {' · ❤ '}{repo.likeCount}
        {' · 💬 '}{repo.commentCount}
        {repo.visibility === 'PUBLIC' && repo.memoryHookLikeCount !== undefined && repo.memoryHookLikeCount > 0 && (
          <span className="ml-2">🔥 {repo.memoryHookLikeCount}</span>
        )}
        {repo.visibility === 'PUBLIC' && (
          <span className="ml-2"><PrivacyBadge visibility="PUBLIC" /></span>
        )}
      </p>
    </Link>
  );
}
