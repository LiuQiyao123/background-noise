import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { api, uploadMedia } from '../api/client';
import type { AiExpandResult, AiTagResult, Show } from '../api/types';
import { useAuth } from '../context/AuthContext';
import { cn } from '@/lib/utils';
import { TornPaperCard } from '@/components/ui/torn-paper';
import { SectionHeader } from '@/components/ui/section-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';


/* ─── 记忆模板 ─── */
const MEMORY_TEMPLATES = {
  A: { label: '那一刻', skeleton: '____的那一刻，我____', persona: '感性派' },
  B: { label: '比喻', skeleton: '这场演出像____', persona: '比喻狂魔' },
  C: { label: '动作定义', skeleton: '我在这场演出____', persona: '行动派' },
  D: { label: '自由', skeleton: null, persona: '自由人' },
} as const;
type TemplateKey = keyof typeof MEMORY_TEMPLATES;

/* ─── 评分锚定词 ─── */
const VIBE_ADJECTIVES = {
  band: ['车祸现场', '不在状态', '中规中矩', '全程高能', '封神之夜'],
  sound: ['一团浆糊', '听了个寂寞', '及格水平', '身临其境', '耳朵怀孕'],
  atmosphere: ['全员养神', '稀稀拉拉', '礼貌性躁动', '真的燥起来了', '掀翻屋顶'],
};

/* ─── 照片标签 ─── */
const PHOTO_TAG_GROUPS = [
  {
    category: '台上',
    tags: [
      { key: 'guitar-solo', label: '吉他手 solo' },
      { key: 'vocal-scream', label: '主唱嘶吼' },
      { key: 'drum-explosion', label: '鼓手爆裂' },
      { key: 'bass-groove', label: '贝斯律动' },
      { key: 'light-show', label: '灯光炸场' },
    ],
  },
  {
    category: '台下',
    tags: [
      { key: 'pogo', label: '我在 pogo' },
      { key: 'stage-dive', label: '跳水瞬间' },
      { key: 'circle-pit', label: '开火车经过' },
      { key: 'metal-horn', label: '金属礼' },
      { key: 'crowd-surfing', label: 'crowd surfing' },
      { key: 'chorus', label: '合唱瞬间' },
    ],
  },
  {
    category: '环境',
    tags: [
      { key: 'venue-panorama', label: '场地全景' },
      { key: 'soundboard-view', label: '调音台视角' },
      { key: 'queuing', label: '门口排队' },
      { key: 'after-party', label: '散场后' },
      { key: 'merch', label: '周边摊位' },
      { key: 'ticket', label: '门票特写' },
    ],
  },
];

/* ─── 媒体预览组件（含标签） ─── */
function MediaImg({
  url,
  tags,
  onTagsChange,
}: {
  url: string;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
}) {
  const [error, setError] = useState(false);
  const [showTags, setShowTags] = useState(false);

  if (error) {
    return (
      <div className="w-[72px] h-[72px] rounded-lg bg-white/60 flex items-center justify-center text-2xl text-ink/30 select-none">
        ✖
      </div>
    );
  }

  const toggleTag = (key: string) => {
    if (tags.includes(key)) {
      onTagsChange(tags.filter((t) => t !== key));
    } else {
      onTagsChange([...tags, key]);
    }
  };

  return (
    <div className="relative inline-block">
      <img
        src={url}
        alt=""
        onError={() => setError(true)}
        onClick={() => setShowTags(!showTags)}
        className="cursor-pointer rounded-lg max-h-[72px]"
      />

      {tags.length > 0 && (
        <div className="absolute bottom-0.5 right-0.5 bg-primary text-white text-[10px] rounded px-1 py-px leading-tight select-none">
          +{tags.length}
        </div>
      )}

      {showTags && (
        <div className="absolute top-full left-0 z-10 mt-1 bg-white border border-concrete/40 rounded-lg p-2.5 min-w-[200px] shadow-md">
          {PHOTO_TAG_GROUPS.map((group) => (
            <div key={group.category} className="mb-2 last:mb-0">
              <div className="text-[10px] text-ink/55 mb-1 font-medium">
                {group.category}
              </div>
              <div className="flex flex-wrap gap-1">
                {group.tags.map((tag) => (
                  <button
                    key={tag.key}
                    type="button"
                    onClick={() => toggleTag(tag.key)}
                    className={cn(
                      'text-[11px] px-2 py-0.5 rounded-full border transition-colors',
                      tags.includes(tag.key)
                        ? 'bg-ink text-bone border-ink font-semibold'
                        : 'bg-white text-ink/55 border-concrete/40 hover:text-ink hover:border-concrete-dark',
                    )}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── AI 扩写卡片 ─── */
function AiExpandCard({
  style,
  preview,
  selected,
  onSelect,
}: {
  style: string;
  preview: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full text-left p-3 rounded-lg border transition-colors cursor-pointer',
        selected
          ? 'bg-danger/10 border-danger'
          : 'bg-white/60 border-concrete/40 hover:border-concrete-dark',
      )}
    >
      <div className="text-xs font-semibold text-danger mb-1.5">
        {style}
      </div>
      <p className="text-sm text-ink/65 leading-relaxed">
        {preview}
      </p>
    </button>
  );
}

/* ─── 主页面 ─── */
export function RecordPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const preShowId = params.get('showId') ?? '';

  const [shows, setShows] = useState<Show[]>([]);
  const [showId, setShowId] = useState(preShowId);
  const [body, setBody] = useState('');
  const [memoryTemplate, setMemoryTemplate] = useState<TemplateKey>('D');
  const [memoryHook, setMemoryHook] = useState('');
  const [hookFill, setHookFill] = useState<Record<string, string>>({});
  const [vibeBand, setVibeBand] = useState(4);
  const [vibeSound, setVibeSound] = useState(4);
  const [vibeAtmosphere, setVibeAtmosphere] = useState(4);
  const [visibility, setVisibility] = useState<'PRIVATE' | 'PUBLIC'>('PRIVATE');
  const [mediaItems, setMediaItems] = useState<{ url: string; tags: string[] }[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // AI expand
  const [aiExpanding, setAiExpanding] = useState(false);
  const [aiResult, setAiResult] = useState<AiExpandResult | null>(null);
  const [selectedAiIdx, setSelectedAiIdx] = useState<number | null>(null);

  // AI tag suggest (free mode only)
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [aiSuggestedTags, setAiSuggestedTags] = useState<string[]>([]);

  const fillRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    api<{ items: Show[] }>('/shows', { auth: false }).then((r) => setShows(r.items));
  }, []);

  if (!user) return <Navigate to="/login" replace />;

  /* ─── 构建完整的 memoryHook 文本 ─── */
  const buildMemoryHook = useCallback((): string => {
    if (memoryTemplate === 'D') return memoryHook.trim();
    if (memoryTemplate === 'A') {
      const p1 = hookFill['A:1']?.trim() || '';
      const p2 = hookFill['A:2']?.trim() || '';
      if (!p1 && !p2) return '';
      return `${p1}的那一刻，我${p2}`;
    }
    if (memoryTemplate === 'B') {
      const fill = hookFill['B:1']?.trim() || '';
      if (!fill) return '';
      return `这场演出像${fill}`;
    }
    if (memoryTemplate === 'C') {
      const fill = hookFill['C:1']?.trim() || '';
      if (!fill) return '';
      return `我在这场演出${fill}`;
    }
    return memoryHook.trim();
  }, [memoryTemplate, memoryHook, hookFill]);

  const memoryHookChars = buildMemoryHook().length;
  const maxHookChars = 20;

  /* ─── 照片上传 ─── */
  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await uploadMedia(file);
    setMediaItems((prev) => [...prev, { url: res.url, tags: [] }]);
    e.target.value = '';
  }

  /* ─── AI 扩写 ─── */
  async function handleAiExpand() {
    const words = body.trim().split(/[\s,，。.、]+/).filter(Boolean);
    if (words.length < 3) {
      setError('至少输入 3 个词才能使用 AI 扩写');
      return;
    }
    setAiExpanding(true);
    setAiResult(null);
    setSelectedAiIdx(null);
    try {
      const res = await api<AiExpandResult>('/ai/expand', {
        method: 'POST',
        body: JSON.stringify({ keywords: words }),
      });
      setAiResult(res);
    } catch {
      setError('AI 扩写暂不可用');
    } finally {
      setAiExpanding(false);
    }
  }

  function applyAiVersion(idx: number) {
    if (!aiResult) return;
    setSelectedAiIdx(idx);
    setBody(aiResult.versions[idx].preview);
    setAiResult(null);
  }

  /* ─── AI 标签建议 ─── */
  async function handleAiSuggest() {
    if (!body.trim()) return;
    setAiSuggesting(true);
    try {
      const res = await api<AiTagResult>('/ai/suggest-tags', {
        method: 'POST',
        body: JSON.stringify({ body: body.trim() }),
      });
      setAiSuggestedTags(res.tags);
    } catch {
      // silent
    } finally {
      setAiSuggesting(false);
    }
  }

  function applyAiTag(tag: string) {
    setMemoryHook((prev) => {
      const existing = prev ? prev + '、' : '';
      return existing + tag;
    });
    setAiSuggestedTags((prev) => prev.filter((t) => t !== tag));
  }

  /* ─── 提交 ─── */
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!showId) {
      setError('请选择演出');
      return;
    }
    const finalHook = buildMemoryHook();
    if (!finalHook) {
      setError('请填写一句话记忆');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const repo = await api<{ id: string }>('/repos', {
        method: 'POST',
        body: JSON.stringify({
          showId,
          body: body || undefined,
          memoryHook: finalHook,
          memoryTemplate: memoryTemplate,
          vibeBand,
          vibeSound,
          vibeAtmosphere,
          visibility,
          media: mediaItems.map((m, i) => ({
            url: m.url,
            sortOrder: i,
            tags: m.tags,
          })),
        }),
      });
      navigate(`/repos/${repo.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '发布失败');
    } finally {
      setLoading(false);
    }
  }

  /* ─── Render ─── */
  return (
    <div className="px-4 py-6 bg-bone min-h-screen">
      {/* 页面标题 */}
      <SectionHeader
        title="写现场记录"
        subtitle="默认私密，可选公开到演出条目"
        className="mb-5 px-0"
      />

      {/* 错误提示 */}
      {error && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-danger/10 border border-danger/30 text-sm text-danger font-medium">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        {/* ─── 选择演出 ─── */}
        <section>
          <SectionHeader
            title="绑定演出"
            subtitle="SELECT SHOW · 写下这一夜"
            className="mb-3 px-0"
          />

          <TornPaperCard className="w-full">
            <select
              value={showId}
              onChange={(e) => setShowId(e.target.value)}
              required
              className={cn(
                'w-full h-10 rounded-lg bg-white border border-concrete/40',
                'px-3 text-sm text-ink outline-none',
                'focus:border-concrete-dark focus:ring-2 focus:ring-ink/20',
                'transition-colors appearance-none',
                !showId && 'text-ink/55',
              )}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23121212' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                backgroundSize: '14px',
              }}
            >
              <option value="" disabled>
                选择演出...
              </option>
              {shows.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.artistName} @ {s.venueName}
                </option>
              ))}
            </select>
          </TornPaperCard>
        </section>

        {/* ─── 照片 ─── */}
        <section>
          <SectionHeader
            title="现场照片"
            subtitle="PHOTOS · 定格那一帧"
            className="mb-3 px-0"
          />

          <TornPaperCard className="w-full">
            <div className="flex flex-col gap-3">
              <label className="cursor-pointer inline-block">
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg',
                    'text-xs font-semibold border border-concrete/40',
                    'bg-white text-ink/65 hover:text-ink hover:border-concrete-dark',
                    'transition-colors cursor-pointer',
                  )}
                >
                  📸 选择照片
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onFile}
                  className="hidden"
                />
              </label>

              {mediaItems.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {mediaItems.map((m, i) => (
                    <MediaImg
                      key={m.url}
                      url={m.url}
                      tags={m.tags}
                      onTagsChange={(newTags) => {
                        const next = [...mediaItems];
                        next[i] = { ...next[i], tags: newTags };
                        setMediaItems(next);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </TornPaperCard>
        </section>

        {/* ─── 文字记录 ─── */}
        <section>
          <SectionHeader
            title="文字记录"
            subtitle="WORDS · 以笔为马"
            className="mb-3 px-0"
          />

          <TornPaperCard className="w-full">
            <div className="flex flex-col gap-3">
              <Textarea
                value={body}
                onChange={(e) => {
                  setBody(e.target.value);
                  setAiSuggestedTags([]);
                }}
                placeholder="写点什么…"
                className="bg-white border-concrete/40 min-h-[100px]"
              />

              {/* AI 扩写按钮 */}
              {body.trim().length > 0 && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={aiExpanding}
                    onClick={handleAiExpand}
                    className="w-full"
                  >
                    {aiExpanding ? 'AI 思考中…' : '🎸 AI 帮我写'}
                  </Button>

                  {aiResult && (
                    <div className="flex flex-col gap-2">
                      {aiResult.versions.map((v, i) => (
                        <AiExpandCard
                          key={i}
                          style={v.style}
                          preview={v.preview}
                          selected={selectedAiIdx === i}
                          onSelect={() => applyAiVersion(i)}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </TornPaperCard>
        </section>

        {/* ─── 一句话记忆 ─── */}
        <section>
          <SectionHeader
            title="一句话记忆"
            subtitle="HOOK · 必填"
            className="mb-3 px-0"
          />

          <TornPaperCard className="w-full">
            <div className="flex flex-col gap-3">
              {/* 模板选择器 */}
              <div className="flex gap-1.5 flex-wrap">
                {(Object.entries(MEMORY_TEMPLATES) as [TemplateKey, typeof MEMORY_TEMPLATES['A']][]).map(
                  ([key, tmpl]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setMemoryTemplate(key)}
                      className={cn(
                        'text-xs px-3 py-1.5 rounded-full border font-semibold transition-colors',
                        memoryTemplate === key
                          ? 'bg-ink text-bone border-ink'
                          : 'bg-white text-ink/55 border-concrete/40 hover:text-ink',
                      )}
                    >
                      {tmpl.label}
                      <span className="ml-1 opacity-50 text-[10px]">
                        ({tmpl.persona})
                      </span>
                    </button>
                  ),
                )}
              </div>

              {/* 模板填充区域 */}
              {memoryTemplate === 'A' && (
                <div className="text-sm text-ink/65 flex items-center flex-wrap gap-1">
                  <Input
                    ref={(el) => {
                      fillRefs.current['A:1'] = el as HTMLInputElement;
                    }}
                    maxLength={10}
                    placeholder="_____"
                    value={hookFill['A:1'] || ''}
                    onChange={(e) => setHookFill((p) => ({ ...p, 'A:1': e.target.value }))}
                    className="inline-flex w-[100px] bg-white border-concrete/40 h-8 text-sm"
                  />
                  <span>的那一刻，我</span>
                  <Input
                    ref={(el) => {
                      fillRefs.current['A:2'] = el as HTMLInputElement;
                    }}
                    maxLength={10}
                    placeholder="_____"
                    value={hookFill['A:2'] || ''}
                    onChange={(e) => setHookFill((p) => ({ ...p, 'A:2': e.target.value }))}
                    className="inline-flex w-[100px] bg-white border-concrete/40 h-8 text-sm"
                  />
                </div>
              )}

              {memoryTemplate === 'B' && (
                <div className="text-sm text-ink/65 flex items-center flex-wrap gap-1">
                  <span>这场演出像</span>
                  <Input
                    ref={(el) => {
                      fillRefs.current['B:1'] = el as HTMLInputElement;
                    }}
                    maxLength={14}
                    placeholder="_____"
                    value={hookFill['B:1'] || ''}
                    onChange={(e) => setHookFill((p) => ({ ...p, 'B:1': e.target.value }))}
                    className="inline-flex w-[160px] bg-white border-concrete/40 h-8 text-sm"
                  />
                </div>
              )}

              {memoryTemplate === 'C' && (
                <div className="text-sm text-ink/65 flex items-center flex-wrap gap-1">
                  <span>我在这场演出</span>
                  <Input
                    ref={(el) => {
                      fillRefs.current['C:1'] = el as HTMLInputElement;
                    }}
                    maxLength={14}
                    placeholder="_____"
                    value={hookFill['C:1'] || ''}
                    onChange={(e) => setHookFill((p) => ({ ...p, 'C:1': e.target.value }))}
                    className="inline-flex w-[160px] bg-white border-concrete/40 h-8 text-sm"
                  />
                </div>
              )}

              {memoryTemplate === 'D' && (
                <div className="flex flex-col gap-2">
                  <Input
                    maxLength={20}
                    placeholder="搞一句情话吧"
                    value={memoryHook}
                    onChange={(e) => setMemoryHook(e.target.value)}
                    required
                    className="bg-white border-concrete/40"
                  />

                  {/* AI 标签建议（自由模式） */}
                  {body.trim().length > 5 && (
                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        disabled={aiSuggesting}
                        onClick={handleAiSuggest}
                      >
                        {aiSuggesting ? '思考中…' : '🎯 AI 推荐标签'}
                      </Button>
                      {aiSuggestedTags.length > 0 && (
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                          {aiSuggestedTags.map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => applyAiTag(tag)}
                              className={cn(
                                'text-[11px] px-2 py-0.5 rounded-full cursor-pointer',
                                'bg-ink text-bone font-semibold border border-ink',
                              )}
                            >
                              + {tag}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 字数计数器 */}
              <div
                className={cn(
                  'text-[10px] font-mono text-right',
                  memoryHookChars >= 18
                    ? memoryHookChars >= maxHookChars
                      ? 'text-danger font-bold'
                      : 'text-highlight'
                    : 'text-ink/55',
                )}
              >
                {memoryHookChars}/{maxHookChars}
              </div>
            </div>
          </TornPaperCard>
        </section>

        {/* ─── Vibe Check ─── */}
        <section>
          <SectionHeader
            title="Vibe Check"
            subtitle="RATE · 用身体记住的感觉"
            className="mb-3 px-0"
          />

          <TornPaperCard className="w-full">
            <div className="flex flex-col gap-4">
              {([
                { key: 'band', label: '乐队表现', val: vibeBand, set: setVibeBand },
                { key: 'sound', label: '音响效果', val: vibeSound, set: setVibeSound },
                { key: 'atmosphere', label: '现场氛围', val: vibeAtmosphere, set: setVibeAtmosphere },
              ] as const).map((dim) => (
                <div key={dim.key} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-ink">{dim.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-black text-ink">
                        {dim.val}
                      </span>
                      <span className="text-[10px] font-medium text-ink/55 w-16 text-right">
                        {VIBE_ADJECTIVES[dim.key][dim.val - 1]}
                      </span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={dim.val}
                    onChange={(e) => dim.set(Number(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-ink/15 accent-ink [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-bone [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-ink [&::-webkit-slider-thumb]:shadow-[0_1px_3px_rgba(0,0,0,0.2)]"
                  />
                </div>
              ))}
            </div>
          </TornPaperCard>
        </section>

        {/* ─── 可见性 ─── */}
        <section>
          <SectionHeader
            title="可见性"
            subtitle="VISIBILITY · 写给自己的还是给世界的"
            className="mb-3 px-0"
          />

          <TornPaperCard className="w-full">
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as 'PRIVATE' | 'PUBLIC')}
              className={cn(
                'w-full h-10 rounded-lg bg-white border border-concrete/40',
                'px-3 text-sm text-ink outline-none',
                'focus:border-concrete-dark focus:ring-2 focus:ring-ink/20',
                'transition-colors appearance-none',
              )}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23121212' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                backgroundSize: '14px',
              }}
            >
              <option value="PRIVATE">🔒 仅自己可见</option>
              <option value="PUBLIC">🌍 公开到演出条目</option>
            </select>
          </TornPaperCard>
        </section>

        {/* ─── 提交按钮 ─── */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-ink text-bone hover:bg-ink/90 font-bold text-sm rounded-lg shadow-md"
        >
          {loading ? '保存中...' : '保存记录'}
        </Button>
      </form>
    </div>
  );
}
