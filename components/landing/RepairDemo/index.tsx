"use client";

import { useState, useEffect } from "react";
import { Shield, ChevronLeft, ChevronRight, RotateCcw, ZoomIn, CheckCircle, XCircle } from "lucide-react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei";

import { headlightSteps, brakePadSteps } from "./data";
import { HeadlightAssembly } from "./HeadlightAssembly";
import { BrakeAssembly } from "./BrakeAssembly";

export function RepairDemo() {
  const [demoMode, setDemoMode] = useState<"headlight" | "brakes">("headlight");
  const [currentStep, setCurrentStep] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const steps = demoMode === "headlight" ? headlightSteps : brakePadSteps;
  const maxSteps = steps.length;

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

  const handleModeChange = (mode: "headlight" | "brakes") => {
    setDemoMode(mode);
    setCurrentStep(0);
  };

  const currentStepData = steps[currentStep];

  // Responsive camera settings
  const cameraPosition: [number, number, number] = isMobile ? [0, 2, 8] : [0, 3, 6];
  const cameraFov = isMobile ? 55 : 45;

  return (
    <section className="relative py-20 md:py-32 bg-linear-to-b from-slate-900 via-slate-800 to-slate-900 overflow-hidden border-y border-slate-700/50 w-full">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 w-full">
        {/* Header */}
        <div className="text-center mb-10 md:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
            <Shield className="h-4 w-4" />
            3D Interactive Training
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 md:mb-6 text-white px-4">
            See Every Step in 3D
            <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-cyan-400">
              Learn What NOT to Do
            </span>
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-3 px-4">
            Interactive 3D repair simulations with realistic models, tool visualizations, and error prevention.
          </p>

          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto px-4">
            Visual supplement for complex repairs—rotate, zoom, and explore each step before you start.
          </p>
        </div>

        {/* Demo Mode Selector */}
        <div className="flex justify-center gap-2 sm:gap-3 mb-8 md:mb-10 px-4">
          <button
            onClick={() => handleModeChange("headlight")}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all ${
              demoMode === "headlight"
                ? "bg-linear-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                : "bg-slate-800 text-slate-400 hover:bg-slate-750 hover:text-white border border-slate-700"
            }`}
          >
            Headlight Fog Repair
          </button>
          <button
            onClick={() => handleModeChange("brakes")}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all ${
              demoMode === "brakes"
                ? "bg-linear-to-r from-cyan-600 to-blue-500 text-white shadow-lg shadow-cyan-500/30"
                : "bg-slate-800 text-slate-400 hover:bg-slate-750 hover:text-white border border-slate-700"
            }`}
          >
            Brake Pad Replacement
          </button>
        </div>

        {/* Main Demo Area */}
        <div className="grid lg:grid-cols-2 gap-6 md:gap-10 items-start max-w-full">
          {/* 3D Visualization */}
          <div className="relative order-1 w-full">
            <div className="relative aspect-4/3 rounded-xl md:rounded-2xl overflow-hidden border-2 border-slate-700 bg-slate-900 shadow-2xl max-w-full">
              <Canvas shadows camera={{ position: cameraPosition, fov: cameraFov }} className="w-full h-full touch-none">
                <color attach="background" args={['#0f172a']} />
                <fog attach="fog" args={['#0f172a', 12, 25]} />
                <PerspectiveCamera makeDefault position={cameraPosition} fov={cameraFov} />
                <OrbitControls
                  enableZoom={true}
                  enablePan={true}
                  minDistance={3}
                  maxDistance={12}
                  minPolarAngle={0}
                  maxPolarAngle={Math.PI / 2}
                />
                {demoMode === "headlight" ? (
                  <HeadlightAssembly step={currentStep} showError={false} />
                ) : (
                  <BrakeAssembly step={currentStep} showError={false} />
                )}
                {demoMode === "brakes" && <Environment preset="city" />}
              </Canvas>

              {/* Controls */}
              <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700">
                  <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-400" />
                  <span className="text-[10px] sm:text-xs text-slate-300 font-medium hidden sm:inline">Drag to Rotate</span>
                  <span className="text-[10px] text-slate-300 font-medium sm:hidden">Drag</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700">
                  <ZoomIn className="h-3 w-3 sm:h-4 sm:w-4 text-cyan-400" />
                  <span className="text-[10px] sm:text-xs text-slate-300 font-medium hidden sm:inline">Scroll to Zoom</span>
                  <span className="text-[10px] text-slate-300 font-medium sm:hidden">Zoom</span>
                </div>
              </div>

              {/* Progress */}
              <div className="absolute top-3 left-3 right-3 pointer-events-none">
                <div className="px-4 py-2.5 rounded-lg bg-slate-900/90 backdrop-blur-sm border border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold text-sm">
                      Step {currentStep + 1} of {maxSteps}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500"
                      style={{ width: `${((currentStep + 1) / maxSteps) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="mt-4 sm:mt-6 flex items-center justify-center gap-3 sm:gap-4">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm font-medium hover:bg-slate-750 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="h-5 w-5" />
                Previous
              </button>

              <button
                onClick={handleNext}
                disabled={currentStep === maxSteps - 1}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-linear-to-r from-emerald-600 to-emerald-500 text-white text-sm font-medium hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/20"
              >
                Next
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-4 sm:space-y-6 order-2 w-full overflow-hidden">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3 overflow-wrap-break-word">
                {currentStepData.title}
              </h3>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-3 overflow-wrap-break-word">
                {currentStepData.description}
              </p>
              <div className="px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700">
                <p className="text-xs sm:text-sm text-slate-400">
                  <span className="font-semibold text-cyan-400">Tools:</span> {currentStepData.tools}
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-start gap-2 sm:gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-emerald-400 uppercase mb-1.5">✓ Correct Technique</h4>
                  <p className="text-xs sm:text-sm text-slate-200">{currentStepData.correct}</p>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-red-500/10 border border-red-500/30">
              <div className="flex items-start gap-2 sm:gap-3">
                <XCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-red-400 uppercase mb-1.5">✗ Common Mistakes</h4>
                  <p className="text-xs sm:text-sm text-slate-200">{currentStepData.incorrect}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
