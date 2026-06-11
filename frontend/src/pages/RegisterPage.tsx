import { FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ApiError } from '../api/client';
import { BrandLogo } from '../components/BrandLogo';
import { useAuth } from '../context/AuthContext';

export function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(phone, password, nickname);
      navigate('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '\u6ce8\u518c\u5931\u8d25');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div style={{ marginBottom: 16 }}>
        <BrandLogo size={36} variant="full" animated />
      </div>
      <p className="auth-tagline">{'\u52a0\u5165\u5e95\u566a\uff0c\u5f00\u59cb\u8bb0\u5f55\u4f60\u7684\u73b0\u573a'}</p>
      {error && <div className="error-banner">{error}</div>}
      <form onSubmit={onSubmit}>
        <div className="field">
          <label>{'\u6635\u79f0'}</label>
          <input className="input" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder={'\u53eb\u4ec0\u4e48\u540d\u5b57\uff1f'} required />
        </div>
        <div className="field">
          <label>{'\u624b\u673a\u53f7'}</label>
          <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={'\u624b\u673a\u53f7\u7801'} required />
        </div>
        <div className="field">
          <label>{'\u5bc6\u7801\uff08\u81f3\u5c11 6 \u4f4d\uff09'}</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={'\u8bbe\u7f6e\u5bc6\u7801'}
            minLength={6}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? '\u6ce8\u518c\u4e2d\u2026' : '\u521b\u5efa\u8d26\u53f7'}
        </button>
      </form>
      <p style={{ marginTop: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        {'\u5df2\u6709\u8d26\u53f7\uff1f'}
        <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>
          {'\u767b\u5f55'}
        </Link>
      </p>
    </div>
  );
}
