import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Video, Mic } from 'lucide-react';

interface MemoryMedia {
  url: string;
  type: string;
}

interface MemoryUser {
  id: string;
  nickname: string;
  avatarUrl: string | null;
}

interface MemoryShow {
  id: string;
  artistName: string;
  venueName: string;
  showDate: string;
  city: string | null;
}

interface MemoryDetail {
  id: string;
  showId: string;
  text: string | null;
  media: MemoryMedia[];
  visibility: 'PRIVATE' | 'PUBLIC';
  createdAt: string;
  user: MemoryUser;
  show: MemoryShow;
}

export function MemoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [memory, setMemory] = useState<MemoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    api<MemoryDetail>(`/memories/${id}`, { auth: false })
      .then(setMemory)
      .catch(() => setError('记忆不存在'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await api(`/memories/${id}`, { method: 'DELETE' });
      navigate('/profile', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
    } finally {
      setDeleting(false);
    }
  };

  const isOwner = user && memory && user.id === memory.user.id;

  if (loading) {
    return (
      <div className="bg-bone px-4 py-6">
        <p className="py-16 text-center text-sm text-concrete-dark">加载中...</p>
      </div>
    );
  }

  if (error || !memory) {
    return (
      <div className="bg-bone px-4 py-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-3 inline-flex items-center text-xs font-medium text-ink/60 hover:text-ink"
        >
          ← 返回
        </button>
        <p className="py-16 text-center text-sm text-concrete-dark">{error || '记忆不存在'}</p>
      </div>
    );
  }

  const dateStr = new Date(memory.createdAt).toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="min-h-dvh bg-bone px-4 py-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-3 inline-flex items-center text-xs font-medium text-ink/60 hover:text-ink"
      >
        ← 返回
      </button>

      {/* Delete button (own memory only) */}
      {isOwner && (
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger/10"
          >
            删除
          </button>
        </div>
      )}

      {/* Media gallery */}
      {memory.media && memory.media.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {memory.media.map((m, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl bg-bg-elevated"
              style={{ width: memory.media && memory.media.length === 1 ? '100%' : 'calc(50% - 4px)' }}
            >
              {m.type === 'video' ? (
                <div className="flex aspect-video items-center justify-center bg-bg-elevated">
                  <Video className="h-10 w-10 text-concrete-dark" />
                </div>
              ) : m.type === 'audio' ? (
                <div className="flex aspect-square items-center justify-center bg-bg-elevated">
                  <Mic className="h-10 w-10 text-concrete-dark" />
                </div>
              ) : (
                <img src={m.url} alt="" className="w-full object-cover" style={{ maxHeight: '300px' }} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Memory text */}
      <div className="mb-4">
        {memory.text ? (
          <p className="text-base leading-relaxed text-ink">{memory.text}</p>
        ) : (
          <p className="text-sm italic text-concrete-dark">（无文字）</p>
        )}
      </div>

      {/* Meta */}
      <div className="rounded-xl bg-card px-4 py-3 ring-1 ring-ink/5">
        <p className="text-xs text-ink/60">
          {memory.user.nickname ?? '乐迷'}
        </p>
        <p className="mt-1 text-xs text-concrete-dark">
          {dateStr}
        </p>
        {memory.show && (
          <button
            type="button"
            onClick={() => navigate(`/shows/${memory.show.id}`)}
            className="mt-1 text-xs font-medium text-brand hover:underline"
          >
            {memory.show.artistName} @ {memory.show.venueName}
          </button>
        )}
        {memory.visibility === 'PRIVATE' && (
          <p className="mt-1 text-[11px] text-concrete-dark">🔒 仅自己可见</p>
        )}
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4">
          <div className="w-full max-w-[300px] rounded-2xl bg-bone px-6 py-5 shadow-xl">
            <div className="mb-4 text-center">
              <div className="mb-2 text-3xl">🗑️</div>
              <p className="text-sm font-semibold text-ink">确定删除这条记忆？</p>
              <p className="mt-1 text-xs text-concrete-dark">删除后无法恢复</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 rounded-xl border border-concrete/40 bg-white py-2.5 text-sm font-medium text-ink/60 transition-all"
              >
                取消
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="flex-1 rounded-xl bg-danger py-2.5 text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-50"
              >
                {deleting ? '删除中...' : '删除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
