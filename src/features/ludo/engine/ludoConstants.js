// ─── Ludo Board Constants ────────────────────────────────────────────────────
// 15×15 grid (0-indexed). Main path = 52 cells. Home stretches = 6 cells each.

export const COLORS = ['red', 'green', 'yellow', 'blue'];

export const COLOR_CONFIG = {
  red:    { label: 'Red',    emoji: '🔴', home: { rows:[0,5], cols:[9,14] },  homeStretchDir: 'left',  entryIdx: 0  },
  green:  { label: 'Green',  emoji: '🟢', home: { rows:[0,5], cols:[0,5] },   homeStretchDir: 'down',  entryIdx: 13 },
  yellow: { label: 'Yellow', emoji: '🟡', home: { rows:[9,14], cols:[0,5] },  homeStretchDir: 'right', entryIdx: 26 },
  blue:   { label: 'Blue',   emoji: '🔵', home: { rows:[9,14], cols:[9,14] }, homeStretchDir: 'up',    entryIdx: 39 },
};

// ─── Main path: 52 [row,col] cells, clockwise from RED entry ─────────────────
export const MAIN_PATH = [
  // 0-12 : Red entry → across top → Green entry
  [1,8],[0,8],[0,7],[0,6],[1,6],[2,6],[3,6],[4,6],[5,6],[6,6],[6,5],[6,4],[6,3],
  // 13-25: Green entry → down left → Yellow entry
  [6,2],[6,1],[6,0],[7,0],[8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[8,6],[9,6],[10,6],
  // 26-38: Yellow entry → across bottom → Blue entry
  [11,6],[12,6],[13,6],[14,6],[14,7],[14,8],[13,8],[12,8],[11,8],[10,8],[9,8],[8,8],[8,9],
  // 39-51: Blue entry → up right → back to Red
  [8,10],[8,11],[8,12],[8,13],[8,14],[7,14],[6,14],[6,13],[6,12],[6,11],[6,10],[6,9],[6,8],
  // [7,8] is the center approach — handled via home stretch
];

// ─── Home stretches: 6 cells each (leading to center) ───────────────────────
export const HOME_STRETCH = {
  red:    [[1,7],[2,7],[3,7],[4,7],[5,7],[6,7]],
  green:  [[7,1],[7,2],[7,3],[7,4],[7,5],[7,6]],
  yellow: [[13,7],[12,7],[11,7],[10,7],[9,7],[8,7]],
  blue:   [[7,13],[7,12],[7,11],[7,10],[7,9],[7,8]],
};

// ─── Safe squares (main path indices — captures not allowed) ─────────────────
export const SAFE_SQUARES = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

// ─── Base positions for each color (where tokens wait before entering) ────────
export const BASE_POSITIONS = {
  red:    [[1,10],[1,12],[3,10],[3,12]],
  green:  [[1,2],[1,4],[3,2],[3,4]],
  yellow: [[10,2],[10,4],[12,2],[12,4]],
  blue:   [[10,10],[10,12],[12,10],[12,12]],
};

export const TOKENS_PER_PLAYER = 4;
export const MAIN_PATH_LEN = 52;
export const HOME_STRETCH_LEN = 6;
export const TOKEN_BASE = -1;      // token in base
export const TOKEN_COMPLETE = 100; // token finished
