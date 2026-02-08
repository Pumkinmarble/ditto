'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface DittoCharacterProps {
  mousePos: { x: number; y: number };
  isPopupOpen: boolean;
  audioLevel?: number;
}

function DittoMouth({ audioLevel = 0 }: { audioLevel: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const prevLevel = useRef(0);

  useFrame(() => {
    if (!meshRef.current) return;
    // Smooth the audio level
    const smoothed = THREE.MathUtils.lerp(prevLevel.current, audioLevel, 0.25);
    prevLevel.current = smoothed;

    // Scale Y: when silent → flat ellipse, when talking → open circle
    // Min scaleY 0.15 (thin line), max scaleY 1.0 (full circle)
    const openness = 0.15 + smoothed * 0.85;
    meshRef.current.scale.set(1, openness, 1);
  });

  return (
    <mesh ref={meshRef} position={[0, -0.2, 1.28]} renderOrder={1}>
      <circleGeometry args={[0.18, 32]} />
      <meshStandardMaterial color="#2D1B4E" depthTest={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

function DittoBlob({ mousePos, isPopupOpen, audioLevel = 0 }: DittoCharacterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<any>(null);

  useFrame((_state, delta) => {
    if (!materialRef.current || !groupRef.current) return;

    // Normalize mouse position to -1..1
    const nx = (mousePos.x / window.innerWidth) * 2 - 1;
    const ny = -(mousePos.y / window.innerHeight) * 2 + 1;

    // Distance from center — closer cursor = more jiggle
    const dist = Math.sqrt(nx * nx + ny * ny);
    const proximity = Math.max(0, 1 - dist);

    // Animate distortion: base 0.2 + up to 0.25 extra when cursor is near
    const targetDistort = isPopupOpen ? 0.15 : 0.2 + proximity * 0.25;
    materialRef.current.distort = THREE.MathUtils.lerp(
      materialRef.current.distort,
      targetDistort,
      delta * 3
    );

    // Rotate to follow cursor (smooth spring-like)
    const targetRotationY = nx * 0.5;
    const targetRotationX = -ny * 0.3;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRotationY,
      delta * 4
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetRotationX,
      delta * 4
    );

    // Subtle idle bob
    groupRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.05;
  });

  return (
    <group ref={groupRef}>
      {/* Main blob body */}
      <mesh>
        <sphereGeometry args={[1.2, 64, 64]} />
        <MeshDistortMaterial
          ref={materialRef}
          color="#C8A2F8"
          speed={2.5}
          distort={0.2}
          radius={1}
          roughness={0.2}
          metalness={0.1}
          clearcoat={0.8}
          clearcoatRoughness={0.2}
        />
      </mesh>

      {/* Face group - rendered on top of blob */}
      {/* Left eye */}
      <mesh position={[-0.35, 0.25, 1.25]} renderOrder={1}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial color="#2D1B4E" depthTest={false} />
      </mesh>
      {/* Left eye highlight */}
      <mesh position={[-0.30, 0.32, 1.38]} renderOrder={2}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshBasicMaterial color="white" depthTest={false} />
      </mesh>

      {/* Right eye */}
      <mesh position={[0.35, 0.25, 1.25]} renderOrder={1}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial color="#2D1B4E" depthTest={false} />
      </mesh>
      {/* Right eye highlight */}
      <mesh position={[0.40, 0.32, 1.38]} renderOrder={2}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshBasicMaterial color="white" depthTest={false} />
      </mesh>

      {/* Mouth */}
      <DittoMouth audioLevel={audioLevel} />
    </group>
  );
}

export default function DittoCharacter({ mousePos, isPopupOpen, audioLevel }: DittoCharacterProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -60%) scale(${isPopupOpen ? 0.8 : 1})`,
        width: '500px',
        height: '500px',
        zIndex: 30,
        transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: 'none',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-3, 2, 4]} intensity={0.3} color="#A855F7" />
        <DittoBlob mousePos={mousePos} isPopupOpen={isPopupOpen} audioLevel={audioLevel} />
      </Canvas>
    </div>
  );
}
