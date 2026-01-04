"use client";

import { useState, useId } from "react";
import { createClient } from "@/lib/supabase/client";
import { IoPeople, IoCheckmarkCircle } from "react-icons/io5";
import Link from "next/link";

interface LoginClientProps {
  inviteToken?: string | null;
  groupName?: string | null;
}

// Dark theme styles to match dashboard
const styles = {
  text: { color: '#ffffff' },
  textMuted: { color: '#888888' },
  textError: { color: '#ef4444' },
  buttonOutline: {
    backgroundColor: '#111111',
    color: '#ffffff',
    border: '1px solid #2a2a2a',
  },
  link: { color: '#5eead4' },
  accent: '#5eead4',
};

export function LoginClient({ inviteToken, groupName }: LoginClientProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const errorId = useId();

  const handleOAuth = async (provider: "github" | "google") => {
    setLoading(provider);
    setError("");

    const supabase = createClient();

    // Build redirect URL with invitation token if present
    // Use absolute URL to ensure proper redirect
    const callbackUrl = new URL('/auth/callback', window.location.origin);
    if (inviteToken) {
      callbackUrl.searchParams.set('token', inviteToken);
    }
    if (groupName) {
      callbackUrl.searchParams.set('group', groupName);
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: callbackUrl.toString(),
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(null);
    }
  };

  const features = [
    {
      title: "Instant Diagnosis",
      description: "Upload a photo, video clip, or describe the issue. Get options and cost estimates.",
    },
    {
      title: "Collaborate with Your Group",
      description: "Share projects with family or roommates. Make decisions together.",
    },
    {
      title: "Track Everything",
      description: "Budgets, expenses, contractor ratings, and decision outcomes in one place.",
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
              Make smarter{" "}
              <span style={{ color: '#5eead4' }}>decisions</span>
            </h1>
            <p className="text-lg leading-relaxed" style={styles.textMuted}>
              Every project researched. Every option compared. Ready for you to act on.
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
          Join thousands making smarter decisions every day
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
            {groupName && (
              <div
                className="mb-6 p-4 rounded-lg border"
                style={{ backgroundColor: 'rgba(94, 234, 212, 0.1)', borderColor: 'rgba(94, 234, 212, 0.2)' }}
                role="status"
              >
                <div className="flex items-center gap-2" style={{ color: '#5eead4' }}>
                  <IoPeople className="h-5 w-5" aria-hidden="true" />
                  <p className="font-medium">
                    You&apos;ve been invited to join <span className="font-bold">{groupName}</span>
                  </p>
                </div>
              </div>
            )}
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2" style={styles.text}>
                {groupName ? "Join group" : "Get started"}
              </h2>
              <p style={styles.textMuted}>
                {groupName ? "Sign in to accept your invitation" : "Sign in or create an account"}
              </p>
            </div>
            <div className="sr-only" aria-live="polite" aria-atomic="true">
              {loading && `Signing in with ${loading === "linkedin_oidc" ? "LinkedIn" : loading}...`}
            </div>
            <div className="space-y-3" role="group" aria-label="Sign in options">
              <button
                onClick={() => handleOAuth("github")}
                disabled={loading !== null}
                className="w-full h-12 text-base font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
                style={styles.buttonOutline}
                aria-describedby={error ? errorId : undefined}
              >
                {loading === "github" ? (
                  <>
                    <span
                      className="h-4 w-4 rounded-full animate-spin"
                      style={{ border: '2px solid #2a2a2a', borderTopColor: '#5eead4' }}
                      aria-hidden="true"
                    />
                    Signing in...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                    Continue with GitHub
                  </>
                )}
              </button>
              <button
                onClick={() => handleOAuth("google")}
                disabled={loading !== null}
                className="w-full h-12 text-base font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
                style={styles.buttonOutline}
                aria-describedby={error ? errorId : undefined}
              >
                {loading === "google" ? (
                  <>
                    <span
                      className="h-4 w-4 rounded-full animate-spin"
                      style={{ border: '2px solid #2a2a2a', borderTopColor: '#5eead4' }}
                      aria-hidden="true"
                    />
                    Signing in...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>
            </div>
            {error && (
              <div
                id={errorId}
                role="alert"
                aria-live="assertive"
                className="mt-4 p-3 rounded-lg border"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
              >
                <p className="text-sm font-medium" style={styles.textError}>{error}</p>
              </div>
            )}
            <p className="text-sm text-center mt-8" style={styles.textMuted}>
              By continuing, you agree to our{" "}
              <Link href="/terms-of-service" className="font-semibold hover:underline" style={styles.link}>
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy-policy" className="font-semibold hover:underline" style={styles.link}>
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
