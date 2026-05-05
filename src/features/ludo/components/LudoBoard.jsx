import React, { memo } from 'react';
import {
  MAIN_PATH, HOME_STRETCH, BASE_POSITIONS,
  SAFE_SQUARES, COLOR_CONFIG, COLORS, TOKENS_PER_PLAYER,
  TOKEN_BASE, TOKEN_COMPLETE,
} from '../engine/ludoConstants';
import { getAbsoluteIndex, getTokenCoords } from '../engine/ludoEngine';

// ─── Vibrant colors matching traditional Ludo board ──────────────────────────
const BG = {
  red:    '#e53935',
  green:  '#2e7d32',
  yellow: '#f9a825',
  blue:   '#1565c0',
  path:   '#ffffff',
  border: '#1565c0',
  safe:   '#a5d6a7',
  center: '#ffffff',
};

const TOKEN_COLORS = {
  red:    { fill:'#e53935', stroke:'#b71c1c', shadow:'rgba(229,57,53,0.6)' },
  green:  { fill:'#43a047', stroke:'#1b5e20', shadow:'rgba(67,160,71,0.6)' },
  yellow: { fill:'#fdd835', stroke:'#f57f17', shadow:'rgba(253,216,53,0.6)' },
  blue:   { fill:'#1e88e5', stroke:'#0d47a1', shadow:'rgba(30,136,229,0.6)' },
};

// ─── Token SVG circle ────────────────────────────────────────────────────────
const Token = memo(({ color, isSelectable, isSelected, onClick, size = 68 }) => {
  const c = TOKEN_COLORS[color];
  const s = size;
  return (
    <svg
      width={`${s}%`} height={`${s}%`}
      viewBox="0 0 40 40"
      onClick={onClick}
      style={{
        cursor: isSelectable ? 'pointer' : 'default',
        filter: isSelected
          ? `drop-shadow(0 0 4px ${c.shadow}) drop-shadow(0 0 8px ${c.shadow})`
          : isSelectable
          ? `drop-shadow(0 0 3px ${c.shadow})`
          : 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))',
        transform: isSelected ? 'scale(1.25)' : isSelectable ? 'scale(1.12)' : 'scale(1)',
        transition: 'transform 0.15s, filter 0.15s',
        zIndex: isSelected ? 10 : 1,
      }}
    >
      {/* Outer ring */}
      <circle cx="20" cy="20" r="18" fill={c.stroke} />
      {/* Main body */}
      <circle cx="20" cy="20" r="15" fill={c.fill} />
      {/* Highlight */}
      <circle cx="14" cy="13" r="5" fill="rgba(255,255,255,0.35)" />
      {/* Center dot */}
      <circle cx="20" cy="20" r="4" fill={c.stroke} />
    </svg>
  );
});

// ─── Diamond pattern inside home quad ────────────────────────────────────────
function HomeDiamond({ color }) {
  const c = TOKEN_COLORS[color];
  return (
    <svg viewBox="0 0 30 30" width="70%" height="70%" style={{ opacity: 0.4 }}>
      <rect x="5" y="5" width="20" height="20" rx="2" fill={c.fill}
        transform="rotate(45 15 15)" />
    </svg>
  );
}

// ─── Build token map: cell key → { tokenEls, count } ────────────────────────
function buildTokenMap(players, moveableTokens, selectedToken, currentColor, onSelectToken) {
  const cells = {};
  COLORS.forEach(color => {
    const player = players[color];
    player.tokens.forEach((pos, i) => {
      if (pos === TOKEN_BASE || pos === TOKEN_COMPLETE) return;
      const coords = getTokenCoords(color, pos);
      if (!coords) return;
      const key = `${coords[0]},${coords[1]}`;
      if (!cells[key]) cells[key] = [];
      const isSelectable = color === currentColor && moveableTokens.includes(i);
      const isSelected   = color === currentColor && selectedToken === i;
      cells[key].push({ color, idx: i, isSelectable, isSelected });
    });
  });
  return cells;
}

// ─── Single grid cell ─────────────────────────────────────────────────────────
function Cell({ row, col, bg, border, children, onClick, pulsing }) {
  return (
    <div
      onClick={onClick}
      style={{
        gridRow: row + 1, gridColumn: col + 1,
        background: bg,
        border: `0.8px solid ${border || 'rgba(0,0,0,0.18)'}`,
        display: 'flex', flexWrap: 'wrap',
        alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        animation: pulsing ? 'pulse 1s infinite' : 'none',
        boxSizing: 'border-box',
      }}
    >
      {children}
    </div>
  );
}

// ─── Arrow character for path direction ──────────────────────────────────────
const DIRECTION_ARROWS = {
  right: '›', left: '‹', up: '∧', down: '∨',
};

function pathCellBg(r, c) {
  for (const color of COLORS) {
    const entry = COLOR_CONFIG[color].entryIdx;
    const [er, ec] = MAIN_PATH[entry];
    if (er === r && ec === c) return { bg: BG[color], isEntry: true, color };
  }
  for (const color of COLORS) {
    for (const [sr, sc] of HOME_STRETCH[color]) {
      if (sr === r && sc === c) return { bg: BG[color] + '55', isStretch: true, color };
    }
  }
  for (let i = 0; i < MAIN_PATH.length; i++) {
    if (MAIN_PATH[i][0] === r && MAIN_PATH[i][1] === c && SAFE_SQUARES.has(i)) {
      return { bg: BG.safe, isSafe: true };
    }
  }
  return { bg: BG.path };
}

// ─── Main Board ───────────────────────────────────────────────────────────────
export default memo(function LudoBoard({ state, currentColor, onSelectToken }) {
  const { players, moveableTokens, selectedToken } = state;
  const tokenMap = buildTokenMap(players, moveableTokens, selectedToken, currentColor, onSelectToken);

  const isInHomeQuad = (r, c) =>
    (r<=5&&c<=5) || (r<=5&&c>=9) || (r>=9&&c<=5) || (r>=9&&c>=9);

  const cells = [];

  // ── Home quadrants ──
  for (const color of COLORS) {
    const cfg = COLOR_CONFIG[color];
    const [rMin, rMax] = cfg.home.rows;
    const [cMin, cMax] = cfg.home.cols;

    for (let ri = rMin; ri <= rMax; ri++) {
      for (let ci = cMin; ci <= cMax; ci++) {
        // Outer ring = solid color
        const isOuter = ri === rMin || ri === rMax || ci === cMin || ci === cMax;
        // Inner 4×4 is lighter with diamond pattern
        const isInner = ri >= rMin+1 && ri <= rMax-1 && ci >= cMin+1 && ci <= cMax-1;
        // Base token slots (2×2 grids in the inner area)
        const basePos = BASE_POSITIONS[color];
        const baseIdx = basePos.findIndex(([br, bc]) => br === ri && bc === ci);

        let bg = isOuter ? BG[color] : isInner ? '#ffffffcc' : BG[color] + 'aa';

        cells.push(
          <Cell key={`h-${color}-${ri}-${ci}`} row={ri} col={ci} bg={bg}
            border={isOuter ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.1)'}
          >
            {isInner && baseIdx === -1 && <HomeDiamond color={color} />}
            {baseIdx !== -1 && (() => {
              const pos = players[color].tokens[baseIdx];
              if (pos !== TOKEN_BASE) return null;
              const isSel = color === currentColor && moveableTokens.includes(baseIdx);
              const isSeld = color === currentColor && selectedToken === baseIdx;
              return (
                <Token color={color} isSelectable={isSel} isSelected={isSeld}
                  size={80}
                  onClick={isSel ? () => onSelectToken(baseIdx) : undefined}
                />
              );
            })()}
          </Cell>
        );
      }
    }
  }

  // ── Center 3×3 ──
  // Each of the 4 arms of the center colored
  const centerColorMap = {
    '6,7': 'green', '7,6': 'yellow', '8,7': 'red', '7,8': 'blue',
  };
  for (let r = 6; r <= 8; r++) {
    for (let c = 6; c <= 8; c++) {
      const key = `${r},${c}`;
      const armColor = centerColorMap[key];
      const isCenter = r === 7 && c === 7;
      cells.push(
        <Cell key={`c-${r}-${c}`} row={r} col={c}
          bg={isCenter ? 'conic-gradient(#e53935 0deg 90deg,#2e7d32 90deg 180deg,#1565c0 180deg 270deg,#f9a825 270deg 360deg)'
                       : armColor ? BG[armColor] : BG.path}
          border="rgba(0,0,0,0.15)"
        >
          {isCenter && <span style={{ fontSize: '60%', zIndex: 2 }}>⭐</span>}
        </Cell>
      );
    }
  }

  // ── Path cells ──
  for (let r = 0; r < 15; r++) {
    for (let c = 0; c < 15; c++) {
      if (isInHomeQuad(r, c)) continue;
      if (r >= 6 && r <= 8 && c >= 6 && c <= 8) continue; // center handled above

      const cellKey = `${r},${c}`;
      const { bg, isSafe, isEntry, isStretch, color: cellColor } = pathCellBg(r, c);
      const tokensHere = tokenMap[cellKey] || [];

      cells.push(
        <Cell key={cellKey} row={r} col={c} bg={bg}
          border={isEntry ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.12)'}
        >
          {isSafe && tokensHere.length === 0 && (
            <span style={{ fontSize: '50%', opacity: 0.7 }}>⭐</span>
          )}
          {tokensHere.length > 0 && (
            <div style={{
              display: 'flex', flexWrap: 'wrap',
              width: '100%', height: '100%',
              alignItems: 'center', justifyContent: 'center',
              gap: 1,
            }}>
              {tokensHere.map(({ color, idx, isSelectable, isSelected }) => (
                <Token key={`${color}-${idx}`} color={color}
                  isSelectable={isSelectable} isSelected={isSelected}
                  size={tokensHere.length > 1 ? 48 : 72}
                  onClick={isSelectable ? () => onSelectToken(idx) : undefined}
                />
              ))}
            </div>
          )}
        </Cell>
      );
    }
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(15, 1fr)',
      gridTemplateRows: 'repeat(15, 1fr)',
      width: '100%', height: '100%',
      borderRadius: 6,
      overflow: 'hidden',
      border: '4px solid #1565c0',
      outline: '2px solid #e53935',
      boxShadow: '0 0 0 4px #f9a825, 0 8px 40px rgba(0,0,0,0.6)',
      background: BG.path,
    }}>
      {cells}
    </div>
  );
});
