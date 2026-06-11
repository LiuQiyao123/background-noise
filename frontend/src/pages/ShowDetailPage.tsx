import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import type { MemoryWallItem, Repo, Show } from '../api/types';
import { RepoCard } from '../components/RepoCard';
import { useAuth } from '../context/AuthContext';

const VIBE_ADJECTIVES = {
  band: ['车祸现场', '不在状态', '中规中矩', '全程高能', '封神之夜'],
  sound: ['一团浆糊', '听了个寂寞', '及格水平', '身临其境', '耳朵怀孕'],
  atmosphere: ['全员养神', '稀稀拉拉', '礼貌性躁动', '真的燥起来了', '掀翻屋顶'],
} as const;

function VibeDistributionBar({
  distribution,
  color,
  dimension,
}: {
  distribution: Record<string, number>;
  color: string;
  dimension: 'band' | 'sound' | 'atmosphere';
}) {
  const values = Object.entries(distribution).map(([k, v]) => ({ score: Number(k), count: v }));
  const total = values.reduce((s, v) => s + v.count, 0);
  if (total === 0) return null;

  // Find the most common score
  const maxCount = Math.max(...values.map((v) => v.count));
  const topScore = values.find((v) => v.count === maxCount)!.score;
  const topAdjective = VIBE_ADJECTIVES[dimension][topScore - 1];
  const topPercent = Math.round((maxCount / total) * 100);

  return (
    <div
      style={{
        background: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-sm)',
        padding: 10,
        marginBottom: 6,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 6,
        }}
      >
        <span style={{ fontSize: 'var(--font-size-caption)', color: 'var(--text-muted)' }}>
          {dimension === 'band' ? '乐队表现' : dimension === 'sound' ? '音响效果' : '现场氛围'}
        </span>
        <span style={{ fontSize: 'var(--font-size-caption)', color, fontWeight: 600 }}>
          {topPercent}% 认为「{topAdjective}」
        </span>
      </div>
      <div style={{ display: 'flex', gap: 3, height: 6 }}>
        {[1, 2, 3, 4, 5].map((score) => {
          const count = distribution[score] ?? 0;
          const pct = total > 0 ? (count / total) * 100 : 0;
          return (
            <div
              key={score}
              style={{
                flex: 1,
                background: 'var(--bg-card)',
                borderRadius: 3,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: `${pct}%`,
                  background: color,
                  borderRadius: 3,
                  opacity: 0.7 + score * 0.06,
                  transition: 'height 0.3s ease',
                }}
              />
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        {[1, 2, 3, 4, 5].map((score) => (
          <span
            key={score}
            style={{
              fontSize: 'var(--font-size-micro)',
              color: 'var(--text-dim)',
              flex: 1,
              textAlign: 'center' as const,
            }}
          >
            {distribution[score] ?? 0}
          </span>
        ))}
      </div>
    </div>
  );
}

export function ShowDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [show, setShow] = useState<Show | null>(null);
  const [wall, setWall] = useState<MemoryWallItem[]>([]);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [sort, setSort] = useState<'hot' | 'latest'>('hot');
  const [loadingInterest, setLoadingInterest] = useState<string | null>(null);
  const [coverError, setCoverError] = useState(false);
  const [showVibeDetail, setShowVibeDetail] = useState(false);
  const hook = searchParams.get('memoryHook') ?? '';

  useEffect(() => {
    if (!id) return;
    api<Show>(`/shows/${id}`, { auth: false }).then(setShow);
    api<MemoryWallItem[]>(`/shows/${id}/memory-wall`, { auth: false }).then(setWall);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const q = new URLSearchParams({ sort });
    if (hook) q.set('memoryHook', hook);
    api<{ items: Repo[] }>(`/shows/${id}/repos?${q}`, { auth: false }).then((r) =>
      setRepos(r.items),
    );
  }, [id, sort, hook]);

  const handleInterest = useCallback(
    async (type: 'want' | 'attended') => {
      if (!id) return;
      setLoadingInterest(type);
      try {
        await api(`/shows/${id}/${type}`, { method: 'POST' });
        api<Show>(`/shows/${id}`, { auth: false }).then(setShow);
      } catch {
        // silent
      } finally {
        setLoadingInterest(null);
      }
    },
    [id],
  );

  if (!show) {
    return (
      <div className="page">
        <p className="empty">加载中...</p>
      </div>
    );
  }

  const date = new Date(show.showDate).toLocaleString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
  });
  const time = new Date(show.showDate).toLocaleString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="page">
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        style={{ marginBottom: 12 }}
        onClick={() => navigate(-1)}
      >
        ← 返回
      </button>

      {/* ShowHero */}
      <div className="show-hero">
        {show.coverUrl && !coverError && (
          <>
            <img
              src={show.coverUrl}
              alt=""
              onError={() => setCoverError(true)}
              style={{ display: 'none' }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url(${show.coverUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(24px) saturate(1.1)',
                transform: 'scale(1.1)',
              }}
            />
          </>
        )}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, #0a0a0c 0%, transparent 60%)',
          }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1>{show.artistName}</h1>
          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: 'var(--font-size-caption)',
              marginTop: 4,
            }}
          >
            {date === time ? date : `${date} ${time}`} · {show.venueName}
            {show.city ? ` · ${show.city}` : ''}
          </p>
        </div>
      </div>

      {/* Stats */}
      {show.stats && (
        <>
          <div className="stats-grid">
            <div className="stat-box">
              <div className="val" style={{ color: 'var(--vibe-band)' }}>
                {show.stats.avgVibe.band?.toFixed(1) ?? '-'}
              </div>
              <div className="lbl">乐队</div>
            </div>
            <div className="stat-box">
              <div className="val" style={{ color: 'var(--vibe-sound)' }}>
                {show.stats.avgVibe.sound?.toFixed(1) ?? '-'}
              </div>
              <div className="lbl">音响</div>
            </div>
            <div className="stat-box">
              <div className="val" style={{ color: 'var(--vibe-atmosphere)' }}>
                {show.stats.avgVibe.atmosphere?.toFixed(1) ?? '-'}
              </div>
              <div className="lbl">氛围</div>
            </div>
            <div className="stat-box">
              <div className="val">{show.stats.wantToSeeCount}</div>
              <div className="lbl">想看</div>
            </div>
            <div className="stat-box">
              <div className="val">{show.stats.attendedCount}</div>
              <div className="lbl">看过</div>
            </div>
            <div className="stat-box">
              <div className="val">{show.stats.publicRepoCount}</div>
              <div className="lbl">记录</div>
            </div>
          </div>

          {/* M-04: 集体评分气质 */}
          {show.stats.vibeDistribution && (
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 'var(--font-size-caption)',
                    color: 'var(--text-muted)',
                    fontWeight: 500,
                  }}
                >
                  现场气质
                </span>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ padding: '2px 8px', fontSize: 'var(--font-size-caption)' }}
                  onClick={() => setShowVibeDetail(!showVibeDetail)}
                >
                  {showVibeDetail ? '收起' : '详情'}
                </button>
              </div>
              {showVibeDetail ? (
                <>
                  <VibeDistributionBar
                    distribution={show.stats.vibeDistribution.band}
                    color="var(--vibe-band)"
                    dimension="band"
                  />
                  <VibeDistributionBar
                    distribution={show.stats.vibeDistribution.sound}
                    color="var(--vibe-sound)"
                    dimension="sound"
                  />
                  <VibeDistributionBar
                    distribution={show.stats.vibeDistribution.atmosphere}
                    color="var(--vibe-atmosphere)"
                    dimension="atmosphere"
                  />
                </>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    flexWrap: 'wrap',
                    fontSize: 'var(--font-size-caption)',
                  }}
                >
                  {(['band', 'sound', 'atmosphere'] as const).map((dim) => {
                    const dist = show.stats!.vibeDistribution![dim]!;
                    const total = Object.values(dist).reduce((s, v) => s + v, 0);
                    const topScore = (Object.entries(dist) as [string, number][])
                      .sort((a, b) => b[1] - a[1])[0];
                    const pct = total > 0 ? Math.round((topScore[1] / total) * 100) : 0;
                    const adj = VIBE_ADJECTIVES[dim][Number(topScore[0]) - 1];
                    const color =
                      dim === 'band'
                        ? 'var(--vibe-band)'
                        : dim === 'sound'
                          ? 'var(--vibe-sound)'
                          : 'var(--vibe-atmosphere)';
                    return (
                      <span
                        key={dim}
                        style={{
                          background: 'var(--bg-elevated)',
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-pill)',
                          color,
                          fontSize: 'var(--font-size-micro)',
                        }}
                      >
                        {pct}% 「{adj}」
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Action buttons */}
      {user && (
        <div
          style={{
            display: 'flex',
            gap: 8,
            marginBottom: 16,
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={loadingInterest !== null}
            onClick={() => handleInterest('want')}
          >
            {loadingInterest === 'want' ? '...' : '想看'}
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={loadingInterest !== null}
            onClick={() => handleInterest('attended')}
          >
            {loadingInterest === 'attended' ? '...' : '标记看过'}
          </button>
          <Link to={`/record?showId=${id}`} className="btn btn-primary btn-sm">
            写记录
          </Link>
        </div>
      )}

      {/* Memory Wall */}
      <h2
        style={{
          fontSize: 'var(--font-size-body)',
          fontWeight: 600,
          marginBottom: 8,
        }}
      >
        记忆墙
      </h2>
      <div className="memory-scroll">
        <button
          type="button"
          className={`tag${!hook ? ' active' : ''}`}
          onClick={() => setSearchParams({})}
        >
          全部
        </button>
        {wall.map((w) => (
          <button
            key={w.memoryHook}
            type="button"
            className={`tag${hook === w.memoryHook ? ' active' : ''}`}
            onClick={() => setSearchParams({ memoryHook: w.memoryHook })}
          >
            {w.memoryHook}
          </button>
        ))}
      </div>

      {/* Sort tabs */}
      <div className="segment">
        <button
          type="button"
          className={sort === 'hot' ? 'active' : ''}
          onClick={() => setSort('hot')}
        >
          热门
        </button>
        <button
          type="button"
          className={sort === 'latest' ? 'active' : ''}
          onClick={() => setSort('latest')}
        >
          最新
        </button>
      </div>

      {repos.length === 0 ? (
        <div className="empty">
          <p>暂无公开记录</p>
          {user && (
            <div className="empty-cta">
              <Link to={`/record?showId=${id}`} className="btn btn-primary btn-sm">
                写下你的现场记忆
              </Link>
            </div>
          )}
          {!user && (
            <div className="empty-cta">
              <Link to="/login" className="btn btn-ghost btn-sm">
                登录后查看更多
              </Link>
            </div>
          )}
        </div>
      ) : (
        repos.map((r) => <RepoCard key={r.id} repo={r} />)
      )}
    </div>
  );
}
