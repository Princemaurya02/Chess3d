import React, { memo } from 'react';
import { COLORS, PLAYER_PATH, HOME_STRETCH, BASE_POS, HOME_BOUNDS, SAFE_POS, TOKENS_PER_PLAYER, BASE, DONE, PATH_LEN } from '../engine/ludoConstants';
import { getCoords } from '../engine/ludoEngine';

const CLR = { red:'#f44336', green:'#4caf50', yellow:'#ffeb3b', blue:'#2196f3' };
const DRK = { red:'#b71c1c', green:'#1b5e20', yellow:'#f57f17', blue:'#0d47a1' };
const TXT = { red:'#fff',    green:'#fff',    yellow:'#333',    blue:'#fff'   };

function Tok({ color, num, sel, done, onClick }) {
  const bg = done ? '#gold' : CLR[color];
  return (
    <div onClick={onClick} style={{
      width:'78%', height:'78%', borderRadius:'50%',
      background: done ? 'linear-gradient(135deg,#ffd700,#ff8c00)' : CLR[color],
      border:`2px solid ${DRK[color]}`,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:'clamp(7px,1.5vw,11px)', fontWeight:900, color: TXT[color],
      cursor: sel?'pointer':'default',
      boxShadow: sel ? `0 0 0 3px white, 0 0 10px ${CLR[color]}` : '0 1px 3px rgba(0,0,0,0.4)',
      transform: sel?'scale(1.2)':'scale(1)',
      transition:'transform 0.15s,box-shadow 0.15s',
      fontFamily:'Inter,sans-serif', userSelect:'none',
    }}>{num+1}</div>
  );
}

function buildMap(players, current, canMove) {
  const m = {};
  for (const col of COLORS) {
    players[col].tokens.forEach((pos,i) => {
      if (pos===BASE||pos===DONE) return;
      const rc = getCoords(col, pos);
      if (!rc) return;
      const k=`${rc[0]},${rc[1]}`;
      if(!m[k]) m[k]=[];
      const sel = col===current && canMove.includes(i);
      m[k].push({col,i,sel});
    });
  }
  return m;
}

function isInHome(r,c) {
  for (const col of COLORS) {
    const [r1,r2,c1,c2] = HOME_BOUNDS[col];
    if(r>=r1&&r<=r2&&c>=c1&&c<=c2) return col;
  }
  return null;
}

function pathBg(r,c) {
  // Home stretch cells
  for (const col of COLORS) {
    for (const [hr,hc] of HOME_STRETCH[col]) {
      if(hr===r&&hc===c) return { bg: CLR[col]+'aa', hs: col };
    }
  }
  // Safe squares (star cells — starting squares of all players)
  for (const col of COLORS) {
    if(PLAYER_PATH[col][0][0]===r && PLAYER_PATH[col][0][1]===c)
      return { bg: CLR[col]+'cc', star:true };
  }
  return { bg:'#fff' };
}

export default memo(function LudoBoard({ state, current, onSelect }) {
  const { players, canMove } = state;
  const tokenMap = buildMap(players, current, canMove);

  const cells = [];
  for (let r=0; r<15; r++) {
    for (let c=0; c<15; c++) {
      const homeCol = isInHome(r,c);
      const key = `${r},${c}`;

      if (homeCol) {
        const [r1,,c1] = HOME_BOUNDS[homeCol];
        const inner = r>=r1+1&&r<=r1+4&&c>=c1+1&&c<=c1+4;
        const bi = BASE_POS[homeCol].findIndex(([br,bc])=>br===r&&bc===c);
        cells.push(
          <div key={key} style={{
            gridRow:r+1,gridColumn:c+1,
            background: inner ? '#fff' : CLR[homeCol],
            border:`0.5px solid rgba(0,0,0,0.1)`,
            display:'flex',alignItems:'center',justifyContent:'center',position:'relative',
          }}>
            {inner && bi<0 && (
              <div style={{width:'50%',height:'50%',background:CLR[homeCol]+'55',borderRadius:3,transform:'rotate(45deg)'}} />
            )}
            {bi>=0 && (() => {
              const pos = players[homeCol].tokens[bi];
              if(pos!==BASE) return null;
              const sel = homeCol===current && canMove.includes(bi);
              return <Tok color={homeCol} num={bi} sel={sel} onClick={sel?()=>onSelect(bi):undefined}/>;
            })()}
          </div>
        );
        continue;
      }

      // Center
      if(r===7&&c===7) {
        cells.push(
          <div key={key} style={{
            gridRow:8,gridColumn:8,
            background:'conic-gradient(#f44336 0 90deg,#4caf50 90deg 180deg,#2196f3 180deg 270deg,#ffeb3b 270deg)',
            border:'1px solid rgba(0,0,0,0.2)',
            display:'flex',alignItems:'center',justifyContent:'center',
          }}>
            <div style={{width:'60%',height:'60%',clipPath:'polygon(50% 0%,100% 50%,50% 100%,0% 50%)',background:'rgba(255,255,255,0.9)'}} />
          </div>
        );
        continue;
      }

      const { bg, star } = pathBg(r,c);
      const toks = tokenMap[key]||[];

      cells.push(
        <div key={key} style={{
          gridRow:r+1,gridColumn:c+1, background:bg,
          border:`0.5px solid rgba(0,0,0,0.12)`,
          display:'flex',flexWrap:'wrap',
          alignItems:'center',justifyContent:'center',
          position:'relative',
        }}>
          {star && toks.length===0 && (
            <div style={{width:'40%',height:'40%',clipPath:'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)',background:'rgba(255,255,255,0.7)'}} />
          )}
          {!star && toks.length===0 && (
            // Safe squares show a small star
            (() => {
              const isSafeCell = COLORS.some(col => {
                for(let p=0;p<PATH_LEN;p++) {
                  if(PLAYER_PATH[col][p]?.[0]===r&&PLAYER_PATH[col][p]?.[1]===c&&SAFE_POS.has(p)) return true;
                }
                return false;
              });
              return isSafeCell ? <span style={{fontSize:'55%',opacity:0.5}}>⭐</span> : null;
            })()
          )}
          {toks.length>0 && (
            <div style={{display:'flex',flexWrap:'wrap',width:'100%',height:'100%',alignItems:'center',justifyContent:'center'}}>
              {toks.map(({col,i,sel})=>(
                <div key={`${col}-${i}`} style={{width:toks.length>1?'48%':'100%',height:toks.length>1?'48%':'100%',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <Tok color={col} num={i} sel={sel} onClick={sel?()=>onSelect(i):undefined}/>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
  }

  return (
    <div style={{
      display:'grid', gridTemplateColumns:'repeat(15,1fr)', gridTemplateRows:'repeat(15,1fr)',
      width:'100%', height:'100%',
      border:'5px solid #333',
      borderRadius:4, overflow:'hidden',
      boxShadow:'0 4px 30px rgba(0,0,0,0.5)',
    }}>
      {cells}
    </div>
  );
});
