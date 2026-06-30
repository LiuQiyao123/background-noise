import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, SendHorizonal } from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';
import { api, ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { AuthResponse } from '../api/types';

type Step = 'phone' | 'code';

export function LoginPage() {
  const { user, setUser } = useAuth();
  const nav = useNavigate();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  if (user) return <Navigate to="/" replace />;

  /** Step 1: Send verification code */
  const sendCode = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^1\d{10}$/.test(phone)) {
      setError('请输入正确的手机号');
      return;
    }
    setError('');
    setSending(true);
    try {
      await api('/auth/send-code', {
        method: 'POST',
        auth: false,
        body: JSON.stringify({ phone }),
      });
      setStep('code');
      setCountdown(60);
      const t = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) { clearInterval(t); return 0; }
          return c - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '发送失败，请重试');
    } finally {
      setSending(false);
    }
  };

  /** Step 2: Submit code */
  const submitCode = async (e: FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length !== 4) {
      setError('请输入4位验证码');
      return;
    }
    setError('');
    try {
      const res = await api<AuthResponse & { isNewUser?: boolean }>('/auth/login-by-code', {
        method: 'POST',
        auth: false,
        body: JSON.stringify({ phone, code: fullCode }),
      });
      localStorage.setItem('bn_token', res.accessToken);
      setUser(res.user);
      nav('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '验证失败');
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');
    if (value && index < 3) {
      const next = document.getElementById(`code-${index + 1}`);
      next?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prev = document.getElementById(`code-${index - 1}`);
      prev?.focus();
    }
  };

  const resetPhone = () => {
    setStep('phone');
    setCode(['', '', '', '']);
    setError('');
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-bone px-6">
      <BrandLogo size={48} variant="full" animated />

      {step === 'phone' ? (
        <>
          <p className="mt-4 mb-8 text-center text-sm text-concrete-dark">
            输入手机号，接收验证码登录
          </p>
          <form onSubmit={sendCode} className="flex w-full max-w-xs flex-col gap-3">
            {error && (
              <div className="rounded-lg bg-stamp/10 px-3 py-2 text-xs text-stamp">{error}</div>
            )}
            <input
              className="h-11 w-full rounded-lg border border-concrete/50 bg-bone/50 px-4 text-center text-lg text-ink outline-none placeholder:text-concrete-dark/60 focus:border-ink focus:bg-bone"
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setError(''); }}
              placeholder="手机号"
              maxLength={11}
              required
              autoFocus
            />
            <button
              type="submit"
              disabled={!phone.trim() || sending}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-ink px-4 text-sm font-bold text-bone transition-all hover:bg-[#2a2a2a] active:translate-y-px disabled:opacity-50"
            >
              {sending ? '发送中...' : '获取验证码'}
              <SendHorizonal className="h-4 w-4" />
            </button>
          </form>
        </>
      ) : (
        <>
          <p className="mt-4 mb-2 text-center text-sm text-concrete-dark">
            验证码已发送至
          </p>
          <button
            onClick={resetPhone}
            className="mb-8 flex items-center gap-1 text-sm font-medium text-ink/70 hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {phone}
          </button>
          <form onSubmit={submitCode} className="flex w-full max-w-xs flex-col gap-3">
            {error && (
              <div className="rounded-lg bg-stamp/10 px-3 py-2 text-xs text-stamp">{error}</div>
            )}
            <div className="flex justify-center gap-3">
              {code.map((d, i) => (
                <input
                  key={i}
                  id={`code-${i}`}
                  className="h-14 w-14 rounded-lg border border-concrete/50 bg-bone/50 text-center text-2xl font-bold text-ink outline-none focus:border-ink focus:bg-bone"
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleCodeChange(i, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(i, e)}
                  autoFocus={i === 0}
                  required
                />
              ))}
            </div>
            <button
              type="submit"
              disabled={code.join('').length !== 4}
              className="mt-2 inline-flex h-11 items-center justify-center rounded-lg bg-ink px-4 text-sm font-bold text-bone transition-all hover:bg-[#2a2a2a] active:translate-y-px disabled:opacity-50"
            >
              登录 / 注册
            </button>
            {countdown > 0 ? (
              <p className="text-center text-xs text-concrete-dark">
                {countdown}s 后可重新发送
              </p>
            ) : (
              <button
                type="button"
                onClick={sendCode as unknown as React.MouseEventHandler}
                className="text-center text-xs text-ink/60 hover:text-ink underline underline-offset-4"
              >
                重新发送验证码
              </button>
            )}
          </form>
        </>
      )}

      <Link to="/" className="mt-6 text-xs text-concrete-dark underline underline-offset-4 hover:text-ink">
        先逛逛 →
      </Link>
    </div>
  );
}
