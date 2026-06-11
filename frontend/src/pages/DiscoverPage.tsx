import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { DiscoverFeed, BlindBox } from '../api/types';
import { RepoCard } from '../components/RepoCard';
import { ShowCard } from '../components/ShowCard';
import { useAuth } from '../context/AuthContext';

function BlindBoxCard({ box, onReveal, onDismiss }: { box: BlindBox; onReveal: () => void; onDismiss: () => void }) {
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #1e1418 0%, #14141e 100%)',
        border: '1px solid var(--accent-muted)',
        borderRadius: 'var(--radius)',
        padding: '20px',
        marginBottom: '16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 10,
          right: 14,
          fontSize: '1.2rem',
          opacity: 0.3,
        }}
      >
        🎸
      </div>
      <div
        style={{
          fontSize: 'var(--font-size-caption)',
          color: 'var(--accent)',
          fontWeight: 600,
          marginBottom: '12px',
          letterSpacing: '0.05em',
        }}
      >
        同场盲盒
      </div>
      <p
        style={{
          fontSize: 'var(--font-size-memory)',
          color: 'var(--text)',
          fontWeight: 500,
          lineHeight: 1.6,
          marginBottom: '8px',
          fontStyle: 'italic',
        }}
      >
        「{box.memoryHook}」
      </p>
      <p
        style={{
          fontSize: 'var(--font-size-caption)',
          color: 'var(--text-muted)',
          marginBottom: '16px',
        }}
      >
        —— 来自 {box.show.artistName} 的某位在场者
      </p>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          className="btn btn-primary"
          style={{ flex: 1, fontSize: '0.875rem' }}
          onClick={onReveal}
        >
          我也这么觉得 🤘
        </button>
        <button
          className="btn btn-ghost btn-sm"
          onClick={onDismiss}
        >
          滑走
        </button>
      </div>
    </div>
  );
}

function MatchSection({ matches }: { matches: any[] }) {
  if (!matches || matches.length === 0) return null;
  return (
    <div>
      <div className="section-divider">与你共鸣</div>
      {matches.map((m: any) => (
        <div
          key={m.id}
          className="card"
          style={{ cursor: 'pointer', padding: '12px 14px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '2px' }}>
                {m.otherUser?.nickname || '未知'}
                {m.matchLevel === 3 && (
                  <span
                    style={{
                      marginLeft: '6px',
                      fontSize: 'var(--font-size-micro)',
                      background: 'var(--accent-muted)',
                      color: 'var(--accent)',
                      padding: '1px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    {m.similarityScore}% 重合
                  </span>
                )}
              </div>
              <div style={{ fontSize: 'var(--font-size-caption)', color: 'var(--text-muted)' }}>
                {m.show?.artistName} · {m.show?.venueName}
              </div>
            </div>
            <span
              style={{
                fontSize: '1.1rem',
                color: m.matchLevel >= 3 ? 'var(--accent)' : m.matchLevel >= 2 ? 'var(--warm)' : 'var(--text-muted)',
              }}
            >
              {m.matchLevel >= 3 ? '🔥' : m.matchLevel >= 2 ? '💡' : '👋'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function DiscoverPage() {
  const { user } = useAuth();
  const [feed, setFeed] = useState<DiscoverFeed | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const headers: Record<string, string> = {};
    if (user) {
      headers['Authorization'] = `Bearer ${localStorage.getItem('token') || ''}`;
    }
    api<DiscoverFeed>('/discover', { auth: !!user })
      .then(setFeed)
      .finally(() => setLoading(false));
  }, [user]);

  const handleReveal = async (matchId: string) => {
    await api(`/match/${matchId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'CONNECTED' }),
    });
    // Refresh feed
    api<DiscoverFeed>('/discover', { auth: !!user }).then(setFeed);
  };

  const handleDismiss = async (matchId: string) => {
    await api(`/match/${matchId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'DISMISSED' }),
    });
    api<DiscoverFeed>('/discover', { auth: !!user }).then(setFeed);
  };

  if (loading) {
    return <div className="page"><p className="empty">加载中...</p></div>;
  }
  if (!feed) {
    return <div className="page"><p className="empty">加载失败</p></div>;
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">发现</h1>
        <p className="page-sub">共鸣与推荐</p>
      </header>

      {/* C-05: 同场盲盒 */}
      {feed.blindBox && (
        <BlindBoxCard
          box={feed.blindBox}
          onReveal={() => handleReveal(feed.blindBox!.id)}
          onDismiss={() => handleDismiss(feed.blindBox!.id)}
        />
      )}

      {/* Match recommendations */}
      <MatchSection matches={feed.matches || []} />

      <div className="section-divider">即将上演</div>
      {feed.upcoming.length === 0 ? (
        <p className="empty" style={{ padding: '12px 0' }}>暂无</p>
      ) : (
        feed.upcoming.slice(0, 3).map((s) => <ShowCard key={s.id} show={s} />)
      )}

      <div className="section-divider">热门现场</div>
      {feed.hotShows.length === 0 ? (
        <p className="empty" style={{ padding: '12px 0' }}>暂无</p>
      ) : (
        feed.hotShows.slice(0, 3).map((s) => <ShowCard key={s.id} show={s} />)
      )}

      <div className="section-divider">最新共鸣</div>
      {feed.recentRepos.length === 0 ? (
        <p className="empty" style={{ padding: '12px 0' }}>暂无公开记录</p>
      ) : (
        feed.recentRepos.map((r) => <RepoCard key={r.id} repo={r} compact />)
      )}
    </div>
  );
}
