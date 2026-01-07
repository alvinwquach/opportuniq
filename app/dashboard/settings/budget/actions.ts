"use server";

import { db } from "@/app/db/client";
import { users } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { RiskTolerance } from "./schemas";

export async function getBudgetSettings(userId: string) {
  const [user] = await db
    .select({
      monthlyBudget: users.monthlyBudget,
      emergencyBuffer: users.emergencyBuffer,
      riskTolerance: users.riskTolerance,
    })
    .from(users)
    .where(eq(users.id, userId));

  if (!user) {
    return null;
  }

  return {
    monthlyBudget: user.monthlyBudget ? Number(user.monthlyBudget) : null,
    emergencyBuffer: user.emergencyBuffer ? Number(user.emergencyBuffer) : null,
    riskTolerance: user.riskTolerance as RiskTolerance | null,
  };
}

export async function updateBudgetSettings(
  userId: string,
  data: {
    monthlyBudget?: number | null;
    emergencyBuffer?: number | null;
    riskTolerance?: RiskTolerance | null;
  }
) {
  const [updated] = await db
    .update(users)
    .set({
      ...(data.monthlyBudget !== undefined && {
        monthlyBudget: data.monthlyBudget?.toString() ?? null,
      }),
      ...(data.emergencyBuffer !== undefined && {
        emergencyBuffer: data.emergencyBuffer?.toString() ?? null,
      }),
      ...(data.riskTolerance !== undefined && {
        riskTolerance: data.riskTolerance,
      }),
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning({
      monthlyBudget: users.monthlyBudget,
      emergencyBuffer: users.emergencyBuffer,
      riskTolerance: users.riskTolerance,
    });

  revalidatePath("/dashboard/settings/budget");
  revalidatePath("/dashboard");

  return updated
    ? {
        monthlyBudget: updated.monthlyBudget
          ? Number(updated.monthlyBudget)
          : null,
        emergencyBuffer: updated.emergencyBuffer
          ? Number(updated.emergencyBuffer)
          : null,
        riskTolerance: updated.riskTolerance as RiskTolerance | null,
      }
    : null;
}
