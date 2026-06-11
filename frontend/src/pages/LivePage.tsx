/**
 * Home — Main page (重构)
 * Layout: Figma 的搜索 + 推荐演出 + 集体记忆 结构
 * Visual: chopinshown 的 bone/ink 票根美学
 */
import { FormEvent, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { api } from '../api/client';
import type { Show } from '../api/types';
import { SectionHeader } from '@/components/ui/section-header';
import { TicketStubCard } from '@/components/ui/ticket-stub-card';
import { PaperTexture } from '@/components/ui/paper-grain';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function LivePage() {
  const [tab, setTab] = useState<'upcoming' | 'all' | 'hot'>('upcoming');
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const path =
      tab === 'upcoming' ? '/shows/upcoming' : tab === 'hot' ? '/shows/hot' : '/shows';
    api<{ items: Show[] }>(path, { auth: false })
      .then((res) => {
        if (!cancelled) setShows(res.items);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tab]);

  async function onSearch(e: FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    setSearching(true);
    try {
      const res = await api<{ shows: Show[] }>(
        `/search?q=${encodeURIComponent(q.trim())}&type=all`,
        { auth: false },
      );
      setShows(res.shows);
      setTab('all');
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="flex flex-col min-h-full overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-bone/90 backdrop-blur-md px-4 py-3 border-b border-concrete/50">
        <h1 className="font-serif text-2xl font-black text-ink tracking-tight">
          底噪
        </h1>
        <p className="text-xs text-concrete-dark mt-0.5">
          找演出 · 写记忆 · 撞见同类
        </p>
      </header>

      {/* Search */}
      <form
        onSubmit={onSearch}
        className="px-4 py-3 flex items-center gap-2"
      >
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-concrete-dark pointer-events-none"
            strokeWidth={2.5}
          />
          <Input
            placeholder="搜索乐队、场地…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-10 bg-white border-concrete/40 text-ink text-sm h-10 rounded-full focus-visible:ring-ink/20"
          />
        </div>
        <Button
          type="submit"
          variant="outline"
          size="sm"
          disabled={searching}
          className="rounded-full border-ink/30 text-ink hover:bg-ink hover:text-bone h-10 px-4"
        >
          {searching ? '搜索中…' : '搜索'}
        </Button>
      </form>

      {/* Filter tabs */}
      <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto hide-scrollbar">
        {(
          [
            { key: 'upcoming' as const, label: '即将' },
            { key: 'hot' as const, label: '热门' },
            { key: 'all' as const, label: '全部' },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-bold transition-all',
              tab === t.key
                ? 'bg-ink text-bone shadow-sm'
                : 'bg-white text-ink/60 border border-concrete/40 hover:text-ink hover:border-concrete-dark',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="px-4 py-3 space-y-2">
        <SectionHeader
          title={tab === 'upcoming' ? '推荐演出' : tab === 'hot' ? '热门演出' : '全部演出'}
        />

        {loading ? (
          <div className="space-y-4 pt-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[120px] w-full rounded-sm" />
            ))}
          </div>
        ) : shows.length === 0 ? (
          <div className="py-16 text-center">
            <div className="relative inline-block mb-4">
              <PaperTexture intensity={0.04} />
              <div className="relative z-10 w-16 h-16 mx-auto rounded-full bg-ink/5 flex items-center justify-center">
                <Search className="w-6 h-6 text-concrete" strokeWidth={1.5} />
              </div>
            </div>
            <p className="text-sm text-concrete-dark font-medium">暂无演出</p>
            <button
              type="button"
              onClick={() => setTab('all')}
              className="mt-3 text-xs text-ink/60 hover:text-ink underline underline-offset-4"
            >
              查看全部演出
            </button>
          </div>
        ) : (
          shows.map((s) => (
            <TicketStubCard
              key={s.id}
              show={{
                id: s.id,
                artist: s.artistName,
                title: s.description || s.venueName,
                venue: s.venueName,
                dateLine1: extractDate(s.showDate),
                dateLine2: extractDay(s.showDate),
                serialShort: s.id.slice(0, 8).toUpperCase(),
                attendPercent: s.stats?.attendedCount ? Math.min(99, Math.floor((s.stats.attendedCount / 100) * 100)) : 42,
                attendCount: s.stats?.attendedCount || 0,
                poster: s.coverUrl || undefined,
              }}
              linkTo={`/shows/${s.id}`}
              className="w-full my-1"
            />
          ))
        )}
      </div>

      {/* Empty bottom space for TabBar */}
      <div className="h-8" />
    </div>
  );
}

/** Extract a date string like "Jun 10" */
function extractDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    return `${months[d.getMonth()]} ${d.getDate()}`;
  } catch {
    return dateStr;
  }
}

function extractDay(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return days[d.getDay()];
  } catch {
    return '';
  }
}
