import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import BottomNav from './features/ui/BottomNav';
import HomeScreen from './screens/HomeScreen';
import GameScreen from './screens/GameScreen';
import SettingsScreen from './screens/SettingsScreen';
import ProfileScreen from './screens/ProfileScreen';
import OnlineScreen from './screens/OnlineScreen';

// Auto-redirect to /online if URL contains ?room=...
function RoomDetector() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const room = searchParams.get('room');
    if (room && pathname !== '/online') {
      navigate(`/online?room=${room}`);
    }
  }, []); // only on mount

  return null;
}

function AppContent() {
  const { pathname } = useLocation();
  const isGame = pathname === '/game';

  return (
    <div className="app-shell">
      <RoomDetector />
      <Routes>
        <Route path="/"        element={<HomeScreen />} />
        <Route path="/game"    element={<GameScreen />} />
        <Route path="/online"  element={<OnlineScreen />} />
        <Route path="/settings"element={<SettingsScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
      </Routes>
      {!isGame && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
