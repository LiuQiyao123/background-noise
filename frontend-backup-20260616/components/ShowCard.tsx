import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Show } from '../api/types';

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

function ShowThumbnail({ url, artistName }: { url: string | null | undefined; artistName: string }) {
  const [failed, setFailed] = useState(false);

  if (!url || failed) {
    // Generate a deterministic color from the artist name
    const colors = ['#e85d4c', '#3498db', '#9b59b6', '#f39c12', '#2ecc71', '#e67e22', '#1abc9c', '#e84393', '#6c5ce7'];
    const hash = artistName.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
    const color = colors[hash % colors.length];

    return (
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 10,
          background: `linear-gradient(135deg, ${color}, ${color}dd)`,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          color: 'rgba(255,255,255,0.85)',
        }}
      >
        🎸
      </div>
    );
  }

  return (
    <img
      src={url}
      alt=""
      onError={() => setFailed(true)}
      style={{
        width: 64,
        height: 64,
        borderRadius: 10,
        objectFit: 'cover',
        flexShrink: 0,
      }}
    />
  );
}

export function ShowCard({ show }: { show: Show }) {
  return (
    <Link to={`/shows/${show.id}`} className="card">
      <div style={{ display: 'flex', gap: 14, alignItems: 'center', minWidth: 0 }}>
        <ShowThumbnail url={show.coverUrl} artistName={show.artistName} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <strong
            style={{
              fontSize: 'var(--font-size-body)',
              fontWeight: 700,
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {show.artistName}
          </strong>
          <p
            className="repo-meta"
            style={{
              marginTop: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {formatDate(show.showDate)} · {show.venueName}
            {show.city ? ` · ${show.city}` : ''}
          </p>
          {show.stats && show.stats.publicRepoCount > 0 && (
            <p style={{ fontSize: 'var(--font-size-caption)', color: 'var(--text-dim)', marginTop: 4 }}>
              🎸 {show.stats.publicRepoCount} 条现场记录
              {show.stats.avgVibe.band && ` · ⭐ ${show.stats.avgVibe.band.toFixed(1)}`}
            </p>
          )}
        </div>
        {show.stats && show.stats.publicRepoCount > 0 && (
          <span className="tag" style={{ flexShrink: 0, fontSize: 'var(--font-size-micro)' }}>
            {show.stats.publicRepoCount} 条
          </span>
        )}
      </div>
    </Link>
  );
}
