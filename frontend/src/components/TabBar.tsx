import { NavLink } from 'react-router-dom';
import { TabIcon } from './TabIcons';

const tabs = [
  { to: '/', label: '\u73b0\u573a', icon: 'live' as const },
  { to: '/discover', label: '\u53d1\u73b0', icon: 'discover' as const },
  { to: '/record', label: '\u8bb0\u5f55', icon: 'record' as const },
  { to: '/profile', label: '\u6211\u7684', icon: 'profile' as const },
];

export function TabBar() {
  return (
    <nav className="tab-bar">
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.to === '/'}
          className={({ isActive }) => `tab-item${isActive ? ' active' : ''}`}
        >
          <span className="tab-icon">
            <TabIcon name={t.icon} />
          </span>
          <span>{t.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
