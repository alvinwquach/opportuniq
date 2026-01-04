import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db/client";
import { users } from "@/app/db/schema";
import { and, isNull, lt, gte, sql } from "drizzle-orm";
import { sendAbandonedOnboardingEmail } from "@/lib/resend";

/**
 * Cron job to send abandoned onboarding emails
 *
 * This should run daily to find users who:
 * - Created their account 24+ hours ago
 * - Haven't completed onboarding (zipCode is null)
 * - Haven't been sent this email yet
 *
 * Setup in Vercel:
 * 1. Go to Project Settings → Cron Jobs
 * 2. Add: GET /api/cron/abandoned-onboarding
 * 3. Schedule: 0 10 * * * (daily at 10am)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify this is called by Vercel Cron (optional but recommended)
    const authHeader = request.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find users who:
    // 1. Created account 24+ hours ago
    // 2. Haven't completed onboarding (zipCode is null)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const abandonedUsers = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(
        and(
          isNull(users.postalCode), // Hasn't completed onboarding
          lt(users.createdAt, twentyFourHoursAgo), // Created 24+ hours ago
          gte(users.createdAt, new Date(Date.now() - 48 * 60 * 60 * 1000)) // But not more than 48 hours (only send once)
        )
      );

    console.log(`Found ${abandonedUsers.length} users with abandoned onboarding`);

    const results = await Promise.allSettled(
      abandonedUsers.map((user) =>
        sendAbandonedOnboardingEmail({
          email: user.email,
          name: user.name,
        })
      )
    );

    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return NextResponse.json({
      success: true,
      message: `Sent ${successful} abandoned onboarding emails`,
      details: {
        total: abandonedUsers.length,
        successful,
        failed,
      },
    });
  } catch (error) {
    console.error("Abandoned onboarding cron error:", error);
    return NextResponse.json(
      { error: "Failed to send abandoned onboarding emails" },
      { status: 500 }
    );
  }
}
