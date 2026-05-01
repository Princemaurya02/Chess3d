import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoGrid, IoCube, IoWifi, IoWifiOutline } from 'react-icons/io5';
import { useGameStore } from '../store/gameStore';
import { getBestMove } from '../services/aiEngine';
import ChessBoard3D from '../features/board/ChessBoard3D';
import ChessBoard2D from '../features/board/ChessBoard2D';
import GameControls from '../features/ui/GameControls';
import MoveHistory from '../features/ui/MoveHistory';
import { PromotionModal, GameOverModal } from '../features/ui/GameModals';

// View toggle button (3D ↔ 2D)
function ViewToggle() {
  const { viewMode, setViewMode } = useGameStore();
  return (
    <button
      onClick={() => setViewMode(viewMode === '3d' ? '2d' : '3d')}
      style={{
        position: 'absolute', bottom: 8, right: 8, zIndex: 50,
        background: 'rgba(10,10,26,0.8)', border: '1px solid var(--border-gold)',
        borderRadius: 10, padding: '7px 12px',
        color: 'var(--accent-gold)', fontSize: 12, fontWeight: 700,
        fontFamily: 'Inter, sans-serif', cursor: 'pointer',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', gap: 6,
        transition: 'all 0.2s',
      }}
    >
      {viewMode === '3d' ? <><IoGrid style={{ fontSize: 14 }} /> 2D View</> : <><IoCube style={{ fontSize: 14 }} /> 3D View</>}
    </button>
  );
}

// Online connection badge
function OnlineBadge() {
  const { onlineMode, onlineConnected, onlinePlayerColor } = useGameStore();
  if (!onlineMode) return null;
  return (
    <div style={{
      position: 'absolute', bottom: 8, left: 8, zIndex: 50,
      background: 'rgba(10,10,26,0.85)', border: `1px solid ${onlineConnected ? 'rgba(74,222,128,0.4)' : 'rgba(248,113,113,0.4)'}`,
      borderRadius: 10, padding: '6px 12px',
      display: 'flex', alignItems: 'center', gap: 7,
      backdropFilter: 'blur(8px)',
    }}>
      <div style={{
        width: 8, height: 8, borderRadius: '50%',
        background: onlineConnected ? '#4ade80' : '#f87171',
        animation: onlineConnected ? 'pulse 2s infinite' : 'none',
      }} />
      <span style={{ fontSize: 11, fontWeight: 700, color: onlineConnected ? '#4ade80' : '#f87171' }}>
        {onlineConnected ? 'Connected' : 'Disconnected'}
      </span>
      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
        You: {onlinePlayerColor === 'w' ? '♔ White' : '♚ Black'}
      </span>
    </div>
  );
}

// Turn indicator for 2D mode
function TurnIndicator2D() {
  const { chess, gameStatus, onlineMode, onlinePlayerColor, isAIThinking } = useGameStore();
  const turn = chess.turn();
  const isYourTurn = !onlineMode || turn === onlinePlayerColor;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      padding: '8px 16px',
      background: 'rgba(10,10,26,0.9)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{
        width: 14, height: 14, borderRadius: '50%',
        background: turn === 'w'
          ? 'linear-gradient(135deg, #dcdcec, #888)'
          : 'linear-gradient(135deg, #2a1500, #c9a84c)',
        border: '1px solid rgba(255,255,255,0.2)',
        boxShadow: turn === 'w' ? '0 0 8px rgba(220,220,236,0.4)' : '0 0 8px rgba(201,168,76,0.4)',
      }} />
      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
        {isAIThinking ? '🤖 AI Thinking...'
          : gameStatus === 'checkmate' ? '♟ Checkmate!'
          : gameStatus === 'stalemate' ? '🤝 Stalemate'
          : gameStatus === 'draw'      ? '🤝 Draw'
          : gameStatus === 'check'     ? `⚠ ${turn === 'w' ? 'White' : 'Black'} in Check!`
          : onlineMode && !isYourTurn  ? "⏳ Opponent's Turn"
          : `${turn === 'w' ? 'White' : 'Black'}'s Turn`}
      </span>
    </div>
  );
}

export default function GameScreen() {
  const navigate = useNavigate();
  const {
    gameMode, gameStatus, chess, playerColor,
    setAIThinking, makeMove, isAIThinking, promotionPending,
    viewMode, onlineMode, onlinePlayerColor,
  } = useGameStore();
  const aiTimeoutRef = useRef(null);

  // Redirect if no game started
  useEffect(() => {
    if (!gameMode) navigate('/');
  }, [gameMode, navigate]);

  // AI move trigger
  const triggerAI = useCallback(() => {
    if (
      gameMode !== 'vsAI' ||
      chess.turn() === playerColor ||
      chess.isGameOver() ||
      promotionPending
    ) return;

    setAIThinking(true);
    const { difficulty } = useGameStore.getState();

    aiTimeoutRef.current = setTimeout(() => {
      const best = getBestMove(chess, difficulty);
      if (best) makeMove(best.from, best.to, best.promotion || 'q');
      setAIThinking(false);
    }, 350);
  }, [gameMode, chess, playerColor, setAIThinking, makeMove, promotionPending]);

  useEffect(() => {
    const s = gameStatus;
    if (s === 'playing' || s === 'check') triggerAI();
    return () => clearTimeout(aiTimeoutRef.current);
  }, [gameStatus, chess.turn()]);

  const is2D = viewMode === '2d';

  return (
    <div style={{
      height: '100dvh',
      display: 'flex', flexDirection: 'column',
      background: 'radial-gradient(ellipse at top, #0f0f2a 0%, #0a0a1a 70%)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Top game controls bar */}
      <GameControls />

      {/* 2D turn indicator strip (only in 2D mode) */}
      {is2D && (
        <div style={{ marginTop: 56 }}>
          <TurnIndicator2D />
        </div>
      )}

      {/* Board area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', marginTop: is2D ? 0 : 56 }}>
        {is2D ? <ChessBoard2D /> : <ChessBoard3D />}

        {/* AI thinking overlay (3D only — 2D has inline indicator) */}
        {isAIThinking && !is2D && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            <div style={{
              background: 'rgba(10,10,26,0.8)', backdropFilter: 'blur(4px)',
              borderRadius: 12, padding: '10px 20px',
              border: '1px solid var(--border-gold)',
              color: 'var(--accent-gold)', fontSize: 13, fontWeight: 600,
            }}>
              🤖 Calculating...
            </div>
          </div>
        )}

        {/* Online badge */}
        <OnlineBadge />

        {/* View toggle */}
        <ViewToggle />
      </div>

      {/* Move history */}
      <MoveHistory />

      {/* Modals */}
      <PromotionModal />
      <GameOverModal />
    </div>
  );
}
