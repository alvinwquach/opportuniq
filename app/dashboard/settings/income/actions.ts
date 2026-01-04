"use server";

import { db } from "@/app/db/client";
import { userIncomeStreams } from "@/app/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { IncomeFrequency } from "./schemas";

// Re-export for convenience
export type { IncomeFrequency } from "./schemas";

const FREQUENCY_TO_MONTHLY: Record<string, number> = {
  weekly: 4.33,
  bi_weekly: 2.17,
  semi_monthly: 2,
  monthly: 1,
  quarterly: 1 / 3,
  annual: 1 / 12,
  one_time: 0,
};

const ANNUAL_HOURS = 2080;

export async function getIncomeData(userId: string) {
  const incomeStreams = await db
    .select()
    .from(userIncomeStreams)
    .where(eq(userIncomeStreams.userId, userId))
    .orderBy(userIncomeStreams.createdAt);

  // Calculate monthly income (only active, recurring streams)
  let monthlyIncome = 0;
  for (const stream of incomeStreams) {
    if (!stream.isActive) continue;
    const multiplier = FREQUENCY_TO_MONTHLY[stream.frequency] || 0;
    monthlyIncome += Number(stream.amount) * multiplier;
  }

  const annualIncome = monthlyIncome * 12;
  const hourlyRate = annualIncome / ANNUAL_HOURS;

  return {
    incomeStreams,
    financials: {
      monthlyIncome,
      annualIncome,
      hourlyRate,
    },
  };
}

export async function addIncomeStream(
  userId: string,
  data: {
    source: string;
    amount: number;
    frequency: IncomeFrequency;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    isActive?: boolean;
  }
) {
  const [stream] = await db
    .insert(userIncomeStreams)
    .values({
      userId,
      source: data.source,
      amount: data.amount.toString(),
      frequency: data.frequency,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      isActive: data.isActive ?? true,
    })
    .returning();

  revalidatePath("/settings/income");
  revalidatePath("/dashboard");

  return stream;
}

export async function updateIncomeStream(
  streamId: string,
  userId: string,
  data: {
    source?: string;
    amount?: number;
    frequency?: IncomeFrequency;
    description?: string;
    startDate?: Date | null;
    endDate?: Date | null;
    isActive?: boolean;
  }
) {
  const [stream] = await db
    .update(userIncomeStreams)
    .set({
      ...(data.source !== undefined && { source: data.source }),
      ...(data.amount !== undefined && { amount: data.amount.toString() }),
      ...(data.frequency !== undefined && { frequency: data.frequency }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.startDate !== undefined && { startDate: data.startDate }),
      ...(data.endDate !== undefined && { endDate: data.endDate }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(userIncomeStreams.id, streamId),
        eq(userIncomeStreams.userId, userId)
      )
    )
    .returning();

  revalidatePath("/settings/income");
  revalidatePath("/dashboard");

  return stream;
}

export async function deleteIncomeStream(streamId: string, userId: string) {
  await db
    .delete(userIncomeStreams)
    .where(
      and(
        eq(userIncomeStreams.id, streamId),
        eq(userIncomeStreams.userId, userId)
      )
    );

  revalidatePath("/settings/income");
  revalidatePath("/dashboard");
}
