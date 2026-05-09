import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';

const DIFFICULTIES = [
  { id: 'easy',   label: 'Beginner',     icon: '🌱', color: '#4ade80', desc: 'Learn the game' },
  { id: 'medium', label: 'Challenger',   icon: '⚔️', color: '#f59e0b', desc: 'Real challenge' },
  { id: 'hard',   label: 'Master',       icon: '🔥', color: '#f87171', desc: 'Elite play' },
];

const MODES = [
  {
    id: 'vsAI', icon: '🤖', title: 'vs Computer',
    desc: 'Play against AI opponent',
    badge: 'Most Popular', badgeClass: 'badge-gold',
    color1: '#7c3aed', color2: '#4f46e5',
    glow: 'rgba(124,58,237,0.3)',
  },
  {
    id: 'vsHuman', icon: '♟', title: 'Two Players',
    desc: 'Local pass-and-play',
    badge: 'Pass & Play', badgeClass: 'badge-green',
    color1: '#d4a843', color2: '#a07830',
    glow: 'rgba(212,168,67,0.3)',
  },
  {
    id: 'online', icon: '🌐', title: 'Play Online',
    desc: 'Share link with a friend',
    badge: 'Live', badgeClass: 'badge-cyan',
    color1: '#00d4ff', color2: '#4a9eff',
    glow: 'rgba(0,212,255,0.3)',
  },
];

function AnimatedCounter({ value, color }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(value / 20);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(start);
    }, 40);
    return () => clearInterval(timer);
  }, [value]);
  return <span style={{ color, fontWeight: 900, fontSize: 28, fontFamily: 'Orbitron,sans-serif' }}>{display}</span>;
}

export default function HomeScreen() {
  const navigate = useNavigate();
  const { startGame, difficulty, setDifficulty, viewMode, setViewMode, stats } = useGameStore();
  const [visible, setVisible] = useState(false);
  const [hoveredMode, setHoveredMode] = useState(null);

  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

  const handleMode = (modeId) => {
    if (modeId === 'online') { navigate('/online'); return; }
    startGame(modeId, difficulty, 'w');
    navigate('/game');
  };

  return (
    <div className="screen" style={{ padding: '0 16px 16px' }}>

      {/* ── Hero Header ── */}
      <div style={{
        textAlign: 'center', padding: '40px 16px 28px',
        background: 'linear-gradient(180deg, rgba(124,58,237,0.18) 0%, transparent 100%)',
        margin: '0 -16px 24px',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.6s ease',
      }}>
        {/* Floating chess icon */}
        <div className="float-anim" style={{
          width: 82, height: 82, borderRadius: '50%', margin: '0 auto 18px',
          background: 'linear-gradient(135deg, #1a0a30, #0d0d25)',
          border: '2px solid rgba(212,168,67,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 42, boxShadow: '0 0 40px rgba(212,168,67,0.25), 0 0 80px rgba(124,58,237,0.15)',
        }}>♛</div>

        <div className="heading-xl shimmer-text" style={{ marginBottom: 6 }}>CHESS 3D</div>
        <div style={{
          fontSize: 12, letterSpacing: 3, textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.35)', fontFamily: 'Rajdhani,sans-serif', fontWeight: 600,
        }}>
          Premium Chess Experience
        </div>
      </div>

      {/* ── Quick Stats ── */}
      {stats.gamesPlayed > 0 && (
        <div className="glass-card fade-in stagger" style={{
          marginBottom: 22, display: 'flex', justifyContent: 'space-around',
          padding: '18px 12px', borderColor: 'rgba(212,168,67,0.15)',
          background: 'linear-gradient(135deg,rgba(212,168,67,0.06),rgba(124,58,237,0.04))',
        }}>
          {[
            { label: 'Wins', value: stats.wins, color: '#4ade80' },
            { label: 'Games', value: stats.gamesPlayed, color: '#d4a843' },
            { label: 'Streak', value: stats.streak, color: '#a78bfa' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <AnimatedCounter value={value} color={color} />
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Board View Toggle ── */}
      <div style={{ marginBottom: 22, animation: 'fadeInUp 0.5s 0.1s both' }}>
        <div style={{
          fontSize: 10, letterSpacing: 2, textTransform: 'uppercase',
          color: 'var(--text-muted)', fontWeight: 700, marginBottom: 12,
          fontFamily: 'Rajdhani,sans-serif',
        }}>Board View</div>
        <div style={{
          display: 'flex', background: 'rgba(255,255,255,0.03)',
          borderRadius: 14, padding: 4, border: '1px solid var(--border)',
          gap: 4,
        }}>
          {[
            { id: '3d', label: '🧊 3D Board', sub: 'Rotate & zoom' },
            { id: '2d', label: '🗺 2D Board', sub: 'Classic flat' },
          ].map(({ id, label, sub }) => (
            <button key={id} onClick={() => setViewMode(id)} style={{
              flex: 1, padding: '13px 8px', borderRadius: 11, cursor: 'pointer',
              background: viewMode === id
                ? 'linear-gradient(135deg,rgba(212,168,67,0.18),rgba(212,168,67,0.06))'
                : 'transparent',
              border: viewMode === id ? '1px solid rgba(212,168,67,0.4)' : '1px solid transparent',
              color: viewMode === id ? 'var(--accent-gold)' : 'var(--text-muted)',
              fontFamily: 'Inter,sans-serif', fontWeight: 700, fontSize: 13,
              transition: 'all 0.25s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              boxShadow: viewMode === id ? '0 0 20px rgba(212,168,67,0.1)' : 'none',
            }}>
              <span>{label}</span>
              <span style={{ fontSize: 10, fontWeight: 400, opacity: 0.7 }}>{sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Game Mode Cards ── */}
      <div style={{ marginBottom: 22 }}>
        <div style={{
          fontSize: 10, letterSpacing: 2, textTransform: 'uppercase',
          color: 'var(--text-muted)', fontWeight: 700, marginBottom: 14,
          fontFamily: 'Rajdhani,sans-serif',
        }}>Choose Mode</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }} className="stagger">
          {MODES.map(({ id, icon, title, desc, badge, badgeClass, color1, color2, glow }) => (
            <button key={id}
              onClick={() => handleMode(id)}
              onMouseEnter={() => setHoveredMode(id)}
              onMouseLeave={() => setHoveredMode(null)}
              className="fade-in"
              style={{
                textAlign: 'left', cursor: 'pointer', width: '100%',
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '18px 18px',
                background: hoveredMode === id
                  ? `linear-gradient(135deg,rgba(${color1.slice(1).match(/.{2}/g).map(h=>parseInt(h,16)).join(',')},0.18),rgba(${color2.slice(1).match(/.{2}/g).map(h=>parseInt(h,16)).join(',')},0.08))`
                  : 'rgba(255,255,255,0.025)',
                border: `1px solid ${hoveredMode===id ? glow.replace('0.3','0.6') : 'rgba(255,255,255,0.06)'}`,
                borderRadius: 18, transition: 'all 0.25s',
                transform: hoveredMode === id ? 'translateX(4px)' : 'translateX(0)',
                boxShadow: hoveredMode === id ? `0 8px 30px ${glow}` : 'none',
              }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 15, flexShrink: 0,
                background: `linear-gradient(135deg,${color1},${color2})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26, boxShadow: `0 4px 16px ${glow}`,
              }}>{icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 15, fontFamily: 'Inter,sans-serif', marginBottom: 3 }}>{title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{desc}</div>
                <span className={`badge ${badgeClass}`} style={{ marginTop: 8, display: 'inline-block' }}>{badge}</span>
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: 22, opacity: 0.5 }}>›</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── AI Difficulty ── */}
      <div style={{ marginBottom: 22, animation: 'fadeInUp 0.5s 0.3s both' }}>
        <div style={{
          fontSize: 10, letterSpacing: 2, textTransform: 'uppercase',
          color: 'var(--text-muted)', fontWeight: 700, marginBottom: 12,
          fontFamily: 'Rajdhani,sans-serif',
        }}>AI Difficulty</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {DIFFICULTIES.map(d => (
            <button key={d.id} onClick={() => setDifficulty(d.id)} style={{
              flex: 1, padding: '14px 4px', borderRadius: 14, cursor: 'pointer',
              background: difficulty === d.id
                ? `linear-gradient(135deg,${d.color}22,${d.color}08)`
                : 'rgba(255,255,255,0.03)',
              border: `1.5px solid ${difficulty === d.id ? d.color : 'rgba(255,255,255,0.06)'}`,
              textAlign: 'center', transition: 'all 0.25s',
              display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'center',
              boxShadow: difficulty === d.id ? `0 0 20px ${d.color}33` : 'none',
              transform: difficulty === d.id ? 'scale(1.04)' : 'scale(1)',
            }}>
              <span style={{ fontSize: 24 }}>{d.icon}</span>
              <span style={{
                fontSize: 11, fontWeight: 800, fontFamily: 'Inter,sans-serif',
                color: difficulty === d.id ? d.color : 'var(--text-primary)',
                letterSpacing: 0.5,
              }}>{d.label}</span>
              <span style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'Inter,sans-serif' }}>{d.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Feature Highlights ── */}
      <div style={{
        background: 'linear-gradient(135deg,rgba(212,168,67,0.08),rgba(124,58,237,0.05))',
        border: '1px solid rgba(212,168,67,0.2)', borderRadius: 18, padding: '18px 20px',
        animation: 'fadeInUp 0.5s 0.4s both',
      }}>
        <div style={{
          fontSize: 11, letterSpacing: 2, color: 'var(--accent-gold)', fontWeight: 700,
          marginBottom: 14, textTransform: 'uppercase', fontFamily: 'Rajdhani,sans-serif',
        }}>✨ Features</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { icon: '🧊', text: '3D & 2D Interactive Board' },
            { icon: '🌐', text: 'Online Multiplayer via Link' },
            { icon: '🤖', text: 'Smart AI with 3 Levels' },
            { icon: '📊', text: 'Stats & Achievement Tracking' },
          ].map(({ icon, text }) => (
            <div key={text} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 16 }}>{icon}</span>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
