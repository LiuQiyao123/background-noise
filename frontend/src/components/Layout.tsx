import { Outlet } from 'react-router-dom';
import { TabBar } from '@/components/ui/tab-bar';
import { Home, Compass, PlusSquare, User } from 'lucide-react';

const tabs = [
  { icon: <Home className="w-[22px] h-[22px]" strokeWidth={1.5} />, label: '首页', path: '/' },
  { icon: <Compass className="w-[22px] h-[22px]" strokeWidth={1.5} />, label: '发现', path: '/discover' },
  { icon: <PlusSquare className="w-[22px] h-[22px]" strokeWidth={1.5} />, label: '记录', path: '/record' },
  { icon: <User className="w-[22px] h-[22px]" strokeWidth={1.5} />, label: '我', path: '/profile' },
];

export function Layout() {
  return (
    <div className="min-h-dvh bg-background flex justify-center selection:bg-ink selection:text-bone">
      <div className="w-full max-w-[420px] min-h-dvh relative shadow-2xl shadow-black/20 border-x border-concrete/30 overflow-x-hidden flex flex-col bg-bone">
        <div className="flex-1 pb-20">
          <Outlet />
        </div>
        <TabBar tabs={tabs} />
      </div>
    </div>
  );
}
