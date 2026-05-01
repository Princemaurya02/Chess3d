import { useNavigate } from 'react-router-dom';
import { IoArrowBack, IoRefresh, IoArrowUndo, IoExpand } from 'react-icons/io5';
import { GiChessKing } from 'react-icons/gi';
import { useGameStore } from '../../store/gameStore';

export default function GameControls({ onFullscreen }) {
  const navigate = useNavigate();
  const { gameStatus, gameMode, moveHistory, undoMove, resetGame, isAIThinking, chess } = useGameStore();

  const turn = chess.turn();
  const turnLabel = turn === 'w' ? 'White' : 'Black';

  const handleBack = () => {
    resetGame();
    navigate('/');
  };

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px',
      background: 'linear-gradient(to bottom, rgba(10,10,26,0.95), transparent)',
      zIndex: 100,
    }}>
      {/* Left: Back */}
      <button className="btn-icon" onClick={handleBack} title="Back">
        <IoArrowBack />
      </button>

      {/* Center: turn indicator */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        {isAIThinking ? (
          <span style={{ color: 'var(--accent-gold)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', fontSize: 16 }}>⚙</span>
            AI Thinking...
          </span>
        ) : (
          <span style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 600 }}>
            {gameStatus === 'checkmate' ? '♟ Checkmate!' :
             gameStatus === 'stalemate' ? '🤝 Stalemate' :
             gameStatus === 'draw' ? '🤝 Draw' :
             gameStatus === 'check' ? `⚠ ${turnLabel} in Check!` :
             `${turnLabel}'s Turn`}
          </span>
        )}
        <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>
          {moveHistory.length} move{moveHistory.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Right: actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn-icon" onClick={undoMove} title="Undo" disabled={moveHistory.length === 0 || isAIThinking}
          style={{ opacity: moveHistory.length === 0 ? 0.4 : 1 }}>
          <IoArrowUndo />
        </button>
        <button className="btn-icon" onClick={() => { resetGame(); navigate('/'); }} title="New Game">
          <IoRefresh />
        </button>
      </div>
    </div>
  );
}
