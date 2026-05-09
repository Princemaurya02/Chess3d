import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { IoGameController, IoInformationCircle, IoColorPalette, IoSunny, IoMoon } from 'react-icons/io5';

// ── Theme stored in localStorage ────────────────────────────────────────────
const THEME_KEY = 'chess3d_theme';

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'light') {
    root.style.setProperty('--bg-primary',    '#f0f0fa');
    root.style.setProperty('--bg-secondary',  '#e4e4f4');
    root.style.setProperty('--bg-card',       '#ffffff');
    root.style.setProperty('--bg-glass',      'rgba(0,0,0,0.04)');
    root.style.setProperty('--text-primary',  '#1a1a2e');
    root.style.setProperty('--text-secondary','#555577');
    root.style.setProperty('--text-muted',    '#9999bb');
    root.style.setProperty('--border',        'rgba(0,0,0,0.08)');
  } else {
    root.style.setProperty('--bg-primary',    '#050510');
    root.style.setProperty('--bg-secondary',  '#0a0a20');
    root.style.setProperty('--bg-card',       '#0d0d25');
    root.style.setProperty('--bg-glass',      'rgba(255,255,255,0.04)');
    root.style.setProperty('--text-primary',  '#f0f0ff');
    root.style.setProperty('--text-secondary','#8888bb');
    root.style.setProperty('--text-muted',    '#44445a');
    root.style.setProperty('--border',        'rgba(255,255,255,0.06)');
  }
  localStorage.setItem(THEME_KEY, theme);
}

// Init theme on load
const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
applyTheme(savedTheme);

// ── Board / Game Settings ────────────────────────────────────────────────────
function GameSettings() {
  const {
    showCoordinates, setShowCoordinates,
    boardRotated, setBoardRotated,
    soundEnabled, setSoundEnabled,
    difficulty, setDifficulty,
  } = useGameStore();

  const toggles = [
    { label: 'Show Coordinates', desc: 'Display rank & file labels on board', value: showCoordinates, set: setShowCoordinates },
    { label: 'Rotate Board', desc: 'View from Black\'s side', value: boardRotated, set: setBoardRotated },
    { label: 'Sound Effects', desc: 'Move & capture sounds', value: soundEnabled, set: setSoundEnabled },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {toggles.map(({ label, desc, value, set }) => (
        <div key={label} className="glass-card" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px',
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{label}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{desc}</div>
          </div>
          <button className={`toggle ${value ? 'on' : ''}`} onClick={() => set(!value)} />
        </div>
      ))}

      {/* AI Difficulty */}
      <div className="glass-card" style={{ padding: '18px 20px' }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 14 }}>
          AI Difficulty
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { id: 'easy',   label: '🌱 Easy',   color: '#4ade80' },
            { id: 'medium', label: '⚔️ Medium', color: '#f59e0b' },
            { id: 'hard',   label: '🔥 Hard',   color: '#f87171' },
          ].map(({ id, label, color }) => (
            <button key={id} onClick={() => setDifficulty(id)} style={{
              flex: 1, padding: '11px 4px', borderRadius: 11, cursor: 'pointer',
              background: difficulty === id ? `${color}18` : 'rgba(255,255,255,0.03)',
              border: `1.5px solid ${difficulty === id ? color : 'rgba(255,255,255,0.06)'}`,
              color: difficulty === id ? color : 'var(--text-muted)',
              fontSize: 12, fontWeight: 700, fontFamily: 'Inter,sans-serif',
              transition: 'all 0.2s',
              boxShadow: difficulty === id ? `0 0 14px ${color}30` : 'none',
            }}>{label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Theme Settings ───────────────────────────────────────────────────────────
function ThemeSettings() {
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'dark');

  const handleTheme = (t) => {
    setTheme(t);
    applyTheme(t);
  };

  const THEMES = [
    {
      id: 'dark', icon: <IoMoon size={22}/>, label: 'Dark Mode',
      desc: 'Easy on the eyes — classic dark chess experience',
      color: '#7c3aed', preview: ['#050510', '#0d0d25', '#d4a843'],
    },
    {
      id: 'light', icon: <IoSunny size={22}/>, label: 'Light Mode',
      desc: 'Clean bright interface for daytime play',
      color: '#f59e0b', preview: ['#f0f0fa', '#ffffff', '#d4a843'],
    },
  ];

  const BOARD_THEMES = [
    { id: 'classic',  label: 'Classic',  colors: ['#f0d9b5', '#b58863'] },
    { id: 'ocean',    label: 'Ocean',    colors: ['#dee3e6', '#788a94'] },
    { id: 'midnight', label: 'Midnight', colors: ['#2d2d48', '#6b5b8e'] },
    { id: 'forest',   label: 'Forest',   colors: ['#ffffdd', '#86a666'] },
  ];
  const [boardTheme, setBoardTheme] = useState(() => localStorage.getItem('chess3d_boardtheme') || 'classic');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* App Theme */}
      <div style={{ fontSize: 11, letterSpacing: 2, color: 'var(--text-muted)', fontWeight: 700,
        textTransform: 'uppercase', fontFamily: 'Rajdhani,sans-serif', marginBottom: 4 }}>
        App Theme
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {THEMES.map(({ id, icon, label, desc, color, preview }) => (
          <button key={id} onClick={() => handleTheme(id)} style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: '18px 20px', borderRadius: 16, cursor: 'pointer', width: '100%', textAlign: 'left',
            background: theme === id ? `${color}15` : 'rgba(255,255,255,0.03)',
            border: `2px solid ${theme === id ? color : 'rgba(255,255,255,0.06)'}`,
            transition: 'all 0.25s',
            boxShadow: theme === id ? `0 4px 20px ${color}30` : 'none',
          }}>
            {/* Preview swatches */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flexShrink: 0 }}>
              {preview.map((c, i) => (
                <div key={i} style={{ width: 14, height: 14, borderRadius: 4, background: c, border: '1px solid rgba(255,255,255,0.1)' }}/>
              ))}
            </div>
            <div style={{ color, fontSize: 22 }}>{icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: theme === id ? color : 'var(--text-primary)', marginBottom: 3 }}>
                {label}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{desc}</div>
            </div>
            {theme === id && (
              <div style={{
                width: 22, height: 22, borderRadius: '50%', background: color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, color: '#fff', flexShrink: 0,
              }}>✓</div>
            )}
          </button>
        ))}
      </div>

      {/* Board Color Theme */}
      <div style={{ fontSize: 11, letterSpacing: 2, color: 'var(--text-muted)', fontWeight: 700,
        textTransform: 'uppercase', fontFamily: 'Rajdhani,sans-serif', marginTop: 8, marginBottom: 4 }}>
        Board Color
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {BOARD_THEMES.map(({ id, label, colors }) => (
          <button key={id} onClick={() => { setBoardTheme(id); localStorage.setItem('chess3d_boardtheme', id); }} style={{
            padding: '14px 16px', borderRadius: 14, cursor: 'pointer',
            background: boardTheme === id ? 'rgba(212,168,67,0.12)' : 'rgba(255,255,255,0.03)',
            border: `1.5px solid ${boardTheme === id ? 'rgba(212,168,67,0.5)' : 'rgba(255,255,255,0.06)'}`,
            transition: 'all 0.2s', textAlign: 'left',
          }}>
            <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{
                  width: 16, height: 16, borderRadius: 3,
                  background: i % 2 === 0 ? colors[0] : colors[1],
                }}/>
              ))}
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: boardTheme === id ? 'var(--accent-gold)' : 'var(--text-primary)' }}>
              {label}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── About ────────────────────────────────────────────────────────────────────
function AboutSection() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{
        background: 'linear-gradient(135deg,rgba(212,168,67,0.12),rgba(124,58,237,0.06))',
        border: '1px solid rgba(212,168,67,0.25)', borderRadius: 18, padding: 28, textAlign: 'center',
      }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>♛</div>
        <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 20, fontWeight: 900,
          background: 'linear-gradient(135deg,#d4a843,#f0c060)', WebkitBackgroundClip: 'text',
          backgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 6 }}>
          Chess 3D
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: 1 }}>Version 1.0.0 • Premium Edition</div>
      </div>
      {[
        { icon: '🎮', title: 'Game Modes', desc: 'Play vs AI, pass-and-play, or online with friends' },
        { icon: '🧠', title: 'Smart AI', desc: 'Minimax with alpha-beta pruning & positional evaluation' },
        { icon: '📱', title: 'Mobile First', desc: 'Optimized for touch with 3D orbit controls' },
        { icon: '⚡', title: 'Full Rules', desc: 'Castling, en passant, promotion, check & checkmate' },
      ].map(({ icon, title, desc }) => (
        <div key={title} className="glass-card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: '16px 18px' }}>
          <span style={{ fontSize: 26 }}>{icon}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>{title}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>{desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Settings Screen ──────────────────────────────────────────────────────
const TABS = [
  { id: 'theme', label: 'Theme',    icon: <IoColorPalette /> },
  { id: 'game',  label: 'Game',     icon: <IoGameController /> },
  { id: 'about', label: 'About',    icon: <IoInformationCircle /> },
];

export default function SettingsScreen() {
  const [activeTab, setActiveTab] = useState('theme');

  return (
    <div className="screen">
      {/* Header */}
      <div style={{
        padding: '28px 16px 0',
        background: 'linear-gradient(180deg, rgba(124,58,237,0.12) 0%, transparent 100%)',
        animation: 'slideInFromTop 0.4s ease',
      }}>
        <div style={{
          fontFamily: 'Orbitron,sans-serif', fontSize: 22, fontWeight: 900,
          background: 'linear-gradient(135deg,#d4a843,#f0c060)',
          WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: 4,
        }}>Settings</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20, letterSpacing: 0.5 }}>
          Customize your experience
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: 4, gap: 4, marginBottom: 20 }}>
          {TABS.map(({ id, label, icon }) => (
            <button key={id} onClick={() => setActiveTab(id)} style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '11px 8px', borderRadius: 11, cursor: 'pointer',
              background: activeTab === id ? 'linear-gradient(135deg,rgba(212,168,67,0.18),rgba(212,168,67,0.06))' : 'transparent',
              border: activeTab === id ? '1px solid rgba(212,168,67,0.4)' : '1px solid transparent',
              color: activeTab === id ? 'var(--accent-gold)' : 'var(--text-muted)',
              fontSize: 12, fontWeight: 700, fontFamily: 'Inter,sans-serif',
              transition: 'all 0.2s',
              boxShadow: activeTab === id ? '0 2px 12px rgba(212,168,67,0.15)' : 'none',
            }}>
              {icon} {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 16px 16px', animation: 'fadeInUp 0.35s ease' }}>
        {activeTab === 'theme' && <ThemeSettings />}
        {activeTab === 'game'  && <GameSettings />}
        {activeTab === 'about' && <AboutSection />}
      </div>
    </div>
  );
}
