import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DiscoverPage } from './pages/DiscoverPage';
import { LivePage } from './pages/LivePage';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { RecordPage } from './pages/RecordPage';
import { CreateMemoryPage } from './pages/CreateMemoryPage';
import { MemoryDetailPage } from './pages/MemoryDetailPage';
import { RepoDetailPage } from './pages/RepoDetailPage';
import { ShowDetailPage } from './pages/ShowDetailPage';
import { SplashPage } from './pages/SplashPage';

export default function App() {
  return (
    <Routes>
      <Route path="/welcome" element={<SplashPage />} />
      <Route path="/login" element={<LoginPage />} />
      {/* 公开页面 — 未登录也可浏览 */}
      <Route element={<Layout />}>
        <Route path="/" element={<LivePage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/record" element={<CreateMemoryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="/shows/:id" element={<ShowDetailPage />} />
      <Route path="/repos/:id" element={<RepoDetailPage />} />
      {/* 旧版 Repo 创建仍可访问 */}
      <Route path="/repo/create" element={<RecordPage />} />
      <Route path="/memories/create" element={<Navigate to="/record" replace />} />
      <Route path="/memories/:id" element={<MemoryDetailPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
