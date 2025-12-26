"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface HeadlightAssemblyProps {
  step: number;
  showError: boolean;
}

/**
 * ==========================================
 * BMW HEADLIGHT 3D COMPONENT
 * ==========================================
 *
 *
 * 1. **useFrame Hook** - React Three Fiber's animation loop
 *    - Runs on every frame (60fps typically)
 *    - Receives state object with clock, camera, scene, etc.
 *    - Use for smooth animations and continuous updates
 *
 * 2. **useRef for Object References** - Direct access to Three.js objects
 *    - Allows us to mutate Three.js objects imperatively
 *    - Essential for animations that update every frame
 *    - Bypasses React's render cycle for performance
 *
 * 3. **Smooth Interpolation** - Creating natural animations
 *    - Using lerp (linear interpolation): current + (target - current) * alpha
 *    - Alpha value (0.05-0.08) controls animation speed
 *    - Smaller = slower/smoother, larger = faster/snappier
 *
 * 4. **Material Properties** - PBR (Physically Based Rendering)
 *    - metalness: 0-1 (how metal-like the surface is)
 *    - roughness: 0-1 (how rough/shiny the surface is)
 *    - emissive: color that glows independently of lights
 *    - transparent + opacity: for see-through materials
 */
export function HeadlightAssembly({ step, showError }: HeadlightAssemblyProps) {
  // ==========================================
  // REFS: Direct references to Three.js objects for imperative animations
  // ==========================================
  // Why useRef? It persists across renders without causing re-renders
  // Each ref will point to a THREE.Group or THREE.Mesh instance
  const housingRef = useRef<THREE.Group>(null);      // Entire headlight assembly group
  const lensRef = useRef<THREE.Mesh>(null);          // Clear polycarbonate lens
  const moistureRef = useRef<THREE.Group>(null);     // Group of moisture droplets
  const reflectorRef = useRef<THREE.Mesh>(null);     // Chrome reflector bowl

  /**
   * ==========================================
   * useFrame: ANIMATION LOOP (runs every frame ~60fps)
   * ==========================================
   * This is React Three Fiber's equivalent of requestAnimationFrame
   *
   * @param state - Contains:
   *   - clock: THREE.Clock for time-based animations
   *   - camera: Current camera
   *   - scene: Current scene
   *   - gl: WebGL renderer
   *
   * PERFORMANCE TIP: Keep this function lightweight
   * - Avoid creating new objects on every frame
   * - Use refs to mutate objects directly
   * - Conditional checks should be fast
   */
  useFrame((state) => {
    const time = state.clock.getElapsedTime();  // Time in seconds since component mounted

    /**
     * ==========================================
     * ANIMATION 1: LENS SEPARATION & CLEARING
     * ==========================================
     * Demonstrates:
     * - Position animation using smooth interpolation
     * - Material property animation (opacity, color)
     * - Runtime type checking (instanceof)
     * - Color lerping for smooth transitions
     */
    if (lensRef.current) {
      // POSITION ANIMATION: Lens moves forward when disassembling (step 2-3)
      // ================================================================
      // Why 1.2? That's the Z-axis distance to visually separate lens from housing
      // Why 0.08? That's our interpolation alpha - controls animation smoothness
      //   - 0.01 = very slow/smooth
      //   - 0.5 = instant/snappy
      //   - 0.08 = good balance for natural movement
      const targetZ = step >= 2 && step < 4 ? 1.2 : 0;
      lensRef.current.position.z += (targetZ - lensRef.current.position.z) * 0.08;

      // MATERIAL ANIMATION: Lens clarity improves through repair steps
      // ================================================================
      // Why instanceof check? TypeScript doesn't guarantee material type at runtime
      // This prevents errors if material changes unexpectedly
      if (lensRef.current.material instanceof THREE.MeshStandardMaterial) {
        let targetOpacity = 0.85;    // Default: mostly transparent (realistic lens)
        let targetColor = "#ffffff";  // Default: pure white (clean polycarbonate)

        // STEP-BASED MATERIAL STATES
        // Each repair step changes the lens appearance
        if (step === 0 || step === 1) {
          targetOpacity = 0.55;        // More opaque = foggy/dirty
          targetColor = "#e2e8f0";     // Slight gray tint = oxidation
        } else if (step === 2) {
          targetOpacity = 0.70;        // Getting clearer
          targetColor = "#f1f5f9";     // Lighter tint
        } else if (step === 3 || step === 4) {
          targetOpacity = showError && step === 4 ? 0.60 : 0.88;  // Error = foggy again
          targetColor = "#ffffff";     // Crystal clear
        }

        // SMOOTH INTERPOLATION
        // ================================================================
        // Opacity: Simple lerp formula - current + (target - current) * alpha
        lensRef.current.material.opacity += (targetOpacity - lensRef.current.material.opacity) * 0.05;

        // Color: THREE.Color.lerp() is built-in color interpolation
        // Why create new Color? lerp() expects a THREE.Color object
        // 0.05 alpha = slow color fade (prevents jarring color changes)
        lensRef.current.material.color.lerp(new THREE.Color(targetColor), 0.05);
      }
    }

    /**
     * ==========================================
     * ANIMATION 2: MOISTURE/FOG DROPLETS
     * ==========================================
     * Demonstrates:
     * - Iterating over group children
     * - Progressive opacity animation
     * - Simulating the repair process visually
     */
    if (moistureRef.current) {
      // PROGRESSIVE DRYING: Opacity decreases as repair progresses
      // ================================================================
      // This creates the visual effect of the headlight drying out
      let targetOpacity = 0;
      if (step === 0 || step === 1) targetOpacity = 0.8;  // Very fogged at start
      else if (step === 2) targetOpacity = 0.4;            // Drying in progress
      else if (step === 3) targetOpacity = 0.15;           // Mostly dry
      else if (step === 4) targetOpacity = showError ? 0.6 : 0;  // Clear (or fogged if error)

      // ITERATE OVER GROUP CHILDREN
      // ================================================================
      // moistureRef is a THREE.Group containing multiple sphere meshes
      // forEach() applies the same animation to all moisture droplets
      // Why forEach? More readable than for loop, and performant enough for small arrays
      moistureRef.current.children.forEach((child) => {
        // RUNTIME TYPE CHECKING: Ensure we're working with the right types
        // This prevents crashes if the group structure changes
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          // Same smooth lerp formula as before
          child.material.opacity += (targetOpacity - child.material.opacity) * 0.05;
        }
      });
    }

    /**
     * ==========================================
     * ANIMATION 3: REFLECTOR BOWL CLEANING
     * ==========================================
     * Demonstrates:
     * - PBR material properties (metalness, roughness)
     * - How metalness/roughness create realistic metal surfaces
     * - Progressive material quality improvement
     *
     * UNDERSTANDING PBR (Physically Based Rendering):
     * ================================================
     * metalness (0-1):
     *   0 = non-metal (plastic, wood, fabric)
     *   1 = pure metal (chrome, gold, steel)
     *
     * roughness (0-1):
     *   0 = perfectly smooth/shiny (mirror)
     *   1 = completely rough/matte (no reflections)
     *
     * These work together to create realistic surfaces:
     *   metalness:0.9 + roughness:0.1 = shiny chrome
     *   metalness:0.3 + roughness:0.7 = tarnished metal
     */
    if (reflectorRef.current && reflectorRef.current.material instanceof THREE.MeshStandardMaterial) {
      // DEFAULT VALUES: Clean chrome reflector
      let targetMetalness = 0.9;
      let targetRoughness = 0.1;
      let targetColor = "#c0c0c0";  // Chrome silver

      // DIRTY STATE (steps 0-1): Tarnished, oxidized metal
      if (step === 0 || step === 1) {
        targetMetalness = 0.3;  // Less metallic = more oxidized
        targetRoughness = 0.7;  // Rough surface = no shine
        targetColor = "#7a7a7a";  // Dark gray = dirty
      }
      // CLEANING (step 2): Partially cleaned
      else if (step === 2) {
        targetMetalness = 0.5;  // Becoming more metallic
        targetRoughness = 0.5;  // Some shine returning
        targetColor = "#9ca3af";  // Lighter gray
      }
      // CLEAN (steps 3-4): Restored chrome
      else if (step === 3 || step === 4) {
        targetMetalness = 0.6;  // Clean metal (not perfect mirror)
        targetRoughness = 0.3;  // Smooth but realistic
        targetColor = "#c0c0c0";  // Bright chrome
      }

      // ANIMATE ALL THREE PROPERTIES SMOOTHLY
      // Why 0.05 alpha? Same as before - creates smooth transitions
      reflectorRef.current.material.metalness += (targetMetalness - reflectorRef.current.material.metalness) * 0.05;
      reflectorRef.current.material.roughness += (targetRoughness - reflectorRef.current.material.roughness) * 0.05;
      reflectorRef.current.material.color.lerp(new THREE.Color(targetColor), 0.05);
    }

    /**
     * ==========================================
     * ANIMATION 4: ERROR SHAKE
     * ==========================================
     * Demonstrates:
     * - Time-based animation using Math.sin()
     * - Rotation animation for visual feedback
     * - Damping effect for smooth return
     *
     * Math.sin() creates oscillating values perfect for shake effects:
     * - Math.sin(time) oscillates between -1 and 1
     * - Multiply by frequency (20) = faster oscillation
     * - Multiply by amplitude (0.05) = smaller shake range
     */
    if (showError && housingRef.current) {
      // SHAKE ANIMATION: Sinusoidal rotation
      // time * 20 = 20Hz frequency (fast shake)
      // * 0.05 = ±0.05 radians (about ±3 degrees)
      housingRef.current.rotation.z = Math.sin(time * 20) * 0.05;
    } else if (housingRef.current) {
      // DAMPING: Gradually return to zero rotation
      // *= 0.9 reduces rotation by 10% each frame
      // Creates smooth "settling" effect
      housingRef.current.rotation.z *= 0.9;
    }
  });

  return (
    <>
      {/**
       * ==========================================
       * LIGHTING SETUP
       * ==========================================
       * Three.js uses multiple light sources to create realistic illumination
       * Each light type serves a specific purpose in the scene
       */}

      {/* AMBIENT LIGHT - Base illumination for all objects
       * intensity: 0.9 = strong overall brightness (increased for better visibility)
       * Why use it? Prevents objects from being completely black in shadowed areas
       * Simulates indirect light bouncing in a real environment
       */}
      <ambientLight intensity={0.9} />

      {/* DIRECTIONAL LIGHT - Simulates sunlight/main light source
       * position: [5, 8, 5] = coming from upper-right-front
       * intensity: 1.8 = very bright primary light source (increased for visibility)
       * castShadow: true = creates realistic shadows on ground plane
       * Why directional? Light rays are parallel (like sun), not diverging
       */}
      <directionalLight position={[5, 8, 5]} intensity={1.8} castShadow />

      {/* SPOT LIGHT - Focused cone of light with soft edges
       * position: [-5, 5, 2] = from upper-left-front
       * intensity: 1.2 = bright focused beam (increased for better detail visibility)
       * angle: 0.4 radians ≈ 23° = narrow focused beam
       * penumbra: 1 = maximum soft edge falloff
       * color: "#fff" = pure white light
       * Why use it? Creates dramatic rim lighting and highlights edges
       */}
      <spotLight position={[-5, 5, 2]} intensity={1.2} angle={0.4} penumbra={1} color="#fff" />

      {/* POINT LIGHT - Omnidirectional light (like a light bulb)
       * position: [0, 2, 4] = center-front of scene
       * intensity: 0.8 = stronger fill light (increased for better visibility)
       * color: "#a5d8ff" = cool blue tint
       * Why use it? Adds colored accent lighting to make headlight lens appear lit
       */}
      <pointLight position={[0, 2, 4]} intensity={0.8} color="#a5d8ff" />

      {/* ADDITIONAL FRONT LIGHT - Extra illumination for headlight assembly
       * position: [0, 1, 6] = directly in front, slightly above
       * intensity: 1.0 = bright fill light
       * color: "#ffffff" = neutral white
       * Why add it? Ensures headlight details are clearly visible, especially fog/moisture
       */}
      <pointLight position={[0, 1, 6]} intensity={1.0} color="#ffffff" />

      {/**
       * ==========================================
       * MAIN HEADLIGHT GROUP
       * ==========================================
       * THREE.Group is a container for multiple meshes
       * - Allows transforming all children together
       * - Rotating the group rotates all headlight parts
       * - Position/scale/rotation propagate to children
       */}
      <group ref={housingRef} rotation={[0, 0, 0]}>
        {/**
         * HEADLIGHT HOUSING - Main body (black plastic)
         * ==========================================
         */}
        {/* Mesh = Geometry + Material
         * - Geometry defines shape (vertices, faces)
         * - Material defines appearance (color, reflectivity)
         * - castShadow: true = this object casts shadows on other objects
         */}
        <mesh position={[0, 0, 0]} castShadow>
          {/* BOX GEOMETRY - Rectangular prism
           * args: [width, height, depth]
           * [2.5, 1.8, 1.5] = headlight dimensions in Three.js units
           * Default: centered at origin (0,0,0)
           *
           * Why boxGeometry? Simple primitive perfect for rectangular housings
           * Optimized for performance - fewer vertices than custom geometry
           */}
          <boxGeometry args={[2.5, 1.8, 1.5]} />

          {/* MESH STANDARD MATERIAL - PBR (Physically Based Rendering)
           * color: "#1a1a1a" = very dark gray (black plastic)
           * roughness: 0.7 = moderately rough surface (not shiny)
           * metalness: 0.1 = barely metallic (plastic, not metal)
           *
           * UNDERSTANDING PBR VALUES:
           * - Plastic: low metalness (0-0.2), varying roughness
           * - Metal: high metalness (0.8-1.0), varying roughness
           * - Glass: transparent, low roughness
           * - Wood: low metalness, high roughness
           */}
          <meshStandardMaterial color="#1a1a1a" roughness={0.7} metalness={0.1} />
        </mesh>

        {/**
         * BULB HOUSING - Cylindrical socket at rear
         * ==========================================
         */}
        <mesh position={[0, 0, -0.8]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          {/* CYLINDER GEOMETRY - Pipe/tube shape
           * args: [radiusTop, radiusBottom, height, radialSegments]
           * [0.4, 0.4, 0.6, 16] = uniform cylinder
           * - radiusTop = radiusBottom = straight cylinder (not cone)
           * - height: 0.6 = length of cylinder
           * - radialSegments: 16 = smoothness (more = smoother, but slower)
           *
           * ROTATION: [Math.PI / 2, 0, 0]
           * - Rotates 90° around X-axis
           * - Why? Cylinders are Y-axis by default, we want Z-axis
           * - Math.PI / 2 radians = 90 degrees
           */}
          <cylinderGeometry args={[0.4, 0.4, 0.6, 16]} />

          {/* Dark gray plastic - slightly lighter than housing */}
          <meshStandardMaterial color="#2d2d2d" roughness={0.6} />
        </mesh>

        {/**
         * REFLECTOR BOWL - Chrome parabolic mirror
         * ==========================================
         * This is the key component - reflects bulb light forward
         * Animated via reflectorRef in useFrame (see above)
         */}
        <mesh ref={reflectorRef} position={[0, 0, -0.3]}>
          {/* SPHERE GEOMETRY (partial) - Creates parabolic bowl shape
           * args: [radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength]
           * [1.1, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]
           *
           * BREAKDOWN:
           * - radius: 1.1 = size of sphere
           * - widthSegments: 32 = horizontal detail (smoothness)
           * - heightSegments: 32 = vertical detail (smoothness)
           * - phiStart: 0 = horizontal start angle (0° = full circle)
           * - phiLength: Math.PI * 2 = 360° around (full circle)
           * - thetaStart: 0 = vertical start angle (0° = top of sphere)
           * - thetaLength: Math.PI / 2 = 90° vertical sweep (hemisphere bowl)
           *
           * RESULT: Only front half of sphere (bowl shape facing forward)
           */}
          <sphereGeometry args={[1.1, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />

          {/* Initial state: tarnished metal (gets cleaner through steps)
           * See reflectorRef animation in useFrame above
           */}
          <meshStandardMaterial color="#7a7a7a" metalness={0.3} roughness={0.7} />
        </mesh>

        {/**
         * MOUNTING TABS - Attachment points (3 tabs)
         * ==========================================
         * ARRAY MAPPING TECHNIQUE in Three.js
         * - Creates multiple similar objects programmatically
         * - Efficient way to avoid code repetition
         * - Each tab has unique position but shared properties
         */}
        {[[-1.3, 0.9, 0], [1.3, 0.9, 0], [0, -0.9, 0]].map((pos, i) => (
          /* KEY PROP: Required for React arrays
           * - Helps React track which items changed
           * - "tab-${i}" creates unique keys: "tab-0", "tab-1", "tab-2"
           * - Important: Keys should be stable (don't use array index in dynamic arrays)
           */
          <mesh key={`tab-${i}`} position={pos as [number, number, number]}>
            {/* Small boxes for mounting tabs */}
            <boxGeometry args={[0.3, 0.15, 0.3]} />

            {/* CONDITIONAL MATERIAL PROPERTIES
             * Shows error state if user makes mistake in step 1 (broken tabs)
             * - color: changes to red (#dc2626) on error
             * - emissive: glows red to draw attention
             * - emissiveIntensity: 0.5 = moderate glow
             *
             * EMISSIVE PROPERTY:
             * - Makes object appear to emit light (self-illuminating)
             * - Doesn't actually cast light on other objects
             * - Great for error indicators, LEDs, screens
             */}
            <meshStandardMaterial
              color={showError && step === 1 ? "#dc2626" : "#2d2d2d"}
              roughness={0.7}
              emissive={showError && step === 1 ? "#991b1b" : "#000000"}
              emissiveIntensity={showError && step === 1 ? 0.5 : 0}
            />
          </mesh>
        ))}

        {/**
         * VENT TUBE - Pressure equalization tube
         * ==========================================
         * Small cylinder angled at bottom-right
         */}
        <mesh position={[1.1, -0.6, -0.5]} rotation={[0, 0, Math.PI / 6]}>
          {/* Thin cylinder for vent tube
           * rotation: [0, 0, Math.PI / 6] = 30° tilt on Z-axis
           */}
          <cylinderGeometry args={[0.08, 0.08, 0.5, 12]} />

          {/* Glows red if blocked vents error in step 3 */}
          <meshStandardMaterial
            color={showError && step === 3 ? "#dc2626" : "#2d2d2d"}
            roughness={0.6}
            emissive={showError && step === 3 ? "#991b1b" : "#000000"}
            emissiveIntensity={showError && step === 3 ? 0.4 : 0}
          />
        </mesh>

        {/**
         * CLEAR LENS - Polycarbonate front cover
         * ==========================================
         * Most important visual element - this is what gets foggy and clears
         * Animated via lensRef in useFrame (position + material changes)
         */}
        <mesh ref={lensRef} position={[0, 0, 0.8]} castShadow>
          {/* Thin flat box for lens */}
          <boxGeometry args={[2.4, 1.7, 0.15]} />

          {/* TRANSPARENT MATERIAL PROPERTIES
           * Creating realistic glass/plastic appearance
           * ==========================================
           * transparent: true = enables alpha blending (see-through)
           * opacity: 0.55 = initial foggy state (55% see-through)
           * roughness: 0.05 = very smooth (shiny plastic)
           * metalness: 0.1 = non-metallic (plastic)
           *
           * IMPORTANT: transparent must be true for opacity to work
           * Without it, opacity is ignored and object is fully opaque
           *
           * Opacity and color animate in useFrame (see above)
           */}
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.55}
            roughness={0.05}
            metalness={0.1}
          />
        </mesh>

        {/**
         * MOISTURE DROPLETS - Water condensation inside lens
         * ==========================================
         * PROCEDURAL GENERATION TECHNIQUE
         * - Creates 12 droplets in circular pattern
         * - Each droplet has random size and position variation
         * - Demonstrates computational geometry in Three.js
         */}
        <group ref={moistureRef}>
          {/* Array.from({ length: 12 }) creates array of 12 undefined values
           * .map() iterates to create 12 sphere meshes
           */}
          {Array.from({ length: 12 }).map((_, i) => {
            // CIRCULAR DISTRIBUTION MATH
            // ==========================================
            // angle: divide full circle (2π) into 12 equal segments
            const angle = (i / 12) * Math.PI * 2;  // 0°, 30°, 60°, 90°, etc.

            // radius: random distance from center (0.6 to 1.0)
            // + Math.random() * 0.4 adds variation (0-0.4)
            const radius = 0.6 + Math.random() * 0.4;

            // POLAR TO CARTESIAN CONVERSION
            // ==========================================
            // Convert (angle, radius) polar coordinates to (x, y) cartesian
            // Math.cos(angle) = x component (horizontal)
            // Math.sin(angle) = y component (vertical)
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            return (
              <mesh key={`moisture-${i}`} position={[x, y, 0.5]}>
                {/* SPHERE GEOMETRY with random size
                 * args: [radius, widthSegments, heightSegments]
                 * 0.08 + Math.random() * 0.06 = radius 0.08-0.14 (size variation)
                 * 12, 12 = low segment count for small droplets (performance)
                 */}
                <sphereGeometry args={[0.08 + Math.random() * 0.06, 12, 12]} />

                {/* Translucent gray material - starts invisible (opacity: 0)
                 * Opacity animates in useFrame based on repair step
                 * emissive: strong glow to make droplets highly visible
                 * Increased emissiveIntensity for better fog visibility
                 */}
                <meshStandardMaterial
                  color="#cbd5e1"
                  transparent
                  opacity={0}
                  roughness={0.8}
                  emissive="#e0e7ff"
                  emissiveIntensity={0.6}
                />
              </mesh>
            );
          })}
        </group>

        {/* Flashlight - visible step 0 */}
        {step === 0 && (
          <group position={[2, 0.3, 1.5]} rotation={[0, -Math.PI / 4, 0]}>
            {/* Flashlight body */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.12, 0.12, 0.7, 16]} />
              <meshStandardMaterial color="#1f2937" metalness={0.4} roughness={0.6} />
            </mesh>
            {/* Flashlight head */}
            <mesh position={[0.4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.15, 0.12, 0.15, 16]} />
              <meshStandardMaterial color="#374151" metalness={0.5} roughness={0.5} />
            </mesh>
            {/* Lens (light source) */}
            <mesh position={[0.48, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.13, 0.13, 0.02, 16]} />
              <meshStandardMaterial
                color="#fef3c7"
                emissive="#fbbf24"
                emissiveIntensity={0.8}
                transparent
                opacity={0.9}
              />
            </mesh>
            {/* Light beam */}
            <mesh position={[1.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.5, 0.13, 1.5, 16, 1, true]} />
              <meshStandardMaterial
                color="#fef3c7"
                transparent
                opacity={0.15}
                emissive="#fbbf24"
                emissiveIntensity={0.3}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        )}

        {/* Socket Wrench + Trim Tool + Work Gloves - visible step 1 */}
        {step === 1 && (
          <>
            {/* 10mm Socket wrench */}
            <group position={[-1.8, 0.3, 1.5]} rotation={[0, Math.PI / 4, 0]}>
              {/* Handle */}
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.12, 0.12, 1.5, 12]} />
                <meshStandardMaterial color="#4a5568" metalness={0.7} roughness={0.3} />
              </mesh>
              {/* Socket head (10mm) */}
              <mesh position={[0.9, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.15, 0.15, 0.25, 6]} />
                <meshStandardMaterial color="#2d3748" metalness={0.8} roughness={0.2} />
              </mesh>
              {/* Ratchet mechanism */}
              <mesh position={[-0.8, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.15, 0.15, 0.15, 16]} />
                <meshStandardMaterial color="#dc2626" metalness={0.5} roughness={0.4} />
              </mesh>
            </group>
            {/* Trim removal tool */}
            <group position={[-1.8, -0.4, 1.2]} rotation={[Math.PI / 8, 0, 0]}>
              <mesh>
                <boxGeometry args={[0.6, 0.04, 0.08]} />
                <meshStandardMaterial color="#3b82f6" roughness={0.4} />
              </mesh>
              {/* Hooked end */}
              <mesh position={[0.3, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
                <boxGeometry args={[0.15, 0.04, 0.08]} />
                <meshStandardMaterial color="#3b82f6" roughness={0.4} />
              </mesh>
            </group>
            {/* Work gloves */}
            <group position={[2, -0.6, 1.2]} rotation={[Math.PI / 8, 0, 0]}>
              {/* Left glove */}
              <group position={[-0.4, 0, 0]} rotation={[0, -Math.PI / 12, 0]}>
                {/* Palm */}
                <mesh>
                  <boxGeometry args={[0.5, 0.7, 0.15]} />
                  <meshStandardMaterial color="#1f2937" roughness={0.9} />
                </mesh>
                {/* Thumb */}
                <mesh position={[0.3, -0.2, 0]} rotation={[0, 0, Math.PI / 6]}>
                  <boxGeometry args={[0.15, 0.3, 0.15]} />
                  <meshStandardMaterial color="#1f2937" roughness={0.9} />
                </mesh>
                {/* Wrist cuff */}
                <mesh position={[0, -0.45, 0]}>
                  <cylinderGeometry args={[0.18, 0.2, 0.2, 16]} />
                  <meshStandardMaterial color="#374151" roughness={0.85} />
                </mesh>
              </group>
              {/* Right glove */}
              <group position={[0.4, 0, 0]} rotation={[0, Math.PI / 12, 0]}>
                {/* Palm */}
                <mesh>
                  <boxGeometry args={[0.5, 0.7, 0.15]} />
                  <meshStandardMaterial color="#1f2937" roughness={0.9} />
                </mesh>
                {/* Thumb */}
                <mesh position={[-0.3, -0.2, 0]} rotation={[0, 0, -Math.PI / 6]}>
                  <boxGeometry args={[0.15, 0.3, 0.15]} />
                  <meshStandardMaterial color="#1f2937" roughness={0.9} />
                </mesh>
                {/* Wrist cuff */}
                <mesh position={[0, -0.45, 0]}>
                  <cylinderGeometry args={[0.18, 0.2, 0.2, 16]} />
                  <meshStandardMaterial color="#374151" roughness={0.85} />
                </mesh>
              </group>
            </group>
          </>
        )}

        {/* Heat Gun + Pry Tools + Compressed Air + Microfiber Cloth - visible step 2 */}
        {step === 2 && (
          <>
            {/* Heat gun - LARGER, 250°F max */}
            <group position={[2.5, 0.8, 1.2]} rotation={[0, -Math.PI / 3, -Math.PI / 8]}>
              {/* Nozzle */}
              <mesh>
                <cylinderGeometry args={[0.24, 0.32, 1.2, 12]} />
                <meshStandardMaterial
                  color={showError ? "#dc2626" : "#ef4444"}
                  roughness={0.6}
                  emissive={showError ? "#991b1b" : "#f59e0b"}
                  emissiveIntensity={showError ? 0.8 : 0.3}
                />
              </mesh>
              {/* Handle */}
              <mesh position={[-0.8, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.18, 0.14, 0.5, 12]} />
                <meshStandardMaterial color="#1f2937" />
              </mesh>
              {/* Power cord */}
              <mesh position={[-1.1, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
                <cylinderGeometry args={[0.04, 0.04, 0.4, 12]} />
                <meshStandardMaterial color="#1f2937" />
              </mesh>
              {/* Heat visualization when error */}
              {showError && (
                <mesh position={[-1.2, 0, 0]}>
                  <sphereGeometry args={[0.4, 16, 16]} />
                  <meshStandardMaterial
                    color="#fbbf24"
                    transparent
                    opacity={0.6}
                    emissive="#dc2626"
                    emissiveIntensity={1.2}
                  />
                </mesh>
              )}
            </group>
            {/* Plastic pry tools - LARGER set of 3 */}
            <group position={[-2.5, 0.5, 1.2]}>
              {[
                { pos: [0, 0, 0], rot: 0, color: "#3b82f6" },
                { pos: [0, -0.3, 0], rot: Math.PI / 8, color: "#ef4444" },
                { pos: [0, -0.6, 0], rot: -Math.PI / 8, color: "#10b981" }
              ].map((tool, i) => (
                <group key={i} position={tool.pos as [number, number, number]} rotation={[0, 0, tool.rot]}>
                  <mesh>
                    <boxGeometry args={[0.6, 0.04, 0.1]} />
                    <meshStandardMaterial color={tool.color} roughness={0.5} />
                  </mesh>
                  {/* Hooked end */}
                  <mesh position={[0.3, 0, 0]} rotation={[0, 0, Math.PI / 6]}>
                    <boxGeometry args={[0.15, 0.04, 0.1]} />
                    <meshStandardMaterial color={tool.color} roughness={0.5} />
                  </mesh>
                </group>
              ))}
            </group>
            {/* Compressed air can - LARGER */}
            <group position={[-2.5, -0.8, 0.8]}>
              <mesh>
                <cylinderGeometry args={[0.2, 0.24, 1.2, 16]} />
                <meshStandardMaterial color="#3b82f6" roughness={0.3} metalness={0.2} />
              </mesh>
              {/* Nozzle */}
              <mesh position={[0, 0.7, 0]}>
                <cylinderGeometry args={[0.06, 0.06, 0.3, 12]} />
                <meshStandardMaterial color="#1f2937" />
              </mesh>
              {/* Trigger */}
              <mesh position={[0.15, 0.3, 0]} rotation={[0, 0, Math.PI / 4]}>
                <boxGeometry args={[0.15, 0.05, 0.1]} />
                <meshStandardMaterial color="#dc2626" />
              </mesh>
            </group>
            {/* Microfiber cloth - folded */}
            <group position={[2.5, -0.8, 0.8]} rotation={[Math.PI / 6, 0, Math.PI / 8]}>
              <mesh>
                <boxGeometry args={[0.5, 0.08, 0.4]} />
                <meshStandardMaterial color="#fbbf24" roughness={0.95} />
              </mesh>
              {/* Folded edge */}
              <mesh position={[0, 0.05, 0.1]} rotation={[Math.PI / 8, 0, 0]}>
                <boxGeometry args={[0.5, 0.02, 0.2]} />
                <meshStandardMaterial color="#f59e0b" roughness={0.95} />
              </mesh>
            </group>
          </>
        )}

        {/* Silica Gel Packs + Sealant Tube + Inspection Light - visible step 3 */}
        {step === 3 && (
          <>
            {/* Silica gel packs */}
            {[[-0.8, -0.5, 0.2], [0.8, -0.5, 0.2]].map((pos, i) => (
              <group key={`silica-${i}`} position={pos as [number, number, number]}>
                <mesh>
                  <boxGeometry args={[0.25, 0.08, 0.35]} />
                  <meshStandardMaterial color="#f1f5f9" roughness={0.85} />
                </mesh>
                <mesh position={[0, 0.05, 0]}>
                  <boxGeometry args={[0.2, 0.01, 0.25]} />
                  <meshStandardMaterial color="#3b82f6" />
                </mesh>
              </group>
            ))}
            {/* Sealant tube */}
            <group position={[2, -0.3, 0.8]}>
              <mesh rotation={[0, 0, -Math.PI / 6]}>
                <cylinderGeometry args={[0.08, 0.08, 0.6, 12]} />
                <meshStandardMaterial color="#e5e7eb" roughness={0.4} />
              </mesh>
              <mesh position={[0, 0.35, 0]}>
                <cylinderGeometry args={[0.05, 0.08, 0.1, 12]} />
                <meshStandardMaterial color="#dc2626" />
              </mesh>
            </group>
            {/* Small inspection light */}
            <group position={[-2.2, 0.2, 1]}>
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.08, 0.08, 0.4, 12]} />
                <meshStandardMaterial color="#fbbf24" metalness={0.3} roughness={0.6} />
              </mesh>
              <mesh position={[0.25, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.06, 0.06, 0.02, 12]} />
                <meshStandardMaterial
                  color="#fef3c7"
                  emissive="#fbbf24"
                  emissiveIntensity={0.6}
                />
              </mesh>
            </group>
          </>
        )}

        {/* Sealant Tape + Heat Gun + Mounting Bolts - visible step 4 */}
        {step === 4 && (
          <>
            {/* Butyl rubber sealant tape roll */}
            <group position={[2.2, 0.2, 1]}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.15, 0.08, 16, 32]} />
                <meshStandardMaterial color="#1f2937" roughness={0.7} />
              </mesh>
            </group>
            {/* Heat gun */}
            <group position={[2.2, -0.6, 0.8]} rotation={[0, -Math.PI / 3, 0]}>
              <mesh>
                <cylinderGeometry args={[0.1, 0.14, 0.5, 12]} />
                <meshStandardMaterial color="#ef4444" roughness={0.6} />
              </mesh>
              <mesh position={[-0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.07, 0.06, 0.2, 12]} />
                <meshStandardMaterial color="#1f2937" />
              </mesh>
            </group>
            {/* Mounting bolts */}
            {[[-2.2, 0, 0.7], [-2.2, 0.3, 0.7], [-2.2, -0.3, 0.7]].map((pos, i) => (
              <group key={`bolt-${i}`} position={pos as [number, number, number]}>
                <mesh rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.05, 0.05, 0.25, 6]} />
                  <meshStandardMaterial color="#4a5568" metalness={0.8} roughness={0.2} />
                </mesh>
                <mesh position={[0.15, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.08, 0.08, 0.04, 6]} />
                  <meshStandardMaterial color="#4a5568" metalness={0.8} roughness={0.2} />
                </mesh>
              </group>
            ))}
          </>
        )}
      </group>

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1e293b" roughness={0.95} />
      </mesh>
    </>
  );
}
