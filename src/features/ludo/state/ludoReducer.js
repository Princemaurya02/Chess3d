import { COLORS, TOKENS_PER_PLAYER, TOKEN_BASE, TOKEN_COMPLETE } from '../engine/ludoConstants';
import { rollDice, getMoveableTokens, calcNewPos, findCapture, getTokenCoords, isWinner } from '../engine/ludoEngine';

export const ACTIONS = {
  START_GAME:   'START_GAME',
  ROLL_DICE:    'ROLL_DICE',
  SELECT_TOKEN: 'SELECT_TOKEN',
  NEXT_TURN:    'NEXT_TURN',
};

function makePlayers(numPlayers) {
  const active = COLORS.slice(0, numPlayers);
  const p = {};
  COLORS.forEach(c => {
    p[c] = { tokens: Array(TOKENS_PER_PLAYER).fill(TOKEN_BASE), isActive: active.includes(c) };
  });
  return p;
}

export function getInitialState(numPlayers = 4) {
  return {
    phase: 'idle',
    numPlayers,
    players: makePlayers(numPlayers),
    turnOrder: COLORS.slice(0, numPlayers),
    currentTurn: 0,
    dice: null,
    diceRolled: false,
    moveableTokens: [],
    selectedToken: null,
    winner: null,
    sixStreak: 0,
    lastCapture: null,
    _autoNext: false,
    nextTurn: 0,
  };
}

function nextTurnIdx(state, wasExtra) {
  if (wasExtra) return state.currentTurn;
  return (state.currentTurn + 1) % state.numPlayers;
}

export function ludoReducer(state, action) {
  switch (action.type) {

    case ACTIONS.START_GAME:
      return { ...getInitialState(action.payload.numPlayers), phase: 'playing' };

    case ACTIONS.ROLL_DICE: {
      if (state.phase !== 'playing' || state.diceRolled) return state;
      const color = state.turnOrder[state.currentTurn];
      const dice = rollDice();
      // Three 6s in a row → forfeit
      if (dice === 6 && state.sixStreak >= 2) {
        return {
          ...state, dice, diceRolled: true,
          sixStreak: 0, moveableTokens: [], _autoNext: true,
          nextTurn: (state.currentTurn + 1) % state.numPlayers,
        };
      }
      const moveable = getMoveableTokens(state.players[color], dice);
      if (moveable.length === 0) {
        return {
          ...state, dice, diceRolled: true, moveableTokens: [],
          _autoNext: true, nextTurn: (state.currentTurn + 1) % state.numPlayers,
        };
      }
      return {
        ...state, dice, diceRolled: true, moveableTokens: moveable,
        selectedToken: moveable.length === 1 ? moveable[0] : null,
      };
    }

    case ACTIONS.SELECT_TOKEN: {
      if (!state.diceRolled || state.phase !== 'playing') return state;
      const { tokenIdx } = action.payload;
      if (!state.moveableTokens.includes(tokenIdx)) return state;

      const color = state.turnOrder[state.currentTurn];
      const oldPos = state.players[color].tokens[tokenIdx];
      const newPos = calcNewPos(oldPos, state.dice);
      const newCoords = getTokenCoords(color, newPos);

      // Capture check (only on main path)
      let capture = null;
      if (newPos < 52) {
        capture = findCapture(state.players, color, newCoords, newPos);
      }

      // Apply move
      const newTokens = [...state.players[color].tokens];
      newTokens[tokenIdx] = newPos;
      let newPlayers = { ...state.players, [color]: { ...state.players[color], tokens: newTokens } };

      // Apply capture
      if (capture) {
        const ct = [...newPlayers[capture.color].tokens];
        ct[capture.tokenIdx] = TOKEN_BASE;
        newPlayers = { ...newPlayers, [capture.color]: { ...newPlayers[capture.color], tokens: ct } };
      }

      // Win?
      if (isWinner(newTokens)) {
        return { ...state, players: newPlayers, phase: 'over', winner: color, diceRolled: false, moveableTokens: [], dice: null };
      }

      const extraTurn = state.dice === 6 || !!capture;
      const newSixStreak = state.dice === 6 ? state.sixStreak + 1 : 0;

      return {
        ...state, players: newPlayers,
        diceRolled: false, dice: null,
        moveableTokens: [], selectedToken: null,
        lastCapture: capture,
        sixStreak: newSixStreak,
        currentTurn: extraTurn ? state.currentTurn : (state.currentTurn + 1) % state.numPlayers,
      };
    }

    case ACTIONS.NEXT_TURN:
      return {
        ...state,
        currentTurn: action.payload?.nextTurn ?? (state.currentTurn + 1) % state.numPlayers,
        diceRolled: false, dice: null,
        moveableTokens: [], selectedToken: null,
        _autoNext: false, lastCapture: null,
      };

    default:
      return state;
  }
}
