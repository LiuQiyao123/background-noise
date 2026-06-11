import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { api, uploadMedia } from '../api/client';
import type { AiExpandResult, AiTagResult, Show } from '../api/types';
import { useAuth } from '../context/AuthContext';

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
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 8,
          background: 'var(--bg-elevated)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          color: 'var(--text-disabled)',
        }}
      >
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
    <div style={{ position: 'relative' }}>
      <img
        src={url}
        alt=""
        onError={() => setError(true)}
        onClick={() => setShowTags(!showTags)}
        style={{ cursor: 'pointer' }}
      />
      {tags.length > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: 2,
            right: 2,
            background: 'var(--brand)',
            color: '#fff',
            fontSize: 'var(--font-size-micro)',
            borderRadius: 4,
            padding: '1px 5px',
            lineHeight: 1.4,
          }}
        >
          +{tags.length}
        </div>
      )}
      {showTags && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            zIndex: 10,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: 10,
            minWidth: 200,
            marginTop: 4,
          }}
        >
          {PHOTO_TAG_GROUPS.map((group) => (
            <div key={group.category} style={{ marginBottom: 8 }}>
              <div
                style={{
                  fontSize: 'var(--font-size-micro)',
                  color: 'var(--text-dim)',
                  marginBottom: 4,
                }}
              >
                {group.category}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {group.tags.map((tag) => (
                  <button
                    key={tag.key}
                    type="button"
                    className={`tag${tags.includes(tag.key) ? ' active' : ''}`}
                    onClick={() => toggleTag(tag.key)}
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
      style={{
        background: selected ? 'var(--accent-muted)' : 'var(--bg-elevated)',
        border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 'var(--radius)',
        padding: 12,
        textAlign: 'left',
        cursor: 'pointer',
        width: '100%',
        transition: 'border-color 0.15s, background 0.15s',
      }}
    >
      <div
        style={{
          fontSize: 'var(--font-size-caption)',
          color: 'var(--accent)',
          fontWeight: 600,
          marginBottom: 6,
        }}
      >
        {style}
      </div>
      <p
        style={{
          fontSize: 'var(--font-size-body)',
          color: 'var(--text-muted)',
          lineHeight: 1.5,
        }}
      >
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
  // For template A/B/C: fill-in parts
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

  // Refs for fill-in inputs
  const fillRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    api<{ items: Show[] }>('/shows', { auth: false }).then((r) => setShows(r.items));
  }, []);

  if (!user) return <Navigate to="/login" replace />;

  /* ─── 构建完整的 memoryHook 文本 ─── */
  const buildMemoryHook = useCallback((): string => {
    if (memoryTemplate === 'D') return memoryHook.trim();
    // Template A: "__的那一刻，我__"
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
    // For free mode, insert into memoryHook
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
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">记录</h1>
        <p className="page-sub">默认私密，可选公开到演出条目</p>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <form onSubmit={onSubmit}>
        {/* ─── 选择演出 ─── */}
        <div className="section-divider">绑定演出</div>
        <div className="field">
          <select
            className="select"
            value={showId}
            onChange={(e) => setShowId(e.target.value)}
            required
          >
            <option value="">选择演出...</option>
            {shows.map((s) => (
              <option key={s.id} value={s.id}>
                {s.artistName} @ {s.venueName}
              </option>
            ))}
          </select>
        </div>

        {/* ─── 照片 ─── */}
        <div className="section-divider">现场照片</div>
        <div className="field">
          <input type="file" accept="image/*" onChange={onFile} />
          {mediaItems.length > 0 && (
            <div className="media-preview">
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

        {/* ─── 文字记录 ─── */}
        <div className="section-divider">文字记录</div>
        <div className="field">
          <textarea
            className="textarea"
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              setAiSuggestedTags([]);
            }}
            placeholder="写点什么…"
          />
        </div>

        {/* AI 扩写 */}
        {body.trim().length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              disabled={aiExpanding}
              onClick={handleAiExpand}
              style={{ width: '100%' }}
            >
              {aiExpanding ? 'AI 思考中…' : '🎸 AI 帮我写'}
            </button>
            {aiResult && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
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
          </div>
        )}

        {/* ─── 一句话记忆模板选择器 ─── */}
        <div className="section-divider">
          一句话记忆
          <span style={{ color: 'var(--accent)', fontSize: 'var(--font-size-micro)', marginLeft: 4 }}>
            ★ 必填
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 6,
            marginBottom: 12,
            flexWrap: 'wrap',
          }}
        >
          {(Object.entries(MEMORY_TEMPLATES) as [TemplateKey, typeof MEMORY_TEMPLATES['A']][]).map(
            ([key, tmpl]) => (
              <button
                key={key}
                type="button"
                className={`tag${memoryTemplate === key ? ' active' : ''}`}
                onClick={() => setMemoryTemplate(key)}
                style={{ padding: '6px 14px', fontSize: '0.8125rem' }}
              >
                {tmpl.label}
                <span style={{ opacity: 0.5, marginLeft: 4, fontSize: 'var(--font-size-micro)' }}>
                  ({tmpl.persona})
                </span>
              </button>
            ),
          )}
        </div>

        {/* 模板填充区域 */}
        <div className="memory-hook-field">
          {memoryTemplate === 'A' && (
            <div style={{ fontSize: 'var(--font-size-body)', color: 'var(--text-muted)' }}>
              <input
                ref={(el) => { fillRefs.current['A:1'] = el; }}
                className="input"
                style={{ display: 'inline', width: 'auto', maxWidth: 120, padding: '4px 8px', margin: '0 2px' }}
                maxLength={10}
                placeholder="_____"
                value={hookFill['A:1'] || ''}
                onChange={(e) => setHookFill((p) => ({ ...p, 'A:1': e.target.value }))}
              />
              的那一刻，我
              <input
                ref={(el) => { fillRefs.current['A:2'] = el; }}
                className="input"
                style={{ display: 'inline', width: 'auto', maxWidth: 120, padding: '4px 8px', margin: '0 2px' }}
                maxLength={10}
                placeholder="_____"
                value={hookFill['A:2'] || ''}
                onChange={(e) => setHookFill((p) => ({ ...p, 'A:2': e.target.value }))}
              />
            </div>
          )}
          {memoryTemplate === 'B' && (
            <div style={{ fontSize: 'var(--font-size-body)', color: 'var(--text-muted)' }}>
              这场演出像
              <input
                ref={(el) => { fillRefs.current['B:1'] = el; }}
                className="input"
                style={{ display: 'inline', width: 'auto', maxWidth: 200, padding: '4px 8px', margin: '0 2px' }}
                maxLength={14}
                placeholder="_____"
                value={hookFill['B:1'] || ''}
                onChange={(e) => setHookFill((p) => ({ ...p, 'B:1': e.target.value }))}
              />
            </div>
          )}
          {memoryTemplate === 'C' && (
            <div style={{ fontSize: 'var(--font-size-body)', color: 'var(--text-muted)' }}>
              我在这场演出
              <input
                ref={(el) => { fillRefs.current['C:1'] = el; }}
                className="input"
                style={{ display: 'inline', width: 'auto', maxWidth: 200, padding: '4px 8px', margin: '0 2px' }}
                maxLength={14}
                placeholder="_____"
                value={hookFill['C:1'] || ''}
                onChange={(e) => setHookFill((p) => ({ ...p, 'C:1': e.target.value }))}
              />
            </div>
          )}
          {memoryTemplate === 'D' && (
            <div className="field" style={{ marginBottom: 0 }}>
              <input
                className="input"
                maxLength={20}
                placeholder="搞一句情话吧"
                value={memoryHook}
                onChange={(e) => setMemoryHook(e.target.value)}
                required
              />
              {/* AI 标签建议（自由模式） */}
              {body.trim().length > 5 && (
                <div style={{ marginTop: 8 }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    disabled={aiSuggesting}
                    onClick={handleAiSuggest}
                    style={{ fontSize: 'var(--font-size-caption)', padding: '4px 10px' }}
                  >
                    {aiSuggesting ? '思考中…' : '🎯 AI 推荐标签'}
                  </button>
                  {aiSuggestedTags.length > 0 && (
                    <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                      {aiSuggestedTags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          className="tag active"
                          onClick={() => applyAiTag(tag)}
                          style={{ cursor: 'pointer' }}
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
          <div
            className={`char-counter${memoryHookChars >= 18 ? memoryHookChars >= maxHookChars ? ' char-counter--danger' : ' char-counter--warn' : ''}`}
          >
            {memoryHookChars}/{maxHookChars}
          </div>
        </div>

        {/* ─── Vibe Check ─── */}
        <div className="section-divider">Vibe Check</div>
        <div className="vibe-row">
          {([
            { key: 'band', label: '乐队表现', color: 'var(--vibe-band)', val: vibeBand, set: setVibeBand },
            { key: 'sound', label: '音响效果', color: 'var(--vibe-sound)', val: vibeSound, set: setVibeSound },
            { key: 'atmosphere', label: '现场氛围', color: 'var(--vibe-atmosphere)', val: vibeAtmosphere, set: setVibeAtmosphere },
          ] as const).map((dim) => (
            <div key={dim.key} className="vibe-item">
              <label>
                <span style={{ color: dim.color }}>{dim.label}</span>
                <span>
                  <span style={{ color: dim.color, fontWeight: 600 }}>{dim.val}</span>
                  <span style={{ color: 'var(--text-dim)', fontSize: 'var(--font-size-caption)', marginLeft: 6 }}>
                    {VIBE_ADJECTIVES[dim.key][dim.val - 1]}
                  </span>
                </span>
              </label>
              <input
                type="range"
                min={1}
                max={5}
                value={dim.val}
                onChange={(e) => dim.set(Number(e.target.value))}
                style={{ accentColor: dim.color }}
              />
            </div>
          ))}
        </div>

        {/* ─── 可见性 ─── */}
        <div className="section-divider">可见性</div>
        <div className="field">
          <select
            className="select"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as 'PRIVATE' | 'PUBLIC')}
          >
            <option value="PRIVATE">仅自己可见</option>
            <option value="PUBLIC">公开到演出条目</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? '保存中...' : '保存记录'}
        </button>
      </form>
    </div>
  );
}
