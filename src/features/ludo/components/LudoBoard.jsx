import React, { memo } from 'react';
import {
  MAIN_PATH, HOME_STRETCH, BASE_POSITIONS,
  SAFE_SQUARES, COLOR_CONFIG, COLORS, TOKENS_PER_PLAYER, TOKEN_BASE, TOKEN_COMPLETE,
} from '../engine/ludoConstants';
import { getAbsoluteIndex, getTokenCoords } from '../engine/ludoEngine';

// ─── Color palettes ───────────────────────────────────────────────────────────
const CELL_COLORS = {
  red:    '#e53935',
  green:  '#43a047',
  yellow: '#f9a825',
  blue:   '#1e88e5',
  light:  '#f5f0e8',
  safe:   '#b8f7b0',
};

const TOKEN_STYLE = {
  red:    { bg: '#e53935', border: '#b71c1c' },
  green:  { bg: '#43a047', border: '#1b5e20' },
  yellow: { bg: '#f9a825', border: '#e65100' },
  blue:   { bg: '#1e88e5', border: '#0d47a1' },
};

// ─── Single board cell ────────────────────────────────────────────────────────
const Cell = memo(({ row, col, bg, children, onClick, highlight }) => (
  <div
    onClick={onClick}
    style={{
      gridRow: row + 1,
      gridColumn: col + 1,
      background: highlight ? 'rgba(255,255,100,0.6)' : bg,
      border: '0.5px solid rgba(0,0,0,0.12)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: onClick ? 'pointer' : 'default',
      position: 'relative',
      transition: 'background 0.2s',
      borderRadius: 2,
    }}
  >
    {children}
  </div>
));

// ─── Token circle ─────────────────────────────────────────────────────────────
const Token = memo(({ color, isSelectable, isSelected, onClick }) => {
  const style = TOKEN_STYLE[color];
  return (
    <div
      onClick={onClick}
      style={{
        width: '70%',
        height: '70%',
        borderRadius: '50%',
        background: style.bg,
        border: `2px solid ${style.border}`,
        cursor: isSelectable ? 'pointer' : 'default',
        boxShadow: isSelected
          ? `0 0 0 3px #fff, 0 0 0 5px ${style.bg}`
          : isSelectable
          ? `0 0 8px rgba(255,255,255,0.7)`
          : '0 1px 3px rgba(0,0,0,0.4)',
        transform: isSelected ? 'scale(1.25)' : isSelectable ? 'scale(1.1)' : 'scale(1)',
        transition: 'all 0.15s ease',
        zIndex: isSelected ? 10 : 1,
      }}
    />
  );
});

// ─── Safe square star ────────────────────────────────────────────────────────
const SafeStar = () => (
  <span style={{ fontSize: 8, opacity: 0.5, pointerEvents: 'none', position: 'absolute' }}>⭐</span>
);

// ─── Home quadrant (colored corner) ──────────────────────────────────────────
function HomeQuadrant({ color, tokens, moveableTokens, selectedToken, onSelectToken }) {
  const cfg = COLOR_CONFIG[color];
  const [rMin, rMax] = cfg.home.rows;
  const [cMin, cMax] = cfg.home.cols;
  const bases = BASE_POSITIONS[color];

  return (
    <>
      {/* Colored background fill */}
      {Array.from({ length: rMax - rMin + 1 }, (_, ri) =>
        Array.from({ length: cMax - cMin + 1 }, (_, ci) => {
          const r = rMin + ri;
          const c = cMin + ci;
          const key = `home-${color}-${r}-${c}`;
          // Inner 4×4 is lighter
          const isInner = ri >= 1 && ri <= 4 && ci >= 1 && ci <= 4;
          return (
            <Cell key={key} row={r} col={c} bg={isInner ? '#f5f0e8' : CELL_COLORS[color]}>
              {/* Base slots */}
              {bases.map((pos, i) => {
                if (pos[0] !== r || pos[1] !== c) return null;
                const tokenHere = tokens[i] === TOKEN_BASE;
                if (!tokenHere) return null;
                const isSelectable = moveableTokens.includes(i);
                const isSelected = selectedToken === i;
                return (
                  <Token
                    key={i}
                    color={color}
                    isSelectable={isSelectable}
                    isSelected={isSelected}
                    onClick={isSelectable ? () => onSelectToken(i) : undefined}
                  />
                );
              })}
            </Cell>
          );
        })
      )}
    </>
  );
}

// ─── Build a map of tokens on main path + home stretch ───────────────────────
function buildTokenMap(players, moveableTokens, selectedToken, currentColor, onSelectToken) {
  const cells = {}; // key: "r,c" → array of token elements

  COLORS.forEach(color => {
    const player = players[color];
    const isCurrentPlayer = color === currentColor;

    player.tokens.forEach((pos, i) => {
      if (pos === TOKEN_BASE || pos === TOKEN_COMPLETE) return;
      const coords = getTokenCoords(color, pos);
      if (!coords) return;
      const [r, c] = coords;
      const key = `${r},${c}`;
      if (!cells[key]) cells[key] = [];

      const isSelectable = isCurrentPlayer && moveableTokens.includes(i);
      const isSelected = isCurrentPlayer && selectedToken === i;
      cells[key].push(
        <Token
          key={`${color}-${i}`}
          color={color}
          isSelectable={isSelectable}
          isSelected={isSelected}
          onClick={isSelectable ? () => onSelectToken(i) : undefined}
        />
      );
    });
  });

  return cells;
}

// ─── Get background for a main-path cell ─────────────────────────────────────
function getPathCellBg(r, c) {
  // Home stretch cells — colored by player
  for (const color of COLORS) {
    const stretch = HOME_STRETCH[color];
    for (const [sr, sc] of stretch) {
      if (sr === r && sc === c) return CELL_COLORS[color] + '66'; // semi-transparent
    }
  }
  // Safe squares
  for (let i = 0; i < MAIN_PATH.length; i++) {
    if (MAIN_PATH[i][0] === r && MAIN_PATH[i][1] === c && SAFE_SQUARES.has(i)) return CELL_COLORS.safe;
  }
  // Check if entry point (colored)
  for (const color of COLORS) {
    const entry = COLOR_CONFIG[color].entryIdx;
    if (MAIN_PATH[entry][0] === r && MAIN_PATH[entry][1] === c) return CELL_COLORS[color] + '99';
  }
  return CELL_COLORS.light;
}

// ─── Is safe square (for star rendering) ─────────────────────────────────────
function isMainPathSafe(r, c) {
  for (let i = 0; i < MAIN_PATH.length; i++) {
    if (MAIN_PATH[i][0] === r && MAIN_PATH[i][1] === c && SAFE_SQUARES.has(i)) return true;
  }
  return false;
}

// ─── Main Board Component ─────────────────────────────────────────────────────
export default memo(function LudoBoard({ state, currentColor, onSelectToken }) {
  const { players, moveableTokens, selectedToken } = state;
  const tokenMap = buildTokenMap(players, moveableTokens, selectedToken, currentColor, onSelectToken);

  // All cells: 15×15
  const cells = [];

  // Home quadrants
  for (const color of COLORS) {
    cells.push(
      <HomeQuadrant
        key={`home-${color}`}
        color={color}
        tokens={players[color].tokens}
        moveableTokens={currentColor === color ? moveableTokens : []}
        selectedToken={currentColor === color ? selectedToken : null}
        onSelectToken={onSelectToken}
      />
    );
  }

  // Center star (winning zone)
  cells.push(
    <Cell key="center" row={7} col={7} bg="linear-gradient(135deg,#e53935,#43a047,#f9a825,#1e88e5)">
      <span style={{ fontSize: 14 }}>⭐</span>
    </Cell>
  );

  // Path cells and home stretch cells (non-home-quadrant cells)
  const homeRanges = [
    [0,5,9,14],[0,5,0,5],[9,14,0,5],[9,14,9,14],
  ];
  const isInHome = (r, c) =>
    homeRanges.some(([r1,r2,c1,c2]) => r>=r1&&r<=r2&&c>=c1&&c<=c2);

  for (let r = 0; r < 15; r++) {
    for (let c = 0; c < 15; c++) {
      if (isInHome(r, c)) continue;
      if (r === 7 && c === 7) continue; // center already added
      const bg = getPathCellBg(r, c);
      const key = `${r},${c}`;
      const tokensHere = tokenMap[key] || [];
      const safe = isMainPathSafe(r, c);
      cells.push(
        <Cell key={key} row={r} col={c} bg={bg}>
          {safe && <SafeStar />}
          <div style={{ display:'flex', flexWrap:'wrap', width:'100%', height:'100%', alignItems:'center', justifyContent:'center', gap: tokensHere.length > 1 ? 1 : 0 }}>
            {tokensHere}
          </div>
        </Cell>
      );
    }
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(15, 1fr)',
      gridTemplateRows: 'repeat(15, 1fr)',
      width: 'min(94vw, 94vh - 200px)',
      height: 'min(94vw, 94vh - 200px)',
      maxWidth: 480,
      maxHeight: 480,
      border: '3px solid rgba(201,168,76,0.4)',
      borderRadius: 8,
      overflow: 'hidden',
      boxShadow: '0 0 40px rgba(0,0,0,0.7)',
      margin: '0 auto',
    }}>
      {cells}
    </div>
  );
});
