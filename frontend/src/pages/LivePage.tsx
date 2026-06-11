import { FormEvent, useEffect, useState } from 'react';
import { api } from '../api/client';
import type { Show } from '../api/types';
import { ShowCard } from '../components/ShowCard';

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
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">{'\u73b0\u573a'}</h1>
        <p className="page-sub">{'\u627e\u6f14\u51fa\uff0c\u770b\u8bb0\u5fc6'}</p>
      </header>

      <form className="search-bar" onSubmit={onSearch}>
        <input
          className="input"
          placeholder={'\u641c\u7d22\u4e50\u961f\u3001\u573a\u5730\u2026'}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button type="submit" className="btn btn-ghost btn-sm" disabled={searching}>
          {'\u641c'}
        </button>
      </form>

      <div className="segment">
        <button type="button" className={tab === 'upcoming' ? 'active' : ''} onClick={() => setTab('upcoming')}>
          {'\u5373\u5c06'}
        </button>
        <button type="button" className={tab === 'hot' ? 'active' : ''} onClick={() => setTab('hot')}>
          {'\u70ed\u95e8'}
        </button>
        <button type="button" className={tab === 'all' ? 'active' : ''} onClick={() => setTab('all')}>
          {'\u5168\u90e8'}
        </button>
      </div>

      {loading ? (
        <p className="empty">{'\u52a0\u8f7d\u4e2d...'}</p>
      ) : shows.length === 0 ? (
        <div className="empty">
          <p>{'\u6682\u65e0\u6f14\u51fa'}</p>
          <div className="empty-cta">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setTab('all')}
            >
              {'\u67e5\u770b\u5168\u90e8\u6f14\u51fa'}
            </button>
          </div>
        </div>
      ) : (
        shows.map((s) => <ShowCard key={s.id} show={s} />)
      )}
    </div>
  );
}
