import { COLORS, PLAYER_PATH, HOME_STRETCH, SAFE_POS, TOKENS_PER_PLAYER, PATH_LEN, HS_LEN, BASE, DONE } from './ludoConstants';

export function getCoords(color, pos) {
  if (pos === BASE || pos === DONE) return null;
  if (pos >= PATH_LEN) return HOME_STRETCH[color]?.[pos - PATH_LEN] ?? null;
  return PLAYER_PATH[color][pos] ?? null;
}

export function isSafe(pos) {
  return pos >= 0 && pos < PATH_LEN && SAFE_POS.has(pos);
}

export function canMove(pos, dice) {
  if (pos === DONE) return false;
  if (pos === BASE) return dice === 6;
  return pos + dice <= PATH_LEN + HS_LEN;
}

export function nextPos(pos, dice) {
  if (pos === BASE) return 0;
  const n = pos + dice;
  return n >= PATH_LEN + HS_LEN ? DONE : n;
}

export function findCapture(players, myColor, myNewPos) {
  if (myNewPos >= PATH_LEN || isSafe(myNewPos)) return null;
  const myCoords = getCoords(myColor, myNewPos);
  if (!myCoords) return null;
  for (const color of COLORS) {
    if (color === myColor) continue;
    for (let i = 0; i < TOKENS_PER_PLAYER; i++) {
      const p = players[color].tokens[i];
      if (p === BASE || p === DONE || p >= PATH_LEN) continue;
      if (isSafe(p)) continue;
      const c = getCoords(color, p);
      if (c && c[0] === myCoords[0] && c[1] === myCoords[1])
        return { color, idx: i };
    }
  }
  return null;
}

export function moveable(tokens, dice) {
  return tokens.reduce((a, p, i) => { if (canMove(p, dice)) a.push(i); return a; }, []);
}

export function won(tokens) { return tokens.every(t => t === DONE); }
export function rollDice() { return Math.floor(Math.random() * 6) + 1; }
