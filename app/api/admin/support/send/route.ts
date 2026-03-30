import { NextRequest, NextResponse } from "next/server";
import { sendSupportMessage } from "@/app/admin/support/actions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipientUserId, content } = body;

    if (!recipientUserId || !content) {
      return NextResponse.json(
        { error: "Recipient ID and content required" },
        { status: 400 }
      );
    }

    const data = await sendSupportMessage(recipientUserId, content);
    return NextResponse.json(data);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to send message" },
      { status: 500 }
    );
  }
}

