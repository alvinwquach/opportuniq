import { NextResponse } from "next/server";
import { db } from "@/app/db/client";
import { referralCodes, users } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { normalizeReferralCode } from "@/lib/referral";

/**
 * GET /api/referral/validate?code=ABC123
 * Validates a referral code for beta signup
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { valid: false, error: "Referral code is required" },
        { status: 400 }
      );
    }

    const normalizedCode = normalizeReferralCode(code);

    const [referralCode] = await db
      .select({
        id: referralCodes.id,
        code: referralCodes.code,
        ownerId: referralCodes.ownerId,
        maxUses: referralCodes.maxUses,
        useCount: referralCodes.useCount,
        isActive: referralCodes.isActive,
        expiresAt: referralCodes.expiresAt,
      })
      .from(referralCodes)
      .where(eq(referralCodes.code, normalizedCode));

    if (!referralCode) {
      return NextResponse.json(
        { valid: false, error: "Invalid referral code" },
        { status: 404 }
      );
    }

    if (referralCode.isActive !== "true") {
      return NextResponse.json(
        { valid: false, error: "This referral code is no longer active" },
        { status: 400 }
      );
    }

    if (referralCode.expiresAt && new Date() > referralCode.expiresAt) {
      return NextResponse.json(
        { valid: false, error: "This referral code has expired" },
        { status: 400 }
      );
    }

    if (referralCode.maxUses && referralCode.useCount >= referralCode.maxUses) {
      return NextResponse.json(
        { valid: false, error: "This referral code has reached its usage limit" },
        { status: 400 }
      );
    }

    const [referrer] = await db
      .select({ name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, referralCode.ownerId));

    return NextResponse.json({
      valid: true,
      referrer: referrer?.name || referrer?.email?.split("@")[0] || "A friend",
    });
  } catch (error) {
    console.error("[Referral Validate] Error:", error);
    return NextResponse.json(
      { valid: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/referral/validate
 * Validates a referral code for beta signup
 */
export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { valid: false, error: "Referral code is required" },
        { status: 400 }
      );
    }

    const normalizedCode = normalizeReferralCode(code);

    // Look up the referral code
    const [referralCode] = await db
      .select({
        id: referralCodes.id,
        code: referralCodes.code,
        ownerId: referralCodes.ownerId,
        maxUses: referralCodes.maxUses,
        useCount: referralCodes.useCount,
        isActive: referralCodes.isActive,
        expiresAt: referralCodes.expiresAt,
      })
      .from(referralCodes)
      .where(eq(referralCodes.code, normalizedCode));

    if (!referralCode) {
      return NextResponse.json(
        { valid: false, error: "Invalid referral code" },
        { status: 400 }
      );
    }

    // Check if code is active
    if (referralCode.isActive !== "true") {
      return NextResponse.json(
        { valid: false, error: "This referral code is no longer active" },
        { status: 400 }
      );
    }

    // Check if code has expired
    if (referralCode.expiresAt && new Date() > referralCode.expiresAt) {
      return NextResponse.json(
        { valid: false, error: "This referral code has expired" },
        { status: 400 }
      );
    }

    // Check if code has reached max uses
    if (referralCode.maxUses && referralCode.useCount >= referralCode.maxUses) {
      return NextResponse.json(
        { valid: false, error: "This referral code has reached its usage limit" },
        { status: 400 }
      );
    }

    // Get the referrer's name for display
    const [referrer] = await db
      .select({ name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, referralCode.ownerId));

    return NextResponse.json({
      valid: true,
      referrer: referrer?.name || referrer?.email?.split("@")[0] || "A friend",
    });
  } catch (error) {
    console.error("[Referral Validate] Error:", error);
    return NextResponse.json(
      { valid: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}
