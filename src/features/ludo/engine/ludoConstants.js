// Correct Standard Ludo — 15×15 grid, clockwise path
// Colors: RED=top-right  GREEN=top-left  YELLOW=bottom-left  BLUE=bottom-right

export const COLORS = ['red', 'green', 'yellow', 'blue'];

export const COLOR_CONFIG = {
  red:    { label: 'Red',    entryIdx:  0 },
  green:  { label: 'Green',  entryIdx: 13 },
  yellow: { label: 'Yellow', entryIdx: 26 },
  blue:   { label: 'Blue',   entryIdx: 39 },
};

export const TOKENS_PER_PLAYER = 4;
export const MAIN_PATH_LEN     = 52;
export const HOME_STRETCH_LEN  = 6;
export const TOKEN_BASE        = -1;
export const TOKEN_COMPLETE    = 100;

// 52-cell CLOCKWISE main path [row, col] — verified, entries 13 apart
// RED=0  GREEN=13  YELLOW=26  BLUE=39
export const MAIN_PATH = [
  // RED (0-12): top-arm ↓ col8, right-arm → row6, corner
  [2,8],[3,8],[4,8],[5,8],[6,8],[6,9],[6,10],[6,11],[6,12],[6,13],[6,14],[7,14],[8,14],
  // GREEN (13-25): row8 ← , bottom-arm ↓ col8, corner
  [8,13],[8,12],[8,11],[8,10],[8,9],[8,8],[9,8],[10,8],[11,8],[12,8],[13,8],[13,7],[13,6],
  // YELLOW (26-38): col6 ↑ , row8 ← , left corner
  [12,6],[11,6],[10,6],[9,6],[8,6],[8,5],[8,4],[8,3],[8,2],[8,1],[7,1],[6,1],[6,2],
  // BLUE (39-51): row6 → , top-arm ↑ col6, top corner
  [6,3],[6,4],[6,5],[6,6],[5,6],[4,6],[3,6],[2,6],[1,6],[0,6],[0,7],[0,8],[1,8],
];

// Home stretches: 6 cells each leading toward center (7,7)
export const HOME_STRETCH = {
  red:    [[7,13],[7,12],[7,11],[7,10],[7,9],[7,8]],  // row7 ←
  green:  [[1,7],[2,7],[3,7],[4,7],[5,7],[6,7]],      // col7 ↓
  yellow: [[7,1],[7,2],[7,3],[7,4],[7,5],[7,6]],      // row7 →
  blue:   [[13,7],[12,7],[11,7],[10,7],[9,7],[8,7]],  // col7 ↑
};

// Safe squares — tokens cannot be captured here (absolute main-path indices)
export const SAFE_SQUARES = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

// Home quadrant bounds [rowMin, rowMax, colMin, colMax]
export const HOME_BOUNDS = {
  red:    [0, 5,  9, 14],
  green:  [0, 5,  0,  5],
  yellow: [9, 14, 0,  5],
  blue:   [9, 14, 9, 14],
};

// Token base positions (4 per player) inside their home quadrant
export const BASE_POSITIONS = {
  red:    [[1,10],[1,12],[3,10],[3,12]],
  green:  [[1,2],[1,4],[3,2],[3,4]],
  yellow: [[10,2],[10,4],[12,2],[12,4]],
  blue:   [[10,10],[10,12],[12,10],[12,12]],
};
