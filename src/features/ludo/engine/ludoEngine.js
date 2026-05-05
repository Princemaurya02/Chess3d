import {
  COLORS, COLOR_CONFIG, MAIN_PATH, HOME_STRETCH,
  SAFE_SQUARES, TOKENS_PER_PLAYER, MAIN_PATH_LEN,
  HOME_STRETCH_LEN, TOKEN_BASE, TOKEN_COMPLETE,
} from './ludoConstants';

/** Get the board-index of a token (main path relative to color's entry) */
export function getAbsoluteIndex(color, relativePos) {
  if (relativePos < 0) return null;
  const entry = COLOR_CONFIG[color].entryIdx;
  return (entry + relativePos) % MAIN_PATH_LEN;
}

/** Get [row,col] for rendering a token */
export function getTokenCoords(color, position) {
  if (position === TOKEN_BASE) return null;
  if (position === TOKEN_COMPLETE) return null;
  if (position >= MAIN_PATH_LEN) {
    // Home stretch
    const hsIdx = position - MAIN_PATH_LEN;
    return HOME_STRETCH[color][hsIdx] ?? null;
  }
  const absIdx = getAbsoluteIndex(color, position);
  return MAIN_PATH[absIdx] ?? null;
}

/** Check if two tokens are on the same cell (for capture) */
export function isSameCell(colorA, posA, colorB, posB) {
  const a = getTokenCoords(colorA, posA);
  const b = getTokenCoords(colorB, posB);
  if (!a || !b) return false;
  return a[0] === b[0] && a[1] === b[1];
}

/** Is this main-path cell a safe square? */
export function isSafeSquare(color, position) {
  if (position < 0 || position >= MAIN_PATH_LEN) return false;
  const absIdx = getAbsoluteIndex(color, position);
  return SAFE_SQUARES.has(absIdx);
}

/** Can a token move by `dice` steps? */
export function canMove(position, dice) {
  if (position === TOKEN_COMPLETE) return false;
  if (position === TOKEN_BASE) return dice === 6; // must roll 6 to enter
  const newPos = position + dice;
  // Cannot overshoot home stretch end
  const totalPath = MAIN_PATH_LEN + HOME_STRETCH_LEN;
  return newPos <= totalPath; // allow exactly reaching end
}

/** Calculate new position after move */
export function calcNewPosition(position, dice) {
  if (position === TOKEN_BASE && dice === 6) return 0; // enter board
  const newPos = position + dice;
  const totalPath = MAIN_PATH_LEN + HOME_STRETCH_LEN;
  if (newPos === totalPath) return TOKEN_COMPLETE;
  return newPos;
}

/** Find which color+tokenIdx occupies a cell — for capture detection */
export function findTokenAtCell(players, targetColor, targetPos) {
  const coords = getTokenCoords(targetColor, targetPos);
  if (!coords) return null;
  if (isSafeSquare(targetColor, targetPos)) return null;

  for (const color of COLORS) {
    if (color === targetColor) continue;
    const player = players[color];
    for (let i = 0; i < TOKENS_PER_PLAYER; i++) {
      const pos = player.tokens[i];
      if (pos === TOKEN_BASE || pos === TOKEN_COMPLETE) continue;
      if (isSameCell(color, pos, targetColor, targetPos)) {
        // Check if it's a safe square for the occupier
        if (isSafeSquare(color, pos)) return null;
        return { color, tokenIdx: i };
      }
    }
  }
  return null;
}

/** Check win: all tokens complete */
export function isWinner(tokens) {
  return tokens.every(t => t === TOKEN_COMPLETE);
}

/** Get list of moveable token indices for current player */
export function getMoveableTokens(player, dice) {
  return player.tokens.reduce((acc, pos, idx) => {
    if (canMove(pos, dice)) acc.push(idx);
    return acc;
  }, []);
}

/** Roll dice */
export function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}
