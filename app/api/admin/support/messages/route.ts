import { NextRequest, NextResponse } from "next/server";
import { getChatMessages } from "@/app/admin/support/actions";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const data = await getChatMessages(userId);
    return NextResponse.json(data);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to load messages" },
      { status: 500 }
    );
  }
}

