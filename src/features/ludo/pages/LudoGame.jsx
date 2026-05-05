import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useLudo } from '../hooks/useLudo';
import LudoBoard from '../components/LudoBoard';
import LudoDice from '../components/LudoDice';
import { COLORS, DONE } from '../engine/ludoConstants';
import { IoArrowBack, IoRefresh } from 'react-icons/io5';

const PC = {
  red:    { emoji:'🔴', name:'Red',    grad:'linear-gradient(135deg,#e53935,#b71c1c)', text:'#fff', light:'#ef9a9a' },
  green:  { emoji:'🟢', name:'Green',  grad:'linear-gradient(135deg,#2e7d32,#1b5e20)', text:'#fff', light:'#a5d6a7' },
  yellow: { emoji:'🟡', name:'Yellow', grad:'linear-gradient(135deg,#f9a825,#e65100)', text:'#111', light:'#fff176' },
  blue:   { emoji:'🔵', name:'Blue',   grad:'linear-gradient(135deg,#1565c0,#0d47a1)', text:'#fff', light:'#90caf9' },
};

// ─── Token progress pips ─────────────────────────────────────────────────────
function TokenPips({ tokens, color }) {
  const done = tokens.filter(t => t === DONE).length;
  return (
    <div style={{ display:'flex', gap: 3, marginTop: 3 }}>
      {tokens.map((t, i) => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius:'50%',
          background: t === TOKEN_COMPLETE ? PC[color].light : 'rgba(255,255,255,0.2)',
          border: '1px solid rgba(255,255,255,0.4)',
          transition: 'background 0.3s',
        }} />
      ))}
    </div>
  );
}

// ─── Compact player chip ─────────────────────────────────────────────────────
function PlayerChip({ color, isCurrent, tokens }) {
  const p = PC[color];
  return (
    <div style={{
      display:'flex', flexDirection:'column', alignItems:'center',
      padding:'6px 10px', borderRadius:10, minWidth: 60,
      background: isCurrent ? p.grad : 'rgba(255,255,255,0.07)',
      border: `1.5px solid ${isCurrent ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)'}`,
      boxShadow: isCurrent ? '0 4px 16px rgba(0,0,0,0.4)' : 'none',
      transition: 'all 0.35s ease',
      transform: isCurrent ? 'scale(1.08)' : 'scale(1)',
    }}>
      <span style={{ fontSize: 18, lineHeight: 1 }}>{p.emoji}</span>
      <span style={{ fontSize: 10, fontWeight: 700, color: isCurrent ? p.text : 'rgba(255,255,255,0.5)', marginTop: 2, fontFamily:'Inter,sans-serif' }}>
        {p.name}
      </span>
      <TokenPips tokens={tokens} color={color} />
    </div>
  );
}

// ─── Game Over Modal ─────────────────────────────────────────────────────────
function GameOverModal({ winner, onRestart, onHome }) {
  const p = PC[winner];
  return (
    <div style={{
      position:'fixed', inset:0, zIndex:100,
      background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)',
      display:'flex', alignItems:'center', justifyContent:'center',
    }}>
      <div style={{
        background:'#0d0d20', border:'2px solid rgba(255,255,255,0.15)',
        borderRadius:20, padding:'32px 28px', textAlign:'center',
        maxWidth:320, width:'90%', boxShadow:'0 20px 60px rgba(0,0,0,0.8)',
      }}>
        <div style={{ fontSize:64 }}>🏆</div>
        <div style={{
          background: p.grad, borderRadius:12, padding:'12px 24px', margin:'16px 0',
        }}>
          <div style={{ fontSize:22, fontWeight:800, color: p.text, fontFamily:'Orbitron,sans-serif' }}>
            {p.emoji} {p.name} Wins!
          </div>
        </div>
        <div style={{ color:'rgba(255,255,255,0.6)', fontSize:13, marginBottom:24 }}>
          Congratulations! 🎉
        </div>
        <div style={{ display:'flex', gap:12 }}>
          <button onClick={onHome} style={{
            flex:1, padding:'12px', borderRadius:10, cursor:'pointer',
            background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)',
            color:'#fff', fontSize:14, fontWeight:600, fontFamily:'Inter,sans-serif',
          }}>Home</button>
          <button onClick={onRestart} style={{
            flex:1, padding:'12px', borderRadius:10, cursor:'pointer',
            background: p.grad, border:'none',
            color: p.text, fontSize:14, fontWeight:700, fontFamily:'Inter,sans-serif',
          }}>Play Again</button>
        </div>
      </div>
    </div>
  );
}

// ─── Setup Screen ─────────────────────────────────────────────────────────────
function SetupScreen({ onStart }) {
  return (
    <div style={{
      minHeight:'100dvh', display:'flex', flexDirection:'column',
      background:'radial-gradient(ellipse at top,#1a0028 0%,#0a0014 100%)',
      padding:'0 16px 16px',
    }}>
      {/* Hero */}
      <div style={{
        textAlign:'center', padding:'40px 16px 28px',
        background:'linear-gradient(180deg,rgba(233,30,99,0.15) 0%,transparent 100%)',
        margin:'0 -16px 24px', paddingLeft:16, paddingRight:16,
      }}>
        <div style={{ fontSize:72, marginBottom:12, filter:'drop-shadow(0 0 20px rgba(255,100,100,0.5))' }}>🎲</div>
        <div style={{
          fontSize:42, fontWeight:900, letterSpacing:6,
          fontFamily:'Orbitron,sans-serif', color:'transparent',
          backgroundImage:'linear-gradient(135deg,#ff6b6b,#ffd93d,#6bcb77,#4d96ff)',
          WebkitBackgroundClip:'text', backgroundClip:'text',
          marginBottom:8,
        }}>LUDO</div>
        <div style={{ color:'rgba(255,255,255,0.5)', fontSize:13 }}>Classic board game, reimagined</div>
      </div>

      {/* Player count */}
      <div style={{ fontWeight:700, fontSize:14, color:'rgba(255,255,255,0.7)', marginBottom:14, fontFamily:'Inter,sans-serif' }}>
        Select Number of Players
      </div>
      <div style={{ display:'flex', gap:12, marginBottom:28 }}>
        {[2,3,4].map(n => (
          <button key={n} onClick={() => onStart(n)} style={{
            flex:1, padding:'20px 0', borderRadius:16, cursor:'pointer',
            background:'rgba(255,255,255,0.05)',
            border:'1.5px solid rgba(255,255,255,0.12)',
            display:'flex', flexDirection:'column', alignItems:'center', gap:8,
            transition:'all 0.2s', fontFamily:'Inter,sans-serif',
          }}
          onMouseEnter={e => { e.currentTarget.style.background='rgba(233,30,99,0.15)'; e.currentTarget.style.borderColor='#e91e63'; }}
          onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.12)'; }}
          >
            <span style={{ fontSize:24 }}>{'👤'.repeat(n)}</span>
            <span style={{ fontSize:24, fontWeight:900, color:'#ff6b6b', fontFamily:'Orbitron,sans-serif' }}>{n}</span>
            <span style={{ fontSize:11, color:'rgba(255,255,255,0.45)' }}>Players</span>
          </button>
        ))}
      </div>

      {/* Color preview */}
      <div style={{
        background:'rgba(255,255,255,0.04)', borderRadius:14,
        border:'1px solid rgba(255,255,255,0.08)', padding:'16px', marginBottom:20,
      }}>
        <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)', marginBottom:12, fontWeight:600 }}>PLAYER COLORS</div>
        <div style={{ display:'flex', gap:8 }}>
          {COLORS.map(c => (
            <div key={c} style={{
              flex:1, padding:'10px 6px', borderRadius:10,
              background: PC[c].grad, display:'flex', flexDirection:'column',
              alignItems:'center', gap:4,
            }}>
              <span style={{ fontSize:20 }}>{PC[c].emoji}</span>
              <span style={{ fontSize:10, color: PC[c].text, fontWeight:700 }}>{PC[c].name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rules */}
      <div style={{
        background:'rgba(255,255,255,0.04)', borderRadius:14,
        border:'1px solid rgba(255,255,255,0.08)', padding:'16px',
      }}>
        <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)', marginBottom:10, fontWeight:700 }}>🎮 HOW TO PLAY</div>
        {[
          ['🎲','Roll 6 to move a token out of base'],
          ['🔄','Move all tokens clockwise around the board'],
          ['💥','Land on opponent to send them back!'],
          ['⭐','Safe squares protect your tokens'],
          ['🏆','Get all 4 tokens home to win'],
        ].map(([icon, rule]) => (
          <div key={rule} style={{ display:'flex', gap:10, marginBottom:8, alignItems:'flex-start' }}>
            <span>{icon}</span>
            <span style={{ fontSize:12, color:'rgba(255,255,255,0.6)', lineHeight:1.5 }}>{rule}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Game Screen ─────────────────────────────────────────────────────────
export default function LudoGame() {
  const navigate = useNavigate();
  const [numPlayers, setNumPlayers] = useState(4);
  const [started, setStarted] = useState(false);
  const { state, current, start, roll, select } = useLudo(numPlayers);

  const handleStart = (n) => {
    setNumPlayers(n);
    setStarted(true);
    start(n);
  };

  if (!started) return <SetupScreen onStart={handleStart} />;

  const activePlayers = state.order || COLORS.slice(0, numPlayers);
  const canRoll = !state.rolled && state.phase === 'playing';
  const curP = current ? PC[current] : null;

  return (
    <div style={{
      height:'100dvh', width:'100vw',
      display:'flex', flexDirection:'column',
      background:'radial-gradient(ellipse at center, #1a0a2e 0%, #0a0a1a 100%)',
      overflow:'hidden', position:'fixed', inset:0,
    }}>

      {/* ── Top bar ── */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'8px 12px', flexShrink:0,
        background:'rgba(0,0,0,0.5)', backdropFilter:'blur(10px)',
        borderBottom:'1px solid rgba(255,255,255,0.08)',
      }}>
        <button onClick={() => navigate('/')} style={{
          background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)',
          borderRadius:8, padding:'7px 12px', cursor:'pointer', color:'#fff',
          display:'flex', alignItems:'center', gap:6, fontSize:13, fontFamily:'Inter,sans-serif',
        }}>
          <IoArrowBack /> Back
        </button>

        <div style={{
          fontSize:18, fontWeight:900, letterSpacing:3,
          fontFamily:'Orbitron,sans-serif', color:'transparent',
          backgroundImage:'linear-gradient(90deg,#ff6b6b,#ffd93d,#6bcb77,#4d96ff)',
          WebkitBackgroundClip:'text', backgroundClip:'text',
        }}>LUDO</div>

        <button onClick={() => startGame(numPlayers)} style={{
          background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)',
          borderRadius:8, padding:'7px 12px', cursor:'pointer', color:'#fff',
          display:'flex', alignItems:'center', gap:6, fontSize:13, fontFamily:'Inter,sans-serif',
        }}>
          <IoRefresh /> New
        </button>
      </div>

      {/* ── Player chips row ── */}
      <div style={{
        display:'flex', gap:8, padding:'8px 12px', flexShrink:0,
        background:'rgba(0,0,0,0.3)', justifyContent:'center',
        borderBottom:'1px solid rgba(255,255,255,0.06)',
      }}>
        {activePlayers.map(color => (
          <PlayerChip
            key={color} color={color}
            isCurrent={color === current && state.phase === 'playing'}
            tokens={state.players[color].tokens}
          />
        ))}
      </div>

      {/* ── Board (fills remaining space) ── */}
      <div style={{
        flex:1, display:'flex', alignItems:'center', justifyContent:'center',
        padding:'8px', overflow:'hidden',
      }}>
        {/* Decorative board frame */}
        <div style={{
          padding:'6px',
          background:'conic-gradient(#e53935 0deg 90deg,#2e7d32 90deg 180deg,#1565c0 180deg 270deg,#f9a825 270deg 360deg)',
          borderRadius:12,
          boxShadow:'0 0 40px rgba(0,0,0,0.6)',
          height:'100%', maxHeight: 480,
          aspectRatio:'1',
        }}>
          <div style={{ width:'100%', height:'100%', borderRadius:8, overflow:'hidden' }}>
            <LudoBoard state={state} current={current} onSelect={select} />
          </div>
        </div>
      </div>

      {/* ── Bottom action panel ── */}
      <div style={{
        flexShrink:0, padding:'10px 16px 14px',
        background:'rgba(0,0,0,0.6)', backdropFilter:'blur(12px)',
        borderTop:'1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>

          {/* Status info */}
          <div style={{ flex:1 }}>
            {curP && (
              <div style={{
                display:'inline-flex', alignItems:'center', gap:8,
                padding:'8px 14px', borderRadius:10,
                background: curP.grad,
                boxShadow:'0 4px 16px rgba(0,0,0,0.4)',
              }}>
                <span style={{ fontSize:20 }}>{curP.emoji}</span>
                <div>
                  <div style={{ fontSize:13, fontWeight:800, color: curP.text, fontFamily:'Inter,sans-serif' }}>
                    {curP.name}'s Turn
                  </div>
                  <div style={{ fontSize:10, color: `${curP.text}aa` }}>
                    {state.rolled && state.canMove.length > 0
                      ? '👆 Select a token'
                      : state.rolled && state.canMove.length === 0
                      ? '⏭ No moves — passing'
                      : '🎲 Roll the dice'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Dice */}
          <LudoDice
            value={state.dice}
            canRoll={canRoll}
            onRoll={roll}
            currentColor={current}
          />
        </div>
      </div>

      {/* ── Game Over ── */}
      {state.phase === 'over' && state.winner && (
        <GameOverModal
          winner={state.winner}
          onRestart={() => start(numPlayers)}
          onHome={() => navigate('/')}
        />
      )}
    </div>
  );
}
