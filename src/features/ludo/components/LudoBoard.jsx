import React, { memo } from 'react';
import {
  MAIN_PATH, HOME_STRETCH, BASE_POSITIONS, HOME_BOUNDS,
  SAFE_SQUARES, COLOR_CONFIG, COLORS, TOKENS_PER_PLAYER,
  TOKEN_BASE, TOKEN_COMPLETE, MAIN_PATH_LEN,
} from '../engine/ludoConstants';
import { absIdx, getTokenCoords } from '../engine/ludoEngine';

const C = {
  red:    '#e53935', green:  '#2e7d32',
  yellow: '#f9a825', blue:   '#1565c0',
  path:   '#f5f0e8', border: 'rgba(0,0,0,0.15)',
  safe:   '#c8e6c9', center: '#fff',
};
const STROKE = { red:'#b71c1c', green:'#1b5e20', yellow:'#e65100', blue:'0d47a1' };

// SVG Token
const Token = memo(({ color, selectable, selected, onClick, pct = 72 }) => (
  <svg
    viewBox="0 0 40 40"
    width={`${pct}%`} height={`${pct}%`}
    onClick={onClick}
    style={{
      cursor: selectable ? 'pointer' : 'default',
      filter: selected ? `drop-shadow(0 0 5px ${C[color]})` : selectable ? `drop-shadow(0 0 3px ${C[color]})` : 'none',
      transform: selected ? 'scale(1.2)' : selectable ? 'scale(1.1)' : 'scale(1)',
      transition: 'transform 0.15s',
    }}
  >
    <circle cx="20" cy="20" r="18" fill={STROKE[color] || C[color]} />
    <circle cx="20" cy="20" r="14" fill={C[color]} />
    <circle cx="14" cy="13" r="5" fill="rgba(255,255,255,0.4)" />
    <circle cx="20" cy="20" r="4"  fill={STROKE[color] || C[color]} />
  </svg>
));

// Build map: "row,col" → [{color,idx,sel,seld}]
function buildMap(players, currentColor, moveableTokens, selectedToken) {
  const map = {};
  for (const color of COLORS) {
    players[color].tokens.forEach((pos, i) => {
      if (pos === TOKEN_BASE || pos === TOKEN_COMPLETE) return;
      const rc = getTokenCoords(color, pos);
      if (!rc) return;
      const k = `${rc[0]},${rc[1]}`;
      if (!map[k]) map[k] = [];
      map[k].push({
        color, idx: i,
        sel:  color === currentColor && moveableTokens.includes(i),
        seld: color === currentColor && selectedToken === i,
      });
    });
  }
  return map;
}

// Path cell background
function cellBg(r, c) {
  // Entry squares
  for (const color of COLORS) {
    const ei = COLOR_CONFIG[color].entryIdx;
    const [er, ec] = MAIN_PATH[ei];
    if (er === r && ec === c) return C[color];
  }
  // Home stretch
  for (const color of COLORS) {
    for (const [hr, hc] of HOME_STRETCH[color]) {
      if (hr === r && hc === c) return C[color] + '55';
    }
  }
  // Safe
  for (let i = 0; i < MAIN_PATH.length; i++) {
    const [pr, pc] = MAIN_PATH[i];
    if (pr === r && pc === c && SAFE_SQUARES.has(i)) return C.safe;
  }
  return C.path;
}

function isHomeCell(r, c) {
  for (const color of COLORS) {
    const [r1,r2,c1,c2] = HOME_BOUNDS[color];
    if (r>=r1&&r<=r2&&c>=c1&&c<=c2) return color;
  }
  return null;
}

function isCenter(r, c) { return r===7&&c===7; }

export default memo(function LudoBoard({ state, currentColor, onSelectToken }) {
  const { players, moveableTokens, selectedToken } = state;
  const tokenMap = buildMap(players, currentColor, moveableTokens, selectedToken);

  const cells = [];

  for (let r = 0; r < 15; r++) {
    for (let c = 0; c < 15; c++) {
      const homeColor = isHomeCell(r, c);

      // ── Home quadrant cell ──
      if (homeColor) {
        const [r1,,c1] = HOME_BOUNDS[homeColor];
        const inner = r>=r1+1 && r<=r1+4 && c>=c1+1 && c<=c1+4;
        const baseIdx = BASE_POSITIONS[homeColor].findIndex(([br,bc]) => br===r&&bc===c);
        cells.push(
          <div key={`${r},${c}`} style={{
            gridRow:r+1, gridColumn:c+1,
            background: inner ? '#ffffffcc' : C[homeColor],
            border: `0.5px solid ${C.border}`,
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            {inner && baseIdx === -1 && (
              <div style={{ width:'55%',height:'55%',background:C[homeColor]+'44',
                borderRadius:4,transform:'rotate(45deg)' }} />
            )}
            {baseIdx !== -1 && (() => {
              const pos = players[homeColor].tokens[baseIdx];
              if (pos !== TOKEN_BASE) return null;
              const s = homeColor===currentColor && moveableTokens.includes(baseIdx);
              const sd = homeColor===currentColor && selectedToken===baseIdx;
              return <Token color={homeColor} selectable={s} selected={sd} pct={80}
                onClick={s ? ()=>onSelectToken(baseIdx) : undefined} />;
            })()}
          </div>
        );
        continue;
      }

      // ── Center ──
      if (isCenter(r,c)) {
        cells.push(
          <div key="7,7" style={{
            gridRow:8,gridColumn:8,
            background:'conic-gradient(#e53935 0 90deg,#2e7d32 90deg 180deg,#1565c0 180deg 270deg,#f9a825 270deg)',
            border:'1px solid rgba(0,0,0,0.2)',
            display:'flex',alignItems:'center',justifyContent:'center',fontSize:'60%',
          }}>⭐</div>
        );
        continue;
      }

      // ── Path / home-stretch cell ──
      const bg = cellBg(r, c);
      const key = `${r},${c}`;
      const tokensHere = tokenMap[key] || [];
      const isSafeSq = (() => {
        for (let i=0;i<MAIN_PATH.length;i++) {
          const [pr,pc]=MAIN_PATH[i];
          if(pr===r&&pc===c&&SAFE_SQUARES.has(i)) return true;
        }
        return false;
      })();

      cells.push(
        <div key={key} style={{
          gridRow:r+1, gridColumn:c+1,
          background:bg, border:`0.5px solid ${C.border}`,
          display:'flex',flexWrap:'wrap',
          alignItems:'center',justifyContent:'center',
          position:'relative',
        }}>
          {isSafeSq && tokensHere.length===0 && (
            <span style={{fontSize:'55%',opacity:0.7}}>⭐</span>
          )}
          {tokensHere.map(({color,idx,sel,seld}) => (
            <Token key={`${color}-${idx}`} color={color} selectable={sel} selected={seld}
              pct={tokensHere.length>1?46:72}
              onClick={sel ? ()=>onSelectToken(idx) : undefined}
            />
          ))}
        </div>
      );
    }
  }

  return (
    <div style={{
      display:'grid',
      gridTemplateColumns:'repeat(15,1fr)',
      gridTemplateRows:'repeat(15,1fr)',
      width:'100%',height:'100%',
      border:'4px solid #1565c0',
      outline:'3px solid #f9a825',
      boxShadow:'0 0 0 3px #e53935, 0 8px 40px rgba(0,0,0,0.6)',
      background:C.path,
      borderRadius:6,overflow:'hidden',
    }}>
      {cells}
    </div>
  );
});
