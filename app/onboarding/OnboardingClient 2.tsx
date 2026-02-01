"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { IoLocation } from "react-icons/io5";
import { completeOnboarding } from "./actions";
import amplitude from "@/amplitude";

interface OnboardingClientProps {
  customRedirect?: string | null;
  isPreview?: boolean;
}

export default function OnboardingClient({ customRedirect, isPreview }: OnboardingClientProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track onboarding started
  useEffect(() => {
    if (!isPreview) {
      amplitude.track("Onboarding Started", {
        hasCustomRedirect: !!customRedirect,
      });
    }
  }, [isPreview, customRedirect]);

  const form = useForm({
    defaultValues: {
      country: "US",
      postalCode: "",
      streetAddress: "",
      city: "",
      stateProvince: "",
      searchRadius: 25,
      phoneNumber: "",
    },
    onSubmit: async ({ value }) => {
      setError(null);
      setIsSubmitting(true);

      if (isPreview) {
        // In preview mode, redirect to dashboard after a brief delay
        setTimeout(() => {
          router.push("/dashboard");
        }, 500);
        return;
      }

      try {
        console.log("[Onboarding Client] Submitting form...", { postalCode: value.postalCode, country: value.country });

        // Add timeout to prevent hanging (increased to 30s for slow DB connections)
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Request timed out after 30 seconds")), 30000)
        );

        const result = await Promise.race([
          completeOnboarding({
            ...value,
            theme: "light",
          }),
          timeoutPromise
        ]) as Awaited<ReturnType<typeof completeOnboarding>>;

        console.log("[Onboarding Client] Result:", result);

        if (!result || !result.success) {
          throw new Error(result?.error || "Failed to save onboarding preferences");
        }

        const finalRedirect = customRedirect || result.redirectTo || "/dashboard";
        console.log("[Onboarding Client] Redirecting to:", finalRedirect);

        // Track onboarding completed
        amplitude.track("Onboarding Completed", {
          country: value.country,
          hasPostalCode: !!value.postalCode,
          hasStreetAddress: !!value.streetAddress,
          hasCity: !!value.city,
          hasStateProvince: !!value.stateProvince,
          hasPhoneNumber: !!value.phoneNumber,
          searchRadius: value.searchRadius,
          redirectTo: finalRedirect,
        });

        // Redirect immediately to the appropriate destination
        router.push(finalRedirect);
      } catch (err) {
        console.error("[Onboarding Client] Error:", err);
        const errorMessage = err instanceof Error ? err.message : "Something went wrong. Please try again.";
        setError(errorMessage);
        setIsSubmitting(false);

        // Track onboarding error
        amplitude.track("Onboarding Error", {
          error: errorMessage,
          country: value.country,
        });
      }
    },
  });

  // Dark theme styles to match dashboard
  const styles = {
    page: { backgroundColor: '#0c0c0c', color: '#ffffff' },
    header: { backgroundColor: '#0c0c0c', borderColor: '#1f1f1f' },
    card: { backgroundColor: '#111111', borderColor: '#1f1f1f' },
    input: {
      backgroundColor: '#0c0c0c',
      color: '#ffffff',
      border: '1px solid #2a2a2a',
      height: '40px',
      padding: '0 12px',
      fontSize: '14px',
      borderRadius: '8px',
      width: '100%',
    },
    label: { color: '#ffffff', fontWeight: 500, fontSize: '13px', marginBottom: '4px', display: 'block' },
    text: { color: '#ffffff', fontSize: '14px' },
    textMuted: { color: '#888888', fontSize: '13px' },
    textError: { color: '#ef4444', fontSize: '13px' },
    button: { backgroundColor: '#5eead4', color: '#000000', fontSize: '14px', fontWeight: 600 },
    accent: '#5eead4',
    accentDark: '#14b8a6',
    accentLight: '#5eead4',
  };

  return (
    <div className="min-h-screen flex flex-col" style={styles.page}>
      <header className="p-4 border-b" style={styles.header}>
        <Link
          href="/"
          aria-label="Go to OpportunIQ home page"
          className="inline-flex items-center gap-2"
        >
          <svg
            viewBox="0 0 100 100"
            className="w-8 h-8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M50 5 L85 25 L85 65 L50 85 L15 65 L15 25 Z"
              stroke="#5eead4"
              strokeWidth="3"
              fill="none"
            />
            <path
              d="M50 15 L75 30 L75 60 L50 75 L25 60 L25 30 Z"
              stroke="#5eead4"
              strokeWidth="2.5"
              fill="#5eead4"
              fillOpacity="0.15"
            />
            <circle
              cx="50"
              cy="45"
              r="15"
              stroke="#5eead4"
              strokeWidth="4"
              fill="none"
              strokeDasharray="70 30"
              transform="rotate(-90 50 45)"
            />
            <path
              d="M 60 55 L 70 65"
              stroke="#5eead4"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="50" cy="45" r="5" fill="#5eead4" />
            <g stroke="#5eead4" strokeWidth="2.5">
              <path d="M 10 20 L 10 10 L 20 10" />
              <path d="M 80 10 L 90 10 L 90 20" />
              <path d="M 90 70 L 90 80 L 80 80" />
              <path d="M 20 80 L 10 80 L 10 70" />
            </g>
          </svg>
          <span className="font-bold text-xl" style={styles.text}>
            OpportunIQ
          </span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="rounded-xl border overflow-hidden" style={styles.card}>
              <div className="text-center px-5 pt-6 pb-4" style={{ backgroundColor: '#0c0c0c', borderBottom: '1px solid #1f1f1f' }}>
                <div
                  className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3"
                  style={{ backgroundColor: '#5eead4' }}
                >
                  <IoLocation className="w-6 h-6" style={{ color: '#000000' }} />
                </div>
                <h1 className="text-xl font-bold mb-1" style={styles.text}>Welcome! Let's get started</h1>
                <p className="text-sm" style={styles.textMuted}>
                  We'll help you find local contractors and services in your area
                </p>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  form.handleSubmit();
                }}
                className="px-5 pt-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#666666' }}>
                        Address (Optional)
                      </span>
                      <div className="h-px flex-1" style={{ backgroundColor: '#1f1f1f' }} />
                    </div>
                    <form.Field name="streetAddress">
                      {(field) => (
                        <div>
                          <label htmlFor="streetAddress" style={styles.label}>
                            Street Address
                          </label>
                          <input
                            id="streetAddress"
                            type="text"
                            placeholder="123 Main St, Apt 2B"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            autoComplete="street-address"
                            style={styles.input}
                          />
                        </div>
                      )}
                    </form.Field>
                    <form.Field name="city">
                      {(field) => (
                        <div>
                          <label htmlFor="city" style={styles.label}>
                            City
                          </label>
                          <input
                            id="city"
                            type="text"
                            placeholder="San Francisco"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            autoComplete="address-level2"
                            style={styles.input}
                          />
                        </div>
                      )}
                    </form.Field>

                    <form.Field name="stateProvince">
                      {(field) => (
                        <div>
                          <label htmlFor="stateProvince" style={styles.label}>
                            State / Province
                          </label>
                          <input
                            id="stateProvince"
                            type="text"
                            placeholder="CA"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            autoComplete="address-level1"
                            style={styles.input}
                          />
                        </div>
                      )}
                    </form.Field>
                    <form.Field name="phoneNumber">
                      {(field) => (
                        <div>
                          <label htmlFor="phoneNumber" style={styles.label}>
                            Phone
                          </label>
                          <input
                            id="phoneNumber"
                            type="tel"
                            placeholder="+1 (555) 123-4567"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            autoComplete="tel"
                            style={styles.input}
                          />
                        </div>
                      )}
                    </form.Field>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#5eead4' }}>
                        Required
                      </span>
                      <div className="h-px flex-1" style={{ backgroundColor: '#1f1f1f' }} />
                    </div>
                    <form.Field
                      name="postalCode"
                      validators={{
                        onChange: ({ value }) => {
                          if (!value) return "Postal code is required";
                          if (!/^[A-Za-z0-9][A-Za-z0-9\s\-]{2,9}$/.test(value.trim())) {
                            return "Invalid format";
                          }
                          return undefined;
                        },
                      }}
                    >
                      {(field) => {
                        const hasError = field.state.meta.errors.length > 0;
                        return (
                          <div>
                            <label htmlFor="postalCode" style={styles.label}>
                              Postal Code <span style={styles.textError}>*</span>
                            </label>
                            <input
                              id="postalCode"
                              type="text"
                              placeholder="94102"
                              value={field.state.value}
                              onChange={(e) => field.handleChange(e.target.value)}
                              onBlur={field.handleBlur}
                              autoComplete="postal-code"
                              aria-invalid={hasError}
                              style={{
                                ...styles.input,
                                borderColor: hasError ? '#ef4444' : '#2a2a2a',
                              }}
                            />
                            {hasError && (
                              <p className="text-sm mt-1" style={styles.textError}>{field.state.meta.errors[0]}</p>
                            )}
                          </div>
                        );
                      }}
                    </form.Field>
                    <form.Field name="country">
                      {(field) => (
                        <div>
                          <label htmlFor="country" style={styles.label}>
                            Country <span style={styles.textError}>*</span>
                          </label>
                          <select
                            id="country"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            style={{
                              ...styles.input,
                              appearance: 'none',
                              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23888888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'right 12px center',
                              paddingRight: '40px',
                            }}
                          >
                            <option value="US">United States</option>
                            <option value="CA">Canada</option>
                            <option value="GB">United Kingdom</option>
                            <option value="AU">Australia</option>
                            <option value="DE">Germany</option>
                            <option value="FR">France</option>
                            <option value="ES">Spain</option>
                            <option value="IT">Italy</option>
                            <option value="NL">Netherlands</option>
                            <option value="JP">Japan</option>
                            <option value="MX">Mexico</option>
                            <option value="BR">Brazil</option>
                            <option value="IN">India</option>
                          </select>
                        </div>
                      )}
                    </form.Field>
                    <form.Subscribe selector={(state) => state.values.country}>
                      {(country) => {
                        const usesMiles = ["US", "GB", "MM", "LR"].includes(country);
                        const unit = usesMiles ? "miles" : "km";

                        return (
                          <form.Field name="searchRadius">
                            {(field) => (
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <label htmlFor="searchRadius" style={styles.label}>
                                    Search Radius <span style={styles.textError}>*</span>
                                  </label>
                                  <span className="text-base font-semibold" style={{ color: '#5eead4' }}>
                                    {field.state.value} {unit}
                                  </span>
                                </div>
                                <div className="relative py-1">
                                  <input
                                    id="searchRadius"
                                    type="range"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(Number(e.target.value))}
                                    min={5}
                                    max={100}
                                    step={5}
                                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                                    style={{
                                      background: `linear-gradient(to right, #5eead4 0%, #5eead4 ${((field.state.value - 5) / 95) * 100}%, #2a2a2a ${((field.state.value - 5) / 95) * 100}%, #2a2a2a 100%)`
                                    }}
                                  />
                                  <style jsx>{`
                                    input[type="range"]::-webkit-slider-thumb {
                                      -webkit-appearance: none;
                                      appearance: none;
                                      width: 20px;
                                      height: 20px;
                                      border-radius: 50%;
                                      background: #5eead4;
                                      cursor: pointer;
                                      border: 2px solid #0c0c0c;
                                      box-shadow: 0 2px 6px rgba(0,0,0,0.4);
                                    }
                                    input[type="range"]::-moz-range-thumb {
                                      width: 20px;
                                      height: 20px;
                                      border-radius: 50%;
                                      background: #5eead4;
                                      cursor: pointer;
                                      border: 2px solid #0c0c0c;
                                      box-shadow: 0 2px 6px rgba(0,0,0,0.4);
                                    }
                                  `}</style>
                                </div>
                                <div className="flex justify-between text-xs mt-1" style={styles.textMuted}>
                                  <span>5 {unit}</span>
                                  <span>100 {unit}</span>
                                </div>
                              </div>
                            )}
                          </form.Field>
                        );
                      }}
                    </form.Subscribe>

                  </div>
                </div>
                {error && (
                  <div
                    className="p-3 rounded-lg border mb-4"
                    style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                  >
                    <p className="text-sm font-medium" style={styles.textError}>{error}</p>
                  </div>
                )}
                <div className="pt-3 pb-4 border-t" style={{ borderColor: '#1f1f1f' }}>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 text-sm font-semibold rounded-lg disabled:opacity-50 transition-all hover:opacity-90 active:scale-[0.99]"
                    style={{
                      ...styles.button,
                      backgroundColor: isSubmitting ? '#14b8a6' : '#5eead4',
                    }}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span
                          className="h-4 w-4 rounded-full animate-spin"
                          style={{ border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#000000' }}
                        />
                        <span>Saving...</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Get Started
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          <p className="text-center text-xs mt-4" style={styles.textMuted}>
            {isPreview ? (
              <>
                Preview mode —{" "}
                <Link href="/auth/login" className="font-medium hover:underline" style={{ color: '#5eead4' }}>
                  Sign in to continue
                </Link>
              </>
            ) : (
              <>
                Wrong account?{" "}
                <Link href="/auth/logout" className="font-medium hover:underline" style={{ color: '#5eead4' }}>
                  Sign out
                </Link>
              </>
            )}
          </p>
        </div>
      </main>
    </div>
  );
}
