import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { useAuth } from './context/AuthContext';
import { DiscoverPage } from './pages/DiscoverPage';
import { LivePage } from './pages/LivePage';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { RecordPage } from './pages/RecordPage';
import { RegisterPage } from './pages/RegisterPage';
import { RepoDetailPage } from './pages/RepoDetailPage';
import { ShowDetailPage } from './pages/ShowDetailPage';
import { SplashPage } from './pages/SplashPage';

function ProtectedLayout() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="app-shell">
        <p className="empty" style={{ marginTop: 80 }}>
          {'\u52a0\u8f7d\u4e2d...'}
        </p>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <Layout />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/welcome" element={<SplashPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<Layout />}>
        <Route path="/" element={<LivePage />} />
        <Route path="/discover" element={<DiscoverPage />} />
      </Route>
      <Route element={<ProtectedLayout />}>
        <Route path="/record" element={<RecordPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="/shows/:id" element={<ShowDetailPage />} />
      <Route path="/repos/:id" element={<RepoDetailPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
