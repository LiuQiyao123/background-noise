import { Link } from 'react-router-dom';
import type { Repo } from '../api/types';

function PrivacyBadge({ visibility }: { visibility: 'PRIVATE' | 'PUBLIC' }) {
  return (
    <span className={`privacy-badge privacy-badge--${visibility === 'PRIVATE' ? 'private' : 'public'}`}>
      {visibility === 'PRIVATE' ? '\ud83d\udd12 仅自己' : '\u2705 已公开'}
    </span>
  );
}

export function RepoCard({ repo, compact }: { repo: Repo; compact?: boolean }) {
  return (
    <Link
      to={`/repos/${repo.id}`}
      className="card"
      style={repo.visibility === 'PRIVATE' ? { opacity: 0.85 } : undefined}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 6,
        }}
      >
        <p
          style={{
            fontWeight: 600,
            fontSize: 'var(--font-size-memory)',
            lineHeight: 'var(--line-height-tight)',
            flex: 1,
          }}
        >
          「{repo.memoryHook}」
        </p>
        {repo.visibility === 'PRIVATE' && <PrivacyBadge visibility="PRIVATE" />}
      </div>
      {repo.body && !compact && (
        <p
          style={{
            fontSize: 'var(--font-size-body)',
            color: 'var(--text-muted)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {repo.body}
        </p>
      )}
      <p className="repo-meta">
        {repo.user?.nickname ?? '乐迷'}
        {' · '}❤ {repo.likeCount}
        {' · '}💬 {repo.commentCount}
        {repo.visibility === 'PUBLIC' && repo.memoryHookLikeCount !== undefined && repo.memoryHookLikeCount > 0 && (
          <span style={{ marginLeft: 8 }}>
            🔥 {repo.memoryHookLikeCount}
          </span>
        )}
        {repo.visibility === 'PUBLIC' && <span style={{ marginLeft: 8 }}><PrivacyBadge visibility="PUBLIC" /></span>}
      </p>
    </Link>
  );
}
