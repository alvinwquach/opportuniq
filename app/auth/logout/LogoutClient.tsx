"use client";

import { useState } from "react";
import { IoLogOut, IoArrowBack, IoCheckmark, IoCheckmarkCircle } from "react-icons/io5";
import Link from "next/link";
import { signOut } from "./actions";
import posthog from "@/lib/posthog/client";

interface LogoutClientProps {
  isLoggedIn: boolean;
}

const styles = {
  text: { color: '#ffffff' },
  textMuted: { color: '#888888' },
  button: { backgroundColor: '#5eead4', color: '#000000' },
  buttonOutline: {
    backgroundColor: '#111111',
    color: '#ffffff',
    border: '1px solid #2a2a2a',
  },
  accent: '#5eead4',
};

export function LogoutClient({ isLoggedIn }: LogoutClientProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoggedOut, setIsLoggedOut] = useState(!isLoggedIn);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    posthog.reset();
    await signOut();

    setIsLoggingOut(false);
    setIsLoggedOut(true);
  };

  const features = [
    {
      title: "Your data is secure",
      description: "All your decisions and projects remain safely stored for when you return.",
    },
    {
      title: "Pick up where you left off",
      description: "Sign back in anytime to continue managing your projects.",
    },
    {
      title: "Stay connected",
      description: "Your group memberships and shared projects will be waiting for you.",
    },
  ];

  return (
    <div className="min-h-screen grid lg:grid-cols-[55%_45%]" style={{ backgroundColor: '#0c0c0c' }}>
      <div className="hidden lg:flex flex-col justify-between p-12" style={{ backgroundColor: '#080808' }}>
        <div>
          <Link href="/" className="flex items-center gap-3">
            <svg viewBox="0 0 100 100" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 5 L85 25 L85 65 L50 85 L15 65 L15 25 Z" stroke="#5eead4" strokeWidth="3" fill="none" />
              <path d="M50 15 L75 30 L75 60 L50 75 L25 60 L25 30 Z" stroke="#5eead4" strokeWidth="2.5" fill="#5eead4" fillOpacity="0.15" />
              <circle cx="50" cy="45" r="15" stroke="#5eead4" strokeWidth="4" fill="none" strokeDasharray="70 30" transform="rotate(-90 50 45)" />
              <path d="M 60 55 L 70 65" stroke="#5eead4" strokeWidth="4" strokeLinecap="round" />
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
        </div>
        <div className="space-y-10">
          <div>
            <h1 className="text-4xl font-bold mb-4 leading-tight" style={styles.text}>
              See you{" "}
              <span style={{ color: '#5eead4' }}>soon</span>
            </h1>
            <p className="text-lg leading-relaxed" style={styles.textMuted}>
              Your account and data will be here when you&apos;re ready to come back.
            </p>
          </div>
          <div className="space-y-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="shrink-0">
                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(94, 234, 212, 0.1)', border: '1px solid rgba(94, 234, 212, 0.2)' }}
                  >
                    <IoCheckmarkCircle className="h-6 w-6" style={{ color: '#5eead4' }} />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1" style={styles.text}>{feature.title}</h3>
                  <p className="leading-relaxed" style={styles.textMuted}>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-sm" style={styles.textMuted}>
          Thanks for using OpportunIQ
        </p>
      </div>
      <div className="flex flex-col min-h-screen p-6 lg:p-12" style={{ backgroundColor: '#0c0c0c' }}>
        <header className="lg:hidden mb-8 -mx-6 -mt-6 px-6 py-4 border-b" style={{ borderColor: '#1f1f1f' }}>
          <Link href="/" className="inline-flex items-center gap-3">
            <svg viewBox="0 0 100 100" className="w-8 h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 5 L85 25 L85 65 L50 85 L15 65 L15 25 Z" stroke="#5eead4" strokeWidth="3" fill="none" />
              <path d="M50 15 L75 30 L75 60 L50 75 L25 60 L25 30 Z" stroke="#5eead4" strokeWidth="2.5" fill="#5eead4" fillOpacity="0.15" />
              <circle cx="50" cy="45" r="15" stroke="#5eead4" strokeWidth="4" fill="none" strokeDasharray="70 30" transform="rotate(-90 50 45)" />
              <path d="M 60 55 L 70 65" stroke="#5eead4" strokeWidth="4" strokeLinecap="round" />
              <circle cx="50" cy="45" r="5" fill="#5eead4" />
              <g stroke="#5eead4" strokeWidth="2.5">
                <path d="M 10 20 L 10 10 L 20 10" />
                <path d="M 80 10 L 90 10 L 90 20" />
                <path d="M 90 70 L 90 80 L 80 80" />
                <path d="M 20 80 L 10 80 L 10 70" />
              </g>
            </svg>
            <span className="font-bold text-lg" style={styles.text}>
              OpportunIQ
            </span>
          </Link>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            {isLoggedOut ? (
              <>
                <div
                  className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#5eead4' }}
                  aria-hidden="true"
                >
                  <IoCheckmark className="w-8 h-8" style={{ color: '#000000' }} />
                </div>
                <div className="mb-8 text-center">
                  <h2 className="text-3xl font-bold mb-2" style={styles.text}>
                    You&apos;ve been signed out
                  </h2>
                  <p style={styles.textMuted}>
                    Thanks for using OpportunIQ. See you next time!
                  </p>
                </div>
                <div className="space-y-3">
                  <Link
                    href="/auth/login"
                    className="w-full h-12 text-base font-semibold rounded-lg shadow-md flex items-center justify-center"
                    style={styles.button}
                  >
                    Sign back in
                  </Link>

                  <Link
                    href="/"
                    className="w-full h-12 text-base font-medium rounded-lg flex items-center justify-center"
                    style={styles.buttonOutline}
                  >
                    Go to homepage
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div
                  className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#1f1f1f' }}
                  aria-hidden="true"
                >
                  <IoLogOut className="w-8 h-8" style={{ color: '#888888' }} />
                </div>

                <div className="mb-8 text-center">
                  <h2 className="text-3xl font-bold mb-2" style={styles.text}>
                    Sign out
                  </h2>
                  <p style={styles.textMuted}>
                    Are you sure you want to sign out of your account?
                  </p>
                </div>
                <div className="sr-only" aria-live="polite" aria-atomic="true">
                  {isLoggingOut && "Signing out..."}
                </div>
                <div className="space-y-3">
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full h-12 text-base font-semibold rounded-lg shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                    style={styles.button}
                  >
                    {isLoggingOut ? (
                      <>
                        <span
                          className="h-4 w-4 rounded-full animate-spin"
                          style={{ border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#000000' }}
                          aria-hidden="true"
                        />
                        Signing out...
                      </>
                    ) : (
                      <>
                        <IoLogOut className="w-5 h-5" aria-hidden="true" />
                        Sign out
                      </>
                    )}
                  </button>
                  <Link
                    href="/dashboard"
                    className="w-full h-12 text-base font-medium rounded-lg flex items-center justify-center gap-2"
                    style={styles.buttonOutline}
                  >
                    <IoArrowBack className="w-5 h-5" aria-hidden="true" />
                    Back to dashboard
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
