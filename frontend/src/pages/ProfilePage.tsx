import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { api } from '../api/client';
import type { MatchCard, MatchList, Repo, UserStats } from '../api/types';
import { RepoCard } from '../components/RepoCard';
import { UserAvatar } from '../components/UserAvatar';
import { useAuth } from '../context/AuthContext';

const PERSONA_EMOJI: Record<string, string> = {
  '感性派': '💫',
  '比喻狂魔': '🎭',
  '行动派': '🤘',
  '自由人': '🎸',
};

export function ProfilePage() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [matches, setMatches] = useState<MatchCard[]>([]);
  const [activeTab, setActiveTab] = useState<'repos' | 'matches' | 'wants'>('repos');

  useEffect(() => {
    if (!user) return;
    api<UserStats>('/users/me/stats').then(setStats);
    api<{ items: Repo[] }>('/repos/me/timeline').then((r) => setRepos(r.items));
  }, [user]);

  useEffect(() => {
    if (!user || activeTab !== 'matches') return;
    api<MatchList>('/match/my').then((r) => setMatches(r.items));
  }, [user, activeTab]);

  if (!user) return <Navigate to="/login" replace />;

  const expressionPersona = user.expressionPersona;
  const personaEmoji = expressionPersona ? PERSONA_EMOJI[expressionPersona] ?? '' : '';

  return (
    <div className="page">
      <header
        className="page-header"
        style={{ display: 'flex', alignItems: 'center', gap: 16 }}
      >
        <UserAvatar nickname={user.nickname} avatarUrl={user.avatarUrl} size={56} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 className="page-title">{user.nickname}</h1>
            {expressionPersona && (
              <span
                style={{
                  fontSize: 'var(--font-size-caption)',
                  color: 'var(--accent)',
                  background: 'var(--accent-muted)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-pill)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                {personaEmoji} {expressionPersona}
              </span>
            )}
          </div>
          <p className="page-sub">{user.phone}</p>
        </div>
      </header>

      {stats && (
        <div className="stats-grid">
          <div className="stat-box">
            <div className="val" style={{ color: 'var(--vibe-band)' }}>
              {stats.attendedShows}
            </div>
            <div className="lbl">看过</div>
          </div>
          <div className="stat-box">
            <div className="val" style={{ color: 'var(--vibe-sound)' }}>
              {stats.wantToSeeCount}
            </div>
            <div className="lbl">想看</div>
          </div>
          <div className="stat-box">
            <div className="val" style={{ color: 'var(--vibe-atmosphere)' }}>
              {stats.uniqueVenues}
            </div>
            <div className="lbl">场馆</div>
          </div>
          <div className="stat-box">
            <div className="val">{stats.repoCount}</div>
            <div className="lbl">记录</div>
          </div>
        </div>
      )}

      {/* Segment tabs */}
      <div className="segment" style={{ marginTop: 16 }}>
        <button
          type="button"
          className={activeTab === 'repos' ? 'active' : ''}
          onClick={() => setActiveTab('repos')}
        >
          我的记录
        </button>
        <button
          type="button"
          className={activeTab === 'matches' ? 'active' : ''}
          onClick={() => setActiveTab('matches')}
        >
          我的共鸣
          {matches.length > 0 && (
            <span
              style={{
                marginLeft: 4,
                background: 'var(--accent)',
                color: '#fff',
                borderRadius: 999,
                padding: '0 6px',
                fontSize: 'var(--font-size-micro)',
              }}
            >
              {matches.length}
            </span>
          )}
        </button>
      </div>

      {/* Repos tab */}
      {activeTab === 'repos' && (
        <>
          {repos.length === 0 ? (
            <p className="empty">
              还没有记录{' '}
              <Link to="/record" style={{ color: 'var(--accent)' }}>
                去写一场
              </Link>
            </p>
          ) : (
            repos.map((r) => <RepoCard key={r.id} repo={r} />)
          )}
        </>
      )}

      {/* Matches tab */}
      {activeTab === 'matches' && (
        <>
          {matches.length === 0 ? (
            <p className="empty">
              还没有共鸣，去写公开记录撞一下？
            </p>
          ) : (
            matches.map((m) => (
              <div
                key={m.id}
                className="card"
                style={{ cursor: 'default' }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        marginBottom: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      {m.otherUser.nickname}
                      {m.matchLevel === 3 && (
                        <span
                          style={{
                            fontSize: 'var(--font-size-micro)',
                            background: 'var(--accent-muted)',
                            color: 'var(--accent)',
                            padding: '1px 6px',
                            borderRadius: 4,
                          }}
                        >
                          {m.similarityScore}% 重合
                        </span>
                      )}
                      {m.matchLevel === 2 && (
                        <span
                          style={{
                            fontSize: 'var(--font-size-micro)',
                            background: 'rgba(201, 120, 58, 0.12)',
                            color: 'var(--warm)',
                            padding: '1px 6px',
                            borderRadius: 4,
                          }}
                        >
                          同频
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: 'var(--font-size-caption)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {m.show.artistName} · {m.show.venueName}
                    </div>
                    <div
                      style={{
                        fontSize: 'var(--font-size-micro)',
                        color: 'var(--text-dim)',
                        marginTop: 4,
                        fontStyle: 'italic',
                      }}
                    >
                      「{m.otherMemoryHook}」
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '1.1rem',
                      color:
                        m.matchLevel >= 3
                          ? 'var(--accent)'
                          : m.matchLevel >= 2
                            ? 'var(--warm)'
                            : 'var(--text-muted)',
                    }}
                  >
                    {m.status === 'CONNECTED' ? '🤝' : m.matchLevel >= 3 ? '🔥' : m.matchLevel >= 2 ? '💕' : '👥'}
                  </span>
                </div>
              </div>
            ))
          )}
        </>
      )}

      <button
        type="button"
        className="btn btn-danger"
        style={{ marginTop: 24, width: '100%' }}
        onClick={logout}
      >
        退出登录
      </button>
    </div>
  );
}
