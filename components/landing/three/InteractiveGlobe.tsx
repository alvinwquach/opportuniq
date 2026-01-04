"use client";

import { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Html, Float, Stars } from "@react-three/drei";
import * as THREE from "three";

/**
 * Interactive 3D Globe
 *
 * Shows user distribution or issue types across the world
 * Animated points, gentle rotation, zoom on hover
 */

interface GlobePoint {
  lat: number;
  lng: number;
  label: string;
  value: number;
  color: string;
}

const SAMPLE_POINTS: GlobePoint[] = [
  { lat: 37.7749, lng: -122.4194, label: "San Francisco", value: 1240, color: "#00F0FF" },
  { lat: 40.7128, lng: -74.006, label: "New York", value: 890, color: "#00F0FF" },
  { lat: 51.5074, lng: -0.1278, label: "London", value: 650, color: "#00FF88" },
  { lat: 35.6762, lng: 139.6503, label: "Tokyo", value: 520, color: "#00FF88" },
  { lat: -33.8688, lng: 151.2093, label: "Sydney", value: 340, color: "#FF8800" },
  { lat: 48.8566, lng: 2.3522, label: "Paris", value: 420, color: "#00FF88" },
  { lat: 52.52, lng: 13.405, label: "Berlin", value: 380, color: "#00FF88" },
  { lat: 1.3521, lng: 103.8198, label: "Singapore", value: 280, color: "#FF8800" },
  { lat: -23.5505, lng: -46.6333, label: "São Paulo", value: 320, color: "#FF8800" },
  { lat: 19.076, lng: 72.8777, label: "Mumbai", value: 450, color: "#00F0FF" },
];

function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

function GlobePoint({ point, radius }: { point: GlobePoint; radius: number }) {
  const [hovered, setHovered] = useState(false);
  const position = latLngToVector3(point.lat, point.lng, radius);
  const ref = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (ref.current) {
      const scale = hovered ? 1.5 : 1;
      ref.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={ref}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <sphereGeometry args={[0.02, 16, 16]} />
        <meshBasicMaterial color={point.color} />
      </mesh>
      {hovered && (
        <Html distanceFactor={3} style={{ pointerEvents: "none" }}>
          <div className="bg-neutral-900/95 border border-neutral-700 rounded-lg px-3 py-2 text-center whitespace-nowrap">
            <div className="text-white text-sm font-medium">{point.label}</div>
            <div className="text-xs mt-0.5" style={{ color: point.color }}>
              {point.value.toLocaleString()} users
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

function Globe() {
  const globeRef = useRef<THREE.Mesh>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useFrame(() => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.001;
    }
  });

  const radius = 1;

  return (
    <group>
      {/* Globe sphere */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial
          color="#0a0a0a"
          metalness={0.1}
          roughness={0.8}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Wireframe overlay */}
      <mesh>
        <sphereGeometry args={[radius * 1.001, 32, 32]} />
        <meshBasicMaterial
          color="#00F0FF"
          wireframe
          transparent
          opacity={0.1}
        />
      </mesh>

      {/* Points */}
      {mounted && SAMPLE_POINTS.map((point, i) => (
        <GlobePoint key={i} point={point} radius={radius * 1.02} />
      ))}

      {/* Glow ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 1.1, radius * 1.15, 64]} />
        <meshBasicMaterial color="#00F0FF" transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export function InteractiveGlobe() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[400px] bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-center">
        <div className="text-neutral-500 text-sm">Loading 3D Globe...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[400px] bg-neutral-950 rounded-xl border border-neutral-800 overflow-hidden">
      <Canvas camera={{ position: [0, 0, 3], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#00F0FF" />

        <Suspense fallback={null}>
          <Float speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
            <Globe />
          </Float>
          <Stars radius={50} depth={50} count={1000} factor={2} fade speed={1} />
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI * 3 / 4}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>

      {/* Stats overlay */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between">
        <div className="bg-neutral-900/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-neutral-800">
          <div className="text-lg font-semibold text-[#00F0FF]">5,490</div>
          <div className="text-xs text-neutral-500">Total Users</div>
        </div>
        <div className="bg-neutral-900/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-neutral-800">
          <div className="text-lg font-semibold text-[#00FF88]">47</div>
          <div className="text-xs text-neutral-500">Countries</div>
        </div>
        <div className="bg-neutral-900/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-neutral-800">
          <div className="text-lg font-semibold text-[#FF8800]">12K+</div>
          <div className="text-xs text-neutral-500">Decisions</div>
        </div>
      </div>
    </div>
  );
}
