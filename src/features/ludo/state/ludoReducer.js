import {
  COLORS, TOKENS_PER_PLAYER, TOKEN_BASE, TOKEN_COMPLETE,
} from '../engine/ludoConstants';
import {
  rollDice, getMoveableTokens, calcNewPosition,
  findTokenAtCell, isWinner,
} from '../engine/ludoEngine';

// ─── Action Types ─────────────────────────────────────────────────────────────
export const ACTIONS = {
  START_GAME:    'START_GAME',
  ROLL_DICE:     'ROLL_DICE',
  SELECT_TOKEN:  'SELECT_TOKEN',
  NEXT_TURN:     'NEXT_TURN',
  GAME_OVER:     'GAME_OVER',
};

// ─── Initial State ────────────────────────────────────────────────────────────
function makeInitialPlayers(numPlayers) {
  const activePlayers = COLORS.slice(0, numPlayers);
  const players = {};
  COLORS.forEach(color => {
    players[color] = {
      tokens: Array(TOKENS_PER_PLAYER).fill(TOKEN_BASE),
      score: 0,
      isActive: activePlayers.includes(color),
    };
  });
  return players;
}

export function getInitialState(numPlayers = 4) {
  return {
    phase: 'idle',       // idle | playing | over
    numPlayers,
    players: makeInitialPlayers(numPlayers),
    turnOrder: COLORS.slice(0, numPlayers),
    currentTurn: 0,      // index into turnOrder
    dice: null,          // 1-6 or null
    diceRolled: false,
    moveableTokens: [],  // token indices that can move
    selectedToken: null,
    winner: null,
    sixStreak: 0,        // consecutive sixes rolled
    lastCapture: null,   // { color, tokenIdx } for animation
  };
}

// ─── Reducer ─────────────────────────────────────────────────────────────────
export function ludoReducer(state, action) {
  switch (action.type) {

    case ACTIONS.START_GAME: {
      return { ...getInitialState(action.payload.numPlayers), phase: 'playing' };
    }

    case ACTIONS.ROLL_DICE: {
      if (state.phase !== 'playing' || state.diceRolled) return state;
      const currentColor = state.turnOrder[state.currentTurn];
      const player = state.players[currentColor];
      const dice = rollDice();
      const moveable = getMoveableTokens(player, dice);

      // No valid moves → pass turn (unless rolled 6)
      if (moveable.length === 0) {
        const nextTurn = getNextTurn(state, dice);
        return {
          ...state, dice, diceRolled: true,
          moveableTokens: [],
          // After short delay, auto-advance turn
          _autoNext: true,
          nextTurn,
        };
      }

      // If only one moveable token → auto-select
      if (moveable.length === 1) {
        return {
          ...state, dice, diceRolled: true,
          moveableTokens: moveable, selectedToken: moveable[0],
        };
      }

      return { ...state, dice, diceRolled: true, moveableTokens: moveable, selectedToken: null };
    }

    case ACTIONS.SELECT_TOKEN: {
      if (!state.diceRolled || state.phase !== 'playing') return state;
      const { tokenIdx } = action.payload;
      if (!state.moveableTokens.includes(tokenIdx)) return state;

      const currentColor = state.turnOrder[state.currentTurn];
      const player = state.players[currentColor];
      const oldPos = player.tokens[tokenIdx];
      const newPos = calcNewPosition(oldPos, state.dice);

      // Check for capture
      let capture = null;
      if (newPos < 52) { // only on main path
        capture = findTokenAtCell(state.players, currentColor, newPos);
      }

      // Build new player state
      const newTokens = [...player.tokens];
      newTokens[tokenIdx] = newPos;
      const newPlayers = {
        ...state.players,
        [currentColor]: { ...player, tokens: newTokens },
      };

      // Apply capture: send opponent token back to base
      if (capture) {
        const capPlayer = newPlayers[capture.color];
        const capTokens = [...capPlayer.tokens];
        capTokens[capture.tokenIdx] = TOKEN_BASE;
        newPlayers[capture.color] = { ...capPlayer, tokens: capTokens };
      }

      // Check win
      if (isWinner(newTokens)) {
        return {
          ...state, players: newPlayers,
          phase: 'over', winner: currentColor,
          diceRolled: false, moveableTokens: [], selectedToken: null,
          lastCapture: capture,
        };
      }

      // Extra turn on 6 or capture
      const extraTurn = state.dice === 6 || capture !== null;
      const nextTurn = extraTurn ? state.currentTurn : getNextTurn(state, state.dice);

      return {
        ...state,
        players: newPlayers,
        diceRolled: false,
        dice: null,
        moveableTokens: [],
        selectedToken: null,
        currentTurn: nextTurn,
        lastCapture: capture,
        sixStreak: state.dice === 6 ? state.sixStreak + 1 : 0,
      };
    }

    case ACTIONS.NEXT_TURN: {
      return {
        ...state,
        currentTurn: action.payload.nextTurn ?? getNextTurn(state, state.dice),
        diceRolled: false,
        dice: null,
        moveableTokens: [],
        selectedToken: null,
        _autoNext: false,
        lastCapture: null,
      };
    }

    case ACTIONS.GAME_OVER: {
      return { ...state, phase: 'over', winner: action.payload.winner };
    }

    default:
      return state;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getNextTurn(state, dice) {
  // 3 sixes in a row → forfeit turn
  if (dice === 6 && state.sixStreak >= 2) return (state.currentTurn + 1) % state.numPlayers;
  // normal next
  return (state.currentTurn + 1) % state.numPlayers;
}
