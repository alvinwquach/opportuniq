"use server";

import { getCachedUser } from "@/lib/supabase/server";
import { db } from "@/app/db/client";
import { chatSessions, chatMessages, users } from "@/app/db/schema";
import { eq, and, isNull, desc, sql, or } from "drizzle-orm";

// Admin emails (from auth callback)
const ADMIN_EMAILS = [
  "alvinwquach@gmail.com",
  "binaryDecisions1111@gmail.com",
];

// Launch weekend dates (adjust these to your actual launch dates)
const LAUNCH_WEEKEND_START = new Date("2026-01-03T00:00:00Z");
const LAUNCH_WEEKEND_END = new Date("2026-01-06T23:59:59Z");

function isLaunchWeekend(): boolean {
  const now = new Date();
  return now >= LAUNCH_WEEKEND_START && now <= LAUNCH_WEEKEND_END;
}

function getAdminName(email: string): "Alvin" | "Kevin" {
  return email.toLowerCase() === "alvinwquach@gmail.com" ? "Alvin" : "Kevin";
}

export async function getSupportData() {
  // Use cached getUser() to prevent duplicate API calls
  const user = await getCachedUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Check if user is admin (case-insensitive check)
  const [userData] = await db.select().from(users).where(eq(users.id, user.id));
  
  if (!userData || !ADMIN_EMAILS.some(email => email.toLowerCase() === userData.email?.toLowerCase())) {
    throw new Error("Access denied - admin only");
  }

  // Track admin online status (update last seen)
  const adminName = getAdminName(userData.email);
  
  // Update current admin's last seen timestamp
  await db
    .update(users)
    .set({ updatedAt: new Date() })
    .where(eq(users.id, user.id));
  
  // Get online admins (admins who have been active in last 5 minutes)
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  
  // Query all admins (case-insensitive)
  const allAdmins = await db
    .select({
      email: users.email,
      name: users.name,
      updatedAt: users.updatedAt,
    })
    .from(users);
  
  // Filter to only admins and check if online
  const onlineAdmins = allAdmins
    .filter(admin => {
      const emailLower = admin.email?.toLowerCase() || "";
      return ADMIN_EMAILS.some(e => e.toLowerCase() === emailLower);
    })
    .filter(admin => 
      admin.updatedAt && new Date(admin.updatedAt) > fiveMinutesAgo
    )
    .map(admin => ({
      name: getAdminName(admin.email || ""),
      email: admin.email || "",
    }));

  // Get all active chat sessions with user info
  const activeSessions = await db
    .select({
      sessionId: chatSessions.id,
      userId: chatSessions.userId,
      userName: users.name,
      userEmail: users.email,
      userAvatarUrl: users.avatarUrl,
      lastMessageAt: chatSessions.lastMessageAt,
      unreadCount: sql<number>`(
        SELECT COUNT(*) 
        FROM ${chatMessages} 
        WHERE ${chatMessages.senderId} = ${chatSessions.userId}
        AND ${chatMessages.isFromSupport} = false
        AND ${chatMessages.readAt} IS NULL
      )`,
    })
    .from(chatSessions)
    .innerJoin(users, eq(chatSessions.userId, users.id))
    .where(eq(chatSessions.isActive, true))
    .orderBy(desc(chatSessions.lastMessageAt));

  // Get total unread count
  const unreadCount = activeSessions.reduce((sum, session) => sum + Number(session.unreadCount || 0), 0);

  return {
    activeSessions: activeSessions.map((s) => ({
      ...s,
      unreadCount: Number(s.unreadCount || 0),
    })),
    unreadCount,
    onlineAdmins,
    currentAdmin: adminName,
  };
}

export async function getChatMessages(userId: string) {
  // Use cached getUser() to prevent duplicate API calls
  const user = await getCachedUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Check if user is admin (case-insensitive check)
  const [userData] = await db.select().from(users).where(eq(users.id, user.id));
  
  if (!userData || !ADMIN_EMAILS.some(email => email.toLowerCase() === userData.email?.toLowerCase())) {
    throw new Error("Access denied - admin only");
  }

  // Get all messages for this chat session
  const messages = await db
    .select({
      id: chatMessages.id,
      senderId: chatMessages.senderId,
      recipientId: chatMessages.recipientId,
      content: chatMessages.content,
      isFromSupport: chatMessages.isFromSupport,
      supportName: chatMessages.supportName,
      createdAt: chatMessages.createdAt,
      readAt: chatMessages.readAt,
    })
    .from(chatMessages)
    .where(
      or(
        and(eq(chatMessages.senderId, userId), isNull(chatMessages.recipientId)),
        eq(chatMessages.recipientId, userId)
      )
    )
    .orderBy(chatMessages.createdAt);

  // Mark messages as read (messages FROM user that support hasn't read yet)
  await db
    .update(chatMessages)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(chatMessages.senderId, userId),
        isNull(chatMessages.readAt),
        eq(chatMessages.isFromSupport, false)
      )
    );

  return { messages };
}

export async function sendSupportMessage(
  recipientUserId: string,
  content: string
) {
  // Use cached getUser() to prevent duplicate API calls
  const user = await getCachedUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Check if user is admin
  const [userData] = await db.select().from(users).where(eq(users.id, user.id));
  
  if (!userData || !ADMIN_EMAILS.includes(userData.email)) {
    throw new Error("Access denied - admin only");
  }

  // Determine support name (Alvin or Kevin)
  const supportName = getAdminName(userData.email);
  const isLaunch = isLaunchWeekend();

  // Create message
  const [message] = await db
    .insert(chatMessages)
    .values({
      senderId: user.id,
      recipientId: recipientUserId,
      content: content.trim(),
      isFromSupport: true,
      supportName,
      status: "sent",
      isLaunchWeekend: isLaunch,
      shouldRouteToInbox: !isLaunch, // After weekend, route to inbox
    })
    .returning();

  // Update session last message time
  await db
    .update(chatSessions)
    .set({ lastMessageAt: new Date() })
    .where(eq(chatSessions.userId, recipientUserId));

  return { message };
}

