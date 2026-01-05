/**
 * Single Conversation API Route
 *
 * GET - Fetch a conversation with its messages
 * DELETE - Delete a conversation
 */

import { createClient } from "@/lib/supabase/server";
import { db } from "@/app/db/client";
import { aiConversations, aiMessages } from "@/app/db/schema";
import { eq, and, asc } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params;

    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Fetch conversation (verify ownership)
    const [conversation] = await db
      .select()
      .from(aiConversations)
      .where(
        and(
          eq(aiConversations.id, conversationId),
          eq(aiConversations.userId, user.id)
        )
      )
      .limit(1);

    if (!conversation) {
      return new Response("Not found", { status: 404 });
    }

    // Fetch messages
    const messages = await db
      .select({
        id: aiMessages.id,
        role: aiMessages.role,
        content: aiMessages.content,
        attachments: aiMessages.attachments,
        createdAt: aiMessages.createdAt,
      })
      .from(aiMessages)
      .where(eq(aiMessages.conversationId, conversationId))
      .orderBy(asc(aiMessages.createdAt));

    return Response.json({
      conversation: {
        ...conversation,
        createdAt: conversation.createdAt.toISOString(),
        updatedAt: conversation.updatedAt.toISOString(),
        lastMessageAt: conversation.lastMessageAt.toISOString(),
      },
      messages: messages.map((m) => ({
        ...m,
        createdAt: m.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("[Conversation API] Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params;

    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Delete conversation (verify ownership) - messages cascade delete
    const result = await db
      .delete(aiConversations)
      .where(
        and(
          eq(aiConversations.id, conversationId),
          eq(aiConversations.userId, user.id)
        )
      )
      .returning({ id: aiConversations.id });

    if (result.length === 0) {
      return new Response("Not found", { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("[Conversation API] Delete error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
