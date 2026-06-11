import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import type { Comment, Repo } from '../api/types';
import { useAuth } from '../context/AuthContext';

function MediaImg({ url }: { url: string }) {
  const [error, setError] = useState(false);
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
  return <img src={url} alt="" onError={() => setError(true)} />;
}

function CommentItem({
  comment,
  onReply,
  replyTarget,
  replyText,
  onReplyTextChange,
  onReplySubmit,
  submittingReply,
  currentUserId,
}: {
  comment: Comment;
  onReply: (id: string) => void;
  replyTarget: string | null;
  replyText: string;
  onReplyTextChange: (text: string) => void;
  onReplySubmit: (parentId: string) => void;
  submittingReply: boolean;
  currentUserId: string | null;
}) {
  return (
    <div className="comment-item">
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
        <strong style={{ fontSize: 'var(--font-size-caption)' }}>
          {comment.user.nickname}
        </strong>
        {comment.isSameShowUser && (
          <span title="同场观众" style={{ fontSize: '0.9rem' }}>🎸</span>
        )}
      </div>
      <p style={{ fontSize: 'var(--font-size-body)', marginTop: 2 }}>{comment.body}</p>
      <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
        <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--text-dim)' }}>
          {new Date(comment.createdAt).toLocaleString('zh-CN', {
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
        {currentUserId && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ padding: '2px 8px', fontSize: 'var(--font-size-caption)' }}
            onClick={() => onReply(comment.id)}
          >
            回复
          </button>
        )}
      </div>

      {/* Reply input (inline) */}
      {replyTarget === comment.id && (
        <form
          className="comment-form"
          style={{ marginTop: 8, marginLeft: 16 }}
          onSubmit={(e) => {
            e.preventDefault();
            onReplySubmit(comment.id);
          }}
        >
          <input
            className="input"
            value={replyText}
            onChange={(e) => onReplyTextChange(e.target.value)}
            placeholder={`回复 ${comment.user.nickname}...`}
            autoFocus
          />
          <button type="submit" className="btn btn-primary btn-sm" disabled={submittingReply || !replyText.trim()}>
            发送
          </button>
        </form>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div style={{ marginLeft: 16, marginTop: 8, borderLeft: '2px solid var(--border)', paddingLeft: 12 }}>
          {comment.replies.map((reply) => (
            <div key={reply.id} className="comment-item" style={{ borderBottom: 'none', padding: '6px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <strong style={{ fontSize: 'var(--font-size-caption)' }}>
                  {reply.user.nickname}
                </strong>
                {reply.isSameShowUser && (
                  <span title="同场观众" style={{ fontSize: '0.9rem' }}>🎸</span>
                )}
              </div>
              <p style={{ fontSize: 'var(--font-size-body)', marginTop: 2 }}>{reply.body}</p>
              <span style={{ fontSize: 'var(--font-size-micro)', color: 'var(--text-dim)' }}>
                {new Date(reply.createdAt).toLocaleString('zh-CN', {
                  month: 'numeric',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function RepoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [repo, setRepo] = useState<Repo | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Reply state
  const [replyTarget, setReplyTarget] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  async function load() {
    if (!id) return;
    const [r, c] = await Promise.all([
      api<Repo>(`/repos/${id}`, { auth: false }),
      api<{ items: Comment[] }>(`/repos/${id}/comments`, { auth: false }),
    ]);
    setRepo(r);
    setComments(c.items);
  }

  useEffect(() => {
    load().catch(() => setRepo(null));
  }, [id]);

  /* ─── Repo like ─── */
  async function toggleLike() {
    if (!id || !user || !repo) return;
    if (repo.visibility !== 'PUBLIC') return;
    if (repo.likedByMe) {
      await api(`/repos/${id}/like`, { method: 'DELETE' });
    } else {
      await api(`/repos/${id}/like`, { method: 'POST' });
    }
    load();
  }

  /* ─── Memory hook like ─── */
  async function toggleMemoryHookLike() {
    if (!id || !user || !repo) return;
    if (repo.visibility !== 'PUBLIC') return;
    if (repo.memoryHookLikedByMe) {
      await api(`/repos/${id}/memory-hook-like`, { method: 'DELETE' });
    } else {
      await api(`/repos/${id}/memory-hook-like`, { method: 'POST' });
    }
    load();
  }

  /* ─── Main comment ─── */
  async function submitComment(e: FormEvent) {
    e.preventDefault();
    if (!id || !text.trim()) return;
    setError('');
    setSubmittingComment(true);
    try {
      await api(`/repos/${id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ body: text.trim() }),
      });
      setText('');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'failed');
    } finally {
      setSubmittingComment(false);
    }
  }

  /* ─── Reply ─── */
  function handleReply(commentId: string) {
    setReplyTarget(replyTarget === commentId ? null : commentId);
    setReplyText('');
  }

  async function submitReply(parentId: string) {
    if (!id || !replyText.trim()) return;
    setSubmittingReply(true);
    try {
      await api(`/repos/${id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ body: replyText.trim(), parentId }),
      });
      setReplyText('');
      setReplyTarget(null);
      load();
    } catch {
      // silent
    } finally {
      setSubmittingReply(false);
    }
  }

  if (!repo) {
    return (
      <div className="page">
        <p className="empty">加载中...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        style={{ marginBottom: 12 }}
        onClick={() => navigate(-1)}
      >
        ← 返回
      </button>

      {/* Private banner */}
      {repo.visibility === 'PRIVATE' && (
        <div className="private-banner">
          🔒 仅自己可见，不会出现在记忆墙
        </div>
      )}

      <div className="card">
        <p
          style={{
            fontWeight: 600,
            fontSize: 'var(--font-size-memory)',
            lineHeight: 'var(--line-height-tight)',
          }}
        >
          「{repo.memoryHook}」
        </p>
        {repo.body && (
          <p
            style={{
              marginTop: 10,
              fontSize: 'var(--font-size-body)',
              lineHeight: 'var(--line-height-normal)',
            }}
          >
            {repo.body}
          </p>
        )}
        {repo.media && repo.media.length > 0 && (
          <div className="media-preview">
            {repo.media.map((m) => (
              <div key={m.id}>
                <MediaImg url={m.url} />
                {m.tags && (m.tags as unknown as string[]).length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      gap: 2,
                      flexWrap: 'wrap',
                      marginTop: 4,
                    }}
                  >
                    {(m.tags as unknown as string[]).map((t: string) => (
                      <span
                        key={t}
                        className="tag"
                        style={{ fontSize: 'var(--font-size-micro)' }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <p className="repo-meta">
          {repo.user?.nickname}
          {' · Vibe '}
          <span className="vibe-value--band">{repo.vibeBand}</span>
          /
          <span className="vibe-value--sound">{repo.vibeSound}</span>
          /
          <span className="vibe-value--atmosphere">{repo.vibeAtmosphere}</span>
        </p>
        {repo.show && (
          <p className="repo-meta">
            {repo.show.artistName} · {repo.show.venueName}
          </p>
        )}
      </div>

      {/* Like + Memory Hook Like */}
      {repo.visibility === 'PUBLIC' && user && (
        <div style={{ display: 'flex', gap: 12, margin: '12px 0', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn btn-ghost btn-sm btn-like${repo.likedByMe ? ' liked' : ''}`}
            onClick={toggleLike}
          >
            {repo.likedByMe ? '❤ 已赞' : '♡ 赞'}
          </button>
          <button
            type="button"
            className={`btn btn-ghost btn-sm btn-like${repo.memoryHookLikedByMe ? ' liked' : ''}`}
            onClick={toggleMemoryHookLike}
          >
            {repo.memoryHookLikedByMe ? '🔥 记忆已赞' : '🔥 赞记忆'}
          </button>
          <span className="repo-meta">
            {repo.likeCount} 赞 · {repo.memoryHookLikeCount ?? 0} 记忆赞 · {repo.commentCount} 评论
          </span>
        </div>
      )}

      {/* Summary for non-logged-in */}
      {repo.visibility === 'PUBLIC' && !user && (
        <div style={{ margin: '12px 0' }}>
          <span className="repo-meta">
            {repo.likeCount} 赞 · {repo.memoryHookLikeCount ?? 0} 记忆赞 · {repo.commentCount} 评论
          </span>
        </div>
      )}

      {/* Comments */}
      {repo.visibility === 'PUBLIC' && (
        <section className="comments-section">
          <h3
            style={{
              fontSize: 'var(--font-size-body)',
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            评论
          </h3>
          {comments.length === 0 ? (
            <p className="repo-meta" style={{ padding: '8px 0' }}>
              暂无评论
            </p>
          ) : (
            comments.map((c) => (
              <CommentItem
                key={c.id}
                comment={c}
                onReply={handleReply}
                replyTarget={replyTarget}
                replyText={replyText}
                onReplyTextChange={setReplyText}
                onReplySubmit={submitReply}
                submittingReply={submittingReply}
                currentUserId={user?.id ?? null}
              />
            ))
          )}
          {user ? (
            <form className="comment-form" onSubmit={submitComment}>
              {error && <div className="error-banner">{error}</div>}
              <input
                className="input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="写点什么..."
              />
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={submittingComment || !text.trim()}
              >
                {submittingComment ? '发送中...' : '发送'}
              </button>
            </form>
          ) : (
            <p className="repo-meta" style={{ padding: '12px 0', textAlign: 'center' }}>
              登录后可评论
            </p>
          )}
        </section>
      )}
    </div>
  );
}
