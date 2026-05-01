import Peer from 'peerjs';

let peer = null;
let conn = null;
let moveHandler = null;
let connectHandler = null;
let disconnectHandler = null;

const PEER_CONFIG = {
  // Use the public PeerJS cloud server — works over internet
  host: '0.peerjs.com',
  port: 443,
  secure: true,
  path: '/',
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  },
};

function setupConnection(connection) {
  conn = connection;
  conn.on('open', () => {
    connectHandler?.();
  });
  conn.on('data', (data) => {
    if (data.type === 'move') moveHandler?.(data.move);
    if (data.type === 'sync') moveHandler?.({ type: 'sync', fen: data.fen });
  });
  conn.on('close', () => disconnectHandler?.());
  conn.on('error', () => disconnectHandler?.());
}

/** Host: Create a new room — returns room ID */
export function createRoom({ onMove, onConnect, onDisconnect }) {
  return new Promise((resolve, reject) => {
    moveHandler = onMove;
    connectHandler = onConnect;
    disconnectHandler = onDisconnect;

    peer = new Peer(undefined, PEER_CONFIG);
    peer.on('open', (id) => resolve(id));
    peer.on('connection', setupConnection);
    peer.on('error', reject);
  });
}

/** Guest: Join an existing room by ID */
export function joinRoom(roomId, { onMove, onConnect, onDisconnect }) {
  return new Promise((resolve, reject) => {
    moveHandler = onMove;
    connectHandler = onConnect;
    disconnectHandler = onDisconnect;

    peer = new Peer(undefined, PEER_CONFIG);
    peer.on('open', () => {
      const c = peer.connect(roomId, { reliable: true });
      setupConnection(c);
      // resolve after open fires inside setupConnection
      const originalConnect = connectHandler;
      connectHandler = () => {
        originalConnect?.();
        resolve();
      };
    });
    peer.on('error', reject);
    setTimeout(() => reject(new Error('Connection timeout')), 15000);
  });
}

/** Send a move to the peer */
export function sendMove(move) {
  if (conn?.open) {
    conn.send({ type: 'move', move });
  }
}

/** Send full FEN (for sync on reconnect) */
export function sendSync(fen) {
  if (conn?.open) {
    conn.send({ type: 'sync', fen });
  }
}

export function isConnected() {
  return conn?.open ?? false;
}

export function disconnect() {
  try { conn?.close(); } catch (_) {}
  try { peer?.destroy(); } catch (_) {}
  peer = null;
  conn = null;
  moveHandler = null;
  connectHandler = null;
  disconnectHandler = null;
}
