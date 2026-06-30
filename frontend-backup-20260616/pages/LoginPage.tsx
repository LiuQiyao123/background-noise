import { FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ApiError } from '../api/client';
import { BrandLogo } from '../components/BrandLogo';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('13800000001');
  const [password, setPassword] = useState('demo123456');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(phone, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '\u767b\u5f55\u5931\u8d25');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div style={{ marginBottom: 16 }}>
        <BrandLogo size={36} variant="full" animated />
      </div>
      <p className="auth-tagline">{'\u8bb0\u5f55\u73b0\u573a\uff0c\u627e\u5230\u540c\u9891\u7684\u4eba'}</p>
      {error && <div className="error-banner">{error}</div>}
      <form onSubmit={onSubmit}>
        <div className="field">
          <label>{'\u624b\u673a\u53f7'}</label>
          <input
            className="input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={'\u8f93\u5165\u624b\u673a\u53f7'}
            required
          />
        </div>
        <div className="field">
          <label>{'\u5bc6\u7801'}</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={'\u8f93\u5165\u5bc6\u7801'}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? '\u767b\u5f55\u4e2d\u2026' : '\u767b\u5f55'}
        </button>
      </form>
      <p style={{ marginTop: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        {'\u8fd8\u6ca1\u6709\u8d26\u53f7\uff1f'}
        <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>
          {'\u6ce8\u518c'}
        </Link>
      </p>
      <p style={{ marginTop: 12, textAlign: 'center' }}>
        <Link to="/" style={{ color: 'var(--text-dim)', fontSize: '0.8125rem' }}>
          {'\u5148\u901b\u901b \u2192'}
        </Link>
      </p>
    </div>
  );
}
