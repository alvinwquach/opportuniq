"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IoCheckmarkCircle, IoPeople, IoSparkles, IoArrowForward } from "react-icons/io5";
import Link from "next/link";
import { OpportunIQLogo } from "@/components/landing/OpportunIQLogo";
import {
  trackInviteTokenValidated,
  trackInviteTokenInvalid,
  trackInviteTokenValidationFailed,
  trackInviteTokenValidatedManualEntry,
  trackReferralCodeValidated,
  trackCodeInvalid,
  trackCodeValidationFailed,
  trackJoinSignUpStarted,
  trackJoinSignUpFailed,
} from "@/lib/analytics";

interface JoinClientProps {
  inviteToken?: string | null;
  urlReferralCode?: string | null;
}

export function JoinClient({ inviteToken, urlReferralCode }: JoinClientProps) {
  const [referralCode, setReferralCode] = useState(urlReferralCode || "");
  const [validating, setValidating] = useState(false);
  const [validated, setValidated] = useState(false);
  const [referrerName, setReferrerName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteTier, setInviteTier] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  // Auto-validate invite token on mount
  useEffect(() => {
    if (inviteToken) {
      validateInviteToken(inviteToken);
    }
  }, [inviteToken]);

  // Auto-validate referral code from URL
  useEffect(() => {
    if (urlReferralCode && !inviteToken) {
      validateReferralCode(urlReferralCode);
    }
  }, [urlReferralCode, inviteToken]);

  const validateInviteToken = async (token: string) => {
    setValidating(true);
    setError("");

    try {
      const res = await fetch("/api/invite/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (data.valid) {
        setValidated(true);
        setInviteEmail(data.email);
        setReferrerName(data.invitedBy);
        setInviteTier(data.tier);
        trackInviteTokenValidated({
          hasInviteEmail: !!data.email,
          tier: data.tier,
        });
      } else {
        setError(data.error);
        trackInviteTokenInvalid({
          error: data.error,
        });
      }
    } catch {
      setError("Failed to validate invite");
      trackInviteTokenValidationFailed({
        error: "Network error",
      });
    } finally {
      setValidating(false);
    }
  };

  const validateReferralCode = async (code: string) => {
    if (!code.trim()) {
      setError("Please enter a code");
      return;
    }

    setValidating(true);
    setError("");

    const trimmedCode = code.trim();

    try {
      // If 16 characters, try as invite token first
      if (trimmedCode.length === 16) {
        const inviteRes = await fetch("/api/invite/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: trimmedCode }),
        });

        const inviteData = await inviteRes.json();

        if (inviteData.valid) {
          setValidated(true);
          setInviteEmail(inviteData.email);
          setReferrerName(inviteData.invitedBy);
          setInviteTier(inviteData.tier);
          // Store the token so OAuth flow uses it
          setReferralCode(trimmedCode);
          trackInviteTokenValidatedManualEntry({
            tier: inviteData.tier,
          });
          return;
        }
      }

      // Try as referral code (8 chars or fallback)
      const res = await fetch("/api/referral/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmedCode }),
      });

      const data = await res.json();

      if (data.valid) {
        setValidated(true);
        setReferrerName(data.referrer);
        trackReferralCodeValidated({
          codeLength: trimmedCode.length,
        });
      } else {
        // If 16 chars and both failed, give better error
        if (trimmedCode.length === 16) {
          setError("Invalid invite token. Please check the code and try again.");
        } else {
          setError(data.error);
        }
        trackCodeInvalid({
          error: data.error,
          codeLength: trimmedCode.length,
        });
      }
    } catch {
      setError("Failed to validate code");
      trackCodeValidationFailed({
        error: "Network error",
      });
    } finally {
      setValidating(false);
    }
  };

  const handleOAuth = async (provider: "google" | "github" | "linkedin_oidc") => {
    if (!validated) {
      setError("Please validate your referral code first");
      return;
    }

    setLoading(provider);
    setError("");

    trackJoinSignUpStarted({
      provider,
      hasInviteToken: !!inviteToken,
      hasReferralCode: !!referralCode,
    });

    const supabase = createClient();

    // Build redirect URL with the access info
    // IMPORTANT: Always use the canonical domain (without www) to match Supabase config
    // This prevents PKCE cookie mismatches between www and non-www domains
    const canonicalOrigin = typeof window !== "undefined" && window.location.hostname === "www.opportuniq.app"
      ? "https://opportuniq.app"
      : window.location.origin;

    let redirectUrl = `${canonicalOrigin}/auth/callback`;
    const params = new URLSearchParams();

    // If we have an invite tier set, it means either:
    // 1. User came via URL with ?token= (inviteToken is set)
    // 2. User manually entered a 16-char invite token (stored in referralCode, inviteTier is set)
    if (inviteToken) {
      params.set("invite_token", inviteToken);
    } else if (inviteTier && referralCode.length === 16) {
      // Manual entry of invite token
      params.set("invite_token", referralCode.trim().toUpperCase());
    } else if (referralCode) {
      params.set("ref", referralCode.trim().toUpperCase());
    }

    if (params.toString()) {
      redirectUrl += `?${params.toString()}`;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(null);
      trackJoinSignUpFailed({
        provider,
        error: error.message,
      });
    }
  };

  // Tier display config
  const tierConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
    johatsu: { label: "Johatsu Access", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30" },
    alpha: { label: "Alpha Access", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30" },
    beta: { label: "Beta Access", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  };

  const currentTier = tierConfig[inviteTier || "alpha"] || tierConfig.alpha;

  // Admin invite flow (johatsu, alpha, beta)
  if (inviteToken) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center p-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,240,255,0.08)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,240,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] opacity-30" />

        <div className="relative z-10 w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3 group mb-8">
              <OpportunIQLogo className="h-10 w-10" />
              <span className="font-mono font-bold text-xl text-white">OpportuniQ</span>
            </Link>

            {validating ? (
              <div className="space-y-4">
                <div className="h-8 w-8 border-2 border-[#00F0FF] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-slate-400">Validating your invite...</p>
              </div>
            ) : error ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                  <p className="text-red-400">{error}</p>
                </div>
                <Link href="/" className="text-[#00F0FF] hover:underline text-sm">
                  Return to homepage
                </Link>
              </div>
            ) : validated ? (
              <div className="space-y-6">
                <div className={`p-4 rounded-lg ${currentTier.bg} ${currentTier.border} border`}>
                  <div className={`flex items-center justify-center gap-2 ${currentTier.color} mb-2`}>
                    <IoSparkles className="h-5 w-5" />
                    <span className="font-medium">{currentTier.label}</span>
                  </div>
                  <p className="text-slate-400 text-sm">
                    You&apos;ve been invited by <span className="text-white font-medium">{referrerName}</span>
                  </p>
                  {inviteEmail && (
                    <p className="text-slate-500 text-xs mt-1">
                      Invite for: {inviteEmail}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => handleOAuth("google")}
                    disabled={loading !== null}
                    className="w-full h-12 bg-white hover:bg-gray-100 text-black"
                  >
                    {loading === "google" ? (
                      <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Continue with Google
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => handleOAuth("github")}
                    disabled={loading !== null}
                    variant="outline"
                    className="w-full h-12 bg-black/50 border-white/20 hover:border-white/40 text-white"
                  >
                    {loading === "github" ? (
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <svg className="h-5 w-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                        </svg>
                        Continue with GitHub
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  // Referral code flow (beta users)
  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,240,255,0.08)_0%,transparent_70%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,240,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] opacity-30" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group mb-8">
            <OpportunIQLogo className="h-10 w-10" />
            <span className="font-mono font-bold text-xl text-white">OpportuniQ</span>
          </Link>

          <h1 className="text-3xl font-bold text-white mb-2">Join OpportunIQ</h1>
          <p className="text-slate-400">
            {validated
              ? inviteTier
                ? `You've been invited by ${referrerName}`
                : `You've been referred by ${referrerName}`
              : "Enter your invite token or referral code"}
          </p>
        </div>

        {!validated ? (
          <div className="space-y-4">
            <div className="p-6 rounded-xl bg-[#0a0e14]/80 border border-white/10">
              <div className="flex items-center gap-2 text-[#00F0FF] mb-4">
                <IoPeople className="h-5 w-5" />
                <span className="text-sm font-medium">Invite Token or Referral Code</span>
              </div>
              <Input
                value={referralCode}
                onChange={(e) => {
                  setReferralCode(e.target.value.toUpperCase());
                  setError("");
                }}
                placeholder="e.g., ABCD1234EFGH5678"
                className="h-12 text-center text-lg font-mono tracking-wider bg-black/50 border-white/20 text-white placeholder:text-slate-600"
                maxLength={16}
              />
              {error && (
                <p className="text-red-400 text-sm mt-2">{error}</p>
              )}
              <Button
                onClick={() => validateReferralCode(referralCode)}
                disabled={validating || !referralCode.trim()}
                className="w-full h-12 mt-4 bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-black font-medium"
              >
                {validating ? (
                  <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Validate Code
                    <IoArrowForward className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>

            <div className="text-center">
              <p className="text-slate-500 text-sm">
                Don&apos;t have a code?{" "}
                <Link href="/#waitlist" className="text-[#00F0FF] hover:underline">
                  Join the waitlist
                </Link>
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Show tier badge for invite tokens */}
            {inviteTier ? (
              <div className={`p-4 rounded-lg ${currentTier.bg} ${currentTier.border} border`}>
                <div className={`flex items-center justify-center gap-2 ${currentTier.color} mb-2`}>
                  <IoSparkles className="h-5 w-5" />
                  <span className="font-medium">{currentTier.label}</span>
                </div>
                <p className="text-slate-400 text-sm text-center">
                  You&apos;ve been invited by <span className="text-white font-medium">{referrerName}</span>
                </p>
                {inviteEmail && (
                  <p className="text-slate-500 text-xs text-center mt-1">
                    Invite for: {inviteEmail}
                  </p>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-[#00FF88]/10 border border-[#00FF88]/30">
                <div className="flex items-center justify-center gap-2 text-[#00FF88]">
                  <IoCheckmarkCircle className="h-5 w-5" />
                  <span className="font-medium">Code validated!</span>
                </div>
                <p className="text-slate-400 text-sm text-center mt-1">
                  Referred by <span className="text-white font-medium">{referrerName}</span>
                </p>
              </div>
            )}

            <div className="space-y-3">
              <Button
                onClick={() => handleOAuth("google")}
                disabled={loading !== null}
                className="w-full h-12 bg-white hover:bg-gray-100 text-black"
              >
                {loading === "google" ? (
                  <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </>
                )}
              </Button>

              <Button
                onClick={() => handleOAuth("github")}
                disabled={loading !== null}
                variant="outline"
                className="w-full h-12 bg-black/50 border-white/20 hover:border-white/40 text-white"
              >
                {loading === "github" ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="h-5 w-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                    Continue with GitHub
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        <p className="text-xs text-slate-500 text-center mt-8">
          By continuing, you agree to our{" "}
          <Link href="/terms-of-service" className="text-[#00F0FF]/70 hover:text-[#00F0FF] underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy-policy" className="text-[#00F0FF]/70 hover:text-[#00F0FF] underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
