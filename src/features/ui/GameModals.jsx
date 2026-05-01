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

  const color = chess.turn() === 'w' ? 'b' : 'w'; // the mover just moved
  const isWhite = color === 'w';

  return (
    <div className="overlay">
      <div className="promotion-modal fade-in">
        <div className="heading-md">Pawn Promotion</div>
        <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Choose your piece</div>
        <div className="promotion-pieces">
          {PROMOTION_PIECES.map(({ type, symbol, name }) => (
            <button
              key={type}
              className="promotion-piece-btn"
              onClick={() => confirmPromotion(type)}
              title={name}
              style={{ color: isWhite ? '#d0d0e8' : '#c9a84c' }}
            >
              {symbol}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function GameOverModal() {
  const { gameStatus, chess, resetGame, moveHistory, playerColor } = useGameStore();
  const navigate = useNavigate();

  const isOver = ['checkmate', 'stalemate', 'draw'].includes(gameStatus);
  if (!isOver) return null;

  let title = '', subtitle = '', emoji = '';
  if (gameStatus === 'checkmate') {
    const winner = chess.turn() === 'w' ? 'Black' : 'White';
    const playerWon = (chess.turn() === 'w' && playerColor === 'b') || (chess.turn() === 'b' && playerColor === 'w');
    emoji = playerWon ? '🏆' : '💀';
    title = playerWon ? 'You Win!' : `${winner} Wins`;
    subtitle = playerWon ? 'Brilliant checkmate!' : 'Better luck next time';
  } else if (gameStatus === 'stalemate') {
    emoji = '🤝'; title = 'Stalemate'; subtitle = 'No legal moves available';
  } else {
    emoji = '🤝'; title = 'Draw'; subtitle = 'The game ends in a draw';
  }

  return (
    <div className="overlay">
      <div className="promotion-modal fade-in" style={{ textAlign: 'center', gap: 20, maxWidth: 340 }}>
        <div style={{ fontSize: 64 }}>{emoji}</div>
        <div>
          <div className="heading-lg text-gold">{title}</div>
          <div className="text-muted" style={{ marginTop: 6 }}>{subtitle}</div>
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
          {moveHistory.length} total moves
        </div>
        <div style={{ display: 'flex', gap: 12, width: '100%' }}>
          <button className="btn-secondary" style={{ flex: 1 }} onClick={() => { resetGame(); navigate('/'); }}>
            Home
          </button>
          <button className="btn-primary" style={{ flex: 1 }} onClick={() => resetGame()}>
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
}
