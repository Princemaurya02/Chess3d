import { useRef, useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';

// Pawn: base=mkMat(false), body+head=mkMat(true)
function PawnMeshes({ mkMat }) {
  return (
    <group>
      {/* Flat base */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.34, 0.38, 0.1, 20]} />
        {mkMat(false)}
      </mesh>
      {/* Neck collar */}
      <mesh position={[0, 0.18, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.28, 0.2, 16]} />
        {mkMat(false)}
      </mesh>
      {/* Main body — texture here */}
      <mesh position={[0, 0.48, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.18, 0.4, 16]} />
        {mkMat(true)}
      </mesh>
      {/* Head sphere — texture here */}
      <mesh position={[0, 0.78, 0]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        {mkMat(true)}
      </mesh>
    </group>
  );
}

function KnightMeshes({ mkMat }) {
  return (
    <group>
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.34, 0.38, 0.1, 20]} />
        {mkMat(false)}
      </mesh>
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.3, 0.4, 16]} />
        {mkMat(false)}
      </mesh>
      {/* Knight head body — texture */}
      <mesh position={[0.04, 0.68, 0.06]} rotation={[0.4, 0, 0.15]} castShadow>
        <boxGeometry args={[0.32, 0.55, 0.22]} />
        {mkMat(true)}
      </mesh>
      <mesh position={[0.04, 0.9, 0.2]} rotation={[-0.3, 0, 0.1]} castShadow>
        <boxGeometry args={[0.26, 0.18, 0.32]} />
        {mkMat(true)}
      </mesh>
      <mesh position={[0.04, 0.98, 0.08]} castShadow>
        <sphereGeometry args={[0.08, 8, 8]} />
        {mkMat(false)}
      </mesh>
    </group>
  );
}

function BishopMeshes({ mkMat }) {
  return (
    <group>
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.34, 0.38, 0.1, 20]} />
        {mkMat(false)}
      </mesh>
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.17, 0.27, 0.25, 16]} />
        {mkMat(false)}
      </mesh>
      {/* Tall body — texture */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.17, 0.65, 14]} />
        {mkMat(true)}
      </mesh>
      {/* Top sphere — texture */}
      <mesh position={[0, 0.98, 0]} castShadow>
        <sphereGeometry args={[0.15, 14, 14]} />
        {mkMat(true)}
      </mesh>
      <mesh position={[0, 1.16, 0]} castShadow>
        <coneGeometry args={[0.07, 0.2, 8]} />
        {mkMat(false)}
      </mesh>
    </group>
  );
}

function RookMeshes({ mkMat }) {
  return (
    <group>
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.34, 0.38, 0.1, 20]} />
        {mkMat(false)}
      </mesh>
      {/* Main tower — texture */}
      <mesh position={[0, 0.43, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.3, 0.65, 16]} />
        {mkMat(true)}
      </mesh>
      <mesh position={[0, 0.82, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.26, 0.12, 16]} />
        {mkMat(false)}
      </mesh>
      {/* Battlements */}
      {[-0.16, 0, 0.16].map((x, i) => (
        <mesh key={i} position={[x, 1.0, 0]} castShadow>
          <boxGeometry args={[0.12, 0.2, 0.6]} />
          {mkMat(false)}
        </mesh>
      ))}
    </group>
  );
}

function QueenMeshes({ mkMat }) {
  return (
    <group>
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.36, 0.4, 0.1, 20]} />
        {mkMat(false)}
      </mesh>
      <mesh position={[0, 0.27, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.3, 0.3, 16]} />
        {mkMat(false)}
      </mesh>
      {/* Tall body — texture */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.18, 0.75, 14]} />
        {mkMat(true)}
      </mesh>
      <mesh position={[0, 1.12, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.15, 0.14, 16]} />
        {mkMat(false)}
      </mesh>
      {/* Crown spheres */}
      {[0, 72, 144, 216, 288].map((deg, i) => {
        const r = 0.18;
        const a = (deg * Math.PI) / 180;
        return (
          <mesh key={i} position={[Math.sin(a) * r, 1.28, Math.cos(a) * r]} castShadow>
            <sphereGeometry args={[0.07, 10, 10]} />
            {mkMat(false)}
          </mesh>
        );
      })}
      <mesh position={[0, 1.21, 0]} castShadow>
        <sphereGeometry args={[0.1, 12, 12]} />
        {mkMat(false)}
      </mesh>
    </group>
  );
}

function KingMeshes({ mkMat }) {
  return (
    <group>
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.36, 0.4, 0.1, 20]} />
        {mkMat(false)}
      </mesh>
      <mesh position={[0, 0.27, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.32, 0.3, 16]} />
        {mkMat(false)}
      </mesh>
      {/* Tall body — texture */}
      <mesh position={[0, 0.78, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 0.9, 14]} />
        {mkMat(true)}
      </mesh>
      <mesh position={[0, 1.28, 0]} castShadow>
        <cylinderGeometry args={[0.23, 0.16, 0.14, 16]} />
        {mkMat(false)}
      </mesh>
      {/* Cross vertical */}
      <mesh position={[0, 1.55, 0]} castShadow>
        <boxGeometry args={[0.08, 0.32, 0.08]} />
        {mkMat(false)}
      </mesh>
      {/* Cross horizontal */}
      <mesh position={[0, 1.62, 0]} castShadow>
        <boxGeometry args={[0.26, 0.08, 0.08]} />
        {mkMat(false)}
      </mesh>
    </group>
  );
}

const PIECE_MESH_MAP = { p: PawnMeshes, n: KnightMeshes, b: BishopMeshes, r: RookMeshes, q: QueenMeshes, k: KingMeshes };

export default function ChessPiece({ type, color, square, position, isSelected, isInCheck }) {
  const customTextures = useGameStore(s => s.customTextures);
  const textureUrl = customTextures[color][type];

  // ── Base solid color material (always used for base/decorative parts) ──
  const baseMat = useMemo(() => {
    if (color === 'w') {
      return new THREE.MeshStandardMaterial({
        color: '#dcdcec',
        metalness: 0.75,
        roughness: 0.22,
      });
    }
    // Black pieces: rich dark walnut + gold emissive so they're clearly visible
    return new THREE.MeshStandardMaterial({
      color: '#2a1500',
      emissive: '#c9a84c',
      emissiveIntensity: 0.28,
      metalness: 0.6,
      roughness: 0.35,
    });
  }, [color]);

  // ── Body material — uses custom texture if uploaded, otherwise same as base ──
  const bodyMat = useMemo(() => {
    if (textureUrl) {
      const loader = new THREE.TextureLoader();
      const tex = loader.load(textureUrl);
      // ClampToEdge = show image ONCE, no tiling
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.repeat.set(1, 1);
      tex.needsUpdate = true;
      return new THREE.MeshStandardMaterial({
        map: tex,
        metalness: 0.2,
        roughness: 0.6,
      });
    }
    return baseMat;
  }, [textureUrl, baseMat]);

  // ── Selected / check overrides ──
  const selectedMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: color === 'w' ? '#ffffff' : '#3a2000',
    emissive: '#c9a84c',
    emissiveIntensity: 0.7,
    metalness: 0.85,
    roughness: 0.15,
  }), [color]);

  const checkMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#cc2200',
    emissive: '#ff3300',
    emissiveIntensity: 0.8,
    metalness: 0.5,
    roughness: 0.3,
  }), []);

  // Active override (check/selected) replaces everything
  const overrideMat = isInCheck ? checkMat : isSelected ? selectedMat : null;

  // Helper: pick correct material
  // overrideMat → use for all parts
  // otherwise → baseMat for base/detail, bodyMat for main cylinder body
  const mkMat = (isBody = false) => (
    <primitive object={overrideMat ?? (isBody ? bodyMat : baseMat)} attach="material" />
  );

  const PieceMesh = PIECE_MESH_MAP[type] || PawnMeshes;

  return (
    <group position={position}>
      <PieceMesh mkMat={mkMat} />
    </group>
  );
}
