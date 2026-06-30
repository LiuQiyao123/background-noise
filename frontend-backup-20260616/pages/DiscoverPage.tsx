import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { DiscoverFeed, BlindBox, Show } from '../api/types';
import { RepoCard } from '../components/RepoCard';
import { useAuth } from '../context/AuthContext';
import { cn } from '@/lib/utils';
import { TornPaperCard } from '@/components/ui/torn-paper';
import { PaperGrain } from '@/components/ui/paper-grain';
import { TicketStubCard } from '@/components/ui/ticket-stub-card';
import { SectionHeader } from '@/components/ui/section-header';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

/* ─── Helpers ─── */
function formatDate(iso: string) {
  const d = new Date(iso);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${m}月${day}日`;
}

function showToTicketData(show: Show) {
  return {
    id: show.id,
    artist: show.artistName,
    title: show.artistName,
    venue: show.venueName,
    dateLine1: formatDate(show.showDate),
    dateLine2: show.city || undefined,
    serialShort: show.id.substring(0, 4).toUpperCase(),
    attendPercent: show.stats?.attendedCount
      ? Math.min(100, Math.round((show.stats.attendedCount / Math.max(1, show.stats.attendedCount + show.stats.publicRepoCount)) * 100))
      : 0,
    attendCount: show.stats?.attendedCount || 0,
    poster: show.coverUrl || undefined,
    tilt: undefined,
  };
}

/* ─── Blind Box Card — chopin style ─── */
function BlindBoxCard({
  box,
  onReveal,
  onDismiss,
}: {
  box: BlindBox;
  onReveal: () => void;
  onDismiss: () => void;
}) {
  return (
    <TornPaperCard dark className="mb-4" jagAmplitude={4} jagFrequency={22}>
      {/* Paper grain overlay */}
      <PaperGrain intensity={0.1} />
      <div className="relative z-10">
        {/* Guitar emoji top-right */}
        <div className="absolute top-0 right-0 text-lg opacity-30 select-none pointer-events-none">
          🎸
        </div>

        <div className="text-xs font-semibold tracking-wider text-danger mb-3">
          同场盲盒
        </div>

        <p className="text-sm font-medium leading-relaxed italic text-bone mb-2">
          「{box.memoryHook}」
        </p>

        <p className="text-xs text-bone/65 mb-4">
          —— 来自 {box.show.artistName} 的某位在场者
        </p>

        <div className="flex gap-2">
          <Button size="sm" className="flex-1 bg-bone text-ink hover:bg-boneDark font-bold" onClick={onReveal}>
            我也这么觉得 🤘
          </Button>
          <Button size="sm" variant="ghost" className="text-bone/70 hover:text-bone" onClick={onDismiss}>
            滑走
          </Button>
        </div>
      </div>
    </TornPaperCard>
  );
}

/* ─── Match Section ─── */
function MatchSection({ matches }: { matches: any[] }) {
  if (!matches || matches.length === 0) return null;

  return (
    <div className="mb-6">
      <SectionHeader
        title="与你共鸣"
        subtitle="MATCHES · 撞见同类"
        className="mb-3 px-0"
      />
      <div className="flex flex-col gap-2">
        {matches.map((m: any) => (
          <TornPaperCard key={m.id} className="cursor-pointer" jagAmplitude={3} jagFrequency={22}>
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                  {m.otherUser?.nickname || '未知'}
                  {m.matchLevel >= 3 && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-auto leading-normal bg-danger/10 text-danger border-danger/30 font-mono">
                      {m.similarityScore}% 重合
                    </Badge>
                  )}
                </div>
                <div className="mt-0.5 text-xs text-ink/55 truncate">
                  {m.show?.artistName} · {m.show?.venueName}
                </div>
              </div>
              <span
                className={cn(
                  'text-base flex-shrink-0',
                  m.matchLevel >= 3
                    ? 'text-danger'
                    : m.matchLevel >= 2
                      ? 'text-highlight'
                      : 'text-ink/55',
                )}
              >
                {m.matchLevel >= 3 ? '🔥' : m.matchLevel >= 2 ? '💡' : '👋'}
              </span>
            </div>
          </TornPaperCard>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export function DiscoverPage() {
  const { user } = useAuth();
  const [feed, setFeed] = useState<DiscoverFeed | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<DiscoverFeed>('/discover', { auth: !!user })
      .then(setFeed)
      .finally(() => setLoading(false));
  }, [user]);

  const handleReveal = async (matchId: string) => {
    await api(`/match/${matchId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'CONNECTED' }),
    });
    api<DiscoverFeed>('/discover', { auth: !!user }).then(setFeed);
  };

  const handleDismiss = async (matchId: string) => {
    await api(`/match/${matchId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'DISMISSED' }),
    });
    api<DiscoverFeed>('/discover', { auth: !!user }).then(setFeed);
  };

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div className="px-4 py-6 min-h-screen">
        <div className="mb-6">
          <Skeleton className="h-8 w-32 mb-1" />
          <Skeleton className="h-4 w-44" />
        </div>
        <Skeleton className="h-40 w-full mb-4 rounded-lg" />
        <Skeleton className="h-20 w-full mb-3 rounded-lg" />
        <Skeleton className="h-20 w-full mb-3 rounded-lg" />
      </div>
    );
  }

  if (!feed) {
    return (
      <div className="px-4 py-6 min-h-screen">
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-sm text-ink/55">加载失败</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 min-h-screen">
      {/* Page Header */}
      <SectionHeader
        title="发现同好"
        subtitle="DISCOVER · 撞见同类"
        className="mb-5 px-0"
      />

      {/* Blind Box */}
      {feed.blindBox && (
        <BlindBoxCard
          box={feed.blindBox}
          onReveal={() => handleReveal(feed.blindBox!.id)}
          onDismiss={() => handleDismiss(feed.blindBox!.id)}
        />
      )}

      {/* Matches */}
      <MatchSection matches={feed.matches || []} />

      {/* Upcoming Shows */}
      <SectionHeader
        title="即将上演"
        subtitle="UPCOMING · 下一场去哪儿"
        className="mb-3 px-0"
      />
      {feed.upcoming.length === 0 ? (
        <p className="text-sm text-ink/55 text-center py-4">暂无</p>
      ) : (
        <div className="flex flex-col gap-3 mb-6">
          {feed.upcoming.slice(0, 3).map((s) => (
            <TicketStubCard
              key={s.id}
              show={showToTicketData(s)}
              linkTo={`/shows/${s.id}`}
            />
          ))}
        </div>
      )}

      {/* Hot Shows */}
      <SectionHeader
        title="热门现场"
        subtitle="HOT · 大家都在看"
        className="mb-3 px-0"
      />
      {feed.hotShows.length === 0 ? (
        <p className="text-sm text-ink/55 text-center py-4">暂无</p>
      ) : (
        <div className="flex flex-col gap-3 mb-6">
          {feed.hotShows.slice(0, 3).map((s) => (
            <TicketStubCard
              key={s.id}
              show={showToTicketData(s)}
              linkTo={`/shows/${s.id}`}
            />
          ))}
        </div>
      )}

      {/* Recent Repos */}
      <SectionHeader
        title="最新共鸣"
        subtitle="RECENT · 来自同温层的回响"
        className="mb-3 px-0"
      />
      {feed.recentRepos.length === 0 ? (
        <p className="text-sm text-ink/55 text-center py-4">暂无公开记录</p>
      ) : (
        <div className="flex flex-col gap-2">
          {feed.recentRepos.map((r) => <RepoCard key={r.id} repo={r} compact />)}
        </div>
      )}
    </div>
  );
}
