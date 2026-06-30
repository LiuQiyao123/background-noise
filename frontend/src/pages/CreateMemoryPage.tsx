import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { api, uploadMedia } from '../api/client';
import type { Show } from '../api/types';
import { useAuth } from '../context/AuthContext';
import { saveDraft, loadDraft, clearDraft } from '../lib/draft';
import { Image, Video, Mic, ChevronLeft, ChevronRight, X, Camera } from 'lucide-react';

/* ────────────── types ────────────── */

interface SelectedMedia {
  url: string;        // local blob URL (immediate) or server URL (after upload)
  type: 'image' | 'video' | 'audio';
  name?: string;
  uploading?: boolean;
  uploadFailed?: boolean;
  file?: File;        // original file for upload
}

function createLocalUrl(file: File): string {
  try { return URL.createObjectURL(file); } catch { return ''; }
}

/* ────────────── step names ────────────── */

type Step = 'show-select' | 'media-pick' | 'express' | 'publish';

/* ────────────── MediaPreview (step 2 hero) ────────────── */

function MediaPreview({ items }: { items: SelectedMedia[] }) {
  if (items.length === 0) return null;
  const [focusIdx, setFocusIdx] = useState(0);

  const first = items[focusIdx];
  const rest = items.filter((_, i) => i !== focusIdx);

  return (
    <div className="mb-4">
      {/* Hero */}
      <div className="relative mb-2 overflow-hidden rounded-xl bg-bg-elevated">
        {first.type === 'video' ? (
          <div className="flex h-48 items-center justify-center bg-bg-elevated">
            <Video className="h-10 w-10 text-concrete-dark" />
          </div>
        ) : first.type === 'audio' ? (
          <div className="flex h-32 items-center justify-center bg-bg-elevated">
            <Mic className="h-10 w-10 text-concrete-dark" />
          </div>
        ) : (
          <img src={first.url} alt="" className="h-48 w-full object-cover" />
        )}
        {items.length > 1 && (
          <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setFocusIdx(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i === focusIdx ? 'w-5 bg-brand' : 'w-1.5 bg-white/50',
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {rest.length > 0 && (
        <div className="flex gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {rest.map((m, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setFocusIdx(items.indexOf(m))}
              className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-bg-elevated"
            >
              {m.type === 'image' ? (
                <img src={m.url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  {m.type === 'video' ? <Video className="h-5 w-5 text-concrete-dark" /> : <Mic className="h-5 w-5 text-concrete-dark" />}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ────────────── MediaPicker (step 1) ────────────── */

function MediaPicker({
  items, onChange, onNext,
}: {
  items: SelectedMedia[];
  onChange: (items: SelectedMedia[]) => void;
  onNext: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newItems: SelectedMedia[] = [];
    for (const file of Array.from(files)) {
      const localUrl = createLocalUrl(file);
      const type = file.type.startsWith('video') ? 'video' : 'image';
      const item: SelectedMedia = {
        url: localUrl,
        type,
        name: file.name,
        uploading: true,
        file,
      };
      newItems.push(item);
      uploadFileInBg(file, item, newItems, items, onChange);
    }
    onChange([...items, ...newItems]);
    e.target.value = '';
  };

  const uploadFileInBg = async (
    file: File,
    item: SelectedMedia,
    batch: SelectedMedia[],
    existing: SelectedMedia[],
    callback: (items: SelectedMedia[]) => void,
  ) => {
    try {
      const res = await uploadMedia(file);
      item.url = res.url;
      item.uploading = false;
      delete item.file;
      callback([...existing, ...batch]);
    } catch {
      item.uploadFailed = true;
      item.uploading = false;
      // Keep local URL so user can still see it
      callback([...existing, ...batch]);
    }
  };

  const handleAudio = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const localUrl = createLocalUrl(file);
    const item: SelectedMedia = { url: localUrl, type: 'audio', name: file.name, uploading: true, file };
    onChange([...items, item]);
    uploadFileInBg(file, item, [item], items, onChange);
    e.target.value = '';
  };

  const removeItem = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx));
  };

  const moveItem = (idx: number, dir: -1 | 1) => {
    const next = [...items];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  return (
    <div className="flex min-h-dvh flex-col bg-bone">
      <div className="flex-1 px-4 pt-6">
        <h2 className="mb-5 text-center font-serif text-lg font-black text-ink">添加现场素材</h2>

        {/* Selected items grid */}
        {items.length > 0 && (
          <div className="mb-4 grid grid-cols-3 gap-2">
            {items.map((m, i) => (
              <div key={`${m.url}-${i}`} className="group relative overflow-hidden rounded-xl bg-bg-elevated">
                {m.type === 'image' ? (
                  <img src={m.url} alt="" className="aspect-square w-full object-cover" />
                ) : m.type === 'video' ? (
                  <div className="flex aspect-square items-center justify-center bg-bg-elevated">
                    <Video className="h-8 w-8 text-concrete-dark" />
                  </div>
                ) : (
                  <div className="flex aspect-square items-center justify-center bg-bg-elevated">
                    <Mic className="h-8 w-8 text-concrete-dark" />
                  </div>
                )}

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink/60 text-bone opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>

                {/* Type badge */}
                <span className="absolute bottom-1 left-1 rounded bg-ink/50 px-1.5 py-0.5 text-[10px] text-bone">
                  {m.type === 'image' ? '📷' : m.type === 'video' ? '🎬' : '🎙'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="mb-4 flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFilePick}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFilePick}
            className="hidden"
          />
          <input
            ref={audioInputRef}
            type="file"
            accept="audio/*"
            onChange={handleAudio}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 rounded-xl border border-concrete/40 bg-white py-3 text-sm font-medium text-ink transition-all hover:border-concrete-dark"
          >
            <Image className="h-4 w-4" />
            选择照片/视频
          </button>
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex items-center justify-center gap-2 rounded-xl border border-concrete/40 bg-white py-3 text-sm font-medium text-ink transition-all hover:border-concrete-dark"
          >
            <Camera className="h-4 w-4" />
            拍照
          </button>
          <button
            type="button"
            onClick={() => audioInputRef.current?.click()}
            className="flex items-center justify-center gap-2 rounded-xl border border-concrete/40 bg-white py-3 text-sm font-medium text-ink transition-all hover:border-concrete-dark"
          >
            <Mic className="h-4 w-4" />
            录音
          </button>
        </div>
      </div>

      {/* Bottom: selected strip + next */}
      {items.length > 0 && (
        <div className="border-t border-concrete/30 bg-bone px-4 py-3">
          <div className="mb-2 flex gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {items.map((m, i) => (
              <div key={i} className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-bg-elevated">
                {m.type === 'image' ? (
                  <img src={m.url} alt="" className="h-full w-full rounded-lg object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-lg">
                    {m.type === 'video' ? <Video className="h-5 w-5 text-concrete-dark" /> : <Mic className="h-5 w-5 text-concrete-dark" />}
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); moveItem(i, -1); }}
                    disabled={i === 0}
                    className="text-bone disabled:opacity-30"
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); moveItem(i, 1); }}
                    disabled={i === items.length - 1}
                    className="text-bone disabled:opacity-30"
                  >
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={onNext}
            className="w-full rounded-xl bg-ink py-2.5 text-sm font-bold text-bone transition-all active:scale-95"
          >
            下一步({items.length})
          </button>
        </div>
      )}

      {/* Skip link */}
      <div className="border-t border-concrete/30 px-4 py-3">
        <button
          type="button"
          onClick={onNext}
          className="w-full text-center text-xs text-concrete-dark hover:text-ink"
        >
          不传媒体，直接写
        </button>
      </div>
    </div>
  );
}

/* ────────────── ExpressionInput (step 2) ────────────── */

function ExpressionInput({
  media, text, onChange, onNext, onBack,
}: {
  media: SelectedMedia[];
  text: string;
  onChange: (text: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [recording] = useState(false);

  const handleAudioRecord = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadMedia(file);
      onChange(text + ` [🎙语音:${res.url}]`);
    } catch {
      // silently skip
    }
    e.target.value = '';
  };

  return (
    <div className="flex min-h-dvh flex-col bg-bone px-4 pt-6">
      <button
        type="button"
        onClick={onBack}
        className="mb-3 inline-flex items-center text-xs font-medium text-ink/60 hover:text-ink"
      >
        ← 返回
      </button>

      {/* Media hero preview */}
      {media.length > 0 && <MediaPreview items={media} />}

      {/* Textarea */}
      <textarea
        className="min-h-[160px] w-full resize-none rounded-xl border border-concrete/40 bg-white px-4 py-3 text-sm leading-relaxed text-ink outline-none placeholder:text-concrete-dark/50 focus:border-concrete-dark"
        value={text}
        onChange={(e) => onChange(e.target.value)}
        placeholder="说说当时的感觉…"
        autoFocus
      />

      {/* Voice recording */}
      <input
        ref={audioInputRef}
        type="file"
        accept="audio/*"
        onChange={handleAudioRecord}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => audioInputRef.current?.click()}
        className={cn(
          'mt-3 flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition-all',
          recording
            ? 'border-danger bg-danger/10 text-danger'
            : 'border-concrete/40 bg-white text-ink/60 hover:border-concrete-dark',
        )}
      >
        <Mic className={cn('h-4 w-4', recording && 'animate-pulse')} />
        {recording ? '录音中..点击停止' : '录音'}
      </button>

      <div className="mt-auto pb-6">
        <button
          type="button"
          onClick={onNext}
          disabled={!text.trim() && media.length === 0}
          className="w-full rounded-xl bg-ink py-3 text-sm font-bold text-bone transition-all active:scale-95 disabled:opacity-50"
        >
          预览并发布?        </button>
      </div>
    </div>
  );
}

/* ────────────── PublishStep (step 3) ────────────── */

function PublishStep({
  showName, media, text, onBack, onPublish, publishing,
}: {
  showName: string;
  media: SelectedMedia[];
  text: string;
  onBack: () => void;
  onPublish: (visibility: 'PRIVATE' | 'PUBLIC') => void;
  publishing: boolean;
}) {
  const [postToWall, setPostToWall] = useState(() => {
    try {
      return localStorage.getItem('bn_memory_wall_default') !== 'false';
    } catch {
      return true;
    }
  });

  const handleToggle = (val: boolean) => {
    setPostToWall(val);
    try {
      localStorage.setItem('bn_memory_wall_default', String(val));
    } catch { /* silent */ }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-bone px-4 pt-6">
      <button
        type="button"
        onClick={onBack}
        className="mb-3 inline-flex items-center text-xs font-medium text-ink/60 hover:text-ink"
      >
        ← 返回
      </button>

      <h2 className="mb-2 font-serif text-lg font-black text-ink">确认发布</h2>
      <p className="mb-6 text-xs text-concrete-dark">关联演出：{showName}</p>

      {/* Summary card */}
      <div className="mb-6 rounded-xl bg-card px-4 py-3 ring-1 ring-ink/5">
        <div className="mb-2 flex gap-2 text-xs text-concrete-dark">
          <span>{media.length} 个媒体文件</span>
          {text && <span className="truncate">· {text.slice(0, 40)}{text.length > 40 ? '…' : ''}</span>}
        </div>

        {/* Media thumbnails */}
        {media.length > 0 && (
          <div className="mb-2 flex gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {media.map((m, i) => (
              <div key={i} className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-bg-elevated">
                {m.type === 'image' ? (
                  <img src={m.url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    {m.type === 'video' ? <Video className="h-4 w-4 text-concrete-dark" /> : <Mic className="h-4 w-4 text-concrete-dark" />}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Text preview */}
        {text && (
          <div className="rounded-lg bg-bg-elevated px-3 py-2">
            <p className="text-sm leading-relaxed text-ink/85">{text}</p>
          </div>
        )}
      </div>

      {/* Toggle: post to wall */}
      <div className="mb-6 flex items-center justify-between rounded-xl bg-bg-elevated px-4 py-3">
        <div>
          <p className="text-sm font-medium text-ink">也发到记忆墙</p>
          <p className="text-[11px] text-concrete-dark">公开到演出条目的记忆墙，其他乐迷可见</p>
        </div>
        <button
          type="button"
          onClick={() => handleToggle(!postToWall)}
          className={cn(
            'relative h-6 w-11 rounded-full transition-colors',
            postToWall ? 'bg-brand' : 'bg-concrete/40',
          )}
        >
          <span
            className={cn(
              'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
              postToWall && 'translate-x-5',
            )}
          />
        </button>
      </div>

      {/* Publish buttons */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          disabled={publishing}
          onClick={() => onPublish(postToWall ? 'PUBLIC' : 'PRIVATE')}
          className="w-full rounded-xl bg-ink py-3 text-sm font-bold text-bone transition-all active:scale-95 disabled:opacity-50"
        >
          {publishing ? '发布中?..' : '发布记忆'}
        </button>
      </div>
    </div>
  );
}

/* ────────────── ShowSelector (step 0) ────────────── */

function ShowSelector({ onSelect }: { onSelect: (id: string) => void }) {
  const [shows, setShows] = useState<Show[]>([]);
  const [query, setQuery] = useState('');
  const [loadingShows, setLoadingShows] = useState(true);

  useEffect(() => {
    api<{ items: Show[] }>('/shows', { auth: false })
      .then((r) => setShows(r.items))
      .catch(() => {})
      .finally(() => setLoadingShows(false));
  }, []);

  const filtered = query
    ? shows.filter(
        (s) =>
          s.artistName.toLowerCase().includes(query.toLowerCase()) ||
          s.venueName.toLowerCase().includes(query.toLowerCase()) ||
          s.city?.toLowerCase().includes(query.toLowerCase()),
      )
    : shows;

  return (
    <div className="flex min-h-dvh flex-col bg-bone px-4 pt-6">
      <h2 className="mb-1 font-serif text-lg font-black text-ink">选择演出</h2>
      <p className="mb-4 text-xs text-concrete-dark">先选一场演出，再写下你的记忆</p>

      {/* Search */}
      <div className="relative mb-4">
        <input
          className="h-10 w-full rounded-full border border-concrete/40 bg-white pl-10 pr-4 text-sm text-ink outline-none placeholder:text-concrete-dark/50 focus:border-concrete-dark"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索艺人、场地、城市?.."
          autoFocus
        />
        <svg
          className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-concrete-dark"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
      </div>

      {/* Show list */}
      {loadingShows ? (
        <p className="py-8 text-center text-xs text-concrete-dark">加载演出...</p>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8">
          <p className="text-sm text-concrete-dark">{query ? '没有找到匹配的演出' : '暂无演出数据'}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s.id)}
              className="flex flex-col gap-0.5 rounded-xl bg-card px-4 py-3 text-left ring-1 ring-ink/5 transition-all hover:ring-ink/20 active:scale-[0.98]"
            >
              <span className="text-sm font-semibold text-ink">{s.artistName}</span>
              <span className="text-xs text-concrete-dark">
                {new Date(s.showDate).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric' })}
                · {s.venueName}
                {s.city ? ` · ${s.city}` : ''}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ────────────── Main Page ────────────── */

export function CreateMemoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const preShowId = params.get('showId') ?? '';

  const [showId, setShowId] = useState(preShowId);
  const [shows, setShows] = useState<Show[]>([]);
  const [mediaItems, setMediaItems] = useState<SelectedMedia[]>([]);
  const [text, setText] = useState('');
  const [step, setStep] = useState<Step>(preShowId ? 'media-pick' : 'show-select');
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);
  const hasUnsaved = useRef(false);

  // Load shows for name lookup
  useEffect(() => {
    api<{ items: Show[] }>('/shows', { auth: false })
      .then((r) => setShows(r.items))
      .catch(() => {});
  }, []);

  // Check for draft on mount
  useEffect(() => {
    if (!preShowId) return;
    const draft = loadDraft(preShowId);
    if (draft && (draft.media.length > 0 || draft.text)) {
      setShowRestorePrompt(true);
    }
  }, [preShowId]);

  const restoreDraft = () => {
    if (!preShowId) return;
    const draft = loadDraft(preShowId);
    if (!draft) return;
    setMediaItems(draft.media as SelectedMedia[]);
    setText(draft.text);
    setShowRestorePrompt(false);
  };

  const dismissDraft = () => {
    clearDraft(preShowId);
    setShowRestorePrompt(false);
  };

  // Auto-save on state changes
  useEffect(() => {
    if (!showId) return;
    const hasContent = mediaItems.length > 0 || text.trim().length > 0;
    if (hasContent) {
      saveDraft(showId, { media: mediaItems, text });
      hasUnsaved.current = true;
    }
  }, [showId, mediaItems, text]);

  // Prompt on back navigation
  useEffect(() => {
    const handler = () => {
      if (hasUnsaved.current && showId) {
        saveDraft(showId, { media: mediaItems, text });
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [showId, mediaItems, text]);

  const showName = shows.find((s) => s.id === showId);
  const showLabel = showName
    ? `${showName.artistName} @ ${showName.venueName}`
    : '';

  const handleShowSelect = (id: string) => {
    setShowId(id);
    const draft = loadDraft(id);
    if (draft && (draft.media.length > 0 || draft.text)) {
      setMediaItems(draft.media as SelectedMedia[]);
      setText(draft.text);
    }
    setStep('media-pick');
    navigate(`/record?showId=${id}`, { replace: true });
  };

  const handlePublish = async (visibility: 'PRIVATE' | 'PUBLIC') => {
    if (!showId || !user) return;
    setPublishing(true);
    setError('');
    try {
      await api('/memories', {
        method: 'POST',
        body: JSON.stringify({
          showId,
          text: text.trim() || undefined,
          media: mediaItems.map((m) => ({ url: m.url, type: m.type })),
          visibility,
        }),
      });
      clearDraft(showId);
      navigate(`/shows/${showId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '发布失败');
    } finally {
      setPublishing(false);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-bone px-6">
        <div className="mb-4 h-16 w-16 rounded-full bg-concrete/20 flex items-center justify-center">
          <svg className="h-8 w-8 text-concrete-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
        <p className="mb-4 text-sm text-concrete-dark">登录后即可写记忆</p>
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="rounded-xl bg-ink px-8 py-2.5 text-sm font-bold text-bone transition-all active:scale-95"
        >
          登录 / 注册
        </button>
      </div>
    );
  }

  // Draft restore prompt overlay
  if (showRestorePrompt) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-bone px-6">
        <div className="mb-6 text-center">
          <div className="mb-3 text-4xl">📝</div>
          <p className="mb-1 text-sm font-semibold text-ink">发现未完成的记忆草稿</p>
          <p className="text-xs text-concrete-dark">是否继续上次的创作？</p>
        </div>
        <div className="flex flex-col gap-2 w-full max-w-[240px]">
          <button
            type="button"
            onClick={restoreDraft}
            className="w-full rounded-xl bg-ink py-2.5 text-sm font-bold text-bone transition-all active:scale-95"
          >
            恢复草稿
          </button>
          <button
            type="button"
            onClick={dismissDraft}
            className="w-full rounded-xl border border-concrete/40 bg-white py-2.5 text-sm font-medium text-ink/60 transition-all"
          >
            重新开始?          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="fixed inset-x-0 top-0 z-50 bg-danger/10 px-4 py-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-danger">{error}</span>
            <button type="button" onClick={() => setError('')}>
              <X className="h-4 w-4 text-danger" />
            </button>
          </div>
        </div>
      )}

      {(step === 'express' || step === 'publish') && (
        <div className="fixed inset-x-0 top-0 z-40 bg-bone px-4 py-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-concrete-dark">{showLabel}</span>
            <span className="text-[10px] font-medium text-concrete-dark">
              {step === 'express' ? '表达' : '发布'}
            </span>
          </div>
        </div>
      )}

      {step === 'show-select' && (
        <ShowSelector onSelect={handleShowSelect} />
      )}

      {step === 'media-pick' && (
        <MediaPicker
          items={mediaItems}
          onChange={setMediaItems}
          onNext={() => setStep('express')}
        />
      )}

      {step === 'express' && (
        <ExpressionInput
          media={mediaItems}
          text={text}
          onChange={setText}
          onNext={() => setStep('publish')}
          onBack={() => setStep('media-pick')}
        />
      )}

      {step === 'publish' && (
        <PublishStep
          showName={showLabel}
          media={mediaItems}
          text={text}
          onBack={() => setStep('express')}
          onPublish={handlePublish}
          publishing={publishing}
        />
      )}
    </div>
  );
}
