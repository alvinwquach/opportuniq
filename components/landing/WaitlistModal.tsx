"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { Toast } from "@/components/ui/Toast";
import { IoArrowForward, IoClose, IoReload, IoMail, IoLockClosed } from "react-icons/io5";
import amplitude from "@/amplitude";

interface WaitlistModalProps {
  children: React.ReactNode;
}

export function WaitlistModal({ children }: WaitlistModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);

  // Fetch waitlist count on mount
  useEffect(() => {
    fetch("/api/waitlist")
      .then((res) => res.json())
      .then((data) => setWaitlistCount(data.count))
      .catch(() => {});
  }, []);

  // Track modal open
  useEffect(() => {
    if (isOpen) {
      amplitude.track("Waitlist Modal Opened");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Get referral code from URL if present
    const urlParams = new URLSearchParams(window.location.search);
    const referralCode = urlParams.get("ref");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source: "landing",
          referralCode,
        }),
      });

      const data = await response.json();

      if (data.success) {
        amplitude.track("Waitlist Signup", {
          source: "landing",
          hasReferral: !!referralCode,
        });
        setIsOpen(false);
        setShowToast(true);
        setEmail("");
      } else {
        setError(data.error || "Failed to join waitlist");
        amplitude.track("Waitlist Signup Failed", {
          error: data.error,
        });
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      amplitude.track("Waitlist Signup Failed", {
        error: "Network error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild suppressHydrationWarning>{children}</DialogTrigger>
        <DialogContent
          className="bg-white border border-neutral-200 shadow-2xl p-0 sm:max-w-md rounded-2xl overflow-hidden"
          showCloseButton={false}
          suppressHydrationWarning
        >
          <div className="relative px-6 pt-6 pb-4 border-b border-neutral-100">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors flex items-center justify-center text-neutral-500 hover:text-neutral-700"
            >
              <IoClose className="w-4 h-4" />
            </button>
            <DialogTitle className="text-xl font-bold text-neutral-900 mb-1">
              Join the Waitlist
            </DialogTitle>
            <p className="text-sm text-neutral-500">
              Be the first to know when OpportunIQ launches.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label
                htmlFor="waitlist-email"
                className="block text-sm font-medium text-neutral-700 mb-1.5"
              >
                Email address
              </label>
              <div className="relative">
                <IoMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="email"
                  id="waitlist-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 placeholder-neutral-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-3 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <IoReload className="w-4 h-4 animate-spin" />
                  <span>Joining...</span>
                </>
              ) : (
                <>
                  <span>Join Waitlist</span>
                  <IoArrowForward className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="flex items-center justify-center gap-1.5 text-xs text-neutral-400">
              <IoLockClosed className="w-3 h-3" />
              <span>We respect your privacy. No spam, ever.</span>
            </p>
          </form>

          {/* Footer */}
          <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100">
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span>OpportunIQ</span>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>{waitlistCount !== null ? `${waitlistCount.toLocaleString()}+ on waitlist` : "Join the waitlist"}</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Toast
        message="You're on the list! We'll notify you when we launch."
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </>
  );
}
