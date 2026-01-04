import { NextRequest, NextResponse } from "next/server";
import { resendInvite } from "@/lib/invites";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, inviteId } = body;

  if (!userId || !inviteId) {
    return NextResponse.json(
      { success: false, error: "userId and inviteId are required" },
      { status: 400 }
    );
  }

  const result = await resendInvite(userId, inviteId);
  return NextResponse.json(result);
}
