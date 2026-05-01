import { useRef } from 'react';
import { useGameStore } from '../../store/gameStore';

const PIECE_NAMES = { p: 'Pawn', n: 'Knight', b: 'Bishop', r: 'Rook', q: 'Queen', k: 'King' };
const PIECE_SYMBOLS = {
  w: { p: '♙', n: '♘', b: '♗', r: '♖', q: '♕', k: '♔' },
  b: { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚' },
};

function PieceUploader({ color, type }) {
  const setCustomTexture = useGameStore(s => s.setCustomTexture);
  const customTextures = useGameStore(s => s.customTextures);
  const inputRef = useRef();
  const current = customTextures[color][type];

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCustomTexture(color, type, ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        padding: '10px 8px',
        background: current ? 'rgba(201,168,76,0.1)' : 'var(--bg-glass)',
        border: `1px solid ${current ? 'var(--border-gold)' : 'var(--border)'}`,
        borderRadius: 10, cursor: 'pointer', minWidth: 68, transition: 'all 0.2s',
      }}
    >
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
      {current ? (
        <img src={current} alt={PIECE_NAMES[type]} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8 }} />
      ) : (
        <span style={{ fontSize: 32, lineHeight: 1, color: color === 'w' ? '#d0d0e8' : '#c9a84c' }}>
          {PIECE_SYMBOLS[color][type]}
        </span>
      )}
      <span style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center' }}>
        {current ? '✓ Set' : PIECE_NAMES[type]}
      </span>
    </div>
  );
}

function PlayerSection({ color, label }) {
  const types = ['k', 'q', 'r', 'b', 'n', 'p'];
  const setCustomTexture = useGameStore(s => s.setCustomTexture);

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 14, height: 14, borderRadius: '50%',
            background: color === 'w' ? 'linear-gradient(135deg, #d0d0e8, #888)' : 'linear-gradient(135deg, #2a2a4a, #c9a84c)',
            border: '1px solid var(--border)',
          }} />
          <span style={{ fontWeight: 700, fontSize: 15 }}>{label}</span>
        </div>
        <button
          className="btn-secondary"
          style={{ fontSize: 11, padding: '5px 12px' }}
          onClick={() => types.forEach(t => setCustomTexture(color, t, null))}
        >
          Reset All
        </button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {types.map(type => <PieceUploader key={type} color={color} type={type} />)}
      </div>
    </div>
  );
}

export default function CustomizePanel() {
  return (
    <div>
      <PlayerSection color="w" label="White Pieces" />
      <PlayerSection color="b" label="Black Pieces" />
      <div style={{
        background: 'rgba(201,168,76,0.05)', border: '1px solid var(--border-gold)',
        borderRadius: 10, padding: 12, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6
      }}>
        💡 <strong style={{ color: 'var(--accent-gold)' }}>Tip:</strong> Upload any image (JPG, PNG, GIF) to use as a texture on your 3D chess pieces. Square images work best.
      </div>
    </div>
  );
}
