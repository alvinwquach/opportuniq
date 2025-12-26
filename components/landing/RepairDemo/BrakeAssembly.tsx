"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface BrakeAssemblyProps {
  step: number;
  showError: boolean;
}

/**
 * ==========================================
 * BRAKE PAD ASSEMBLY 3D COMPONENT
 * ==========================================
 *
 * SENIOR THREE.JS DEVELOPER NOTES:
 * This component demonstrates additional Three.js concepts:
 *
 * 1. **Visibility Control** - Showing/hiding objects dynamically
 *    - visible property toggles object rendering
 *    - More efficient than conditionally rendering components
 *    - Objects remain in scene graph (keeps references valid)
 *
 * 2. **Multi-Object Coordination** - Synchronizing multiple animations
 *    - Caliper lifts up (step 1-2)
 *    - Old pads slide out backward (step 2)
 *    - New pads slide in forward (step 3+)
 *    - Timing controlled by step conditions
 *
 * 3. **Component Swapping** - Replacing old parts with new ones
 *    - Uses visibility instead of mounting/unmounting
 *    - Smooth transitions with lerp
 */
export function BrakeAssembly({ step, showError }: BrakeAssemblyProps) {
  // REFS: References to animated groups
  const caliperRef = useRef<THREE.Group>(null);    // Brake caliper (slides up/down)
  const oldPadRef = useRef<THREE.Group>(null);     // Worn brake pads (slides out)
  const newPadRef = useRef<THREE.Group>(null);     // New brake pads (slides in)

  /**
   * ==========================================
   * ANIMATION LOOP
   * ==========================================
   */
  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    /**
     * ANIMATION 1: CALIPER VERTICAL MOVEMENT
     * ==========================================
     * Simulates removing caliper from rotor
     */
    if (caliperRef.current) {
      // targetY: 1.5 when caliper is removed (steps 1-2), 0 when installed
      const targetY = step >= 1 && step < 3 ? 1.5 : 0;
      // Smooth lerp animation (same 0.08 alpha as headlight)
      caliperRef.current.position.y += (targetY - caliperRef.current.position.y) * 0.08;
    }

    /**
     * ANIMATION 2: OLD PADS REMOVAL
     * ==========================================
     * Slides worn pads backward out of view
     * Demonstrates visibility control
     */
    if (oldPadRef.current) {
      // targetZ: -2 (backward) when removing pads in step 2
      const targetZ = step >= 2 && step < 3 ? -2 : 0;
      oldPadRef.current.position.z += (targetZ - oldPadRef.current.position.z) * 0.08;

      // VISIBILITY CONTROL:
      // - visible = false removes from rendering (but keeps in scene graph)
      // - More performant than conditional JSX rendering
      // - Preserves refs and object relationships
      oldPadRef.current.visible = step < 3;
    }

    /**
     * ANIMATION 3: NEW PADS INSTALLATION
     * ==========================================
     * Slides new pads forward into position
     * Coordinated with old pads removal
     */
    if (newPadRef.current) {
      // targetZ: 0 (in position) when installing, 2 (forward) when waiting
      const targetZ = step >= 3 ? 0 : 2;
      newPadRef.current.position.z += (targetZ - newPadRef.current.position.z) * 0.08;

      // Only show new pads after old ones are removed
      newPadRef.current.visible = step >= 3;
    }

    /**
     * ANIMATION 4: ERROR SHAKE
     * ==========================================
     * Rotates around X-axis (pitch) for different visual effect
     * Compare to headlight which rotates on Z-axis (roll)
     */
    if (showError && caliperRef.current) {
      // X-axis rotation = front/back tilt
      // Slightly smaller amplitude (0.04 vs 0.05) for subtle effect
      caliperRef.current.rotation.x = Math.sin(time * 20) * 0.04;
    }
  });

  return (
    <>
      {/**
       * ==========================================
       * LIGHTING SETUP - Brake Scene
       * ==========================================
       * Matched to headlight scene for consistent visibility
       * Strong lighting to clearly show metallic brake components
       */}
      {/* Ambient light - matches headlight scene for consistent base brightness */}
      <ambientLight intensity={0.9} />

      {/* Directional light - bright primary source matching headlight scene
       * position: [6, 9, 6] = from upper-right-front
       * intensity: 1.8 = very bright (same as headlight)
       */}
      <directionalLight position={[6, 9, 6]} intensity={1.8} castShadow />

      {/* Spot light from left side for rim lighting and edge highlights
       * intensity: 1.2 = bright focused beam (matches headlight)
       */}
      <spotLight position={[-6, 6, 0]} intensity={1.2} angle={0.35} penumbra={1} />

      {/* Blue tinted fill light - matches headlight scene
       * intensity: 0.8 = stronger fill (matches headlight)
       */}
      <pointLight position={[0, 3, 3]} intensity={0.8} color="#60a5fa" />

      {/* Additional front light for better brake component visibility
       * Same as headlight scene for consistent illumination
       */}
      <pointLight position={[0, 1, 6]} intensity={1.0} color="#ffffff" />

      {/**
       * ==========================================
       * BRAKE ROTOR - Cast iron disc
       * ==========================================
       * Large flat cylinder representing the rotor/disc
       * This is what the brake pads clamp onto to stop the wheel
       */}
      <group>
        <mesh rotation={[0, 0, 0]}>
          {/* CYLINDER GEOMETRY - Flat disc shape
           * args: [radiusTop, radiusBottom, height, radialSegments]
           * [1.5, 1.5, 0.12, 48]
           * - radius: 1.5 = large disc
           * - height: 0.12 = thin (it's a disc, not a wheel)
           * - segments: 48 = very smooth circle (high detail for main object)
           *
           * Why 48 segments? Rotors are visible focal point, need smooth edges
           * Compare to 16 segments for small cylinders (bulb housing)
           */}
          <cylinderGeometry args={[1.5, 1.5, 0.12, 48]} />

          {/* CAST IRON MATERIAL
           * High metalness (0.7) and medium roughness (0.4)
           * Creates realistic used metal appearance
           * Glows red if damaged rotor error in step 0
           */}
          <meshStandardMaterial
            color={showError && step === 0 ? "#7f1d1d" : "#4a5568"}
            metalness={0.7}
            roughness={0.4}
            emissive={showError && step === 0 ? "#991b1b" : "#000000"}
            emissiveIntensity={showError && step === 0 ? 0.3 : 0}
          />
        </mesh>

        {/* Rotor Vents - Holes */}
        {Array.from({ length: 6 }).map((_, i) => {
          const angle = (i / 6) * Math.PI * 2;
          const x = Math.cos(angle) * 1.0;
          const z = Math.sin(angle) * 1.0;
          return (
            <mesh key={`vent-${i}`} position={[x, 0, z]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.15, 0.15, 0.14, 12]} />
              <meshStandardMaterial color="#2d3748" metalness={0.6} roughness={0.5} />
            </mesh>
          );
        })}

        {/* Hub - Center */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.2, 24]} />
          <meshStandardMaterial color="#1a202c" metalness={0.5} roughness={0.6} />
        </mesh>
      </group>

      {/* Caliper - Aluminum */}
      <group ref={caliperRef} position={[0, 0, 0]}>
        {/* Caliper Body */}
        <mesh position={[1.3, 0, 0]}>
          <boxGeometry args={[0.6, 1.2, 1.6]} />
          <meshStandardMaterial color="#718096" metalness={0.3} roughness={0.6} />
        </mesh>

        {/* Piston Housing */}
        <mesh position={[0.9, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.35, 0.35, 0.4, 16]} />
          <meshStandardMaterial color="#4a5568" metalness={0.4} roughness={0.5} />
        </mesh>

        {/* Mounting Bracket */}
        <mesh position={[1.3, 0.8, 0]}>
          <boxGeometry args={[0.3, 0.2, 1.8]} />
          <meshStandardMaterial color="#2d3748" metalness={0.5} roughness={0.6} />
        </mesh>

        {/* Brake Line */}
        <mesh position={[1.6, 0.6, 0]} rotation={[0, 0, Math.PI / 4]}>
          <cylinderGeometry args={[0.03, 0.03, 0.8, 12]} />
          <meshStandardMaterial
            color={showError && step === 1 ? "#dc2626" : "#1f2937"}
            emissive={showError && step === 1 ? "#991b1b" : "#000000"}
            emissiveIntensity={showError && step === 1 ? 0.6 : 0}
          />
        </mesh>
      </group>

      {/* OLD Brake Pads - Worn */}
      <group ref={oldPadRef}>
        {/* Outer Pad */}
        <mesh position={[0.65, 0, 0]}>
          <boxGeometry args={[0.15, 1.0, 1.2]} />
          <meshStandardMaterial color="#8b4513" roughness={0.95} />
        </mesh>
        {/* Inner Pad */}
        <mesh position={[-0.65, 0, 0]}>
          <boxGeometry args={[0.15, 1.0, 1.2]} />
          <meshStandardMaterial color="#8b4513" roughness={0.95} />
        </mesh>
        {/* Wear Indicator */}
        <mesh position={[0.65, -0.3, 0.5]}>
          <boxGeometry args={[0.02, 0.3, 0.05]} />
          <meshStandardMaterial color="#a0aec0" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* NEW Brake Pads - Fresh */}
      <group ref={newPadRef} position={[0, 0, 2]}>
        {/* Outer Pad */}
        <mesh position={[0.65, 0, 0]}>
          <boxGeometry args={[0.25, 1.0, 1.2]} />
          <meshStandardMaterial
            color={showError && step === 3 ? "#78350f" : "#1e40af"}
            roughness={0.8}
            emissive={showError && step === 3 ? "#92400e" : "#000000"}
            emissiveIntensity={showError && step === 3 ? 0.4 : 0}
          />
        </mesh>
        {/* Inner Pad */}
        <mesh position={[-0.65, 0, 0]}>
          <boxGeometry args={[0.25, 1.0, 1.2]} />
          <meshStandardMaterial
            color={showError && step === 3 ? "#78350f" : "#1e40af"}
            roughness={0.8}
          />
        </mesh>
        {/* Backing Plate - Steel */}
        <mesh position={[0.65, 0, 0]}>
          <boxGeometry args={[0.02, 1.0, 1.2]} />
          <meshStandardMaterial color="#4a5568" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[-0.65, 0, 0]}>
          <boxGeometry args={[0.02, 1.0, 1.2]} />
          <meshStandardMaterial color="#4a5568" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* Flashlight + Ruler - visible step 0 */}
      {step === 0 && (
        <>
          {/* Flashlight */}
          <group position={[2.5, 0.5, 1]} rotation={[0, -Math.PI / 4, -Math.PI / 8]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.1, 0.1, 0.6, 16]} />
              <meshStandardMaterial color="#1f2937" metalness={0.4} roughness={0.6} />
            </mesh>
            <mesh position={[0.35, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.13, 0.1, 0.12, 16]} />
              <meshStandardMaterial color="#374151" metalness={0.5} roughness={0.5} />
            </mesh>
            <mesh position={[0.42, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.11, 0.11, 0.02, 16]} />
              <meshStandardMaterial
                color="#fef3c7"
                emissive="#fbbf24"
                emissiveIntensity={0.7}
                transparent
                opacity={0.9}
              />
            </mesh>
          </group>
          {/* Pad thickness gauge / ruler */}
          <group position={[2.5, -0.5, 0.8]} rotation={[0, 0, -Math.PI / 6]}>
            <mesh>
              <boxGeometry args={[0.4, 0.02, 0.06]} />
              <meshStandardMaterial color="#e5e7eb" roughness={0.3} metalness={0.5} />
            </mesh>
            {/* Measurement markings */}
            {[0, 0.1, 0.2].map((offset, i) => (
              <mesh key={i} position={[-0.15 + offset, 0.015, 0]}>
                <boxGeometry args={[0.002, 0.005, 0.05]} />
                <meshStandardMaterial color="#1f2937" />
              </mesh>
            ))}
          </group>
        </>
      )}

      {/* Lug Wrench + Jack + C-Clamp - visible step 1 */}
      {step === 1 && (
        <>
          {/* Lug wrench (cross wrench) */}
          <group position={[2.5, 0.7, 1]} rotation={[Math.PI / 2, 0, Math.PI / 4]}>
            <mesh rotation={[0, 0, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.8, 12]} />
              <meshStandardMaterial color="#4a5568" metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.8, 12]} />
              <meshStandardMaterial color="#4a5568" metalness={0.7} roughness={0.3} />
            </mesh>
          </group>
          {/* C-Clamp */}
          <group position={[2, 0, 0.5]} rotation={[0, -Math.PI / 4, 0]}>
            <mesh>
              <boxGeometry args={[0.08, 0.8, 0.08]} />
              <meshStandardMaterial color="#718096" metalness={0.6} roughness={0.4} />
            </mesh>
            <mesh position={[0, -0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.04, 0.04, 0.5, 12]} />
              <meshStandardMaterial color="#4a5568" metalness={0.7} roughness={0.3} />
            </mesh>
          </group>
          {/* Socket (13mm) */}
          <group position={[2.5, -0.6, 0.8]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.08, 0.08, 0.15, 6]} />
              <meshStandardMaterial color="#2d3748" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        </>
      )}

      {/* Wire Brush + Brake Cleaner Spray - visible step 2 */}
      {step === 2 && (
        <>
          {/* Wire brush */}
          <group position={[2.5, 0.5, 1]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.04, 0.04, 0.5, 12]} />
              <meshStandardMaterial color="#1f2937" roughness={0.8} />
            </mesh>
            <mesh position={[0.35, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.06, 0.06, 0.15, 12]} />
              <meshStandardMaterial color="#a0aec0" metalness={0.3} roughness={0.9} />
            </mesh>
          </group>
          {/* Brake cleaner spray */}
          <group position={[2.2, -0.5, 0.8]}>
            <mesh>
              <cylinderGeometry args={[0.1, 0.1, 0.6, 16]} />
              <meshStandardMaterial color="#dc2626" roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.35, 0]}>
              <cylinderGeometry args={[0.06, 0.1, 0.1, 16]} />
              <meshStandardMaterial color="#1f2937" />
            </mesh>
          </group>
        </>
      )}

      {/* Brake Lubricant Tube + Torque Wrench - visible step 3 */}
      {step === 3 && (
        <>
          {/* Ceramic brake lubricant tube */}
          <group position={[2.5, 0.3, 1]}>
            <mesh rotation={[0, 0, -Math.PI / 6]}>
              <cylinderGeometry args={[0.08, 0.08, 0.5, 12]} />
              <meshStandardMaterial color="#fbbf24" roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.3, 0]}>
              <cylinderGeometry args={[0.05, 0.08, 0.08, 12]} />
              <meshStandardMaterial color="#1f2937" />
            </mesh>
          </group>
          {/* Torque wrench */}
          <group position={[2.2, -0.5, 0.8]} rotation={[0, -Math.PI / 6, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.05, 0.05, 0.8, 12]} />
              <meshStandardMaterial color="#4a5568" metalness={0.6} roughness={0.4} />
            </mesh>
            <mesh position={[0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.07, 0.07, 0.12, 6]} />
              <meshStandardMaterial color="#2d3748" metalness={0.7} roughness={0.3} />
            </mesh>
            {/* Torque indicator gauge */}
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 0.04, 16]} />
              <meshStandardMaterial color="#1f2937" />
            </mesh>
          </group>
        </>
      )}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1e293b" roughness={0.95} />
      </mesh>
    </>
  );
}
