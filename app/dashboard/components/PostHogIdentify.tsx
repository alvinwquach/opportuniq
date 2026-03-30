"use client";

import { useEffect } from "react";
import posthog from "@/lib/posthog/client";

interface PostHogIdentifyProps {
  userId: string;
  email: string;
  name: string | null;
  accessTier: string;
  role: string;
  hasIncomeSetup: boolean;
  hasLocation: boolean;
  groupCount: number;
}

export function PostHogIdentify({
  userId,
  email,
  name,
  accessTier,
  role,
  hasIncomeSetup,
  hasLocation,
  groupCount,
}: PostHogIdentifyProps) {
  useEffect(() => {
    posthog.identify(userId, {
      email,
      name: name || undefined,
      accessTier,
      role,
      hasIncomeSetup,
      hasLocation,
      groupCount,
    });
  }, [userId, email, name, accessTier, role, hasIncomeSetup, hasLocation, groupCount]);

  return null;
}
