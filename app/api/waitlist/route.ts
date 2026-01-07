import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db/client";
import { waitlist } from "@/app/db/schema";
import { eq, sql } from "drizzle-orm";

function generateReferralCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, source = "landing", referralCode } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists
    const [existing] = await db
      .select()
      .from(waitlist)
      .where(eq(waitlist.email, normalizedEmail))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { success: false, error: "This email is already on the waitlist" },
        { status: 409 }
      );
    }

    // Generate a unique referral code for this user
    let myReferralCode = generateReferralCode();

    // Ensure uniqueness (unlikely collision but handle it)
    let attempts = 0;
    while (attempts < 5) {
      const [existingCode] = await db
        .select()
        .from(waitlist)
        .where(eq(waitlist.myReferralCode, myReferralCode))
        .limit(1);

      if (!existingCode) break;
      myReferralCode = generateReferralCode();
      attempts++;
    }

    // If referred, update the referrer's count
    if (referralCode) {
      await db
        .update(waitlist)
        .set({
          referralCount: sql`(COALESCE(referral_count::int, 0) + 1)::text`,
        })
        .where(eq(waitlist.myReferralCode, referralCode));
    }

    // Insert the new waitlist entry
    const [newEntry] = await db
      .insert(waitlist)
      .values({
        email: normalizedEmail,
        source,
        referralCode: referralCode || null,
        myReferralCode,
        phase: "public",
      })
      .returning();

    return NextResponse.json({
      success: true,
      referralCode: newEntry.myReferralCode,
    });
  } catch (error) {
    console.error("Waitlist signup error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to join waitlist" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get waitlist count for display
    const entries = await db.select().from(waitlist);

    return NextResponse.json({
      count: entries.length,
    });
  } catch (error) {
    console.error("Waitlist count error:", error);
    return NextResponse.json({ count: 0 });
  }
}
