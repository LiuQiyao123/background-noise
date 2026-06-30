/**
 * Layout — Chopin-style root layout
 * Ported from chopin/bnoise iOS (RootView.swift)
 *
 * Structure:
 *   ConcreteBackground (grey concrete)
 *   → Page content
 *   → BNTabBar (bone bar with torn paper top edge)
 */
import { NavLink, Outlet } from 'react-router-dom';
import { Music, Compass, SquarePen, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConcreteBackground } from '@/components/ui/concrete-background';

const tabs = [
  { to: '/', label: '现场', icon: Music },
  { to: '/discover', label: '发现', icon: Compass },
  { to: '/record', label: '记录', icon: SquarePen },
  { to: '/profile', label: '我的', icon: User },
] as const;

export function Layout() {
  return (
    <div className="relative min-h-screen">
      {/* Concrete background — chopin RootView uses ConcreteBackground() */}
      <ConcreteBackground vignetteOpacity={0.22} />

      {/* Content */}
      <div className="relative z-10 pb-[80px]">
        <Outlet />
      </div>

      {/* TabBar — chopin BNTabBar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-bone">
        {/* Torn paper top edge */}
        <svg
          viewBox="0 0 400 8"
          preserveAspectRatio="none"
          className="absolute top-0 left-0 w-full h-2 -translate-y-1.5"
          fill="currentColor"
          style={{ color: '#F5EDE0' }}
        >
          <path d="M0,4 L3,2 L6,5 L9,1 L12,4 L15,3 L18,6 L21,2 L24,4 L27,1 L30,5 L33,3 L36,7 L39,2 L42,4 L45,1 L48,5 L51,3 L54,6 L57,2 L60,4 L63,1 L66,5 L69,3 L72,7 L75,2 L78,4 L81,1 L84,5 L87,3 L90,6 L93,2 L96,4 L99,1 L102,5 L105,3 L108,7 L111,2 L114,4 L117,1 L120,5 L123,3 L126,6 L129,2 L132,4 L135,1 L138,5 L141,3 L144,7 L147,2 L150,4 L153,1 L156,5 L159,3 L162,6 L165,2 L168,4 L171,1 L174,5 L177,3 L180,7 L183,2 L186,4 L189,1 L192,5 L195,3 L198,6 L201,2 L204,4 L207,1 L210,5 L213,3 L216,7 L219,2 L222,4 L225,1 L228,5 L231,3 L234,6 L237,2 L240,4 L243,1 L246,5 L249,3 L252,7 L255,2 L258,4 L261,1 L264,5 L267,3 L270,6 L273,2 L276,4 L279,1 L282,5 L285,3 L288,7 L291,2 L294,4 L297,1 L300,5 L303,3 L306,6 L309,2 L312,4 L315,1 L318,5 L321,3 L324,7 L327,2 L330,4 L333,1 L336,5 L339,3 L342,6 L345,2 L348,4 L351,1 L354,5 L357,3 L360,7 L363,2 L366,4 L369,1 L372,5 L375,3 L378,6 L381,2 L384,4 L387,1 L390,5 L393,3 L396,7 L400,4" />
        </svg>

        {/* Top border line — chopin: ink.opacity(0.18), height 0.5 */}
        <div className="absolute top-0 left-0 right-0 h-px bg-ink/20" />

        {/* Paper grain overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.18'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
          }}
        />

        {/* Tab items */}
        <div className="relative flex pt-2.5 pb-2">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 flex-1 text-center transition-colors',
                  isActive
                    ? 'text-ink font-heavy'
                    : 'text-ink/45 font-normal',
                )
              }
            >
              <tab.icon className="w-[22px] h-[22px]" strokeWidth={1} />
              <span className="text-[11px] font-heavy">{tab.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
