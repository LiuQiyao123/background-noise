import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { LogOut, Music } from 'lucide-react';
import { api } from '../api/client';
import type { MatchCard, MatchList, Repo, UserStats } from '../api/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { TornPaperCard } from '@/components/ui/torn-paper';
import { PaperGrain } from '@/components/ui/paper-grain';
import { RepoCard } from '../components/RepoCard';
import { useAuth } from '../context/AuthContext';

export function ProfilePage() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [matches, setMatches] = useState<MatchCard[]>([]);
  const [activeTab, setActiveTab] = useState('repos');

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

  return (
    <div className="min-h-screen bg-bone">
      {/* ── Profile Header (dark gradient + paper grain) ── */}
      <header className="relative overflow-hidden bg-gradient-to-b from-[#2E2E33] to-[#0D0D12] px-4 pb-6 pt-10">
        <PaperGrain seed={0xFADE} intensity={0.12} className="opacity-60" />

        <div className="relative z-10">
          {/* Avatar + name row */}
          <div className="flex items-center gap-4 mb-2">
            {/* Avatar — circle, bg-bone, music icon fallback */}
            <div className="size-[70px] shrink-0 rounded-full bg-bone flex items-center justify-center overflow-hidden">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.nickname}
                  className="size-full rounded-full object-cover"
                />
              ) : (
                <Music className="size-7 text-ink/55" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-serif text-[24px] font-black text-bone leading-tight truncate">
                {user.nickname}
              </h1>
              <p className="font-mono text-[13px] text-bone/70 mt-0.5">
                {user.phone}
              </p>
              {/* Mini stats: 47场 · 23场地 */}
              {stats && (
                <p className="text-[11px] text-bone/55 mt-1 font-medium tracking-[0.5px]">
                  {stats.attendedShows}场 · {stats.uniqueVenues}场地
                </p>
              )}
            </div>
          </div>

          {/* Expression persona badge */}
          {user.expressionPersona && (
            <div className="mt-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-bone/15 px-2.5 py-1 text-[11px] font-semibold text-bone/85">
                {user.expressionPersona === '感性派' && '💫'}
                {user.expressionPersona === '比喻狂魔' && '🎭'}
                {user.expressionPersona === '行动派' && '🤘'}
                {user.expressionPersona === '自由人' && '🎸'}{' '}
                {user.expressionPersona}
              </span>
            </div>
          )}

          {/* Music tags (placeholder — wired from user tags when available) */}
          <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[11px] font-medium text-bone/45">后朋克</span>
            <span className="text-[11px] font-medium text-bone/30">·</span>
            <span className="text-[11px] font-medium text-bone/45">Math Rock</span>
            <span className="text-[11px] font-medium text-bone/30">·</span>
            <span className="text-[11px] font-medium text-bone/45">独立摇滚</span>
            <span className="text-[11px] font-medium text-bone/30">·</span>
            <span className="text-[11px] font-medium text-bone/45">Live House</span>
          </div>
        </div>
      </header>

      {/* ── Stats Row (TornPaperCard tiles) ── */}
      {stats && (
        <div className="relative z-20 -mt-5 px-4">
          <div className="grid grid-cols-3 gap-3">
            <TornPaperCard seed={0xCAFE} className="text-center">
              <div className="py-2">
                <div className="font-serif text-[26px] font-black leading-none text-ink">
                  {stats.attendedShows}
                </div>
                <div className="mt-1 text-[11px] font-semibold tracking-[1px] text-ink/55 uppercase">
                  看过
                </div>
              </div>
            </TornPaperCard>
            <TornPaperCard seed={0xBEEF} className="text-center">
              <div className="py-2">
                <div className="font-serif text-[26px] font-black leading-none text-ink">
                  {stats.uniqueVenues}
                </div>
                <div className="mt-1 text-[11px] font-semibold tracking-[1px] text-ink/55 uppercase">
                  场地
                </div>
              </div>
            </TornPaperCard>
            <TornPaperCard seed={0xDEAD} className="text-center">
              <div className="py-2">
                <div className="font-serif text-[26px] font-black leading-none text-ink">
                  {stats.repoCount}
                </div>
                <div className="mt-1 text-[11px] font-semibold tracking-[1px] text-ink/55 uppercase">
                  记录
                </div>
              </div>
            </TornPaperCard>
          </div>
        </div>
      )}

      {/* ── Tab Switcher + Content ── */}
      <div className="mt-6 px-4 pb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Tab bar: ink background, bone text, active state inverts */}
          <TabsList className="w-full rounded-lg bg-ink p-[3px]">
            <TabsTrigger
              value="repos"
              className="flex-1 rounded-md px-3 py-1.5 text-[13px] font-semibold text-bone/60 data-[state=active]:bg-bone data-[state=active]:text-ink"
            >
              我的记录
            </TabsTrigger>
            <TabsTrigger
              value="wants"
              className="flex-1 rounded-md px-3 py-1.5 text-[13px] font-semibold text-bone/60 data-[state=active]:bg-bone data-[state=active]:text-ink"
            >
              想看的演出
            </TabsTrigger>
            <TabsTrigger
              value="matches"
              className="flex-1 rounded-md px-3 py-1.5 text-[13px] font-semibold text-bone/60 data-[state=active]:bg-bone data-[state=active]:text-ink"
            >
              我的同好
              {matches.length > 0 && (
                <span className="ml-1.5 rounded-full bg-highlight px-[5px] py-[1px] text-[10px] font-bold text-ink">
                  {matches.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ── Tab: 我的记录 ── */}
          <TabsContent value="repos" className="mt-4">
            {repos.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm font-medium text-ink/45">
                  还没有记录{' '}
                  <Link to="/record" className="text-highlight underline underline-offset-2">
                    去写一场
                  </Link>
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {repos.map((r) => (
                  <RepoCard key={r.id} repo={r} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Tab: 想看的演出 ── */}
          <TabsContent value="wants" className="mt-4">
            <div className="py-12 text-center">
              <p className="text-sm font-medium text-ink/45">
                还没有想看的演出
              </p>
            </div>
          </TabsContent>

          {/* ── Tab: 我的同好 ── */}
          <TabsContent value="matches" className="mt-4">
            {matches.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm font-medium text-ink/45">
                  还没有同好，去发现页面撞一下？
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {matches.map((m) => {
                  // Derive a stable seed from the match id for each TornPaperCard
                  const seed = (
                    parseInt(m.id.slice(0, 8), 16) || 0xCAFE
                  );
                  return (
                    <TornPaperCard key={m.id} seed={seed} className="cursor-default">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          {/* Name + badge row */}
                          <div className="mb-0.5 flex items-center gap-2">
                            <span className="truncate text-sm font-semibold text-ink">
                              {m.otherUser.nickname}
                            </span>
                            {m.matchLevel === 3 && (
                              <span className="shrink-0 rounded bg-highlight/20 px-1.5 py-0.5 text-[10px] font-bold text-highlight">
                                {m.similarityScore}% 重合
                              </span>
                            )}
                            {m.matchLevel === 2 && (
                              <span className="shrink-0 rounded bg-[#C9783A]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#C9783A]">
                                同频
                              </span>
                            )}
                          </div>
                          {/* Show info */}
                          <p className="truncate text-[11px] text-ink/55">
                            {m.show.artistName} · {m.show.venueName}
                          </p>
                          {/* Memory hook */}
                          <p className="mt-1 truncate text-[10px] italic text-ink/45">
                            「{m.otherMemoryHook}」
                          </p>
                        </div>
                        {/* Match emoji */}
                        <span className="shrink-0 text-lg">
                          {m.status === 'CONNECTED'
                            ? '🤝'
                            : m.matchLevel >= 3
                              ? '🔥'
                              : m.matchLevel >= 2
                                ? '💕'
                                : '👥'}
                        </span>
                      </div>
                    </TornPaperCard>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* ── Logout button ── */}
        <div className="mt-8">
          <Button
            variant="outline"
            className="w-full border-ink/40 text-sm font-semibold text-ink/65 hover:border-ink/60 hover:text-ink"
            onClick={logout}
          >
            <LogOut className="mr-1.5 size-4" />
            退出登录
          </Button>
        </div>
      </div>
    </div>
  );
}
