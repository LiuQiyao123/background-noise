import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../components/BrandLogo';

const features = [
  { icon: '🎸', title: '记录现场', desc: '每一场演出都值得被记住' },
  { icon: '🏷️', title: '一句话记忆', desc: '用标签找到同频的人' },
  { icon: '📊', title: 'Vibe 评分', desc: '乐队·音响·氛围，三维打分' },
];

export function SplashPage() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="splash-root">
      {/* Background atmosphere */}
      <div className="splash-bg" />

      {/* Gradient overlay */}
      <div className="splash-overlay" />

      {/* Content */}
      <div className={`splash-content${loaded ? ' splash-content--visible' : ''}`}>
        {/* Top area — logo */}
        <div className="splash-top">
          <BrandLogo size={40} variant="full" animated />
        </div>

        {/* Center area — tagline */}
        <div className="splash-center">
          <h2 className="splash-tagline">记录现场，找到同频的人</h2>
          <p className="splash-sub">
            为每一场独立音乐和 Live House 演出<br />
            留下你的现场记忆
          </p>

          {/* Feature cards */}
          <div className="splash-features">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="splash-feature"
                style={{ animationDelay: `${400 + i * 150}ms` }}
              >
                <span className="splash-feature-icon">{f.icon}</span>
                <div>
                  <strong>{f.title}</strong>
                  <p>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom area — CTA */}
        <div className="splash-bottom">
          <Link to="/login" className="btn btn-primary splash-cta">
            开始记录
          </Link>
          <Link to="/register" className="btn btn-ghost splash-cta-secondary">
            注册账号
          </Link>
          <Link to="/" className="splash-skip">
            先逛逛 →
          </Link>
        </div>
      </div>
    </div>
  );
}
