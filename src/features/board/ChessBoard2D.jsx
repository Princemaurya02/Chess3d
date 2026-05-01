import { useCallback, useRef } from 'react';
import { useGameStore } from '../../store/gameStore';

const SYMBOLS = {
  w: { p: '♙', n: '♘', b: '♗', r: '♖', q: '♕', k: '♔' },
  b: { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚' },
};

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

function rowColToSquare(row, col) {
  return FILES[col] + (8 - row);
}

function squareToRowCol(sq) {
  const col = sq.charCodeAt(0) - 97;
  const rank = parseInt(sq[1]);
  return [8 - rank, col];
}

export default function ChessBoard2D() {
  const { board, selectedSquare, legalMoves, lastMove, gameStatus, chess, selectSquare, onlineMode, onlinePlayerColor } = useGameStore();

  const lastFromRC = lastMove ? squareToRowCol(lastMove.from) : null;
  const lastToRC   = lastMove ? squareToRowCol(lastMove.to)   : null;

  // Find checked king square
  let checkedKingSq = null;
  if (gameStatus === 'check' || gameStatus === 'checkmate') {
    const turn = chess.turn();
    outer: for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p?.type === 'k' && p.color === turn) {
          checkedKingSq = rowColToSquare(r, c);
          break outer;
        }
      }
    }
  }

  const handleSquareClick = useCallback((row, col) => {
    const sq = rowColToSquare(row, col);
    selectSquare(sq);
  }, [selectSquare]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      padding: '8px',
      userSelect: 'none',
    }}>
      {/* Board container with rank labels */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {/* Rank labels */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {RANKS.map(r => (
            <div key={r} style={{
              height: 'clamp(36px, 10vw, 56px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, color: 'var(--text-muted)', fontWeight: 700,
              width: 14,
            }}>{r}</div>
          ))}
        </div>

        {/* The Board */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 1fr)',
          width: 'clamp(288px, min(80vw, 70vh), 480px)',
          height: 'clamp(288px, min(80vw, 70vh), 480px)',
          border: '3px solid rgba(201,168,76,0.4)',
          borderRadius: 6,
          overflow: 'hidden',
          boxShadow: '0 0 40px rgba(0,0,0,0.6), 0 0 20px rgba(201,168,76,0.1)',
        }}>
          {board.map((rankArr, row) =>
            rankArr.map((piece, col) => {
              const sq = rowColToSquare(row, col);
              const isLight = (row + col) % 2 === 0;
              const isSelected = selectedSquare === sq;
              const isLegal = legalMoves.includes(sq);
              const isLastFrom = lastFromRC?.[0] === row && lastFromRC?.[1] === col;
              const isLastTo   = lastToRC?.[0]   === row && lastToRC?.[1]   === col;
              const isCheck    = sq === checkedKingSq;

              // Background color
              let bg = isLight ? '#C9A84C' : '#1B1B3A';
              if (isCheck)         bg = '#8B1A1A';
              else if (isSelected) bg = isLight ? '#9b59d0' : '#6a1fad';
              else if (isLastFrom || isLastTo) bg = isLight ? '#a07028' : '#2a1f60';

              const hasPiece = !!piece;
              const pieceColor = piece?.color;
              const symbol = piece ? SYMBOLS[piece.color]?.[piece.type] : '';

              // Piece text color — white pieces: silver, black: gold
              const textColor = pieceColor === 'w'
                ? '#e8e8f8'
                : '#c9a84c';
              const textShadow = pieceColor === 'w'
                ? '0 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.7)'
                : '0 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(201,168,76,0.3)';

              return (
                <div
                  key={sq}
                  onClick={() => handleSquareClick(row, col)}
                  style={{
                    background: bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background 0.15s ease',
                    aspectRatio: '1',
                  }}
                >
                  {/* Legal move dot */}
                  {isLegal && !hasPiece && (
                    <div style={{
                      width: '32%', height: '32%',
                      borderRadius: '50%',
                      background: 'rgba(201,168,76,0.75)',
                      boxShadow: '0 0 8px rgba(201,168,76,0.5)',
                      pointerEvents: 'none',
                    }} />
                  )}
                  {/* Legal capture ring */}
                  {isLegal && hasPiece && (
                    <div style={{
                      position: 'absolute', inset: 2,
                      borderRadius: '50%',
                      border: '3px solid rgba(201,168,76,0.85)',
                      pointerEvents: 'none',
                      zIndex: 1,
                    }} />
                  )}
                  {/* Piece */}
                  {symbol && (
                    <span style={{
                      fontSize: 'clamp(20px, 6vw, 38px)',
                      lineHeight: 1,
                      color: textColor,
                      textShadow,
                      zIndex: 2,
                      transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                      transition: 'transform 0.15s ease',
                      filter: isSelected ? 'drop-shadow(0 0 6px rgba(201,168,76,0.8))' : 'none',
                    }}>
                      {symbol}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* File labels */}
      <div style={{ display: 'flex', marginLeft: 18, marginTop: 4 }}>
        {FILES.map(f => (
          <div key={f} style={{
            width: 'clamp(36px, 10vw, 60px)',
            textAlign: 'center',
            fontSize: 11, color: 'var(--text-muted)', fontWeight: 700,
          }}>{f}</div>
        ))}
      </div>
    </div>
  );
}
