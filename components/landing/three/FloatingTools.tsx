"use client";

import { useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Text3D, Center, MeshTransmissionMaterial, Environment } from "@react-three/drei";
import * as THREE from "three";

/**
 * Floating Tools Visualization
 *
 * 3D floating icons representing different issue categories
 * Gentle rotation, hover effects, ambient glow
 */

interface ToolProps {
  position: [number, number, number];
  color: string;
  icon: string;
  label: string;
  rotation?: [number, number, number];
}

function Tool({ position, color, label, rotation = [0, 0, 0] }: ToolProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      const scale = hovered ? 1.2 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group position={position} rotation={rotation as unknown as THREE.Euler}>
        <mesh
          ref={meshRef}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
        >
          <icosahedronGeometry args={[0.3, 1]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={hovered ? 0.5 : 0.2}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Glow sphere */}
        <mesh scale={1.2}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={hovered ? 0.15 : 0.05}
          />
        </mesh>

        {/* Label - visible on hover */}
        {hovered && (
          <group position={[0, -0.5, 0]}>
            <mesh>
              <planeGeometry args={[1.2, 0.3]} />
              <meshBasicMaterial color="#0a0a0a" transparent opacity={0.9} />
            </mesh>
          </group>
        )}
      </group>
    </Float>
  );
}

function CentralOrb() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.2;
      ref.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <mesh ref={ref}>
      <dodecahedronGeometry args={[0.5, 0]} />
      <MeshTransmissionMaterial
        backside
        samples={4}
        thickness={0.5}
        chromaticAberration={0.1}
        anisotropy={0.3}
        distortion={0.5}
        distortionScale={0.5}
        temporalDistortion={0.2}
        iridescence={1}
        iridescenceIOR={1}
        iridescenceThicknessRange={[0, 1400]}
        color="#00F0FF"
      />
    </mesh>
  );
}

function ConnectingLines() {
  const positions = [
    [-1.5, 0.5, 0],
    [1.5, 0.8, -0.5],
    [-1, -0.8, 0.5],
    [1.2, -0.5, 0.3],
    [0, 1.2, -0.5],
    [-0.5, -1, -0.5],
  ];

  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={ref}>
      {positions.map((pos, i) => {
        const positionArray = new Float32Array([0, 0, 0, ...pos]);
        return (
          <line key={i}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[positionArray, 3]}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#00F0FF" transparent opacity={0.2} />
          </line>
        );
      })}
    </group>
  );
}

function Scene() {
  const tools = [
    { position: [-1.5, 0.5, 0] as [number, number, number], color: "#00F0FF", icon: "🏠", label: "Home" },
    { position: [1.5, 0.8, -0.5] as [number, number, number], color: "#00FF88", icon: "🔧", label: "Repair" },
    { position: [-1, -0.8, 0.5] as [number, number, number], color: "#FF8800", icon: "🚗", label: "Auto" },
    { position: [1.2, -0.5, 0.3] as [number, number, number], color: "#A855F7", icon: "💡", label: "DIY" },
    { position: [0, 1.2, -0.5] as [number, number, number], color: "#00F0FF", icon: "📊", label: "Analysis" },
    { position: [-0.5, -1, -0.5] as [number, number, number], color: "#00FF88", icon: "💰", label: "Savings" },
  ];

  return (
    <>
      <CentralOrb />
      <ConnectingLines />
      {tools.map((tool, i) => (
        <Tool key={i} {...tool} />
      ))}
    </>
  );
}

export function FloatingTools() {
  return (
    <div className="relative w-full h-[300px] bg-neutral-950 rounded-xl border border-neutral-800 overflow-hidden">
      <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={0.5} color="#00F0FF" />
        <pointLight position={[-5, -5, -5]} intensity={0.3} color="#00FF88" />
        <spotLight position={[0, 5, 0]} angle={0.3} penumbra={1} intensity={0.5} color="#fff" />

        <Suspense fallback={null}>
          <Scene />
          <Environment preset="night" />
        </Suspense>
      </Canvas>

      {/* Gradient overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
    </div>
  );
}
