import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Eye,
  Heart,
  PencilLine,
  BookOpen,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/api/client';
import type { MemoryWallItem, Repo, Show } from '@/api/types';
import { RepoCard } from '@/components/RepoCard';
import { useAuth } from '@/context/AuthContext';
import { ConcreteBackground } from '@/components/ui/concrete-background';
import { TornPaperShape, TornPaperCard } from '@/components/ui/torn-paper';

import { StampLabel } from '@/components/ui/stamp-label';
import { SectionHeader } from '@/components/ui/section-header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import { Separator } from '@/components/ui/separator';

const VIBE_ADJECTIVES = {
  band: ['车祸现场', '不在状态', '中规中矩', '全程高能', '封神之夜'],
  sound: ['一团浆糊', '听了个寂寞', '及格水平', '身临其境', '耳朵怀孕'],
  atmosphere: ['全员养神', '稀稀拉拉', '礼貌性躁动', '真的燥起来了', '掀翻屋顶'],
} as const;

const VIBE_LABELS: Record<string, string> = {
  band: '乐队表现',
  sound: '音响效果',
  atmosphere: '现场氛围',
};

const VIBE_TAILWIND_CLS: Record<string, string> = {
  band: 'text-[var(--vibe-band)]',
  sound: 'text-[var(--vibe-sound)]',
  atmosphere: 'text-[var(--vibe-atmosphere)]',
};

const VIBE_BG_CLS: Record<string, string> = {
  band: 'bg-[var(--vibe-band)]',
  sound: 'bg-[var(--vibe-sound)]',
  atmosphere: 'bg-[var(--vibe-atmosphere)]',
};

// ─── Vibe Distribution Bar ─────────────────────────────────────

function VibeDistributionBar({
  distribution,
  dimension,
}: {
  distribution: Record<string, number>;
  dimension: 'band' | 'sound' | 'atmosphere';
}) {
  const values = Object.entries(distribution).map(([k, v]) => ({ score: Number(k), count: v }));
  const total = values.reduce((s, v) => s + v.count, 0);
  if (total === 0) return null;

  const maxCount = Math.max(...values.map((v) => v.count));
  const topScore = values.find((v) => v.count === maxCount)!.score;
  const topAdjective = VIBE_ADJECTIVES[dimension][topScore - 1];
  const topPercent = Math.round((maxCount / total) * 100);

  return (
    <div className="bg-[var(--bg-elevated)] rounded-[var(--radius-sm)] p-2.5 mb-1.5">
      {/* Header */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[var(--font-size-caption)] text-[var(--text-muted)]">
          {VIBE_LABELS[dimension]}
        </span>
        <span
          className={cn(
            'text-[var(--font-size-caption)] font-semibold',
            VIBE_TAILWIND_CLS[dimension],
          )}
        >
          {topPercent}% 认为「{topAdjective}」
        </span>
      </div>

      {/* Bar chart */}
      <div className="flex gap-[3px] h-1.5">
        {[1, 2, 3, 4, 5].map((score) => {
          const count = distribution[score] ?? 0;
          const pct = total > 0 ? (count / total) * 100 : 0;
          const opacity = 0.7 + score * 0.06;
          return (
            <div
              key={score}
              className="flex-1 relative overflow-hidden rounded-sm bg-[var(--bg-card)]"
            >
              <div
                className={cn(
                  'absolute bottom-0 left-0 right-0 rounded-sm transition-all duration-300',
                  VIBE_BG_CLS[dimension],
                )}
                style={{ height: `${pct}%`, opacity }}
              />
            </div>
          );
        })}
      </div>

      {/* Score counts */}
      <div className="flex justify-between mt-1">
        {[1, 2, 3, 4, 5].map((score) => (
          <span
            key={score}
            className="text-[var(--font-size-micro)] text-[var(--text-dim)] flex-1 text-center"
          >
            {distribution[score] ?? 0}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Hero Section ─────────────────────────────────────────────

function HeroSection({
  show,
  coverError,
  onCoverError,
}: {
  show: Show;
  coverError: boolean;
  onCoverError: () => void;
}) {
  const navigate = useNavigate();

  const date = new Date(show.showDate).toLocaleString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
  });
  const time = new Date(show.showDate).toLocaleString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const dateTimeStr = date === time ? date : `${date} ${time}`;
  const isPast = new Date(show.showDate) < new Date();

  return (
    <div className="relative w-full aspect-[4/5] overflow-hidden">
      {/* Background image with blur */}
      {show.coverUrl && !coverError && (
        <>
          <img
            src={show.coverUrl}
            alt=""
            className="hidden"
            onError={onCoverError}
          />
          <div
            className="absolute inset-0 bg-cover bg-center blur-2xl saturate-110 scale-110"
            style={{ backgroundImage: `url(${show.coverUrl})` }}
          />
        </>
      )}

      {/* Fallback gradient bg when no cover */}
      {(!show.coverUrl || coverError) && (
        <div className="absolute inset-0 bg-gradient-to-br from-concrete-dark to-ink" />
      )}

      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)]" />

      {/* Bottom gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent" />

      {/* Back button — top left, semi-transparent black circle */}
      <button
        type="button"
        className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-bone/80 hover:text-bone hover:bg-black/70 transition-colors"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      {/* Stamp — top right */}
      <div className="absolute top-4 right-4 z-20">
        <StampLabel text={isPast ? '已退场' : '即将开演'} />
      </div>

      {/* Hero info — bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-5 pb-6">
        {/* Artist name — serif 34px */}
        <h1 className="font-serif text-[34px] font-black leading-tight text-bone mb-1">
          {show.artistName}
        </h1>

        {/* Description / title */}
        {show.description && (
          <p className="text-bone/80 text-sm font-medium mb-1.5 line-clamp-1">
            {show.description}
          </p>
        )}

        {/* Date + Venue */}
        <div className="flex items-center gap-2 text-bone/70 text-xs font-medium">
          <Clock className="w-3 h-3" />
          <span>
            {dateTimeStr}
            {' · '}
            {show.venueName}
            {show.city ? ` · ${show.city}` : ''}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Stats Block ──────────────────────────────────────────────

function VibeDistributionSection({
  stats,
}: {
  stats: NonNullable<Show['stats']>;
}) {
  const [showVibeDetail, setShowVibeDetail] = useState(false);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[var(--font-size-caption)] text-ink/65 font-medium">
          现场气质
        </span>
        <Button
          variant="ghost"
          size="xs"
          onClick={() => setShowVibeDetail(!showVibeDetail)}
        >
          {showVibeDetail ? '收起' : '详情'}
        </Button>
      </div>

      {showVibeDetail ? (
        <>
          <VibeDistributionBar
            distribution={stats.vibeDistribution!.band}
            dimension="band"
          />
          <VibeDistributionBar
            distribution={stats.vibeDistribution!.sound}
            dimension="sound"
          />
          <VibeDistributionBar
            distribution={stats.vibeDistribution!.atmosphere}
            dimension="atmosphere"
          />
        </>
      ) : (
        <div className="flex gap-2 flex-wrap text-[var(--font-size-caption)]">
          {(['band', 'sound', 'atmosphere'] as const).map((dim) => {
            const dist = stats.vibeDistribution![dim]!;
            const total = Object.values(dist).reduce((s, v) => s + v, 0);
            const entries = Object.entries(dist) as [string, number][];
            entries.sort((a, b) => b[1] - a[1]);
            const topScore = entries[0];
            const pct = total > 0 ? Math.round((topScore[1] / total) * 100) : 0;
            const adj = VIBE_ADJECTIVES[dim][Number(topScore[0]) - 1];
            const colorVar =
              dim === 'band'
                ? 'var(--vibe-band)'
                : dim === 'sound'
                  ? 'var(--vibe-sound)'
                  : 'var(--vibe-atmosphere)';
            return (
              <span
                key={dim}
                className="bg-[var(--bg-elevated)] px-2.5 py-1 rounded-[var(--radius-pill)] text-[var(--font-size-micro)]"
                style={{ color: colorVar }}
              >
                {pct}% 「{adj}」
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Stats Block ──────────────────────────────────────────────

function StatsBlock({ show }: { show: Show }) {
  if (!show.stats) return null;

  const s = show.stats;

  return (
    <TornPaperCard className="mx-4 mt-[-20px] relative z-20">
      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-y-4 gap-x-2 mb-3">
        {/* Vibe scores */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[var(--vibe-band)] font-mono text-xl font-black">
            {s.avgVibe.band?.toFixed(1) ?? '-'}
          </span>
          <span className="text-[10px] font-medium text-ink/55">乐队</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[var(--vibe-sound)] font-mono text-xl font-black">
            {s.avgVibe.sound?.toFixed(1) ?? '-'}
          </span>
          <span className="text-[10px] font-medium text-ink/55">音响</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[var(--vibe-atmosphere)] font-mono text-xl font-black">
            {s.avgVibe.atmosphere?.toFixed(1) ?? '-'}
          </span>
          <span className="text-[10px] font-medium text-ink/55">氛围</span>
        </div>

        {/* Counts */}
        <div className="flex flex-col items-center gap-1">
          <span className="font-mono text-xl font-black text-ink">
            {s.wantToSeeCount}
          </span>
          <span className="text-[10px] font-medium text-ink/55">想看</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="font-mono text-xl font-black text-ink">
            {s.attendedCount}
          </span>
          <span className="text-[10px] font-medium text-ink/55">看过</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="font-mono text-xl font-black text-ink">
            {s.publicRepoCount}
          </span>
          <span className="text-[10px] font-medium text-ink/55">记录</span>
        </div>
      </div>

      <Separator className="mb-3" />

      {/* Vibe distribution */}
      {s.vibeDistribution && (
        <VibeDistributionSection stats={s} />
      )}
    </TornPaperCard>
  );
}

// ─── Memory Wall ──────────────────────────────────────────────

function MemoryWallSection({
  wall,
  activeHook,
  onSelectHook,
}: {
  wall: MemoryWallItem[];
  activeHook: string;
  onSelectHook: (hook: string) => void;
}) {
  return (
    <div className="px-4 mt-6">
      <SectionHeader title="记忆墙" subtitle="乐迷们都在聊什么" />

      <div className="flex gap-2 overflow-x-auto mt-3 pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <button
          type="button"
          className={cn(
            'flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all',
            !activeHook
              ? 'bg-ink text-bone shadow-sm'
              : 'bg-bone text-ink/60 border border-concrete/40 hover:text-ink',
          )}
          onClick={() => onSelectHook('')}
        >
          全部
        </button>
        {wall.map((w) => (
          <button
            key={w.memoryHook}
            type="button"
            className={cn(
              'flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all',
              activeHook === w.memoryHook
                ? 'bg-ink text-bone shadow-sm'
                : 'bg-bone text-ink/60 border border-concrete/40 hover:text-ink',
            )}
            onClick={() => onSelectHook(w.memoryHook)}
          >
            {w.memoryHook}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Action Row ───────────────────────────────────────────────

function ActionRow({
  showId,
  loadingInterest,
  onInterest,
}: {
  showId: string;
  loadingInterest: string | null;
  onInterest: (type: 'want' | 'attended') => void;
}) {
  return (
    <div className="px-4 mt-6 flex items-center gap-3">
      {/* "我也在场 · 写记录" — TornPaperShape fill 撕纸按钮 */}
      <Link to={`/record?showId=${showId}`} className="flex-1">
        <TornPaperShape fill className="bg-ink text-bone cursor-pointer hover:opacity-90 transition-opacity">
          <div className="flex items-center justify-center gap-2 px-5 py-3">
            <Eye className="w-4 h-4" />
            <span className="text-sm font-bold whitespace-nowrap">
              我也在场 · 写记录
            </span>
          </div>
        </TornPaperShape>
      </Link>

      {/* "想看" — TornPaperShape stroke 边框 */}
      <button
        type="button"
        className="flex-1"
        disabled={loadingInterest !== null}
        onClick={() => onInterest('want')}
      >
        <TornPaperShape stroke className="text-ink border-transparent cursor-pointer hover:opacity-80 transition-opacity">
          <div className="flex items-center justify-center gap-2 px-5 py-3">
            {loadingInterest === 'want' ? (
              <span className="text-sm font-bold">...</span>
            ) : (
              <>
                <Heart className="w-4 h-4" />
                <span className="text-sm font-bold whitespace-nowrap">想看</span>
              </>
            )}
          </div>
        </TornPaperShape>
      </button>
    </div>
  );
}

// ─── Repo List ────────────────────────────────────────────────

function RepoListSection({
  repos,
  sort,
  onSortChange,
  showId,
  user,
}: {
  repos: Repo[];
  sort: 'hot' | 'latest';
  onSortChange: (s: 'hot' | 'latest') => void;
  showId: string;
  user: any;
}) {
  return (
    <div className="px-4 mt-8 mb-24">
      <SectionHeader
        title="现场记录"
        subtitle="乐迷们的第一人称记忆"
        trailing={
          <div className="flex gap-1">
            {(['hot', 'latest'] as const).map((s) => (
              <button
                key={s}
                type="button"
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-bold transition-all',
                  sort === s
                    ? 'bg-ink text-bone shadow-sm'
                    : 'bg-bone text-ink/60 border border-concrete/40 hover:text-ink',
                )}
                onClick={() => onSortChange(s)}
              >
                {s === 'hot' ? '热门' : '最新'}
              </button>
            ))}
          </div>
        }
      />

      {/* Empty state */}
      {repos.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-8 h-8 mx-auto mb-3 text-ink/30" />
          <p className="text-sm text-ink/55">暂无公开记录</p>
          {user && (
            <div className="mt-3">
              <Link
                to={`/record?showId=${showId}`}
                className="inline-flex items-center gap-1.5 text-sm font-bold text-ink/70 hover:text-ink transition-colors"
              >
                <PencilLine className="w-3.5 h-3.5" />
                写下你的现场记忆
              </Link>
            </div>
          )}
          {!user && (
            <div className="mt-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-ink/70 hover:text-ink transition-colors"
              >
                登录后查看更多
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {repos.map((r) => (
            <RepoCard key={r.id} repo={r} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Loading State ────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="relative min-h-dvh bg-concrete">
      <ConcreteBackground seed={0xC0FFEE} />
      <div className="relative z-10">
        {/* Hero skeleton */}
        <div className="aspect-[4/5] bg-concrete-dark/30">
          <div className="p-5 pt-16">
            <Skeleton className="w-3/4 h-8 mb-2" />
            <Skeleton className="w-1/2 h-4" />
          </div>
        </div>
        {/* Stats skeleton */}
        <div className="mx-4 mt-[-20px] relative z-20">
          <div className="bg-bone rounded-sm p-4 space-y-3">
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <Skeleton className="w-8 h-6" />
                  <Skeleton className="w-6 h-3" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────

export function ShowDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [show, setShow] = useState<Show | null>(null);
  const [wall, setWall] = useState<MemoryWallItem[]>([]);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [sort, setSort] = useState<'hot' | 'latest'>('hot');
  const [loadingInterest, setLoadingInterest] = useState<string | null>(null);
  const [coverError, setCoverError] = useState(false);
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

  const handleMemoryHookChange = useCallback(
    (h: string) => {
      if (h) {
        setSearchParams({ memoryHook: h });
      } else {
        setSearchParams({});
      }
    },
    [setSearchParams],
  );

  if (!show) {
    return <LoadingState />;
  }

  return (
    <div className="relative min-h-dvh bg-concrete text-ink">
      {/* Concrete background */}
      <ConcreteBackground seed={0xC0FFEE} />

      {/* Page content */}
      <div className="relative z-10">
        {/* Hero */}
        <HeroSection
          show={show}
          coverError={coverError}
          onCoverError={() => setCoverError(true)}
        />

        {/* Stats */}
        <StatsBlock show={show} />

        {/* Memory Wall */}
        <MemoryWallSection
          wall={wall}
          activeHook={hook}
          onSelectHook={handleMemoryHookChange}
        />

        {/* Action Buttons — only if logged in */}
        {user && (
          <ActionRow
            showId={show.id}
            loadingInterest={loadingInterest}
            onInterest={handleInterest}
          />
        )}

        {/* Repo List */}
        <RepoListSection
          repos={repos}
          sort={sort}
          onSortChange={setSort}
          showId={show.id}
          user={user}
        />
      </div>
    </div>
  );
}
