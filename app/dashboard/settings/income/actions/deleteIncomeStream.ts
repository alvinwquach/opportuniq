"use server";

/**
 * DELETE INCOME STREAM
 *
 * Removes an income stream from the database.
 * Verifies ownership before deletion.
 */

import { db } from "@/app/db/client";
import { userIncomeStreams } from "@/app/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Delete an income stream
 *
 * PSEUDOCODE:
 * 1. Verify ownership via userId check in WHERE clause
 * 2. Delete the record
 * 3. Revalidate affected paths
 */
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
