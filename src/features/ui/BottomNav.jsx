import { useNavigate, useLocation } from 'react-router-dom';
import { GiChessKnight } from 'react-icons/gi';
import { IoSettings, IoPerson, IoGlobe } from 'react-icons/io5';

const NAV_ITEMS = [
  { path: '/',        icon: <GiChessKnight />, label: 'Play'    },
  { path: '/online',  icon: <IoGlobe />,       label: 'Online'  },
  { path: '/settings',icon: <IoSettings />,    label: 'Settings'},
  { path: '/profile', icon: <IoPerson />,      label: 'Profile' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(({ path, icon, label }) => (
        <button
          key={path}
          className={`nav-btn ${pathname === path ? 'active' : ''}`}
          onClick={() => navigate(path)}
        >
          {icon}
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
