/**
 * Home — Chopin-style HomeView
 * Ported from chopin/bnoise iOS (HomeView.swift)
 *
 * Layout: SearchHeader → SectionHeader → TicketStack (overlapping, offset)
 */
import { FormEvent, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { api } from '../api/client';
import type { Show } from '../api/types';
import { SectionHeader } from '@/components/ui/section-header';
import { TicketStubCard } from '@/components/ui/ticket-stub-card';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

function extractDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const m = d.getMonth() + 1;
    const day = d.getDate();
    return `${m}月${day}日`;
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

/** Chopin ticket offset pattern: (-6, 12, -2, 8) */
function ticketOffsetX(idx: number): number {
  switch (idx % 4) {
    case 0: return -6;
    case 1: return 12;
    case 2: return -2;
    default: return 8;
  }
}

export function LivePage() {
  const [tab, setTab] = useState<'upcoming' | 'all' | 'hot'>('upcoming');
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const path = tab === 'upcoming' ? '/shows/upcoming' : tab === 'hot' ? '/shows/hot' : '/shows';
    api<{ items: Show[] }>(path, { auth: false })
      .then((res) => { if (!cancelled) setShows(res.items); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [tab]);

  async function onSearch(e: FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    setSearching(true);
    try {
      const res = await api<{ shows: Show[] }>(`/search?q=${encodeURIComponent(q.trim())}&type=all`, { auth: false });
      setShows(res.shows);
      setTab('all');
    } finally { setSearching(false); }
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-md px-4 py-4">
        <SectionHeader
          title="现场墙"
          subtitle="LIVE WALL · 此刻和不久之后"
          className="px-0"
        />
      </header>

      {/* Search */}
      <form onSubmit={onSearch} className="px-4 py-2 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40 pointer-events-none" strokeWidth={2.5} />
          <Input
            placeholder="搜索乐队、场地…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-10 bg-white/90 border-ink/20 text-ink text-sm h-10 rounded-full"
          />
        </div>
        <Button type="submit" variant="outline" size="sm" disabled={searching}
          className="rounded-full border-ink/30 text-ink hover:bg-ink hover:text-bone h-10 px-4">
          {searching ? '搜索中…' : '搜索'}
        </Button>
      </form>

      {/* Filter tabs */}
      <div className="px-4 py-2 flex items-center gap-2">
        {([{ key: 'upcoming' as const, label: '即将' }, { key: 'hot' as const, label: '热门' }, { key: 'all' as const, label: '全部' }] as const).map((t) => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-bold transition-all',
              tab === t.key
                ? 'bg-ink text-bone'
                : 'bg-white/80 text-ink/60 border border-ink/20 hover:text-ink',
            )}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Ticket Stack — chopin: VStack spacing:-32 + offset per item */}
      <div className="px-4 py-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-[120px] w-full rounded-sm" />)}
          </div>
        ) : shows.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-ink/55 font-medium">暂无演出</p>
          </div>
        ) : (
          <div className="relative">
            {shows.map((s, idx) => (
              <div
                key={s.id}
                className="relative"
                style={{
                  marginTop: idx === 0 ? 0 : -28,
                  marginLeft: ticketOffsetX(idx),
                  zIndex: idx,
                }}
              >
                <TicketStubCard
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
                  className="w-full"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
