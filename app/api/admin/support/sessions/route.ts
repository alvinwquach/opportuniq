import { NextResponse } from "next/server";
import { getSupportData } from "@/app/admin/support/actions";

export async function GET() {
  try {
    const data = await getSupportData();
    return NextResponse.json({ sessions: data.activeSessions });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to load sessions" },
      { status: 500 }
    );
  }
}

