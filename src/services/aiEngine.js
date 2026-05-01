// Chess AI Engine - Minimax with Alpha-Beta Pruning

const PIECE_VALUES = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

// Piece-square tables (from white's perspective, rank 8 → rank 1)
const PST = {
  p: [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5,  5, 10, 25, 25, 10,  5,  5],
    [0,  0,  0, 20, 20,  0,  0,  0],
    [5, -5,-10,  0,  0,-10, -5,  5],
    [5, 10, 10,-20,-20, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0],
  ],
  n: [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50],
  ],
  b: [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20],
  ],
  r: [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [5, 10, 10, 10, 10, 10, 10,  5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [0,  0,  0,  5,  5,  0,  0,  0],
  ],
  q: [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [-5,  0,  5,  5,  5,  5,  0, -5],
    [0,  0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20],
  ],
  k: [
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [20, 20,  0,  0,  0,  0, 20, 20],
    [20, 30, 10,  0,  0, 10, 30, 20],
  ],
};

function getPSTValue(type, color, row, col) {
  const table = PST[type];
  if (!table) return 0;
  const r = color === 'w' ? row : 7 - row;
  const c = col;
  return table[r]?.[c] ?? 0;
}

function evaluateBoard(chess) {
  if (chess.isCheckmate()) return chess.turn() === 'w' ? -50000 : 50000;
  if (chess.isDraw() || chess.isStalemate()) return 0;

  let score = 0;
  const board = chess.board();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;
      const val = PIECE_VALUES[piece.type] + getPSTValue(piece.type, piece.color, r, c);
      score += piece.color === 'w' ? val : -val;
    }
  }
  return score;
}

function minimax(chess, depth, alpha, beta, isMaximizing) {
  if (depth === 0 || chess.isGameOver()) return evaluateBoard(chess);

  const moves = chess.moves();
  if (isMaximizing) {
    let max = -Infinity;
    for (const m of moves) {
      chess.move(m);
      max = Math.max(max, minimax(chess, depth - 1, alpha, beta, false));
      chess.undo();
      alpha = Math.max(alpha, max);
      if (beta <= alpha) break;
    }
    return max;
  } else {
    let min = Infinity;
    for (const m of moves) {
      chess.move(m);
      min = Math.min(min, minimax(chess, depth - 1, alpha, beta, true));
      chess.undo();
      beta = Math.min(beta, min);
      if (beta <= alpha) break;
    }
    return min;
  }
}

export function getBestMove(chess, difficulty) {
  const depth = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3;
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return null;

  // Shuffle for variety
  const shuffled = [...moves].sort(() => Math.random() - 0.5);

  const aiColor = chess.turn();
  const isAIMax = aiColor === 'w';
  let bestMove = shuffled[0];
  let bestScore = isAIMax ? -Infinity : Infinity;

  for (const move of shuffled) {
    chess.move(move);
    const score = minimax(chess, depth - 1, -Infinity, Infinity, !isAIMax);
    chess.undo();
    if (isAIMax ? score > bestScore : score < bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  return bestMove;
}
