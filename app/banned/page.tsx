"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { IoShield, IoMail, IoHome } from "react-icons/io5";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function BannedPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Sign out the user automatically
    supabase.auth.signOut().then(() => {
      // Clear any cached data
      router.refresh();
    });
  }, [supabase.auth, router]);

  const reasons = [
    "Violation of Terms of Service",
    "Abusive or fraudulent behavior",
    "Multiple user reports",
  ];

  return (
    <div className="min-h-screen grid lg:grid-cols-[60%_40%]" style={{ backgroundColor: '#0c0c0c' }}>
      <div className="hidden lg:flex flex-col justify-between p-12 text-white" style={{ backgroundColor: '#080808' }}>
        <div>
          <Link href="/" className="flex items-center gap-3 group">
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
            <span className="font-bold text-xl tracking-tight text-white group-hover:text-[#5eead4] transition-colors">
              OpportunIQ
            </span>
          </Link>
        </div>
        <div className="space-y-12">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 mb-6">
              <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
              <span className="text-xs font-mono text-red-400 uppercase tracking-wider">Account Status: Suspended</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              <span className="text-white">Account</span>{" "}
              <span className="text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.6)]">Suspended</span>
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed">
              Your account has been suspended due to a violation of our Terms of Service.
              You have been automatically signed out.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-mono text-slate-500 uppercase tracking-wider">Common Reasons</h3>
            {reasons.map((reason, index) => (
              <div key={index} className="flex items-center gap-3 group">
                <div className="h-8 w-8 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                  <span className="text-red-400 font-mono text-sm">{index + 1}</span>
                </div>
                <span className="text-slate-400">{reason}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-sm text-slate-500">
          If you believe this is a mistake, please contact support
        </p>
      </div>
      <div className="flex flex-col min-h-screen p-6 lg:p-12" style={{ backgroundColor: '#0c0c0c' }}>
        <div className="lg:hidden mb-8">
          <Link href="/" className="flex items-center gap-3 group">
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
            <span className="font-bold text-xl tracking-tight text-white group-hover:text-[#5eead4] transition-colors">
              OpportunIQ
            </span>
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="mx-auto w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
              <IoShield className="h-10 w-10 text-red-500" />
            </div>
            <div className="lg:hidden mb-8 text-center">
              <h1 className="text-3xl font-bold text-white mb-2">Account Suspended</h1>
              <p className="text-slate-400">
                Your account has been suspended due to a violation of our Terms of Service.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-[#111111] border border-red-500/20 mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">What can I do?</h3>
              <ul className="space-y-3 text-slate-400 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">1.</span>
                  <span>Review our Terms of Service to understand the violation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">2.</span>
                  <span>Contact our support team with your account details</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">3.</span>
                  <span>Provide any relevant information that may help your case</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <Button
                asChild
                className="w-full h-12 text-base bg-[#5eead4] hover:bg-[#5eead4]/90 text-black font-bold transition-all duration-300"
                size="lg"
              >
                <a href="mailto:support@opportuniq.app" className="flex items-center justify-center gap-2">
                  <IoMail className="h-5 w-5" />
                  Contact Support
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full h-12 text-base bg-[#111111] border-[#2a2a2a] hover:border-[#5eead4]/50 hover:bg-[#111111] text-white transition-all duration-300"
                size="lg"
              >
                <Link href="/" className="flex items-center justify-center gap-2">
                  <IoHome className="h-5 w-5" />
                  Back to Home
                </Link>
              </Button>
            </div>
            <p className="text-xs text-slate-500 text-center mt-8">
              If you believe this is a mistake, please contact our support team with your account details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
