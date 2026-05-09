import { useCallback } from 'react';
import { useGameStore } from '../../store/gameStore';

// Classic chess Unicode symbols
const SYMBOLS = {
  w: { p: '♙', n: '♘', b: '♗', r: '♖', q: '♕', k: '♔' },
  b: { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚' },
};

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

// Classic wooden board colors (matching image)
const LIGHT_SQ = '#f0d9b5'; // light tan/maple
const DARK_SQ  = '#b58863'; // dark walnut/brown

function rowColToSquare(row, col) { return FILES[col] + (8 - row); }
function squareToRowCol(sq) {
  return [8 - parseInt(sq[1]), sq.charCodeAt(0) - 97];
}

export default function ChessBoard2D() {
  const {
    board, selectedSquare, legalMoves, lastMove,
    gameStatus, chess, selectSquare,
  } = useGameStore();

  const lastFromRC = lastMove ? squareToRowCol(lastMove.from) : null;
  const lastToRC   = lastMove ? squareToRowCol(lastMove.to)   : null;

  // Find checked king
  let checkedKingSq = null;
  if (gameStatus === 'check' || gameStatus === 'checkmate') {
    const turn = chess.turn();
    outer: for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p?.type === 'k' && p.color === turn) { checkedKingSq = rowColToSquare(r, c); break outer; }
      }
    }
  }

  const handleClick = useCallback((row, col) => selectSquare(rowColToSquare(row, col)), [selectSquare]);

  const BOARD_SIZE = 'clamp(288px, min(82vw, 72vh), 500px)';

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      width: '100%', height: '100%', padding: 8,
      userSelect: 'none',
    }}>
      {/* Outer wooden frame */}
      <div style={{
        background: '#8B5E3C',
        borderRadius: 8,
        padding: '18px 18px 18px 8px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.1)',
        border: '2px solid #6B3F1C',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0 }}>

          {/* Rank labels left */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around',
            width: 20, alignSelf: 'stretch', paddingBottom: 2 }}>
            {RANKS.map(r => (
              <div key={r} style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: '#f0d9b5',
                fontFamily: 'Georgia, serif',
              }}>{r}</div>
            ))}
          </div>

          {/* Board grid */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(8, 1fr)',
              width: BOARD_SIZE, height: BOARD_SIZE,
              border: '2px solid #6B3F1C',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)',
            }}>
              {board.map((rankArr, row) =>
                rankArr.map((piece, col) => {
                  const sq = rowColToSquare(row, col);
                  const isLight    = (row + col) % 2 === 0;
                  const isSelected = selectedSquare === sq;
                  const isLegal    = legalMoves.includes(sq);
                  const isLastFrom = lastFromRC?.[0] === row && lastFromRC?.[1] === col;
                  const isLastTo   = lastToRC?.[0]   === row && lastToRC?.[1]   === col;
                  const isCheck    = sq === checkedKingSq;
                  const hasPiece   = !!piece;
                  const symbol     = piece ? SYMBOLS[piece.color]?.[piece.type] : '';

                  // Square background
                  let bg = isLight ? LIGHT_SQ : DARK_SQ;
                  if (isCheck)                         bg = '#cc3333';
                  else if (isSelected)                  bg = isLight ? '#f6f669' : '#baca2b';
                  else if (isLastFrom || isLastTo)      bg = isLight ? '#cdd16f' : '#aaa23a';

                  // Piece colors — white = true white with black outline, black = true black with white outline
                  const isWhite = piece?.color === 'w';
                  const pieceColor  = isWhite ? '#ffffff' : '#000000';
                  const pieceShadow = isWhite
                    ? '0 0 0 1.5px #000, 1px 2px 3px rgba(0,0,0,0.8)'
                    : '0 0 0 1px rgba(255,255,255,0.3), 1px 2px 3px rgba(0,0,0,0.6)';

                  return (
                    <div
                      key={sq}
                      onClick={() => handleClick(row, col)}
                      style={{
                        background: bg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', position: 'relative',
                        transition: 'background 0.1s',
                        aspectRatio: '1',
                      }}
                    >
                      {/* Legal move indicator */}
                      {isLegal && !hasPiece && (
                        <div style={{
                          width: '30%', height: '30%', borderRadius: '50%',
                          background: 'rgba(0,0,0,0.18)',
                          pointerEvents: 'none',
                        }}/>
                      )}
                      {/* Legal capture ring */}
                      {isLegal && hasPiece && (
                        <div style={{
                          position: 'absolute', inset: 0,
                          border: '3px solid rgba(0,0,0,0.25)',
                          borderRadius: '50%',
                          pointerEvents: 'none', zIndex: 1,
                        }}/>
                      )}
                      {/* Chess piece */}
                      {symbol && (
                        <span style={{
                          fontSize: 'clamp(22px, 7vw, 44px)',
                          lineHeight: 1,
                          color: pieceColor,
                          textShadow: pieceShadow,
                          zIndex: 2,
                          transform: isSelected ? 'scale(1.18)' : 'scale(1)',
                          transition: 'transform 0.12s',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>{symbol}</span>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* File labels bottom */}
            <div style={{ display: 'flex', paddingTop: 4, paddingRight: 0 }}>
              {FILES.map(f => (
                <div key={f} style={{
                  flex: 1, textAlign: 'center',
                  fontSize: 11, fontWeight: 700,
                  color: '#f0d9b5', fontFamily: 'Georgia, serif',
                }}>{f}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
