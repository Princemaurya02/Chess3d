import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useLudo } from '../hooks/useLudo';
import LudoBoard from '../components/LudoBoard';
import LudoDice from '../components/LudoDice';
import { COLOR_CONFIG, COLORS, TOKEN_COMPLETE, TOKENS_PER_PLAYER } from '../engine/ludoConstants';
import { IoArrowBack, IoRefresh } from 'react-icons/io5';

const COLOR_LABELS = {
  red: { label: 'Red', emoji: '🔴', gradient: 'linear-gradient(135deg,#e53935,#b71c1c)' },
  green: { label: 'Green', emoji: '🟢', gradient: 'linear-gradient(135deg,#43a047,#1b5e20)' },
  yellow: { label: 'Yellow', emoji: '🟡', gradient: 'linear-gradient(135deg,#f9a825,#e65100)' },
  blue: { label: 'Blue', emoji: '🔵', gradient: 'linear-gradient(135deg,#1e88e5,#0d47a1)' },
};

function PlayerChip({ color, isCurrent, tokens }) {
  const cfg = COLOR_LABELS[color];
  const done = tokens.filter(t => t === TOKEN_COMPLETE).length;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '6px 10px', borderRadius: 10,
      background: isCurrent ? cfg.gradient : 'rgba(255,255,255,0.05)',
      border: `1px solid ${isCurrent ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
      transition: 'all 0.3s',
      boxShadow: isCurrent ? '0 0 14px rgba(0,0,0,0.5)' : 'none',
    }}>
      <span style={{ fontSize: 16 }}>{cfg.emoji}</span>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: isCurrent ? '#fff' : 'var(--text-muted)' }}>
          {cfg.label}
        </div>
        <div style={{ fontSize: 9, color: isCurrent ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)' }}>
          {done}/{TOKENS_PER_PLAYER} home
        </div>
      </div>
    </div>
  );
}

function GameOverBanner({ winner, onRestart, onHome }) {
  const cfg = COLOR_LABELS[winner];
  return (
    <div className="overlay">
      <div className="promotion-modal fade-in" style={{ textAlign: 'center', gap: 20 }}>
        <div style={{ fontSize: 60 }}>🏆</div>
        <div style={{ background: cfg.gradient, borderRadius: 12, padding: '12px 24px' }}>
          <div className="heading-lg" style={{ color: '#fff' }}>{cfg.emoji} {cfg.label} Wins!</div>
        </div>
        <div className="text-muted">Congratulations on winning the game!</div>
        <div style={{ display: 'flex', gap: 12, width: '100%' }}>
          <button className="btn-secondary" style={{ flex: 1 }} onClick={onHome}>Home</button>
          <button className="btn-primary" style={{ flex: 1 }} onClick={onRestart}>Play Again</button>
        </div>
      </div>
    </div>
  );
}

export default function LudoGame() {
  const navigate = useNavigate();
  const [numPlayers, setNumPlayers] = useState(4);
  const [started, setStarted] = useState(false);
  const { state, currentColor, startGame, rollDice, selectToken } = useLudo(numPlayers);

  const handleStart = (n) => {
    setNumPlayers(n);
    setStarted(true);
    startGame(n);
  };

  const handleRestart = () => {
    startGame(numPlayers);
  };

  // Setup screen
  if (!started) {
    return (
      <div className="screen" style={{ padding: '0 16px 16px' }}>
        <div style={{
          padding: '32px 0 24px', textAlign: 'center',
          background: 'linear-gradient(180deg,rgba(233,30,99,0.15) 0%,transparent 100%)',
          margin: '0 -16px 24px', paddingLeft: 16, paddingRight: 16,
        }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>🎲</div>
          <div className="heading-xl" style={{ color: '#e91e63', marginBottom: 6 }}>LUDO</div>
          <div className="text-muted">Classic board game, reimagined</div>
        </div>

        <div className="heading-md" style={{ marginBottom: 14 }}>Number of Players</div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
          {[2, 3, 4].map(n => (
            <button
              key={n}
              onClick={() => handleStart(n)}
              style={{
                flex: 1, padding: '20px 0', borderRadius: 14, cursor: 'pointer',
                background: 'linear-gradient(135deg,rgba(233,30,99,0.15),rgba(10,10,26,0.5))',
                border: '1px solid rgba(233,30,99,0.3)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                transition: 'all 0.2s', fontFamily: 'Inter,sans-serif',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#e91e63'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(233,30,99,0.3)'}
            >
              <span style={{ fontSize: 28 }}>{'👤'.repeat(n)}</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: '#e91e63' }}>{n}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Players</span>
            </button>
          ))}
        </div>

        <div className="gold-card">
          <div style={{ fontWeight: 700, fontSize: 13, color: '#e91e63', marginBottom: 10 }}>🎮 How to Play</div>
          {[
            'Roll 6 to move a token out of base',
            'Move tokens around the board clockwise',
            'Land on opponent to send them back!',
            'Get all 4 tokens home to win 🏆',
          ].map(r => (
            <div key={r} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, display: 'flex', gap: 8 }}>
              <span style={{ color: '#e91e63' }}>•</span> {r}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const activeTurnColors = state.turnOrder || COLORS.slice(0, numPlayers);
  const canRoll = !state.diceRolled && state.phase === 'playing';

  return (
    <div style={{
      height: '100dvh', display: 'flex', flexDirection: 'column',
      background: 'radial-gradient(ellipse at center,#1a0a1a 0%,#0a0a1a 70%)',
      overflow: 'hidden',
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px',
        background: 'rgba(10,10,26,0.9)', borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <button className="btn-icon" onClick={() => navigate('/')}><IoArrowBack /></button>
        <div style={{
          fontSize: 16, fontWeight: 800, color: '#e91e63',
          fontFamily: 'Orbitron,sans-serif', letterSpacing: 1,
        }}>🎲 LUDO</div>
        <button className="btn-icon" onClick={handleRestart}><IoRefresh /></button>
      </div>

      {/* Player chips */}
      <div style={{
        display: 'flex', gap: 8, padding: '8px 12px',
        overflowX: 'auto', scrollbarWidth: 'none', flexShrink: 0,
        background: 'rgba(10,10,26,0.8)',
      }}>
        {activeTurnColors.map(color => (
          <PlayerChip
            key={color}
            color={color}
            isCurrent={color === currentColor && state.phase === 'playing'}
            tokens={state.players[color].tokens}
          />
        ))}
      </div>

      {/* Board */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '4px' }}>
        <LudoBoard state={state} currentColor={currentColor} onSelectToken={selectToken} />
      </div>

      {/* Bottom action panel */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px',
        background: 'rgba(10,10,26,0.95)', borderTop: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        {/* Turn info */}
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 3 }}>Current Turn</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 18 }}>{currentColor ? COLOR_LABELS[currentColor].emoji : '⏳'}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
              {currentColor ? COLOR_LABELS[currentColor].label : '—'}
            </span>
          </div>
          {state.diceRolled && state.moveableTokens.length === 0 && (
            <div style={{ fontSize: 10, color: '#f87171', marginTop: 2 }}>No valid moves — passing</div>
          )}
          {state.diceRolled && state.moveableTokens.length > 0 && (
            <div style={{ fontSize: 10, color: '#c9a84c', marginTop: 2 }}>Select a token to move</div>
          )}
        </div>

        {/* Dice */}
        <LudoDice
          value={state.dice}
          canRoll={canRoll}
          onRoll={rollDice}
          currentColor={currentColor}
        />
      </div>

      {/* Game over */}
      {state.phase === 'over' && state.winner && (
        <GameOverBanner
          winner={state.winner}
          onRestart={handleRestart}
          onHome={() => navigate('/')}
        />
      )}
    </div>
  );
}
