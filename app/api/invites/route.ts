import { NextRequest, NextResponse } from "next/server";
import { getUserInviteData, sendUserInvite } from "@/lib/invites";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const data = await getUserInviteData(userId);
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, email } = body;

  if (!userId || !email) {
    return NextResponse.json(
      { success: false, error: "userId and email are required" },
      { status: 400 }
    );
  }

  const result = await sendUserInvite(userId, email);
  return NextResponse.json(result);
}
