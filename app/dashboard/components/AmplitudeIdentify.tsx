"use client";

import { useEffect } from "react";
import amplitude from "@/amplitude";
import * as amplitudeLib from "@amplitude/analytics-browser";

interface AmplitudeIdentifyProps {
  userId: string;
  email: string;
  name: string | null;
  accessTier: string;
  role: string;
  hasIncomeSetup: boolean;
  hasLocation: boolean;
  groupCount: number;
}

export function AmplitudeIdentify({
  userId,
  email,
  name,
  accessTier,
  role,
  hasIncomeSetup,
  hasLocation,
  groupCount,
}: AmplitudeIdentifyProps) {
  useEffect(() => {
    // Set user ID
    amplitude.setUserId(userId);

    // Set user properties
    const identify = new amplitudeLib.Identify()
      .set("email", email)
      .set("name", name || "Unknown")
      .set("accessTier", accessTier)
      .set("role", role)
      .set("hasIncomeSetup", hasIncomeSetup)
      .set("hasLocation", hasLocation)
      .set("groupCount", groupCount);

    amplitude.identify(identify);
  }, [userId, email, name, accessTier, role, hasIncomeSetup, hasLocation, groupCount]);

  return null;
}
