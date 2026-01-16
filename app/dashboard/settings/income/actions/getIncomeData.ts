"use server";

/**
 * GET INCOME DATA
 *
 * Fetches all income streams for a user with financial summaries.
 * Returns encrypted data - client will decrypt.
 */

import { db } from "@/app/db/client";
import { userIncomeStreams } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import type { IncomeStreamResponse } from "./types";
import { FREQUENCY_TO_MONTHLY, ANNUAL_HOURS } from "./types";

/**
 * Get all income streams for a user
 *
 * PSEUDOCODE:
 * 1. Query all income streams for the user
 * 2. Return encrypted data - client will decrypt
 * 3. Calculate financials only for unencrypted legacy rows
 *    (encrypted amounts must be calculated client-side after decryption)
 */
export async function getIncomeData(userId: string): Promise<{
  incomeStreams: IncomeStreamResponse[];
  financials: {
    monthlyIncome: number;
    annualIncome: number;
    hourlyRate: number;
    hasEncryptedData: boolean;
  };
}> {
  const incomeStreams = await db
    .select()
    .from(userIncomeStreams)
    .where(eq(userIncomeStreams.userId, userId))
    .orderBy(userIncomeStreams.createdAt);

  // Calculate monthly income (only for unencrypted legacy rows)
  // Encrypted amounts must be calculated client-side after decryption
  let monthlyIncome = 0;
  let hasEncryptedData = false;

  for (const stream of incomeStreams) {
    if (stream.isEncrypted) {
      hasEncryptedData = true;
      continue; // Skip - client must calculate after decryption
    }
    if (!stream.isActive) continue;
    const multiplier = FREQUENCY_TO_MONTHLY[stream.frequency] || 0;
    monthlyIncome += Number(stream.amount) * multiplier;
  }

  const annualIncome = monthlyIncome * 12;
  const hourlyRate = annualIncome / ANNUAL_HOURS;

  return {
    incomeStreams: incomeStreams as IncomeStreamResponse[],
    financials: {
      monthlyIncome,
      annualIncome,
      hourlyRate,
      hasEncryptedData,
    },
  };
}
