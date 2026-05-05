import { memo, useState, useEffect, useRef } from 'react';

const DOTS = {
  1: [[50,50]],
  2: [[27,27],[73,73]],
  3: [[27,27],[50,50],[73,73]],
  4: [[27,27],[73,27],[27,73],[73,73]],
  5: [[27,27],[73,27],[50,50],[27,73],[73,73]],
  6: [[27,25],[73,25],[27,50],[73,50],[27,75],[73,75]],
};

const PLAYER_COLORS = {
  red:    { face: '#e53935', dot: '#fff', glow: '#e53935', text: '#e53935', name: 'Red'    },
  green:  { face: '#2e7d32', dot: '#fff', glow: '#43a047', text: '#43a047', name: 'Green'  },
  yellow: { face: '#f9a825', dot: '#333', glow: '#fdd835', text: '#f9a825', name: 'Yellow' },
  blue:   { face: '#1565c0', dot: '#fff', glow: '#1e88e5', text: '#1e88e5', name: 'Blue'   },
};

export default memo(function LudoDice({ value, canRoll, onRoll, currentColor }) {
  const [animVal, setAnimVal] = useState(value || 1);
  const [rolling, setRolling] = useState(false);
  const intervalRef = useRef(null);
  const pc = currentColor ? PLAYER_COLORS[currentColor] : PLAYER_COLORS.red;

  // Sync display value when not rolling
  useEffect(() => {
    if (!rolling && value) setAnimVal(value);
  }, [value, rolling]);

  const handleRoll = () => {
    if (!canRoll || rolling) return;
    setRolling(true);
    onRoll();
    let count = 0;
    intervalRef.current = setInterval(() => {
      setAnimVal(Math.ceil(Math.random() * 6));
      count++;
      if (count >= 12) {
        clearInterval(intervalRef.current);
        setRolling(false);
      }
    }, 55);
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const dots = DOTS[animVal] || DOTS[1];

  return (
    <div
      onClick={handleRoll}
      style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 4, cursor: canRoll && !rolling ? 'pointer' : 'not-allowed',
        userSelect: 'none',
      }}
    >
      {/* Player turn label */}
      <div style={{
        fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase',
        color: canRoll ? pc.text : 'rgba(255,255,255,0.3)',
        fontFamily: 'Inter, sans-serif',
        transition: 'color 0.3s',
      }}>
        {currentColor ? `${pc.name}'s Turn` : '—'}
      </div>

      {/* 3D Dice wrapper */}
      <div style={{
        position: 'relative',
        width: 64, height: 64,
      }}>
        {/* Shadow layer (bottom-right offset) */}
        <div style={{
          position: 'absolute', left: 5, top: 5,
          width: 60, height: 60, borderRadius: 12,
          background: 'rgba(0,0,0,0.45)',
          filter: 'blur(3px)',
        }} />

        {/* Right face (3D illusion) */}
        <div style={{
          position: 'absolute', right: -5, top: 5,
          width: 12, height: 55, borderRadius: '0 6px 6px 0',
          background: canRoll ? `${pc.face}aa` : 'rgba(80,80,80,0.6)',
          transform: 'skewY(-45deg)',
          transformOrigin: 'top left',
          transition: 'background 0.3s',
        }} />

        {/* Bottom face (3D illusion) */}
        <div style={{
          position: 'absolute', bottom: -5, left: 5,
          width: 55, height: 12, borderRadius: '0 0 6px 6px',
          background: canRoll ? `${pc.face}88` : 'rgba(60,60,60,0.5)',
          transform: 'skewX(-45deg)',
          transformOrigin: 'top left',
          transition: 'background 0.3s',
        }} />

        {/* Front face — the main dice face */}
        <div style={{
          position: 'absolute', left: 0, top: 0,
          width: 60, height: 60, borderRadius: 12,
          background: canRoll
            ? `linear-gradient(145deg, ${pc.face}cc 0%, ${pc.face} 100%)`
            : 'linear-gradient(145deg, #555, #333)',
          border: `2px solid ${canRoll ? pc.glow : '#444'}`,
          boxShadow: canRoll && !rolling
            ? `0 0 16px ${pc.glow}88, inset 0 1px 0 rgba(255,255,255,0.25)`
            : 'inset 0 1px 0 rgba(255,255,255,0.08)',
          animation: canRoll && !rolling ? 'pulse 2s infinite' : rolling ? 'shake 0.1s infinite' : 'none',
          transform: rolling ? `rotate(${Math.random() > 0.5 ? 8 : -8}deg)` : 'rotate(0deg)',
          transition: 'background 0.3s, box-shadow 0.3s, border-color 0.3s',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {/* Number display (large, centered) */}
          <span style={{
            position: 'absolute',
            fontSize: 28, fontWeight: 900,
            color: pc.dot,
            fontFamily: 'Orbitron, monospace',
            lineHeight: 1,
            textShadow: '0 1px 3px rgba(0,0,0,0.5)',
            opacity: 0.15,
          }}>
            {animVal}
          </span>

          {/* Dots */}
          <svg viewBox="0 0 100 100" width="86%" height="86%">
            {dots.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={9}
                fill={pc.dot}
                filter="url(#dot-shadow)"
              />
            ))}
            <defs>
              <filter id="dot-shadow">
                <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.4" />
              </filter>
            </defs>
          </svg>
        </div>
      </div>

      {/* Roll hint */}
      <div style={{
        fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
        color: canRoll && !rolling ? pc.glow : 'rgba(255,255,255,0.3)',
        fontFamily: 'Inter, sans-serif',
        animation: canRoll && !rolling ? 'pulse 1.5s infinite' : 'none',
      }}>
        {rolling ? '🎲 Rolling...' : canRoll ? '▶ Tap to Roll' : value ? `Rolled ${value}` : 'Wait...'}
      </div>
    </div>
  );
});
