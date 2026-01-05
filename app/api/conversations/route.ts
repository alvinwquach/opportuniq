/**
 * Conversations API Route
 *
 * GET - Fetch user's conversation history
 */

import { createClient } from "@/lib/supabase/server";
import { db } from "@/app/db/client";
import { aiConversations, aiMessages } from "@/app/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Parse query params
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Fetch conversations with message count
    const conversations = await db
      .select({
        id: aiConversations.id,
        title: aiConversations.title,
        type: aiConversations.type,
        category: aiConversations.category,
        severity: aiConversations.severity,
        isResolved: aiConversations.isResolved,
        createdAt: aiConversations.createdAt,
        updatedAt: aiConversations.updatedAt,
        lastMessageAt: aiConversations.lastMessageAt,
        messageCount: sql<number>`(
          SELECT COUNT(*) FROM ai_messages
          WHERE ai_messages.conversation_id = ai_conversations.id
        )`,
      })
      .from(aiConversations)
      .where(eq(aiConversations.userId, user.id))
      .orderBy(desc(aiConversations.lastMessageAt))
      .limit(limit)
      .offset(offset);

    return Response.json({
      conversations: conversations.map((c) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
        lastMessageAt: c.lastMessageAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("[Conversations API] Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
