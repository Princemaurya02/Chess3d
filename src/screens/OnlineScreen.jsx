import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { IoLink, IoCopy, IoCheckmark, IoWifi, IoClose, IoRefresh } from 'react-icons/io5';
import { useGameStore } from '../store/gameStore';
import { createRoom, joinRoom, disconnect } from '../services/peerService';

const STATUS = {
  idle: 'idle',
  creating: 'creating',
  waiting: 'waiting',
  joining: 'joining',
  connected: 'connected',
  error: 'error',
};

export default function OnlineScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { startOnlineGame } = useGameStore();

  const [status, setStatus] = useState(STATUS.idle);
  const [roomId, setRoomId] = useState('');
  const [joinInput, setJoinInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [tab, setTab] = useState('create'); // 'create' | 'join'

  const shareUrl = roomId ? `${window.location.origin}${window.location.pathname}?room=${roomId}` : '';

  // Auto-join if URL has ?room=...
  useEffect(() => {
    const roomParam = searchParams.get('room');
    if (roomParam) {
      setTab('join');
      setJoinInput(roomParam);
    }
  }, [searchParams]);

  const handleMove = useCallback((move) => {
    // Peer sent us a move — apply it
    const { chess, makeMove } = useGameStore.getState();
    if (move && move.from && move.to) {
      makeMove(move.from, move.to, move.promotion || 'q');
    }
  }, []);

  const handleCreateRoom = async () => {
    setStatus(STATUS.creating);
    setErrorMsg('');
    try {
      const id = await createRoom({
        onMove: handleMove,
        onConnect: () => {
          setStatus(STATUS.connected);
          setTimeout(() => {
            startOnlineGame('w'); // host = white
            navigate('/game');
          }, 800);
        },
        onDisconnect: () => setStatus(STATUS.error),
      });
      setRoomId(id);
      setStatus(STATUS.waiting);
    } catch (err) {
      setErrorMsg('Could not create room. Check your internet connection.');
      setStatus(STATUS.error);
    }
  };

  const handleJoinRoom = async () => {
    const id = joinInput.trim();
    if (!id) return;
    setStatus(STATUS.joining);
    setErrorMsg('');
    try {
      await joinRoom(id, {
        onMove: handleMove,
        onConnect: () => {
          setStatus(STATUS.connected);
          setTimeout(() => {
            startOnlineGame('b'); // guest = black
            navigate('/game');
          }, 400);
        },
        onDisconnect: () => setStatus(STATUS.error),
      });
    } catch (err) {
      setErrorMsg('Could not connect. The room may not exist or timed out.');
      setStatus(STATUS.error);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleReset = () => {
    disconnect();
    setStatus(STATUS.idle);
    setRoomId('');
    setErrorMsg('');
  };

  const isLoading = [STATUS.creating, STATUS.joining, STATUS.connected].includes(status);

  return (
    <div className="screen" style={{ padding: '0 16px 16px' }}>
      {/* Header */}
      <div style={{
        padding: '28px 0 20px',
        background: 'linear-gradient(180deg, rgba(124,58,237,0.15) 0%, transparent 100%)',
        margin: '0 -16px 20px', paddingLeft: 16, paddingRight: 16,
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 52, marginBottom: 8 }}>🌐</div>
        <div className="heading-lg text-gold">Play Online</div>
        <div className="text-muted" style={{ marginTop: 6 }}>
          Share a link — play with any friend, anywhere
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 0, background: 'var(--bg-glass)',
        borderRadius: 12, padding: 4, marginBottom: 20,
        border: '1px solid var(--border)',
      }}>
        {[{ id: 'create', label: '+ Create Game' }, { id: 'join', label: '→ Join Game' }].map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id)} style={{
            flex: 1, padding: '11px 8px', borderRadius: 9, cursor: 'pointer',
            background: tab === id ? 'var(--bg-card)' : 'transparent',
            border: tab === id ? '1px solid var(--border-gold)' : '1px solid transparent',
            color: tab === id ? 'var(--accent-gold)' : 'var(--text-muted)',
            fontSize: 14, fontWeight: 700, fontFamily: 'Inter, sans-serif',
            transition: 'all 0.2s',
          }}>{label}</button>
        ))}
      </div>

      {/* CREATE GAME TAB */}
      {tab === 'create' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {status === STATUS.idle && (
            <>
              <div className="glass-card" style={{ textAlign: 'center', padding: '28px 20px' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>♔</div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>You play as White</div>
                <div className="text-muted">Create a room and share the link with your friend</div>
              </div>
              <button className="btn-primary" style={{ width: '100%', padding: 16, fontSize: 16 }} onClick={handleCreateRoom}>
                🚀 Create Room
              </button>
            </>
          )}

          {status === STATUS.creating && (
            <div className="glass-card" style={{ textAlign: 'center', padding: 32 }}>
              <div style={{ fontSize: 32, animation: 'spin 1s linear infinite', display: 'inline-block', marginBottom: 12 }}>⚙</div>
              <div style={{ fontWeight: 600 }}>Setting up your room...</div>
            </div>
          )}

          {status === STATUS.waiting && roomId && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Waiting indicator */}
              <div className="glass-card" style={{
                textAlign: 'center', padding: 20,
                border: '1px solid var(--border-gold)',
                background: 'linear-gradient(135deg, rgba(201,168,76,0.08), rgba(10,10,26,0.5))',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b', animation: 'pulse 1.5s infinite' }} />
                  <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>Waiting for friend to join...</span>
                </div>
                <div className="text-muted">Share the link below</div>
              </div>

              {/* Room code */}
              <div className="glass-card" style={{ padding: '14px 16px' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Room Code</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <code style={{
                    flex: 1, fontFamily: 'monospace', fontSize: 13,
                    color: 'var(--accent-gold)', wordBreak: 'break-all',
                  }}>{roomId}</code>
                </div>
              </div>

              {/* Share URL */}
              <div className="glass-card" style={{ padding: '14px 16px' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Share Link</div>
                <div style={{
                  background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '10px 12px',
                  fontSize: 12, color: 'var(--text-secondary)', wordBreak: 'break-all',
                  marginBottom: 10, lineHeight: 1.5, fontFamily: 'monospace',
                }}>
                  {shareUrl}
                </div>
                <button
                  className={copied ? 'btn-primary' : 'btn-secondary'}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  onClick={handleCopy}
                >
                  {copied ? <IoCheckmark /> : <IoCopy />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>

              <button className="btn-secondary" onClick={handleReset} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <IoClose /> Cancel
              </button>
            </div>
          )}

          {status === STATUS.connected && (
            <div className="glass-card" style={{ textAlign: 'center', padding: 32 }}>
              <div style={{ fontSize: 48, marginBottom: 10 }}>🎉</div>
              <div style={{ fontWeight: 700, color: '#4ade80', fontSize: 16 }}>Friend Connected!</div>
              <div className="text-muted" style={{ marginTop: 6 }}>Starting game...</div>
            </div>
          )}
        </div>
      )}

      {/* JOIN GAME TAB */}
      {tab === 'join' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {(status === STATUS.idle || status === STATUS.error) && (
            <>
              <div className="glass-card" style={{ textAlign: 'center', padding: '20px 20px' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>♚</div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>You play as Black</div>
                <div className="text-muted">Enter the room code your friend shared with you</div>
              </div>

              <div className="glass-card" style={{ padding: '16px' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Room Code or Link</div>
                <input
                  type="text"
                  value={joinInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    // Auto-extract ID from pasted URL
                    const match = val.match(/[?&]room=([^&]+)/);
                    setJoinInput(match ? match[1] : val);
                  }}
                  placeholder="Paste room code or share link..."
                  style={{
                    width: '100%', padding: '12px 14px',
                    background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)',
                    borderRadius: 8, color: 'var(--text-primary)', fontSize: 13,
                    fontFamily: 'monospace', outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent-gold)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>

              {errorMsg && (
                <div style={{
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#f87171',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  ⚠️ {errorMsg}
                </div>
              )}

              <button
                className="btn-primary"
                style={{ width: '100%', padding: 16, fontSize: 16, opacity: joinInput.trim() ? 1 : 0.5 }}
                onClick={handleJoinRoom}
                disabled={!joinInput.trim()}
              >
                🔗 Join Game
              </button>
            </>
          )}

          {status === STATUS.joining && (
            <div className="glass-card" style={{ textAlign: 'center', padding: 32 }}>
              <div style={{ fontSize: 32, animation: 'spin 1s linear infinite', display: 'inline-block', marginBottom: 12 }}>⚙</div>
              <div style={{ fontWeight: 600 }}>Connecting to room...</div>
              <div className="text-muted" style={{ marginTop: 6 }}>This may take a few seconds</div>
            </div>
          )}

          {status === STATUS.connected && (
            <div className="glass-card" style={{ textAlign: 'center', padding: 32 }}>
              <div style={{ fontSize: 48, marginBottom: 10 }}>✅</div>
              <div style={{ fontWeight: 700, color: '#4ade80', fontSize: 16 }}>Connected!</div>
              <div className="text-muted" style={{ marginTop: 6 }}>Starting game...</div>
            </div>
          )}
        </div>
      )}

      {/* How it works */}
      {status === STATUS.idle && (
        <div className="gold-card" style={{ marginTop: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--accent-gold)', marginBottom: 10 }}>ℹ How it works</div>
          {[
            '1. One player creates a room and copies the link',
            '2. Share the link via WhatsApp, Telegram, etc.',
            '3. Friend opens the link and joins',
            '4. Game starts automatically — no account needed!',
          ].map(s => (
            <div key={s} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 5, lineHeight: 1.6 }}>{s}</div>
          ))}
        </div>
      )}
    </div>
  );
}
