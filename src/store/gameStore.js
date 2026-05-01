import { create } from 'zustand';
import { Chess } from 'chess.js';
import { sendMove, disconnect } from '../services/peerService';

const chess = new Chess();

export const useGameStore = create((set, get) => ({
  chess,
  fen: chess.fen(),
  board: chess.board(),

  // Game state
  gameMode: null,         // 'vsAI' | 'vsHuman' | 'online'
  difficulty: 'medium',
  gameStatus: 'idle',     // 'idle' | 'playing' | 'check' | 'checkmate' | 'stalemate' | 'draw'
  playerColor: 'w',

  // 2D / 3D view toggle
  viewMode: '3d',         // '3d' | '2d'

  // Online state
  onlineMode: false,
  onlinePlayerColor: 'w',
  onlineConnected: false,

  // Selection
  selectedSquare: null,
  legalMoves: [],
  lastMove: null,
  promotionPending: null,

  // Move history
  moveHistory: [],

  // Custom textures
  customTextures: {
    w: { p: null, n: null, b: null, r: null, q: null, k: null },
    b: { p: null, n: null, b: null, r: null, q: null, k: null },
  },

  isAIThinking: false,

  // Settings
  showCoordinates: true,
  boardRotated: false,
  soundEnabled: true,

  // Stats
  stats: { wins: 0, losses: 0, draws: 0, streak: 0, gamesPlayed: 0 },

  // ─── Actions ──────────────────────────────────────────────────────────────

  startGame: (mode, difficulty = 'medium', playerColor = 'w') => {
    chess.reset();
    set({
      gameMode: mode, difficulty, playerColor,
      fen: chess.fen(), board: chess.board(),
      gameStatus: 'playing',
      selectedSquare: null, legalMoves: [], lastMove: null,
      moveHistory: [], isAIThinking: false, promotionPending: null,
      onlineMode: false, onlineConnected: false,
    });
  },

  startOnlineGame: (myColor) => {
    chess.reset();
    set({
      gameMode: 'online',
      playerColor: myColor,
      onlineMode: true,
      onlinePlayerColor: myColor,
      onlineConnected: true,
      fen: chess.fen(), board: chess.board(),
      gameStatus: 'playing',
      selectedSquare: null, legalMoves: [], lastMove: null,
      moveHistory: [], isAIThinking: false, promotionPending: null,
    });
  },

  resetGame: () => {
    if (get().onlineMode) disconnect();
    chess.reset();
    set({
      fen: chess.fen(), board: chess.board(),
      gameStatus: 'idle', gameMode: null,
      selectedSquare: null, legalMoves: [], lastMove: null,
      moveHistory: [], isAIThinking: false, promotionPending: null,
      onlineMode: false, onlineConnected: false,
    });
  },

  selectSquare: (square) => {
    const state = get();
    const { selectedSquare, legalMoves, gameStatus, onlineMode, onlinePlayerColor } = state;
    if (gameStatus !== 'playing' && gameStatus !== 'check') return;

    // Online: block if not your turn
    if (onlineMode && chess.turn() !== onlinePlayerColor) return;

    if (legalMoves.includes(square)) {
      state.makeMove(selectedSquare, square);
      return;
    }

    const piece = chess.get(square);
    if (piece && piece.color === chess.turn()) {
      const moves = chess.moves({ square, verbose: true });
      set({ selectedSquare: square, legalMoves: moves.map(m => m.to) });
    } else {
      set({ selectedSquare: null, legalMoves: [] });
    }
  },

  makeMove: (from, to, promotion = 'q') => {
    const state = get();

    // Pawn promotion check
    const piece = chess.get(from);
    const toRank = to[1];
    if (piece?.type === 'p' && ((piece.color === 'w' && toRank === '8') || (piece.color === 'b' && toRank === '1'))) {
      if (!state.promotionPending) {
        set({ promotionPending: { from, to }, selectedSquare: null, legalMoves: [] });
        return;
      }
    }

    let result;
    try { result = chess.move({ from, to, promotion }); }
    catch { set({ selectedSquare: null, legalMoves: [], promotionPending: null }); return; }
    if (!result) { set({ selectedSquare: null, legalMoves: [], promotionPending: null }); return; }

    // Send to peer if online
    if (state.onlineMode) {
      sendMove({ from: result.from, to: result.to, promotion: result.promotion });
    }

    const newHistory = [...state.moveHistory, { san: result.san, from: result.from, to: result.to, color: result.color }];
    let newStatus = 'playing';
    if (chess.isCheckmate()) newStatus = 'checkmate';
    else if (chess.isStalemate()) newStatus = 'stalemate';
    else if (chess.isDraw()) newStatus = 'draw';
    else if (chess.isCheck()) newStatus = 'check';

    set({
      fen: chess.fen(), board: chess.board(),
      selectedSquare: null, legalMoves: [],
      lastMove: { from: result.from, to: result.to },
      moveHistory: newHistory, gameStatus: newStatus,
      promotionPending: null,
    });

    // Update stats on game over
    if (['checkmate', 'stalemate', 'draw'].includes(newStatus)) {
      const s = get().stats;
      let ns = { ...s, gamesPlayed: s.gamesPlayed + 1 };
      if (newStatus === 'checkmate') {
        const playerWon = result.color === get().playerColor;
        ns = playerWon
          ? { ...ns, wins: s.wins + 1, streak: s.streak + 1 }
          : { ...ns, losses: s.losses + 1, streak: 0 };
      } else {
        ns = { ...ns, draws: s.draws + 1 };
      }
      set({ stats: ns });
    }
  },

  confirmPromotion: (piece) => {
    const { promotionPending } = get();
    if (!promotionPending) return;
    get().makeMove(promotionPending.from, promotionPending.to, piece);
  },

  undoMove: () => {
    const { gameMode, moveHistory } = get();
    if (moveHistory.length === 0 || get().onlineMode) return;
    chess.undo();
    if (gameMode === 'vsAI') chess.undo();
    const newHistory = chess.history({ verbose: true }).map(m => ({
      san: m.san, from: m.from, to: m.to, color: m.color,
    }));
    let status = chess.isCheck() ? 'check' : 'playing';
    set({
      fen: chess.fen(), board: chess.board(),
      moveHistory: newHistory, gameStatus: status,
      selectedSquare: null, legalMoves: [],
      lastMove: newHistory.length > 0 ? { from: newHistory[newHistory.length-1].from, to: newHistory[newHistory.length-1].to } : null,
      isAIThinking: false,
    });
  },

  setAIThinking: (val) => set({ isAIThinking: val }),
  setViewMode: (m) => set({ viewMode: m }),
  setCustomTexture: (color, type, url) => set(state => ({
    customTextures: { ...state.customTextures, [color]: { ...state.customTextures[color], [type]: url } },
  })),
  setDifficulty: (d) => set({ difficulty: d }),
  setShowCoordinates: (v) => set({ showCoordinates: v }),
  setBoardRotated: (v) => set({ boardRotated: v }),
  setSoundEnabled: (v) => set({ soundEnabled: v }),
}));
