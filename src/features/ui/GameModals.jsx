import { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useNavigate } from 'react-router-dom';

const PROMOTION_PIECES = [
  { type: 'q', symbol: '♛', name: 'Queen' },
  { type: 'r', symbol: '♜', name: 'Rook' },
  { type: 'b', symbol: '♝', name: 'Bishop' },
  { type: 'n', symbol: '♞', name: 'Knight' },
];

export function PromotionModal() {
  const { promotionPending, confirmPromotion, chess } = useGameStore();
  if (!promotionPending) return null;
  const color = chess.turn() === 'w' ? 'b' : 'w';
  const isWhite = color === 'w';
  return (
    <div className="overlay">
      <div className="promotion-modal fade-in">
        <div className="heading-md">Pawn Promotion</div>
        <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Choose your piece</div>
        <div className="promotion-pieces">
          {PROMOTION_PIECES.map(({ type, symbol, name }) => (
            <button key={type} className="promotion-piece-btn"
              onClick={() => confirmPromotion(type)} title={name}
              style={{ color: isWhite ? '#d0d0e8' : '#c9a84c' }}>
              {symbol}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Analysis breakdown generator ──────────────────────────────────────────────
function buildAnalysis(chess, moveHistory, gameStatus) {
  const lines = [];
  const total = moveHistory.length;

  if (gameStatus === 'checkmate') {
    // Who delivered the last move
    const loser  = chess.turn(); // current turn = loser (checkmated)
    const winner = loser === 'w' ? 'Black' : 'White';
    const loserName = loser === 'w' ? 'White' : 'Black';

    lines.push({ icon: '♟', color: '#f87171',
      text: `${loserName}'s king was checkmated after ${total} moves.` });

    // Last move info
    if (moveHistory.length > 0) {
      const last = moveHistory[moveHistory.length - 1];
      lines.push({ icon: '🎯', color: '#fbbf24',
        text: `Final move: ${last.san} — delivered checkmate by ${winner}.` });
    }

    // Check sequence
    const checks = moveHistory.filter(m => m.san?.includes('+'));
    if (checks.length > 0) {
      lines.push({ icon: '⚠️', color: '#fb923c',
        text: `${loserName} was put in check ${checks.length} time${checks.length > 1 ? 's' : ''} during the game.` });
    }

    // Material count from history
    const captures = moveHistory.filter(m => m.san?.includes('x'));
    if (captures.length > 0) {
      lines.push({ icon: '💥', color: '#a78bfa',
        text: `${captures.length} pieces were captured throughout the game.` });
    }

    // Piece that delivered mate
    const lastSAN = moveHistory[moveHistory.length - 1]?.san || '';
    let matingPiece = 'pawn';
    if      (lastSAN[0] === 'Q') matingPiece = 'queen';
    else if (lastSAN[0] === 'R') matingPiece = 'rook';
    else if (lastSAN[0] === 'B') matingPiece = 'bishop';
    else if (lastSAN[0] === 'N') matingPiece = 'knight';
    else if (lastSAN[0] === 'K') matingPiece = 'king';
    lines.push({ icon: '👑', color: '#4ade80',
      text: `Checkmate was delivered by ${winner}'s ${matingPiece}.` });

    // Advice
    if (loser === 'w') {
      lines.push({ icon: '💡', color: '#60a5fa',
        text: 'Tip: Watch for back-rank threats and keep your king protected with pawns.' });
    } else {
      lines.push({ icon: '💡', color: '#60a5fa',
        text: 'Tip: Avoid leaving your king exposed. Castle early and defend key squares.' });
    }

  } else if (gameStatus === 'stalemate') {
    lines.push({ icon: '🤝', color: '#94a3b8', text: `Stalemate after ${total} moves — no legal moves available.` });
    lines.push({ icon: '💡', color: '#60a5fa', text: 'The losing side had no legal moves but was NOT in check.' });

  } else {
    lines.push({ icon: '🤝', color: '#94a3b8', text: `Draw agreed after ${total} moves.` });
  }

  return lines;
}

// ── Game Over Analysis Screen ─────────────────────────────────────────────────
export function GameOverModal() {
  const { gameStatus, chess, resetGame, moveHistory, playerColor } = useGameStore();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [phase, setPhase] = useState('result'); // 'result' | 'analysis'

  const isOver = ['checkmate', 'stalemate', 'draw'].includes(gameStatus);

  // Delay appearance for drama
  useEffect(() => {
    if (isOver) {
      const t = setTimeout(() => setShow(true), 800);
      return () => clearTimeout(t);
    } else {
      setShow(false);
      setPhase('result');
    }
  }, [isOver, gameStatus]);

  if (!isOver || !show) return null;

  // Winner info
  let winner = '', playerWon = false, isStalemate = false;
  if (gameStatus === 'checkmate') {
    winner = chess.turn() === 'w' ? 'Black' : 'White';
    playerWon = (chess.turn() === 'w' && playerColor === 'b') ||
                (chess.turn() === 'b' && playerColor === 'w');
  } else {
    isStalemate = true;
  }

  const analysis = buildAnalysis(chess, moveHistory, gameStatus);

  // ── Phase 1: Result Card ────────────────────────────────────────────────────
  if (phase === 'result') {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        animation: 'fadeInUp 0.4s ease',
      }}>
        <div style={{
          width: '100%', maxWidth: 480,
          background: 'linear-gradient(180deg,#0d0d25 0%,#050510 100%)',
          borderTop: `3px solid ${playerWon ? '#d4a843' : isStalemate ? '#94a3b8' : '#f87171'}`,
          borderRadius: '24px 24px 0 0',
          padding: '28px 24px 36px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18,
        }}>
          {/* Handle bar */}
          <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', marginBottom: 4 }}/>

          {/* Big emoji */}
          <div style={{
            fontSize: 70, lineHeight: 1,
            filter: `drop-shadow(0 0 24px ${playerWon ? '#d4a843' : isStalemate ? '#94a3b8' : '#f87171'})`,
            animation: 'float 2s ease-in-out infinite',
          }}>
            {isStalemate ? '🤝' : playerWon ? '🏆' : '💀'}
          </div>

          {/* Title */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: 'Orbitron,sans-serif', fontSize: 26, fontWeight: 900,
              color: playerWon ? '#d4a843' : isStalemate ? '#94a3b8' : '#f87171',
              marginBottom: 6,
              textShadow: `0 0 30px ${playerWon ? '#d4a843' : isStalemate ? '#94a3b8' : '#f87171'}66`,
            }}>
              {isStalemate ? 'Stalemate' : playerWon ? 'You Win! 🎉' : `${winner} Wins`}
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              {isStalemate ? 'No legal moves available'
                : playerWon ? 'Outstanding checkmate!'
                : 'Better luck next time'}
            </div>
          </div>

          {/* Stats row */}
          <div style={{
            display: 'flex', gap: 16, width: '100%', justifyContent: 'center',
            padding: '14px 20px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 14,
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 22, fontWeight: 900, color: '#d4a843' }}>
                {moveHistory.length}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 }}>Moves</div>
            </div>
            <div style={{ width: 1, background: 'rgba(255,255,255,0.08)' }}/>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 22, fontWeight: 900, color: '#a78bfa' }}>
                {moveHistory.filter(m => m.san?.includes('x')).length}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 }}>Captures</div>
            </div>
            <div style={{ width: 1, background: 'rgba(255,255,255,0.08)' }}/>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 22, fontWeight: 900, color: '#fb923c' }}>
                {moveHistory.filter(m => m.san?.includes('+')).length}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 }}>Checks</div>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10, width: '100%' }}>
            <button onClick={() => setPhase('analysis')} style={{
              flex: 1, padding: '14px', borderRadius: 14, cursor: 'pointer',
              background: 'rgba(212,168,67,0.12)',
              border: '1px solid rgba(212,168,67,0.4)',
              color: '#d4a843', fontSize: 13, fontWeight: 800,
              fontFamily: 'Inter,sans-serif', letterSpacing: 0.5,
            }}>📊 Analysis</button>
            <button onClick={() => resetGame()} style={{
              flex: 1, padding: '14px', borderRadius: 14, cursor: 'pointer',
              background: 'linear-gradient(135deg,#d4a843,#a07830)',
              border: 'none', color: '#050510', fontSize: 13, fontWeight: 800,
              fontFamily: 'Inter,sans-serif', letterSpacing: 0.5,
              boxShadow: '0 4px 16px rgba(212,168,67,0.4)',
            }}>🔄 Play Again</button>
          </div>

          <button onClick={() => { resetGame(); navigate('/'); }} style={{
            background: 'none', border: 'none', color: 'var(--text-muted)',
            fontSize: 13, cursor: 'pointer', fontFamily: 'Inter,sans-serif', padding: 0,
          }}>← Back to Home</button>
        </div>
      </div>
    );
  }

  // ── Phase 2: Analysis Screen ───────────────────────────────────────────────
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)',
      display: 'flex', flexDirection: 'column',
      animation: 'fadeInUp 0.4s ease',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 20px 0',
        background: 'linear-gradient(180deg,rgba(212,168,67,0.1) 0%,transparent 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button onClick={() => setPhase('result')} style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10, padding: '8px 14px', color: 'var(--text-muted)',
            fontSize: 13, cursor: 'pointer', fontFamily: 'Inter,sans-serif',
          }}>← Back</button>
          <div style={{
            fontFamily: 'Orbitron,sans-serif', fontSize: 18, fontWeight: 900,
            background: 'linear-gradient(135deg,#d4a843,#f0c060)',
            WebkitBackgroundClip: 'text', backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>Game Analysis</div>
        </div>

        {/* Summary bar */}
        <div style={{
          display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4,
        }}>
          {[
            { label: 'Total Moves', val: moveHistory.length, c: '#d4a843' },
            { label: 'Captures',    val: moveHistory.filter(m=>m.san?.includes('x')).length, c: '#a78bfa' },
            { label: 'Checks',      val: moveHistory.filter(m=>m.san?.includes('+')).length, c: '#fb923c' },
            { label: 'Result',      val: isStalemate?'Draw':playerWon?'Win':'Loss', c: playerWon?'#4ade80':isStalemate?'#94a3b8':'#f87171' },
          ].map(({ label, val, c }) => (
            <div key={label} style={{
              flexShrink: 0, padding: '10px 16px', borderRadius: 12,
              background: `${c}14`, border: `1px solid ${c}30`, textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 16, fontWeight: 900, color: c }}>{val}</div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Analysis cards */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* What happened */}
        <div style={{ fontSize: 11, letterSpacing: 2, color: 'var(--text-muted)', fontWeight: 700,
          textTransform: 'uppercase', fontFamily: 'Rajdhani,sans-serif', marginBottom: 4 }}>
          📋 How the game ended
        </div>

        {analysis.map(({ icon, color, text }, i) => (
          <div key={i} style={{
            display: 'flex', gap: 14, alignItems: 'flex-start',
            padding: '14px 16px', borderRadius: 14,
            background: `${color}0d`, border: `1px solid ${color}25`,
            animation: `fadeInUp 0.4s ${i * 0.07}s both`,
          }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
            <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6, flex: 1 }}>{text}</div>
          </div>
        ))}

        {/* Move list (last 10) */}
        {moveHistory.length > 0 && (
          <>
            <div style={{ fontSize: 11, letterSpacing: 2, color: 'var(--text-muted)', fontWeight: 700,
              textTransform: 'uppercase', fontFamily: 'Rajdhani,sans-serif', marginTop: 8, marginBottom: 4 }}>
              🕐 Last moves
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: 6, padding: '14px', borderRadius: 14,
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            }}>
              {moveHistory.slice(-10).map((m, i) => {
                const absIdx = moveHistory.length - Math.min(10, moveHistory.length) + i;
                const isWhiteMove = absIdx % 2 === 0;
                const moveNum = Math.floor(absIdx / 2) + 1;
                const isCheck = m.san?.includes('+');
                const isMate  = m.san?.includes('#');
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 10px', borderRadius: 8,
                    background: isMate ? 'rgba(248,113,113,0.12)' : isCheck ? 'rgba(251,146,60,0.08)' : 'transparent',
                    border: isMate ? '1px solid rgba(248,113,113,0.3)' : 'none',
                  }}>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', width: 24, flexShrink: 0 }}>
                      {isWhiteMove ? `${moveNum}.` : ''}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'monospace',
                      color: isMate ? '#f87171' : isCheck ? '#fb923c' : isWhiteMove ? '#f0f0ff' : '#d4a843' }}>
                      {isWhiteMove ? '♔' : '♚'} {m.san}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
          <button onClick={() => { resetGame(); navigate('/'); }} style={{
            flex: 1, padding: '14px', borderRadius: 14, cursor: 'pointer',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'var(--text-primary)', fontSize: 13, fontWeight: 700,
            fontFamily: 'Inter,sans-serif',
          }}>🏠 Home</button>
          <button onClick={() => resetGame()} style={{
            flex: 1, padding: '14px', borderRadius: 14, cursor: 'pointer',
            background: 'linear-gradient(135deg,#d4a843,#a07830)',
            border: 'none', color: '#050510', fontSize: 13, fontWeight: 800,
            fontFamily: 'Inter,sans-serif',
            boxShadow: '0 4px 16px rgba(212,168,67,0.4)',
          }}>🔄 Play Again</button>
        </div>
      </div>
    </div>
  );
}
