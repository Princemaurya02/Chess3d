import { useRef, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';

export default function MoveHistory() {
  const moveHistory = useGameStore(s => s.moveHistory);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [moveHistory]);

  const pairs = [];
  for (let i = 0; i < moveHistory.length; i += 2) {
    pairs.push({ num: Math.floor(i / 2) + 1, white: moveHistory[i], black: moveHistory[i + 1] });
  }

  return (
    <div style={{
      background: 'rgba(10,10,26,0.9)',
      borderTop: '1px solid var(--border)',
      padding: '10px 16px',
      maxHeight: '120px',
      overflowY: 'auto',
      scrollbarWidth: 'none',
    }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
        Move History
      </div>
      {pairs.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontSize: 12, fontStyle: 'italic' }}>No moves yet</div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 0' }}>
          {pairs.map(({ num, white, black }) => (
            <div key={num} style={{ display: 'flex', gap: 4, minWidth: '30%', fontSize: 12 }}>
              <span style={{ color: 'var(--text-muted)', minWidth: 20 }}>{num}.</span>
              <span style={{ color: '#d0d0e8', minWidth: 52 }}>{white?.san}</span>
              {black && <span style={{ color: '#c9a84c', minWidth: 52 }}>{black.san}</span>}
            </div>
          ))}
          <div ref={endRef} />
        </div>
      )}
    </div>
  );
}
