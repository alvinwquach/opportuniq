"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { gsap } from "@/lib/gsap";
import { Toast } from "@/components/ui/Toast";
import { OpportunIQLogo } from "@/components/landing/OpportunIQLogo";
import { completeOnboarding } from "./actions";
import { TOTAL_STEPS, MILES_COUNTRIES } from "./constants";
import { StepLayout } from "./components/StepLayout";
import {
  WelcomeStepLeft,
  WelcomeStepRight,
  LocationStepLeft,
  LocationStepRight,
  RadiusStepLeft,
  RadiusStepRight,
  ComfortStepLeft,
  ComfortStepRight,
  UseCaseStepLeft,
  UseCaseStepRight,
  CompleteStepLeft,
  CompleteStepRight,
} from "./components/steps";
import type { OnboardingFormData } from "./types";
import {
  trackOnboardingStarted,
  trackOnboardingCompleted,
  trackOnboardingError,
} from "@/lib/analytics";

interface OnboardingClientProps {
  customRedirect?: string | null;
  isPreview?: boolean;
  userName?: string | null;
}

export default function OnboardingClient({
  customRedirect,
  isPreview,
  userName,
}: OnboardingClientProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);
  const [currentSection, setCurrentSection] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [formData, setFormData] = useState<OnboardingFormData>({
    country: "US",
    postalCode: "",
    searchRadius: 25,
    riskTolerance: "",
    primaryUseCase: "",
  });

  const [geocodedLocation, setGeocodedLocation] = useState<{
    coords: { lat: number; lng: number };
    locationInfo: { city: string; region?: string; countryName?: string };
    postalCode: string;
    country: string;
  } | null>(null);

  const usesMiles = MILES_COUNTRIES.includes(formData.country);
  const unit = usesMiles ? "miles" : "km";

  // Track onboarding started
  useEffect(() => {
    if (!isPreview) {
      trackOnboardingStarted({ hasCustomRedirect: !!customRedirect });
    }
  }, [isPreview, customRedirect]);

  // Scroll to section - only right column animates (Typeform style)
  const scrollToSection = (index: number) => {
    if (isAnimating || index < 0 || index >= TOTAL_STEPS || index === currentSection) return;

    setIsAnimating(true);
    const direction = index > currentSection ? 1 : -1;
    const currentEl = sectionsRef.current[currentSection];
    const nextEl = sectionsRef.current[index];

    if (!currentEl || !nextEl) {
      setIsAnimating(false);
      return;
    }

    // Show next section immediately (behind current) for smooth crossfade
    gsap.set(nextEl, { display: "flex", opacity: 1 });

    const tl = gsap.timeline({
      onComplete: () => {
        // Hide current section only after animation completes
        gsap.set(currentEl, { display: "none" });
        setCurrentSection(index);
        setIsAnimating(false);
      },
    });

    // Animate both left and right column content for smoother transitions
    const currentRight = currentEl.querySelector(".right-content");
    const currentLeft = currentEl.querySelector(".left-content");
    const nextRight = nextEl.querySelector(".right-content");
    const nextLeft = nextEl.querySelector(".left-content");

    // Set up next section content (start hidden)
    if (nextRight) {
      gsap.set(nextRight, { y: direction * 30, opacity: 0 });
    }
    if (nextLeft) {
      gsap.set(nextLeft, { opacity: 0 });
    }

    // Crossfade: fade out current while fading in next simultaneously
    // Current content fades out
    if (currentRight) {
      tl.to(currentRight, {
        y: direction * -30,
        opacity: 0,
        duration: 0.4,
        ease: "power2.inOut",
      }, 0);
    }
    if (currentLeft) {
      tl.to(currentLeft, {
        opacity: 0,
        duration: 0.35,
        ease: "power2.inOut",
      }, 0);
    }

    // Next content fades in (overlapping with fade out)
    if (nextRight) {
      tl.to(nextRight, {
        y: 0,
        opacity: 1,
        duration: 0.45,
        ease: "power2.out",
      }, 0.15);
    }
    if (nextLeft) {
      tl.to(nextLeft, {
        opacity: 1,
        duration: 0.4,
        ease: "power2.out",
      }, 0.1);
    }
  };

  const goNext = () => scrollToSection(currentSection + 1);
  const goPrev = () => scrollToSection(currentSection - 1);

  // Keyboard navigation only (no scroll/wheel navigation)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnimating) return;
      const target = e.target as HTMLElement;
      const isInput = ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName);

      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "Enter" && !isInput) {
        e.preventDefault();
        goNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentSection, isAnimating]);

  // Check if can proceed
  const canProceed = (): boolean => {
    switch (currentSection) {
      case 1:
        return formData.postalCode.length >= 3 && formData.country.length > 0;
      case 2:
        return formData.searchRadius >= 5 && formData.searchRadius <= 100;
      default:
        return true;
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);

    if (isPreview) {
      setTimeout(() => {
        setIsSubmitting(false);
        setToastMessage(
          `Preview complete! Location: ${formData.postalCode}, ${formData.country} | Radius: ${formData.searchRadius}${unit} | DIY: ${formData.riskTolerance} | Focus: ${formData.primaryUseCase || "none"}`
        );
        setShowToast(true);
      }, 800);
      return;
    }

    try {
      const result = await completeOnboarding({
        country: formData.country,
        postalCode: formData.postalCode,
        searchRadius: formData.searchRadius,
        riskTolerance: formData.riskTolerance,
        primaryUseCase: formData.primaryUseCase,
        theme: "light",
      });

      if (!result?.success) {
        throw new Error(result?.error || "Failed to save preferences");
      }

      trackOnboardingCompleted({
        country: formData.country,
        searchRadius: formData.searchRadius,
        riskTolerance: formData.riskTolerance,
        primaryUseCase: formData.primaryUseCase,
      });

      router.push(customRedirect || result.redirectTo || "/dashboard");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong.";
      setError(errorMessage);
      setIsSubmitting(false);
      trackOnboardingError({ error: errorMessage });
    }
  };

  const stepProps = {
    formData,
    setFormData,
    onNext: goNext,
    onPrev: goPrev,
    canProceed: canProceed(),
    isPreview,
    userName,
  };

  return (
    <div ref={containerRef} className="h-screen w-screen overflow-hidden bg-[#0a0a0a] text-white relative">
      <Toast message={toastMessage} isVisible={showToast} onClose={() => setShowToast(false)} duration={5000} />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <OpportunIQLogo className="w-8 h-8 text-teal-300" />
            <span className="font-bold text-lg">OpportunIQ</span>
          </Link>

          {isPreview && (
            <span className="text-xs px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Preview Mode
            </span>
          )}
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-3">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToSection(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === currentSection
                ? "bg-teal-400 scale-150"
                : i < currentSection
                ? "bg-teal-400/50"
                : "bg-white/20 hover:bg-white/40"
            }`}
            aria-label={`Go to step ${i + 1}`}
          />
        ))}
      </div>

      {/* Step 0: Welcome */}
      <StepLayout
        ref={(el) => { sectionsRef.current[0] = el; }}
        isVisible={currentSection === 0}
        leftContent={<WelcomeStepLeft />}
        rightContent={<WelcomeStepRight onNext={goNext} userName={userName} />}
      />

      {/* Step 1: Location */}
      <StepLayout
        ref={(el) => { sectionsRef.current[1] = el; }}
        isVisible={false}
        leftFullBleed
        leftNoPadding
        leftContent={
          <LocationStepLeft
            formData={formData}
            onGeocodeSuccess={(coords, locationInfo) =>
              setGeocodedLocation({
                coords,
                locationInfo,
                postalCode: formData.postalCode,
                country: formData.country,
              })
            }
          />
        }
        rightContent={<LocationStepRight {...stepProps} />}
      />

      {/* Step 2: Radius */}
      <StepLayout
        ref={(el) => { sectionsRef.current[2] = el; }}
        isVisible={false}
        leftFullBleed
        leftNoPadding
        leftContent={
          <RadiusStepLeft
            formData={formData}
            initialCoords={
              geocodedLocation &&
              geocodedLocation.postalCode === formData.postalCode &&
              geocodedLocation.country === formData.country
                ? geocodedLocation.coords
                : null
            }
            initialLocationInfo={
              geocodedLocation &&
              geocodedLocation.postalCode === formData.postalCode &&
              geocodedLocation.country === formData.country
                ? geocodedLocation.locationInfo
                : null
            }
          />
        }
        rightContent={<RadiusStepRight {...stepProps} />}
      />

      {/* Step 3: Comfort */}
      <StepLayout
        ref={(el) => { sectionsRef.current[3] = el; }}
        isVisible={false}
        leftFullBleed
        leftContent={<ComfortStepLeft formData={formData} />}
        rightContent={<ComfortStepRight {...stepProps} />}
      />

      {/* Step 4: Use Case */}
      <StepLayout
        ref={(el) => { sectionsRef.current[4] = el; }}
        isVisible={false}
        leftFullBleed
        leftContent={<UseCaseStepLeft formData={formData} />}
        rightContent={<UseCaseStepRight {...stepProps} />}
      />

      {/* Step 5: Complete */}
      <StepLayout
        ref={(el) => { sectionsRef.current[5] = el; }}
        isVisible={false}
        leftFullBleed
        leftContent={<CompleteStepLeft formData={formData} />}
        rightContent={
          <CompleteStepRight
            formData={formData}
            onPrev={goPrev}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isPreview={isPreview}
            error={error}
          />
        }
      />

      {/* Footer */}
      <div className="fixed bottom-6 left-6 z-50">
        <p className="text-xs text-white/30">
          {isPreview ? (
            <>Preview mode — <Link href="/auth/login" className="text-teal-400 hover:underline">Sign in</Link></>
          ) : (
            <>Wrong account? <Link href="/auth/logout" className="text-teal-400 hover:underline">Sign out</Link></>
          )}
        </p>
      </div>

      <div className="fixed bottom-6 right-6 z-50 text-xs text-white/30 hidden lg:block">
        Scroll or use arrow keys
      </div>

      {/* Range input styles */}
      <style jsx global>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #5eead4;
          cursor: pointer;
          border: 3px solid #0a0a0a;
          box-shadow: 0 2px 8px rgba(94, 234, 212, 0.4);
        }
        input[type="range"]::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #5eead4;
          cursor: pointer;
          border: 3px solid #0a0a0a;
          box-shadow: 0 2px 8px rgba(94, 234, 212, 0.4);
        }
      `}</style>
    </div>
  );
}
