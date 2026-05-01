import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoPeople, IoGlobe } from 'react-icons/io5';
import { GiChessBishop } from 'react-icons/gi';
import { useGameStore } from '../store/gameStore';

const DIFFICULTIES = [
  { id: 'easy',   label: 'Beginner',     icon: '🌱', desc: 'Perfect for learning' },
  { id: 'medium', label: 'Intermediate', icon: '⚔️', desc: 'A real challenge' },
  { id: 'hard',   label: 'Advanced',     icon: '🔥', desc: 'Can you win?' },
];

const MODES = [
  {
    id: 'vsAI', icon: '🤖', title: 'vs Computer',
    desc: 'Play against AI opponent', badge: 'Most Popular', badgeClass: 'badge-gold',
    gradient: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(10,10,26,0.5))',
  },
  {
    id: 'vsHuman', icon: '👥', title: 'Two Players',
    desc: 'Local pass-and-play', badge: 'Pass & Play', badgeClass: 'badge-green',
    gradient: 'linear-gradient(135deg, rgba(201,168,76,0.08), rgba(10,10,26,0.5))',
  },
  {
    id: 'online', icon: '🌐', title: 'Play Online',
    desc: 'Share link with a friend', badge: 'Live', badgeClass: 'badge-red',
    gradient: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(10,10,26,0.5))',
  },
];

export default function HomeScreen() {
  const navigate = useNavigate();
  const { startGame, difficulty, setDifficulty, viewMode, setViewMode, stats } = useGameStore();

  const handleMode = (modeId) => {
    if (modeId === 'online') { navigate('/online'); return; }
    startGame(modeId, difficulty, 'w');
    navigate('/game');
  };

  return (
    <div className="screen" style={{ padding: '0 16px 16px' }}>
      {/* Header */}
      <div style={{
        textAlign: 'center', padding: '36px 16px 24px',
        background: 'linear-gradient(180deg, rgba(124,58,237,0.15) 0%, transparent 100%)',
        margin: '0 -16px 20px',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'linear-gradient(135deg, #c9a84c, #7c3aed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 30px rgba(201,168,76,0.3)',
          fontSize: 36, margin: '0 auto 14px',
        }}>♛</div>
        <div className="heading-xl text-gold" style={{ marginBottom: 4 }}>CHESS 3D</div>
        <div className="text-muted">Mobile-First Chess Experience</div>
      </div>

      {/* Quick Stats */}
      {stats.gamesPlayed > 0 && (
        <div className="glass-card fade-in" style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-around' }}>
          {[
            { label: 'Wins', value: stats.wins, color: '#4ade80' },
            { label: 'Losses', value: stats.losses, color: '#f87171' },
            { label: 'Streak', value: stats.streak, color: '#c9a84c' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* View Mode Toggle */}
      <div style={{ marginBottom: 20 }}>
        <div className="heading-md" style={{ marginBottom: 12 }}>Board View</div>
        <div style={{
          display: 'flex', background: 'var(--bg-glass)',
          borderRadius: 12, padding: 4, border: '1px solid var(--border)',
        }}>
          {[
            { id: '3d', label: '🧊 3D Board', desc: 'Rotate & zoom' },
            { id: '2d', label: '🗺 2D Board', desc: 'Classic flat' },
          ].map(({ id, label, desc }) => (
            <button
              key={id}
              onClick={() => setViewMode(id)}
              style={{
                flex: 1, padding: '12px 8px', borderRadius: 9, cursor: 'pointer',
                background: viewMode === id ? 'var(--bg-card)' : 'transparent',
                border: viewMode === id ? '1px solid var(--border-gold)' : '1px solid transparent',
                color: viewMode === id ? 'var(--accent-gold)' : 'var(--text-muted)',
                fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 13,
                transition: 'all 0.2s',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              }}
            >
              <span>{label}</span>
              <span style={{ fontSize: 10, fontWeight: 400, color: viewMode === id ? 'rgba(201,168,76,0.7)' : 'var(--text-muted)' }}>{desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Game Modes */}
      <div style={{ marginBottom: 20 }}>
        <div className="heading-md" style={{ marginBottom: 12 }}>Choose Mode</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {MODES.map(({ id, icon, title, desc, badge, badgeClass, gradient }) => (
            <button
              key={id}
              onClick={() => handleMode(id)}
              className="glass-card"
              style={{
                textAlign: 'left', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '16px 18px', background: gradient,
                border: '1px solid var(--border)',
                transition: 'all 0.2s', width: '100%',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-gold)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{
                width: 50, height: 50, borderRadius: 14, flexShrink: 0,
                background: id === 'vsAI' ? 'linear-gradient(135deg, #7c3aed, #4f46e5)'
                           : id === 'vsHuman' ? 'linear-gradient(135deg, #c9a84c, #a07830)'
                           : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
              }}>{icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{title}</div>
                <div className="text-muted" style={{ marginTop: 2, fontSize: 12 }}>{desc}</div>
                <span className={`badge ${badgeClass}`} style={{ marginTop: 8, display: 'inline-block' }}>{badge}</span>
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: 20 }}>›</span>
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty (only relevant for AI) */}
      <div style={{ marginBottom: 20 }}>
        <div className="heading-md" style={{ marginBottom: 12 }}>AI Difficulty</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {DIFFICULTIES.map(d => (
            <button
              key={d.id}
              onClick={() => setDifficulty(d.id)}
              style={{
                flex: 1, padding: '13px 4px', borderRadius: 12, cursor: 'pointer',
                background: difficulty === d.id ? 'linear-gradient(135deg,rgba(201,168,76,0.2),rgba(201,168,76,0.04))' : 'var(--bg-glass)',
                border: `1px solid ${difficulty === d.id ? 'var(--accent-gold)' : 'var(--border)'}`,
                textAlign: 'center', transition: 'all 0.2s',
                display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'center',
              }}
            >
              <span style={{ fontSize: 22 }}>{d.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'Inter,sans-serif', color: difficulty === d.id ? 'var(--accent-gold)' : 'var(--text-primary)' }}>
                {d.label}
              </span>
              <span style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'Inter,sans-serif' }}>{d.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Feature list */}
      <div className="gold-card">
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-gold)', marginBottom: 10 }}>✨ Features</div>
        {['3D & 2D Interactive Board', 'Online Multiplayer via Link', 'Custom Piece Skins', 'Smart AI Opponent'].map(f => (
          <div key={f} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
            <span style={{ color: '#4ade80', fontSize: 14 }}>✓</span>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{f}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
