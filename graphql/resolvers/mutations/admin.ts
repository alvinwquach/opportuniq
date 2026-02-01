/**
 * Admin Mutation Resolvers
 *
 * Mutation resolvers for admin dashboard operations.
 * All mutations are logged to the admin audit log.
 */

import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { users, waitlist, invites, adminAuditLog } from "@/app/db/schema";
import type { Context } from "../../utils/context";
import { forbidden, notFound } from "../../utils/errors";

function requireAdmin(ctx: Context) {
  if (!ctx.user) {
    throw forbidden("Not authenticated");
  }
  if (ctx.user.role !== "admin") {
    throw forbidden("Admin access required");
  }
}

// Helper to log admin actions
async function logAdminAction(
  ctx: Context,
  action: string,
  targetType: string,
  targetId?: string,
  details?: Record<string, unknown>
) {
  await ctx.db.insert(adminAuditLog).values({
    adminId: ctx.userId!,
    action,
    targetType,
    targetId: targetId || null,
    details: details || null,
  });
}

export const adminMutations = {
  adminUpdateUser: async (_: unknown, { id, input }: { id: string; input: any }, ctx: Context) => {
    requireAdmin(ctx);

    const updateData: any = { updatedAt: new Date() };
    if (input.role !== undefined) updateData.role = input.role;
    if (input.accessTier !== undefined) updateData.accessTier = input.accessTier;

    const [updated] = await ctx.db.update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();

    if (!updated) {
      throw notFound("User");
    }

    await logAdminAction(ctx, "user.update", "user", id, { changes: input });

    return updated;
  },

  adminBanUser: async (_: unknown, { id, reason }: { id: string; reason?: string }, ctx: Context) => {
    requireAdmin(ctx);

    const [updated] = await ctx.db.update(users)
      .set({ role: "banned", updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    if (!updated) {
      throw notFound("User");
    }

    await logAdminAction(ctx, "user.ban", "user", id, { reason });

    return updated;
  },

  adminUnbanUser: async (_: unknown, { id }: { id: string }, ctx: Context) => {
    requireAdmin(ctx);

    const [updated] = await ctx.db.update(users)
      .set({ role: "user", updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    if (!updated) {
      throw notFound("User");
    }

    await logAdminAction(ctx, "user.unban", "user", id);

    return updated;
  },

  adminDeleteUser: async (_: unknown, { id }: { id: string }, ctx: Context) => {
    requireAdmin(ctx);

    // Get user email before deleting for audit log
    const [userToDelete] = await ctx.db.select({ email: users.email }).from(users).where(eq(users.id, id)).limit(1);

    const [deleted] = await ctx.db.delete(users).where(eq(users.id, id)).returning();

    if (deleted) {
      await logAdminAction(ctx, "user.delete", "user", id, { email: userToDelete?.email });
    }

    return !!deleted;
  },

  adminBulkDeleteUsers: async (_: unknown, { input }: { input: { ids: string[] } }, ctx: Context) => {
    requireAdmin(ctx);

    let deletedCount = 0;
    for (const id of input.ids) {
      const [deleted] = await ctx.db.delete(users).where(eq(users.id, id)).returning();
      if (deleted) deletedCount++;
    }

    await logAdminAction(ctx, "user.bulk_delete", "user", undefined, { ids: input.ids, deletedCount });

    return deletedCount;
  },

  adminCreateInvite: async (_: unknown, { input }: { input: { email: string; tier?: string; expiresInDays?: number } }, ctx: Context) => {
    requireAdmin(ctx);

    const token = nanoid(32);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (input.expiresInDays || 7));

    const validTier = input.tier && ["johatsu", "alpha", "beta", "public"].includes(input.tier)
      ? (input.tier as "johatsu" | "alpha" | "beta" | "public")
      : undefined;

    const [invite] = await ctx.db.insert(invites).values({
      email: input.email,
      token,
      tier: validTier,
      expiresAt,
      invitedBy: ctx.userId!,
      emailSent: false,
    }).returning();

    await logAdminAction(ctx, "invite.create", "invite", invite.id, { email: input.email, tier: input.tier });

    return invite;
  },

  adminResendInvite: async (_: unknown, { id }: { id: string }, ctx: Context) => {
    requireAdmin(ctx);

    const [invite] = await ctx.db.select().from(invites).where(eq(invites.id, id)).limit(1);

    if (!invite) {
      throw notFound("Invite");
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const [updated] = await ctx.db.update(invites)
      .set({ expiresAt, emailSent: false })
      .where(eq(invites.id, id))
      .returning();

    await logAdminAction(ctx, "invite.resend", "invite", id, { email: invite.email });

    return updated;
  },

  adminRevokeInvite: async (_: unknown, { id }: { id: string }, ctx: Context) => {
    requireAdmin(ctx);

    const [invite] = await ctx.db.select({ email: invites.email }).from(invites).where(eq(invites.id, id)).limit(1);

    const [deleted] = await ctx.db.delete(invites).where(eq(invites.id, id)).returning();

    if (deleted) {
      await logAdminAction(ctx, "invite.revoke", "invite", id, { email: invite?.email });
    }

    return !!deleted;
  },

  adminBulkCreateInvites: async (_: unknown, { emails, tier }: { emails: string[]; tier?: string }, ctx: Context) => {
    requireAdmin(ctx);

    const createdInvites = [];
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const validTier = tier && ["johatsu", "alpha", "beta", "public"].includes(tier)
      ? (tier as "johatsu" | "alpha" | "beta" | "public")
      : undefined;

    for (const email of emails) {
      const token = nanoid(32);
      const [invite] = await ctx.db.insert(invites).values({
        email,
        token,
        tier: validTier,
        expiresAt,
        invitedBy: ctx.userId!,
        emailSent: false,
      }).returning();
      createdInvites.push(invite);
    }

    await logAdminAction(ctx, "invite.bulk_create", "invite", undefined, { emails, tier, count: emails.length });

    return createdInvites;
  },

  adminDeleteWaitlistEntry: async (_: unknown, { id }: { id: string }, ctx: Context) => {
    requireAdmin(ctx);

    const [entry] = await ctx.db.select({ email: waitlist.email }).from(waitlist).where(eq(waitlist.id, id)).limit(1);

    const [deleted] = await ctx.db.delete(waitlist).where(eq(waitlist.id, id)).returning();

    if (deleted) {
      await logAdminAction(ctx, "waitlist.delete", "waitlist", id, { email: entry?.email });
    }

    return !!deleted;
  },

  adminBulkDeleteWaitlist: async (_: unknown, { input }: { input: { ids: string[] } }, ctx: Context) => {
    requireAdmin(ctx);

    let deletedCount = 0;
    for (const id of input.ids) {
      const [deleted] = await ctx.db.delete(waitlist).where(eq(waitlist.id, id)).returning();
      if (deleted) deletedCount++;
    }

    await logAdminAction(ctx, "waitlist.bulk_delete", "waitlist", undefined, { ids: input.ids, deletedCount });

    return deletedCount;
  },

  adminConvertWaitlistToInvite: async (_: unknown, { id, tier }: { id: string; tier?: string }, ctx: Context) => {
    requireAdmin(ctx);

    const [entry] = await ctx.db.select().from(waitlist).where(eq(waitlist.id, id)).limit(1);

    if (!entry) {
      throw notFound("Waitlist entry");
    }

    const token = nanoid(32);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const validTier = tier && ["johatsu", "alpha", "beta", "public"].includes(tier)
      ? (tier as "johatsu" | "alpha" | "beta" | "public")
      : undefined;

    const [invite] = await ctx.db.insert(invites).values({
      email: entry.email,
      token,
      tier: validTier,
      expiresAt,
      invitedBy: ctx.userId!,
      emailSent: false,
    }).returning();

    await ctx.db.delete(waitlist).where(eq(waitlist.id, id));

    await logAdminAction(ctx, "waitlist.convert", "waitlist", id, { email: entry.email, inviteId: invite.id, tier });

    return invite;
  },

  adminAddUserNote: async (_: unknown, { id, note }: { id: string; note: string }, ctx: Context) => {
    requireAdmin(ctx);

    const [updated] = await ctx.db.update(users)
      .set({ notes: note, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    if (!updated) {
      throw notFound("User");
    }

    await logAdminAction(ctx, "user.add_note", "user", id, { noteLength: note.length });

    return updated;
  },
};
