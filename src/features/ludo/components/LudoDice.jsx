import { memo, useState, useEffect } from 'react';

const DICE_DOTS = {
  1: [[50,50]],
  2: [[25,25],[75,75]],
  3: [[25,25],[50,50],[75,75]],
  4: [[25,25],[75,25],[25,75],[75,75]],
  5: [[25,25],[75,25],[50,50],[25,75],[75,75]],
  6: [[25,25],[75,25],[25,50],[75,50],[25,75],[75,75]],
};

export default memo(function LudoDice({ value, canRoll, onRoll, currentColor }) {
  const [rolling, setRolling] = useState(false);
  const [displayValue, setDisplayValue] = useState(value || 1);
  const [frame, setFrame] = useState(0);

  const COLOR_BORDER = {
    red: '#e53935', green: '#43a047', yellow: '#f9a825', blue: '#1e88e5',
  };
  const border = currentColor ? COLOR_BORDER[currentColor] : '#c9a84c';

  const handleRoll = () => {
    if (!canRoll || rolling) return;
    setRolling(true);
    let count = 0;
    const interval = setInterval(() => {
      setDisplayValue(Math.ceil(Math.random() * 6));
      count++;
      if (count >= 10) {
        clearInterval(interval);
        setDisplayValue(value);
        setRolling(false);
      }
    }, 60);
    onRoll();
  };

  useEffect(() => {
    if (value) setDisplayValue(value);
  }, [value]);

  const dots = DICE_DOTS[displayValue] || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      {/* Dice face */}
      <div
        onClick={handleRoll}
        style={{
          width: 62, height: 62,
          background: canRoll && !rolling ? '#ffffff' : '#cccccc',
          borderRadius: 12,
          border: `3px solid ${border}`,
          position: 'relative',
          cursor: canRoll && !rolling ? 'pointer' : 'not-allowed',
          boxShadow: canRoll && !rolling
            ? `0 0 16px ${border}88, 0 4px 12px rgba(0,0,0,0.4)`
            : '0 2px 6px rgba(0,0,0,0.3)',
          transform: rolling ? 'rotate(15deg) scale(1.05)' : 'rotate(0deg) scale(1)',
          transition: 'transform 0.1s, box-shadow 0.2s',
          animation: canRoll && !rolling ? 'pulse 2s infinite' : 'none',
        }}
      >
        {dots.map(([x, y], i) => (
          <div key={i} style={{
            position: 'absolute',
            width: 9, height: 9,
            borderRadius: '50%',
            background: '#1a1a1a',
            left: `calc(${x}% - 4.5px)`,
            top: `calc(${y}% - 4.5px)`,
          }} />
        ))}
      </div>

      {/* Label */}
      <span style={{
        fontSize: 11, fontWeight: 700, fontFamily: 'Inter,sans-serif',
        color: canRoll ? border : 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: 1,
      }}>
        {rolling ? 'Rolling...' : canRoll ? 'Tap to Roll' : value ? `Rolled ${value}` : 'Wait...'}
      </span>
    </div>
  );
});
