import { useRef, useCallback, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';
import ChessPiece from '../pieces/ChessPiece';

// Convert chess.js board coordinates to 3D position
// chess.board()[row][col]: row 0 = rank 8, row 7 = rank 1
// col 0 = file a, col 7 = file h
function boardToWorld(row, col, rotated) {
  const x = rotated ? (7 - col) - 3.5 : col - 3.5;
  const z = rotated ? (7 - row) - 3.5 : row - 3.5;
  return [x, 0, z];
}

function squareToRowCol(sq) {
  const col = sq.charCodeAt(0) - 97; // 'a'=0
  const rank = parseInt(sq[1]); // 1-8
  const row = 8 - rank; // row 0 = rank 8
  return [row, col];
}

function rowColToSquare(row, col) {
  const file = String.fromCharCode(97 + col);
  const rank = 8 - row;
  return `${file}${rank}`;
}

// Board square mesh
function Square({ row, col, rotated, isLight, isSelected, isLegal, isLastMove, isCheck }) {
  const store = useGameStore();
  const square = rowColToSquare(row, col);
  const [x, , z] = boardToWorld(row, col, rotated);

  let color = isLight ? '#c9a84c' : '#1B1B3A';
  if (isCheck) color = '#8B0000';
  else if (isSelected) color = '#7c3aed';
  else if (isLastMove) color = isLight ? '#9B7820' : '#2a1f6a';

  const emissive = isSelected ? '#7c3aed' : isLastMove ? '#4a3080' : isCheck ? '#8B0000' : '#000000';
  const emissiveIntensity = isSelected ? 0.4 : isLastMove ? 0.2 : isCheck ? 0.5 : 0;

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    store.selectSquare(square);
  }, [square, store]);

  return (
    <group position={[x, -0.05, z]}>
      <mesh onClick={handleClick} receiveShadow>
        <boxGeometry args={[1, 0.1, 1]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={emissiveIntensity} roughness={0.6} metalness={0.1} />
      </mesh>
      {/* Legal move indicator */}
      {isLegal && (
        <mesh position={[0, 0.08, 0]} onClick={handleClick}>
          <cylinderGeometry args={[0.2, 0.2, 0.04, 20]} />
          <meshStandardMaterial color="#c9a84c" emissive="#c9a84c" emissiveIntensity={0.8} transparent opacity={0.85} />
        </mesh>
      )}
    </group>
  );
}

// Board coordinates labels
function BoardLabels({ rotated }) {
  const files = ['a','b','c','d','e','f','g','h'];
  const ranks = ['1','2','3','4','5','6','7','8'];
  return null; // Simplified - no text needed for performance
}

// Board border frame
function BoardFrame() {
  return (
    <mesh position={[0, -0.12, 0]} receiveShadow>
      <boxGeometry args={[9.2, 0.08, 9.2]} />
      <meshStandardMaterial color="#0d0d1a" metalness={0.3} roughness={0.7} />
    </mesh>
  );
}

// Animated piece wrapper for smooth movement
function AnimatedPiece({ pieceData, position, isSelected, isInCheck }) {
  const ref = useRef();
  const targetPos = useMemo(() => new THREE.Vector3(...position, 0.5), [position]);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.position.lerp(new THREE.Vector3(position[0], 0.5, position[2]), Math.min(1, delta * 8));
    }
  });

  return (
    <group ref={ref} position={[position[0], 0.5, position[2]]}>
      <ChessPiece
        type={pieceData.type}
        color={pieceData.color}
        square={pieceData.square}
        position={[0, 0, 0]}
        isSelected={isSelected}
        isInCheck={isInCheck}
      />
    </group>
  );
}

// Camera setup for auto-focus
function CameraController({ rotated }) {
  const { camera } = useThree();
  useEffect(() => {
    const z = rotated ? -12 : 12;
    camera.position.set(0, 10, z);
    camera.lookAt(0, 0, 0);
  }, [rotated]);
  return null;
}

// Main 3D board
function Board3D({ rotated }) {
  const { board, selectedSquare, legalMoves, lastMove, gameStatus, chess } = useGameStore();

  const checkedKingSquare = useMemo(() => {
    if (gameStatus !== 'check' && gameStatus !== 'checkmate') return null;
    const turn = chess.turn();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p?.type === 'k' && p.color === turn) return rowColToSquare(r, c);
      }
    }
    return null;
  }, [gameStatus, board, chess]);

  const selectedRowCol = selectedSquare ? squareToRowCol(selectedSquare) : null;
  const lastFromRowCol = lastMove ? squareToRowCol(lastMove.from) : null;
  const lastToRowCol = lastMove ? squareToRowCol(lastMove.to) : null;

  return (
    <>
      <BoardFrame />
      {board.map((rankArr, row) =>
        rankArr.map((piece, col) => {
          const sq = rowColToSquare(row, col);
          const isLight = (row + col) % 2 === 0;
          const isSelected = selectedSquare === sq;
          const isLegal = legalMoves.includes(sq);
          const isLastMove = (lastFromRowCol && lastFromRowCol[0]===row && lastFromRowCol[1]===col) ||
                             (lastToRowCol && lastToRowCol[0]===row && lastToRowCol[1]===col);
          const isCheck = sq === checkedKingSquare;

          return (
            <Square
              key={sq}
              row={row} col={col} rotated={rotated}
              isLight={isLight}
              isSelected={isSelected}
              isLegal={isLegal}
              isLastMove={isLastMove}
              isCheck={isCheck}
            />
          );
        })
      )}
      {board.map((rankArr, row) =>
        rankArr.map((piece, col) => {
          if (!piece) return null;
          const sq = rowColToSquare(row, col);
          const [x, , z] = boardToWorld(row, col, rotated);
          const isSelected = selectedSquare === sq;
          const isInCheck = sq === checkedKingSquare;
          return (
            <AnimatedPiece
              key={`${sq}-${piece.type}-${piece.color}`}
              pieceData={{ ...piece, square: sq }}
              position={[x, 0.5, z]}
              isSelected={isSelected}
              isInCheck={isInCheck}
            />
          );
        })
      )}
    </>
  );
}

export default function ChessBoard3D() {
  const boardRotated = useGameStore(s => s.boardRotated);

  return (
    <Canvas
      shadows
      camera={{ position: [0, 10, 12], fov: 50, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: false }}
      style={{ background: 'transparent' }}
    >
      <CameraController rotated={boardRotated} />

      {/* Lighting — bright enough to see both sides */}
      <ambientLight intensity={0.9} />

      {/* Main overhead key light */}
      <directionalLight
        position={[5, 14, 5]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />

      {/* Front fill light — illuminates black pieces facing camera */}
      <directionalLight position={[0, 6, 12]} intensity={1.0} color="#ffffff" />

      {/* Back fill — illuminates far side of board (black's side) */}
      <directionalLight position={[0, 8, -10]} intensity={0.6} color="#ffe8b0" />

      {/* Side accent lights */}
      <pointLight position={[-5, 6, -5]} intensity={0.5} color="#a060ff" />
      <pointLight position={[5, 6, 5]}  intensity={0.4} color="#c9a84c" />

      {/* Board */}
      <Board3D rotated={boardRotated} />

      {/* Camera controls */}
      <OrbitControls
        target={[0, 0, 0]}
        minPolarAngle={Math.PI / 8}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={6}
        maxDistance={22}
        enablePan={false}
        dampingFactor={0.08}
        enableDamping
      />
    </Canvas>
  );
}
