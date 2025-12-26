"use client";

import { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Text, Line } from "@react-three/drei";
import * as THREE from "three";
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, RotateCcw, ZoomIn } from "lucide-react";

// Step-by-step connection guide
const connectionSteps = [
  {
    title: "Connect Turntable RCA Cables",
    description: "Connect red and white RCA cables from turntable to receiver's phono input (or line input if turntable has built-in preamp).",
    tools: "RCA cables (red/white pair)",
    correct: "Use phono input for turntables without preamp. Signal gets properly amplified and RIAA equalized.",
    incorrect: "DON'T use line input for phono-level signal (too quiet). DON'T use phono input for line-level signal (distortion, damage).",
    highlightConnection: "turntable-rca"
  },
  {
    title: "Connect Ground Wire",
    description: "Attach ground wire from turntable to receiver's ground terminal (usually a metal screw on the back panel).",
    tools: "Ground wire (thin wire with spade connector)",
    correct: "Secure connection to ground terminal. Eliminates 60Hz hum completely.",
    incorrect: "DON'T skip ground wire (loud buzzing/humming). DON'T attach to random metal parts (may not eliminate hum).",
    highlightConnection: "turntable-ground"
  },
  {
    title: "Receiver to Amplifier",
    description: "Connect RCA cables from receiver's pre-out/line-out to amplifier's line input.",
    tools: "RCA cables (line-level)",
    correct: "Pre-out signal is line-level (~1V), perfect for power amp input. Keep cables under 6 feet if possible.",
    incorrect: "DON'T use speaker outputs to amp input (damage both units). DON'T use phono output for line connection.",
    highlightConnection: "receiver-amp"
  },
  {
    title: "Connect Left Speaker",
    description: "Connect speaker wire from amplifier's left channel output to left speaker. Match polarity: red/+ to +, black/- to -.",
    tools: "Speaker wire (16-gauge or thicker)",
    correct: "Tighten binding posts securely. Verify 8Ω speaker matches amp rating. Check polarity carefully.",
    incorrect: "DON'T reverse polarity (weak bass, phase issues). DON'T use wire too thin (power loss). DON'T exceed amp's impedance rating.",
    highlightConnection: "amp-speaker-l"
  },
  {
    title: "Connect Right Speaker",
    description: "Connect speaker wire from amplifier's right channel output to right speaker. Match polarity: red/+ to +, black/- to -.",
    tools: "Speaker wire (16-gauge or thicker)",
    correct: "Match left speaker wire length for balanced resistance. Double-check polarity. Test for proper stereo imaging.",
    incorrect: "DON'T mix up left/right channels. DON'T use different wire gauges for L/R. DON'T leave wire strands exposed (shorts).",
    highlightConnection: "amp-speaker-r"
  }
];

// Turntable component with brighter colors
function Turntable({ position, highlight }: { position: [number, number, number]; highlight: boolean }) {
  return (
    <group position={position}>
      {/* Highlight glow */}
      {highlight && (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.8, 0.35, 1.6]} />
          <meshStandardMaterial
            color="#fbbf24"
            transparent
            opacity={0.2}
            emissive="#fbbf24"
            emissiveIntensity={0.5}
          />
        </mesh>
      )}
      {/* Base - brighter gray */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.6, 0.25, 1.4]} />
        <meshStandardMaterial
          color={highlight ? "#6b7280" : "#374151"}
          roughness={0.5}
          metalness={0.2}
          emissive={highlight ? "#fbbf24" : "#000000"}
          emissiveIntensity={highlight ? 0.3 : 0}
        />
      </mesh>
      {/* Platter - silver */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.06, 32]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Tonearm - chrome */}
      <mesh position={[0.5, 0.25, 0.3]} rotation={[0, 0, -Math.PI / 6]}>
        <cylinderGeometry args={[0.025, 0.025, 0.7, 12]} />
        <meshStandardMaterial color="#e5e7eb" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

// Receiver component - brighter
function Receiver({ position, highlight }: { position: [number, number, number]; highlight: boolean }) {
  return (
    <group position={position}>
      {/* Highlight glow */}
      {highlight && (
        <mesh>
          <boxGeometry args={[2.0, 0.5, 1.2]} />
          <meshStandardMaterial
            color="#fbbf24"
            transparent
            opacity={0.2}
            emissive="#fbbf24"
            emissiveIntensity={0.5}
          />
        </mesh>
      )}
      {/* Main body - dark silver */}
      <mesh>
        <boxGeometry args={[1.8, 0.4, 1]} />
        <meshStandardMaterial
          color={highlight ? "#6b7280" : "#4b5563"}
          roughness={0.4}
          metalness={0.3}
          emissive={highlight ? "#fbbf24" : "#000000"}
          emissiveIntensity={highlight ? 0.3 : 0}
        />
      </mesh>
      {/* Front panel - brushed aluminum look */}
      <mesh position={[0, 0, 0.51]}>
        <boxGeometry args={[1.7, 0.35, 0.02]} />
        <meshStandardMaterial color="#9ca3af" roughness={0.2} metalness={0.6} />
      </mesh>
      {/* Knobs - bright */}
      {[-0.5, -0.15, 0.15, 0.5].map((x, i) => (
        <mesh key={i} position={[x, 0, 0.53]}>
          <cylinderGeometry args={[0.06, 0.06, 0.03, 16]} />
          <meshStandardMaterial color="#d1d5db" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

// Amplifier component - brighter
function Amplifier({ position, highlight }: { position: [number, number, number]; highlight: boolean }) {
  return (
    <group position={position}>
      {/* Highlight glow */}
      {highlight && (
        <mesh>
          <boxGeometry args={[1.6, 0.6, 1.1]} />
          <meshStandardMaterial
            color="#fbbf24"
            transparent
            opacity={0.2}
            emissive="#fbbf24"
            emissiveIntensity={0.5}
          />
        </mesh>
      )}
      {/* Main body */}
      <mesh>
        <boxGeometry args={[1.4, 0.5, 0.9]} />
        <meshStandardMaterial
          color={highlight ? "#6b7280" : "#52525b"}
          roughness={0.4}
          metalness={0.3}
          emissive={highlight ? "#fbbf24" : "#000000"}
          emissiveIntensity={highlight ? 0.3 : 0}
        />
      </mesh>
      {/* Heat sinks - aluminum */}
      {[-0.35, 0, 0.35].map((x, i) => (
        <mesh key={i} position={[x, 0.3, 0]}>
          <boxGeometry args={[0.12, 0.08, 0.7]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

// Speaker component - brighter
function Speaker({ position, label, highlight }: { position: [number, number, number]; label: string; highlight: boolean }) {
  return (
    <group position={position}>
      {/* Highlight glow */}
      {highlight && (
        <mesh>
          <boxGeometry args={[0.6, 1.1, 0.55]} />
          <meshStandardMaterial
            color="#fbbf24"
            transparent
            opacity={0.2}
            emissive="#fbbf24"
            emissiveIntensity={0.5}
          />
        </mesh>
      )}
      {/* Cabinet - wood tone */}
      <mesh>
        <boxGeometry args={[0.5, 1, 0.45]} />
        <meshStandardMaterial
          color={highlight ? "#78350f" : "#451a03"}
          roughness={0.7}
          emissive={highlight ? "#fbbf24" : "#000000"}
          emissiveIntensity={highlight ? 0.2 : 0}
        />
      </mesh>
      {/* Front baffle - black */}
      <mesh position={[0, 0, 0.23]}>
        <boxGeometry args={[0.48, 0.98, 0.02]} />
        <meshStandardMaterial color="#18181b" roughness={0.9} />
      </mesh>
      {/* Woofer */}
      <mesh position={[0, 0.15, 0.25]}>
        <cylinderGeometry args={[0.2, 0.2, 0.04, 32]} />
        <meshStandardMaterial color="#71717a" metalness={0.3} roughness={0.6} />
      </mesh>
      {/* Tweeter */}
      <mesh position={[0, -0.25, 0.25]}>
        <cylinderGeometry args={[0.08, 0.08, 0.04, 32]} />
        <meshStandardMaterial color="#a1a1aa" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  );
}

// Wire connection
function Wire({
  start,
  end,
  color,
  width,
  dashed
}: {
  start: [number, number, number];
  end: [number, number, number];
  color: string;
  width: number;
  dashed?: boolean;
}) {
  const points = [];
  const segments = 20;

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = start[0] + (end[0] - start[0]) * t;
    const y = start[1] + (end[1] - start[1]) * t + Math.sin(t * Math.PI) * 0.2;
    const z = start[2] + (end[2] - start[2]) * t;
    points.push(new THREE.Vector3(x, y, z));
  }

  return (
    <Line
      points={points}
      color={color}
      lineWidth={width}
      dashed={dashed}
      dashScale={40}
      dashSize={0.08}
      gapSize={0.04}
    />
  );
}

function StereoScene({ currentStep }: { currentStep: number }) {
  const highlightedConnection = connectionSteps[currentStep]?.highlightConnection;

  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[10, 10, 5]} intensity={2.0} castShadow />
      <directionalLight position={[-10, 10, -5]} intensity={1.5} />
      <pointLight position={[0, 8, 0]} intensity={1.2} />
      <pointLight position={[5, 5, 5]} intensity={0.8} color="#60a5fa" />
      <pointLight position={[-5, 5, 5]} intensity={0.8} color="#a78bfa" />
      <Turntable position={[-3.5, 0, 0]} highlight={highlightedConnection?.includes("turntable") || false} />
      <Receiver position={[0, 0, -0.8]} highlight={highlightedConnection?.includes("receiver") || false} />
      <Amplifier position={[0, -2, -0.8]} highlight={highlightedConnection?.includes("amp") || false} />
      <Speaker position={[3.5, -0.8, 0]} label="Speaker L" highlight={highlightedConnection === "amp-speaker-l"} />
      <Speaker position={[3.5, -2.2, 0]} label="Speaker R" highlight={highlightedConnection === "amp-speaker-r"} />
      {/* RED and WHITE RCA cables - visible on step 0 */}
      {currentStep === 0 && (
        <group position={[-2, 0.5, 0.5]}>
          {/* Red RCA Cable */}
          <group position={[0, 0, 0]}>
            {/* Cable body */}
            <mesh rotation={[0, Math.PI / 4, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.8, 12]} />
              <meshStandardMaterial color="#dc2626" roughness={0.6} />
            </mesh>
            {/* RCA plug tip */}
            <mesh position={[0, 0.45, 0]}>
              <cylinderGeometry args={[0.04, 0.06, 0.1, 12]} />
              <meshStandardMaterial color="#991b1b" metalness={0.7} roughness={0.3} />
            </mesh>
            {/* RCA plug body */}
            <mesh position={[0, 0.35, 0]}>
              <cylinderGeometry args={[0.06, 0.06, 0.08, 12]} />
              <meshStandardMaterial color="#dc2626" roughness={0.5} />
            </mesh>
          </group>
          {/* White RCA Cable */}
          <group position={[0.25, 0, 0]}>
            {/* Cable body */}
            <mesh rotation={[0, Math.PI / 4, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.8, 12]} />
              <meshStandardMaterial color="#f3f4f6" roughness={0.6} />
            </mesh>
            {/* RCA plug tip */}
            <mesh position={[0, 0.45, 0]}>
              <cylinderGeometry args={[0.04, 0.06, 0.1, 12]} />
              <meshStandardMaterial color="#e5e7eb" metalness={0.7} roughness={0.3} />
            </mesh>
            {/* RCA plug body */}
            <mesh position={[0, 0.35, 0]}>
              <cylinderGeometry args={[0.06, 0.06, 0.08, 12]} />
              <meshStandardMaterial color="#f3f4f6" roughness={0.5} />
            </mesh>
          </group>
        </group>
      )}
      {/* Ground wire spool - visible on step 1 */}
      {currentStep === 1 && (
        <group position={[-2, 0.3, 0.5]}>
          {/* Wire coil */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.15, 0.03, 12, 24]} />
            <meshStandardMaterial color="#1f2937" roughness={0.8} />
          </mesh>
          {/* Spade connector */}
          <mesh position={[0.2, 0.1, 0]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.12, 0.08, 0.02]} />
            <meshStandardMaterial color="#9ca3af" metalness={0.6} roughness={0.3} />
          </mesh>
        </group>
      )}
      {/* Line-level RCA cables - visible on step 2 */}
      {currentStep === 2 && (
        <group position={[1.2, -0.8, 0]}>
          <group position={[0, 0, 0]}>
            <mesh rotation={[0, -Math.PI / 4, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.6, 12]} />
              <meshStandardMaterial color="#3b82f6" roughness={0.6} />
            </mesh>
            <mesh position={[0, 0.35, 0]}>
              <cylinderGeometry args={[0.05, 0.07, 0.1, 12]} />
              <meshStandardMaterial color="#2563eb" metalness={0.6} roughness={0.3} />
            </mesh>
          </group>
        </group>
      )}
      {/* Speaker wire spools - visible on steps 3 & 4 */}
      {(currentStep === 3 || currentStep === 4) && (
        <group position={[2, -1.5, 0.5]}>
          {/* Red wire */}
          <mesh position={[-0.15, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.12, 0.04, 12, 24]} />
            <meshStandardMaterial color="#dc2626" roughness={0.7} />
          </mesh>
          {/* Black wire */}
          <mesh position={[0.15, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.12, 0.04, 12, 24]} />
            <meshStandardMaterial color="#18181b" roughness={0.7} />
          </mesh>
        </group>
      )}
      {/* Connections - highlight active step */}
      <Wire
        start={[-2.7, 0.1, 0]}
        end={[-0.9, 0, -0.3]}
        color={highlightedConnection === "turntable-rca" ? "#fbbf24" : "#10b981"}
        width={highlightedConnection === "turntable-rca" ? 6 : 3}
      />
      <Wire
        start={[-2.7, -0.1, 0]}
        end={[-0.9, -0.2, -0.3]}
        color={highlightedConnection === "turntable-ground" ? "#fbbf24" : "#10b981"}
        width={highlightedConnection === "turntable-ground" ? 5 : 2}
        dashed={true}
      />
      <Wire
        start={[0, -0.2, -0.3]}
        end={[0, -1.75, -0.35]}
        color={highlightedConnection === "receiver-amp" ? "#fbbf24" : "#10b981"}
        width={highlightedConnection === "receiver-amp" ? 6 : 3}
      />
      <Wire
        start={[0.7, -1.75, -0.35]}
        end={[3.25, -0.8, 0]}
        color={highlightedConnection === "amp-speaker-l" ? "#fbbf24" : "#10b981"}
        width={highlightedConnection === "amp-speaker-l" ? 7 : 4}
      />
      <Wire
        start={[0.7, -2.25, -0.35]}
        end={[3.25, -2.2, 0]}
        color={highlightedConnection === "amp-speaker-r" ? "#fbbf24" : "#10b981"}
        width={highlightedConnection === "amp-speaker-r" ? 7 : 4}
      />
      {/* Bright ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>
    </>
  );
}

export function StereoDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const maxSteps = connectionSteps.length;

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(maxSteps - 1, prev + 1));
  };

  const currentStepData = connectionSteps[currentStep];

  // Responsive camera settings
  const cameraPosition: [number, number, number] = isMobile ? [10, 8, 10] : [6, 4, 6];
  const cameraFov = isMobile ? 70 : 50;

  return (
    <section className="relative py-20 md:py-32 bg-slate-50 dark:bg-slate-900 w-full overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 w-full">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 md:mb-6">
            Vintage Stereo Wiring
            <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">
              Step-by-Step Guide
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Interactive 3D walkthrough of proper stereo setup connections
          </p>
        </div>
        <div className="grid lg:grid-cols-2 gap-6 md:gap-10 items-start max-w-full">
          <div className="relative order-1 w-full">
            <div className="relative aspect-4/3 rounded-xl md:rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-slate-800 shadow-2xl max-w-full">
              <Canvas shadows camera={{ position: cameraPosition, fov: cameraFov }} className="touch-none">
                <color attach="background" args={["#1e293b"]} />
                <PerspectiveCamera makeDefault position={cameraPosition} fov={cameraFov} />
                <OrbitControls
                  enableZoom={true}
                  enablePan={false}
                  minDistance={5}
                  maxDistance={12}
                  minPolarAngle={Math.PI / 6}
                  maxPolarAngle={Math.PI / 2.5}
                />
                <StereoScene currentStep={currentStep} />
              </Canvas>
              <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700">
                  <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-400" />
                  <span className="text-[10px] sm:text-xs text-slate-300 font-medium">Drag to Rotate</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700">
                  <ZoomIn className="h-3 w-3 sm:h-4 sm:w-4 text-cyan-400" />
                  <span className="text-[10px] sm:text-xs text-slate-300 font-medium">Scroll to Zoom</span>
                </div>
              </div>
              <div className="absolute top-3 left-3 right-3 pointer-events-none">
                <div className="px-4 py-2.5 rounded-lg bg-slate-900/90 backdrop-blur-sm border border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold text-sm">
                      Step {currentStep + 1} of {maxSteps}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${((currentStep + 1) / maxSteps) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 sm:mt-6 flex items-center justify-center gap-3 sm:gap-4">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium hover:bg-slate-300 dark:hover:bg-slate-750 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="h-5 w-5" />
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={currentStep === maxSteps - 1}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-linear-to-r from-blue-600 to-purple-600 text-white text-sm font-medium hover:from-blue-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20"
              >
                Next
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="space-y-4 sm:space-y-6 order-2 w-full overflow-hidden">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3 overflow-wrap-break-word">
                {currentStepData.title}
              </h3>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-3 overflow-wrap-break-word">
                {currentStepData.description}
              </p>
              <div className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-cyan-600 dark:text-cyan-400">Tools:</span> {currentStepData.tools}
                </p>
              </div>
            </div>
            <div className="p-4 sm:p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-start gap-2 sm:gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-1.5">✓ Correct Technique</h4>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200">{currentStepData.correct}</p>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-5 rounded-xl bg-red-500/10 border border-red-500/30">
              <div className="flex items-start gap-2 sm:gap-3">
                <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-red-600 dark:text-red-400 uppercase mb-1.5">✗ Common Mistakes</h4>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200">{currentStepData.incorrect}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
