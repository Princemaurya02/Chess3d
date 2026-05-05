import {
  COLORS, COLOR_CONFIG, MAIN_PATH, HOME_STRETCH,
  SAFE_SQUARES, TOKENS_PER_PLAYER, MAIN_PATH_LEN,
  HOME_STRETCH_LEN, TOKEN_BASE, TOKEN_COMPLETE,
} from './ludoConstants';

/** Absolute main-path index for a given color + relative position */
export function absIdx(color, relPos) {
  return (COLOR_CONFIG[color].entryIdx + relPos) % MAIN_PATH_LEN;
}

/** Get [row, col] for rendering a token */
export function getTokenCoords(color, position) {
  if (position === TOKEN_BASE || position === TOKEN_COMPLETE) return null;
  if (position >= MAIN_PATH_LEN) {
    const hsIdx = position - MAIN_PATH_LEN;
    return HOME_STRETCH[color]?.[hsIdx] ?? null;
  }
  return MAIN_PATH[absIdx(color, position)] ?? null;
}

/** Is the current main-path cell a safe square? */
export function isSafe(color, position) {
  if (position < 0 || position >= MAIN_PATH_LEN) return false;
  return SAFE_SQUARES.has(absIdx(color, position));
}

/** Can this token legally move by `dice` steps? */
export function canMove(position, dice) {
  if (position === TOKEN_COMPLETE) return false;
  if (position === TOKEN_BASE) return dice === 6;
  const newPos = position + dice;
  return newPos <= MAIN_PATH_LEN + HOME_STRETCH_LEN;
}

/** New position after moving `dice` steps */
export function calcNewPos(position, dice) {
  if (position === TOKEN_BASE && dice === 6) return 0;
  const next = position + dice;
  return next === MAIN_PATH_LEN + HOME_STRETCH_LEN ? TOKEN_COMPLETE : next;
}

/** Find an opponent token sitting on `targetCoords` (eligible for capture) */
export function findCapture(players, currentColor, targetCoords, targetPos) {
  if (!targetCoords) return null;
  if (isSafe(currentColor, targetPos)) return null;
  for (const color of COLORS) {
    if (color === currentColor) continue;
    for (let i = 0; i < TOKENS_PER_PLAYER; i++) {
      const pos = players[color].tokens[i];
      if (pos === TOKEN_BASE || pos === TOKEN_COMPLETE) continue;
      // Only capture on main path
      if (pos >= MAIN_PATH_LEN) continue;
      const coords = getTokenCoords(color, pos);
      if (coords && coords[0] === targetCoords[0] && coords[1] === targetCoords[1]) {
        if (isSafe(color, pos)) continue; // occupier is safe
        return { color, tokenIdx: i };
      }
    }
  }
  return null;
}

/** Indices of moveable tokens for current player */
export function getMoveableTokens(player, dice) {
  return player.tokens.reduce((acc, pos, i) => {
    if (canMove(pos, dice)) acc.push(i);
    return acc;
  }, []);
}

/** All tokens complete? */
export function isWinner(tokens) {
  return tokens.every(t => t === TOKEN_COMPLETE);
}

export function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}
