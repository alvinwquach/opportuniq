/**
 * DIY Guides API
 *
 * GET /api/conversations/[conversationId]/guides
 * Returns all DIY guides associated with a conversation.
 *
 * PATCH /api/conversations/[conversationId]/guides
 * Updates guide interaction (clicked, bookmarked, helpful).
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/app/db/client";
import { diyGuides, aiConversations } from "@/app/db/schema";
import { eq, and, desc } from "drizzle-orm";

interface RouteContext {
  params: Promise<{ conversationId: string }>;
}

/**
 * GET /api/conversations/[conversationId]/guides
 *
 * Returns all DIY guides for the given conversation.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { conversationId } = await context.params;

    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user owns this conversation
    const conversation = await db
      .select({ id: aiConversations.id, userId: aiConversations.userId })
      .from(aiConversations)
      .where(eq(aiConversations.id, conversationId))
      .limit(1);

    if (!conversation[0] || conversation[0].userId !== user.id) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Fetch guides for this conversation
    const guides = await db
      .select()
      .from(diyGuides)
      .where(eq(diyGuides.conversationId, conversationId))
      .orderBy(desc(diyGuides.relevanceScore));

    return NextResponse.json({
      guides,
      count: guides.length,
    });
  } catch (error) {
    console.error("[Guides API] GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/conversations/[conversationId]/guides
 *
 * Updates guide interaction status.
 * Body: { guideId: string, action: "clicked" | "bookmarked" | "helpful" | "not_helpful" }
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { conversationId } = await context.params;

    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { guideId, action } = body as {
      guideId: string;
      action: "clicked" | "bookmarked" | "helpful" | "not_helpful";
    };

    if (!guideId || !action) {
      return NextResponse.json({ error: "Missing guideId or action" }, { status: 400 });
    }

    // Verify user owns this guide
    const guide = await db
      .select()
      .from(diyGuides)
      .where(and(eq(diyGuides.id, guideId), eq(diyGuides.userId, user.id)))
      .limit(1);

    if (!guide[0]) {
      return NextResponse.json({ error: "Guide not found" }, { status: 404 });
    }

    // Update based on action
    const updateData: Partial<typeof diyGuides.$inferInsert> = {};

    switch (action) {
      case "clicked":
        updateData.wasClicked = true;
        updateData.clickedAt = new Date();
        break;
      case "bookmarked":
        updateData.wasBookmarked = !guide[0].wasBookmarked; // Toggle
        break;
      case "helpful":
        updateData.wasHelpful = true;
        break;
      case "not_helpful":
        updateData.wasHelpful = false;
        break;
    }

    await db
      .update(diyGuides)
      .set(updateData)
      .where(eq(diyGuides.id, guideId));

    return NextResponse.json({ success: true, action });
  } catch (error) {
    console.error("[Guides API] PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
