import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { IoTrophy, IoFlash, IoGameController, IoCamera, IoPencil, IoCheckmark, IoClose } from 'react-icons/io5';

const AVATAR_EMOJIS = ['♟','♛','♜','♝','♞','♔','🏆','⚔️','🎯','🌟','🔥','💎'];

function WinRateRing({ wins, total }) {
  const pct = total > 0 ? Math.round((wins / total) * 100) : 0;
  const r = 44, circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width="114" height="114" viewBox="0 0 114 114">
      <circle cx="57" cy="57" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10"/>
      <circle cx="57" cy="57" r={r} fill="none"
        stroke="url(#goldGrad)" strokeWidth="10"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 57 57)"
        style={{ transition: 'stroke-dasharray 1.5s ease' }}
      />
      <defs>
        <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d4a843"/>
          <stop offset="100%" stopColor="#f0c060"/>
        </linearGradient>
      </defs>
      <text x="57" y="52" textAnchor="middle" fill="#f0f0ff" fontSize="20" fontWeight="900" fontFamily="Orbitron">{pct}%</text>
      <text x="57" y="67" textAnchor="middle" fill="#44445a" fontSize="8" fontFamily="Inter" fontWeight="700" letterSpacing="1">WIN RATE</text>
    </svg>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{
      flex: 1, textAlign: 'center', padding: '16px 10px',
      background: `linear-gradient(135deg,${color}15,${color}05)`,
      border: `1px solid ${color}30`, borderRadius: 16,
      transition: 'transform 0.2s',
    }}>
      <div style={{ fontSize: 22, color, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 22, fontWeight: 900, color, fontFamily: 'Orbitron,sans-serif' }}>{value}</div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>{label}</div>
    </div>
  );
}

const STORAGE_KEY = 'chess3d_profile';

function loadProfile() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
}

export default function ProfileScreen() {
  const stats = useGameStore(s => s.stats);
  const { wins, losses, draws, streak, gamesPlayed } = stats;

  // Profile state from localStorage
  const [profile, setProfile] = useState(() => ({
    name: 'Player One', title: '', bio: '',
    country: '', avatar: '♟', ...loadProfile(),
  }));
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(profile);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [saved, setSaved] = useState(false);

  const saveProfile = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    setProfile(draft);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const cancelEdit = () => { setDraft(profile); setEditing(false); setShowAvatarPicker(false); };

  const milestones = [
    { icon: '🥉', label: 'First Game',   target: 1,  value: gamesPlayed, color: '#cd7f32' },
    { icon: '🥈', label: '5 Wins',       target: 5,  value: wins,        color: '#c0c0c0' },
    { icon: '🥇', label: '10 Wins',      target: 10, value: wins,        color: '#d4a843' },
    { icon: '🔥', label: '3 Win Streak', target: 3,  value: streak,      color: '#f87171' },
    { icon: '👑', label: '25 Games',     target: 25, value: gamesPlayed, color: '#a78bfa' },
  ];

  return (
    <div className="screen" style={{ padding: '0 16px 16px' }}>

      {/* ── Header ── */}
      <div style={{
        padding: '32px 0 24px', textAlign: 'center',
        background: 'linear-gradient(180deg, rgba(212,168,67,0.12) 0%, transparent 100%)',
        margin: '0 -16px 24px', paddingLeft: 16, paddingRight: 16,
        animation: 'slideInFromTop 0.5s ease',
      }}>
        {/* Avatar */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
          <div className="avatar-ring" style={{ width: 90, height: 90 }}>
            <div className="avatar-inner" style={{ width: 84, height: 84 }}>
              <span style={{ fontSize: 42 }}>{profile.avatar}</span>
            </div>
          </div>
          {editing && (
            <button onClick={() => setShowAvatarPicker(!showAvatarPicker)} style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--accent-gold)', border: '2px solid var(--bg-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: 13, color: '#050510',
            }}>
              <IoCamera />
            </button>
          )}
        </div>

        {/* Avatar Picker */}
        {showAvatarPicker && (
          <div className="scale-in" style={{
            display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center',
            marginBottom: 16, padding: '12px 16px',
            background: 'rgba(255,255,255,0.05)', borderRadius: 14,
            border: '1px solid var(--border)',
          }}>
            {AVATAR_EMOJIS.map(em => (
              <button key={em} onClick={() => { setDraft(p=>({...p,avatar:em})); setShowAvatarPicker(false); }} style={{
                width: 44, height: 44, borderRadius: 12, fontSize: 24,
                background: draft.avatar === em ? 'rgba(212,168,67,0.2)' : 'rgba(255,255,255,0.04)',
                border: draft.avatar === em ? '2px solid var(--accent-gold)' : '1px solid var(--border)',
                cursor: 'pointer', transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{em}</button>
            ))}
          </div>
        )}

        {/* Name & Edit */}
        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 8, alignItems: 'center' }}>
            <input className="profile-input" value={draft.name} placeholder="Your name"
              maxLength={24} onChange={e=>setDraft(p=>({...p,name:e.target.value}))}
              style={{ textAlign:'center', fontSize:18, fontWeight:700, maxWidth:260 }}
            />
            <input className="profile-input" value={draft.title} placeholder="Chess title (e.g. Club Player)"
              maxLength={30} onChange={e=>setDraft(p=>({...p,title:e.target.value}))}
              style={{ textAlign:'center', fontSize:13, maxWidth:260 }}
            />
          </div>
        ) : (
          <>
            <div style={{
              fontSize: 22, fontWeight: 800, fontFamily: 'Inter,sans-serif',
              marginBottom: 4, color: 'var(--text-primary)',
            }}>{profile.name}</div>
            {profile.title && (
              <div className="badge badge-gold" style={{ marginBottom: 6 }}>{profile.title}</div>
            )}
          </>
        )}

        <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 12 }}>
          {gamesPlayed} games played
        </div>
        {streak >= 2 && !editing && (
          <div className="badge badge-gold" style={{ marginBottom: 12 }}>🔥 {streak} Win Streak</div>
        )}

        {/* Edit / Save buttons */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          {editing ? (
            <>
              <button onClick={cancelEdit} style={{
                display:'flex', alignItems:'center', gap:6,
                padding:'9px 18px', borderRadius:10, cursor:'pointer',
                background:'rgba(255,255,255,0.06)', border:'1px solid var(--border)',
                color:'var(--text-muted)', fontSize:13, fontFamily:'Inter,sans-serif', fontWeight:600,
              }}><IoClose/> Cancel</button>
              <button onClick={saveProfile} style={{
                display:'flex', alignItems:'center', gap:6,
                padding:'9px 18px', borderRadius:10, cursor:'pointer',
                background:'linear-gradient(135deg,#d4a843,#a07830)',
                border:'none', color:'#050510', fontSize:13,
                fontFamily:'Inter,sans-serif', fontWeight:800,
                boxShadow:'0 4px 16px rgba(212,168,67,0.4)',
              }}><IoCheckmark/> Save Profile</button>
            </>
          ) : (
            <button onClick={()=>{setDraft(profile);setEditing(true);}} style={{
              display:'flex', alignItems:'center', gap:6,
              padding:'9px 18px', borderRadius:10, cursor:'pointer',
              background:'rgba(212,168,67,0.1)', border:'1px solid rgba(212,168,67,0.3)',
              color:'var(--accent-gold)', fontSize:13,
              fontFamily:'Inter,sans-serif', fontWeight:700,
            }}><IoPencil/> Edit Profile</button>
          )}
        </div>
        {saved && <div className="badge badge-green" style={{ marginTop:10 }}>✓ Saved!</div>}
      </div>

      {/* ── Bio & Country (edit mode) ── */}
      {editing && (
        <div className="glass-card fade-in" style={{ marginBottom: 20, display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ fontSize:11, letterSpacing:2, color:'var(--text-muted)', fontWeight:700, textTransform:'uppercase', fontFamily:'Rajdhani,sans-serif' }}>
            Personal Info
          </div>
          <input className="profile-input" value={draft.country} placeholder="Country / City"
            maxLength={30} onChange={e=>setDraft(p=>({...p,country:e.target.value}))}
          />
          <textarea className="profile-input" value={draft.bio} placeholder="Write something about yourself..."
            maxLength={120} rows={3} onChange={e=>setDraft(p=>({...p,bio:e.target.value}))}
            style={{ resize:'none', lineHeight:1.6 }}
          />
          <div style={{ fontSize:11, color:'var(--text-muted)', textAlign:'right' }}>{(draft.bio||'').length}/120</div>
        </div>
      )}

      {/* ── Bio display ── */}
      {!editing && (profile.bio || profile.country) && (
        <div className="glass-card fade-in" style={{ marginBottom: 20, display:'flex', flexDirection:'column', gap:8 }}>
          {profile.country && (
            <div style={{ fontSize:13, color:'var(--text-secondary)' }}>📍 {profile.country}</div>
          )}
          {profile.bio && (
            <div style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.6, fontStyle:'italic' }}>
              "{profile.bio}"
            </div>
          )}
        </div>
      )}

      {/* ── Win Rate ── */}
      <div className="glass-card fade-in" style={{
        display:'flex', alignItems:'center', gap:24, marginBottom:16, padding:'20px 24px',
        background:'linear-gradient(135deg,rgba(212,168,67,0.05),rgba(124,58,237,0.04))',
      }}>
        <WinRateRing wins={wins} total={gamesPlayed}/>
        <div style={{ flex:1, display:'flex', flexDirection:'column', gap:12 }}>
          {[
            { label:'Wins',   value:wins,   color:'#4ade80' },
            { label:'Losses', value:losses, color:'#f87171' },
            { label:'Draws',  value:draws,  color:'#94a3b8' },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ fontSize:12, color:'var(--text-secondary)', fontWeight:600 }}>{label}</span>
                <span style={{ fontSize:13, fontWeight:800, color }}>{value}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{
                  width: gamesPlayed>0 ? `${(value/gamesPlayed)*100}%` : '0%',
                  background: color,
                }}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display:'flex', gap:10, marginBottom:22 }}>
        <StatCard icon={<IoTrophy/>} label="Streak" value={streak}      color="#d4a843"/>
        <StatCard icon={<IoGameController/>} label="Games" value={gamesPlayed} color="#7c3aed"/>
        <StatCard icon={<IoFlash/>}  label="Wins"   value={wins}        color="#4ade80"/>
      </div>

      {/* ── Achievements ── */}
      <div style={{ fontSize:11, letterSpacing:2, color:'var(--text-muted)', fontWeight:700,
        textTransform:'uppercase', fontFamily:'Rajdhani,sans-serif', marginBottom:14 }}>
        🏆 Achievements
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }} className="stagger">
        {milestones.map(({ icon, label, target, value, color }) => {
          const done = value >= target;
          const progress = Math.min(1, value / target);
          return (
            <div key={label} className="glass-card fade-in" style={{
              display:'flex', alignItems:'center', gap:16, padding:'14px 18px',
              opacity: done ? 1 : 0.55,
              borderColor: done ? `${color}50` : 'var(--border)',
              background: done ? `linear-gradient(135deg,${color}12,${color}04)` : 'var(--bg-glass)',
              transition:'all 0.3s',
            }}>
              <span style={{ fontSize:30, filter: done?'none':'grayscale(100%)' }}>{icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:14, color: done?'var(--text-primary)':'var(--text-secondary)', marginBottom:6 }}>
                  {label}
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{
                    width:`${progress*100}%`,
                    background: done ? `linear-gradient(90deg,${color},${color}bb)` : 'var(--accent-purple)',
                  }}/>
                </div>
                <div style={{ fontSize:10, color:'var(--text-muted)', marginTop:4, fontWeight:600 }}>
                  {Math.min(value,target)} / {target}
                </div>
              </div>
              {done && <span style={{ color:'#4ade80', fontSize:20 }}>✓</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
