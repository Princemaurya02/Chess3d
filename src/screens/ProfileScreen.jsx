import { useGameStore } from '../store/gameStore';
import { IoTrophy, IoFlash, IoSkull, IoGameController } from 'react-icons/io5';

function StatCard({ icon, label, value, color }) {
  return (
    <div className="glass-card" style={{ textAlign: 'center', flex: 1, padding: '18px 12px' }}>
      <div style={{ fontSize: 26, color, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{label}</div>
    </div>
  );
}

function WinRateRing({ wins, total }) {
  const pct = total > 0 ? Math.round((wins / total) * 100) : 0;
  const r = 42, circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={r} fill="none" stroke="var(--border)" strokeWidth="10" />
        <circle
          cx="55" cy="55" r={r} fill="none"
          stroke="var(--accent-gold)" strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 55 55)"
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
        <text x="55" y="58" textAnchor="middle" fill="var(--text-primary)" fontSize="18" fontWeight="800" fontFamily="Inter">
          {pct}%
        </text>
        <text x="55" y="72" textAnchor="middle" fill="var(--text-muted)" fontSize="9" fontFamily="Inter">
          WIN RATE
        </text>
      </svg>
    </div>
  );
}

export default function ProfileScreen() {
  const stats = useGameStore(s => s.stats);
  const { wins, losses, draws, streak, gamesPlayed } = stats;

  const milestones = [
    { icon: '🥉', label: 'First Game', target: 1, value: gamesPlayed },
    { icon: '🥈', label: '5 Wins', target: 5, value: wins },
    { icon: '🥇', label: '10 Wins', target: 10, value: wins },
    { icon: '🔥', label: '3 Win Streak', target: 3, value: streak },
    { icon: '👑', label: '25 Games', target: 25, value: gamesPlayed },
  ];

  return (
    <div className="screen" style={{ padding: '0 16px 16px' }}>
      {/* Header */}
      <div style={{
        padding: '32px 0 20px',
        textAlign: 'center',
        background: 'linear-gradient(180deg, rgba(201,168,76,0.1) 0%, transparent 100%)',
        margin: '0 -16px 20px', paddingLeft: 16, paddingRight: 16,
      }}>
        {/* Avatar */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'linear-gradient(135deg, #7c3aed, #c9a84c)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 12px',
          fontSize: 38,
          boxShadow: '0 0 30px rgba(201,168,76,0.3)',
        }}>♔</div>
        <div className="heading-md">Player One</div>
        <div className="text-muted" style={{ marginTop: 4 }}>{gamesPlayed} games played</div>
        {streak >= 2 && (
          <div className="badge badge-gold" style={{ marginTop: 10 }}>🔥 {streak} Win Streak</div>
        )}
      </div>

      {/* Win Rate */}
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 16, padding: '20px 24px' }}>
        <WinRateRing wins={wins} total={gamesPlayed} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Wins', value: wins, color: '#4ade80' },
              { label: 'Losses', value: losses, color: '#f87171' },
              { label: 'Draws', value: draws, color: '#94a3b8' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
                <span style={{ fontSize: 15, fontWeight: 700, color }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick stats row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <StatCard icon={<IoTrophy />} label="Best Streak" value={streak} color="#c9a84c" />
        <StatCard icon={<IoGameController />} label="Games" value={gamesPlayed} color="#7c3aed" />
        <StatCard icon={<IoFlash />} label="Wins" value={wins} color="#4ade80" />
      </div>

      {/* Achievements */}
      <div className="heading-md" style={{ marginBottom: 14 }}>Achievements</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {milestones.map(({ icon, label, target, value }) => {
          const done = value >= target;
          const progress = Math.min(1, value / target);
          return (
            <div key={label} className="glass-card" style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
              opacity: done ? 1 : 0.6,
              borderColor: done ? 'var(--border-gold)' : 'var(--border)',
              background: done ? 'linear-gradient(135deg, rgba(201,168,76,0.08), rgba(10,10,26,0.5))' : 'var(--bg-glass)',
            }}>
              <span style={{ fontSize: 28, filter: done ? 'none' : 'grayscale(100%)' }}>{icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: done ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  {label}
                </div>
                <div style={{
                  height: 4, background: 'var(--border)', borderRadius: 2, marginTop: 6, overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%', borderRadius: 2, transition: 'width 1s ease',
                    width: `${progress * 100}%`,
                    background: done ? 'var(--accent-gold)' : 'var(--accent-purple)',
                  }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                  {Math.min(value, target)} / {target}
                </div>
              </div>
              {done && <span style={{ color: '#4ade80', fontSize: 18 }}>✓</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
