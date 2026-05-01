import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import CustomizePanel from '../features/ui/CustomizePanel';
import { IoColorPalette, IoGameController, IoInformationCircle } from 'react-icons/io5';

const TABS = [
  { id: 'pieces', label: 'Pieces', icon: <IoColorPalette /> },
  { id: 'board', label: 'Board', icon: <IoGameController /> },
  { id: 'about', label: 'About', icon: <IoInformationCircle /> },
];

function BoardSettings() {
  const { showCoordinates, setShowCoordinates, boardRotated, setBoardRotated, soundEnabled, setSoundEnabled, difficulty, setDifficulty } = useGameStore();

  const rows = [
    { label: 'Show Coordinates', desc: 'Display rank/file labels', value: showCoordinates, set: setShowCoordinates },
    { label: 'Rotate Board', desc: 'View from Black\'s perspective', value: boardRotated, set: setBoardRotated },
    { label: 'Sound Effects', desc: 'Move and capture sounds', value: soundEnabled, set: setSoundEnabled },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {rows.map(({ label, desc, value, set }) => (
        <div key={label} className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{label}</div>
            <div className="text-muted" style={{ marginTop: 2 }}>{desc}</div>
          </div>
          <button className={`toggle ${value ? 'on' : ''}`} onClick={() => set(!value)} />
        </div>
      ))}

      <div className="glass-card" style={{ padding: '16px 20px' }}>
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>Default AI Difficulty</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['easy', 'medium', 'hard'].map(d => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              style={{
                flex: 1, padding: '10px 4px', borderRadius: 8, cursor: 'pointer',
                background: difficulty === d ? 'rgba(201,168,76,0.2)' : 'var(--bg-glass)',
                border: `1px solid ${difficulty === d ? 'var(--accent-gold)' : 'var(--border)'}`,
                color: difficulty === d ? 'var(--accent-gold)' : 'var(--text-secondary)',
                fontSize: 12, fontWeight: 700, fontFamily: 'Inter, sans-serif',
                textTransform: 'capitalize', transition: 'all 0.2s',
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function AboutSection() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="gold-card" style={{ textAlign: 'center', padding: 28 }}>
        <div style={{ fontSize: 52, marginBottom: 10 }}>♛</div>
        <div className="heading-lg text-gold">Chess 3D</div>
        <div className="text-muted" style={{ marginTop: 6 }}>Version 1.0.0</div>
      </div>
      {[
        { icon: '🎮', title: 'Game Modes', desc: 'Play vs AI or pass-and-play multiplayer' },
        { icon: '🧠', title: 'Smart AI', desc: 'Minimax algorithm with alpha-beta pruning & positional evaluation' },
        { icon: '🎨', title: 'Custom Pieces', desc: 'Upload your own images as piece textures' },
        { icon: '📱', title: 'Mobile First', desc: 'Optimized for touch devices with orbit controls' },
        { icon: '⚡', title: 'Full Rules', desc: 'Castling, en passant, pawn promotion, check & checkmate' },
      ].map(({ icon, title, desc }) => (
        <div key={title} className="glass-card" style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '14px 16px' }}>
          <span style={{ fontSize: 24 }}>{icon}</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{title}</div>
            <div className="text-muted" style={{ marginTop: 3, lineHeight: 1.5 }}>{desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SettingsScreen() {
  const [activeTab, setActiveTab] = useState('pieces');

  return (
    <div className="screen">
      {/* Header */}
      <div style={{
        padding: '24px 16px 0',
        background: 'linear-gradient(180deg, rgba(124,58,237,0.1) 0%, transparent 100%)',
      }}>
        <div className="heading-lg" style={{ marginBottom: 4 }}>Settings</div>
        <div className="text-muted" style={{ marginBottom: 20 }}>Customize your experience</div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, background: 'var(--bg-glass)', borderRadius: 12, padding: 4, marginBottom: 20 }}>
          {TABS.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '10px 8px', borderRadius: 9, cursor: 'pointer',
                background: activeTab === id ? 'var(--bg-card)' : 'transparent',
                border: activeTab === id ? '1px solid var(--border)' : '1px solid transparent',
                color: activeTab === id ? 'var(--accent-gold)' : 'var(--text-muted)',
                fontSize: 13, fontWeight: 600, fontFamily: 'Inter, sans-serif',
                transition: 'all 0.2s',
              }}
            >
              {icon} {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 16px 16px' }}>
        {activeTab === 'pieces' && <CustomizePanel />}
        {activeTab === 'board' && <BoardSettings />}
        {activeTab === 'about' && <AboutSection />}
      </div>
    </div>
  );
}
