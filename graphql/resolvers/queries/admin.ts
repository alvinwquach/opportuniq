/**
 * Admin Query Resolvers
 *
 * Query resolvers for admin dashboard operations.
 */

import { eq, and, gte, lte, desc, sql, isNull, isNotNull, like, or, count } from "drizzle-orm";
import { users, waitlist, invites, referrals, adminAuditLog } from "@/app/db/schema";
import type { Context } from "../../utils/context";
import { forbidden } from "../../utils/errors";

interface AdminFilters {
  search?: string;
  role?: string;
  accessTier?: string;
  tier?: string;
  status?: string;
  source?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface AdminPagination {
  limit?: number;
  offset?: number;
}


// Helper functions
function requireAdmin(ctx: Context) {
  if (!ctx.user) {
    throw forbidden("Not authenticated");
  }
  if (ctx.user.role !== "admin") {
    throw forbidden("Admin access required");
  }
}

function buildUserFilters(filters: AdminFilters | undefined) {
  const conditions = [];
  if (filters?.search) {
    conditions.push(
      or(
        like(users.email, `%${filters.search}%`),
        like(users.name, `%${filters.search}%`)
      )
    );
  }
  if (filters?.role) {
    conditions.push(eq(users.role, filters.role as "admin" | "moderator" | "user" | "banned"));
  }
  if (filters?.accessTier) {
    conditions.push(eq(users.accessTier, filters.accessTier as "johatsu" | "alpha" | "beta" | "public"));
  }
  if (filters?.dateFrom) {
    conditions.push(gte(users.createdAt, new Date(filters.dateFrom)));
  }
  if (filters?.dateTo) {
    conditions.push(lte(users.createdAt, new Date(filters.dateTo)));
  }
  return conditions.length > 0 ? and(...conditions) : undefined;
}

function buildWaitlistFilters(filters: AdminFilters | undefined) {
  const conditions = [];
  if (filters?.search) {
    conditions.push(like(waitlist.email, `%${filters.search}%`));
  }
  if (filters?.source) {
    conditions.push(eq(waitlist.source, filters.source));
  }
  if (filters?.dateFrom) {
    conditions.push(gte(waitlist.createdAt, new Date(filters.dateFrom)));
  }
  if (filters?.dateTo) {
    conditions.push(lte(waitlist.createdAt, new Date(filters.dateTo)));
  }
  return conditions.length > 0 ? and(...conditions) : undefined;
}

function buildInviteFilters(filters: AdminFilters | undefined) {
  const conditions = [];
  if (filters?.search) {
    conditions.push(like(invites.email, `%${filters.search}%`));
  }
  if (filters?.tier) {
    conditions.push(eq(invites.tier, filters.tier as "johatsu" | "alpha" | "beta" | "public"));
  }
  if (filters?.status === "accepted") {
    conditions.push(isNotNull(invites.acceptedAt));
  } else if (filters?.status === "pending") {
    conditions.push(and(isNull(invites.acceptedAt), gte(invites.expiresAt, new Date())));
  } else if (filters?.status === "expired") {
    conditions.push(and(isNull(invites.acceptedAt), lte(invites.expiresAt, new Date())));
  }
  if (filters?.dateFrom) {
    conditions.push(gte(invites.createdAt, new Date(filters.dateFrom)));
  }
  if (filters?.dateTo) {
    conditions.push(lte(invites.createdAt, new Date(filters.dateTo)));
  }
  return conditions.length > 0 ? and(...conditions) : undefined;
}

function buildReferralFilters(filters: AdminFilters | undefined) {
  const conditions = [];
  if (filters?.search) {
    conditions.push(like(referrals.refereeEmail, `%${filters.search}%`));
  }
  if (filters?.status) {
    conditions.push(eq(referrals.status, filters.status as "pending" | "clicked" | "converted"));
  }
  if (filters?.dateFrom) {
    conditions.push(gte(referrals.createdAt, new Date(filters.dateFrom)));
  }
  if (filters?.dateTo) {
    conditions.push(lte(referrals.createdAt, new Date(filters.dateTo)));
  }
  return conditions.length > 0 ? and(...conditions) : undefined;
}

export const adminQueries = {
  adminStats: async (_: unknown, args: { dateRange?: { from: string; to: string } }, ctx: Context) => {
    requireAdmin(ctx);

    const [[userStats], [waitlistStats], [inviteStats], [referralStats]] = await Promise.all([
      ctx.db.select({
        total: count(),
        thisWeek: sql<number>`count(*) filter (where ${users.createdAt} >= now() - interval '7 days')`,
        lastWeek: sql<number>`count(*) filter (where ${users.createdAt} >= now() - interval '14 days' and ${users.createdAt} < now() - interval '7 days')`,
        johatsu: sql<number>`count(*) filter (where ${users.accessTier} = 'johatsu')`,
        alpha: sql<number>`count(*) filter (where ${users.accessTier} = 'alpha')`,
        beta: sql<number>`count(*) filter (where ${users.accessTier} = 'beta')`,
        admins: sql<number>`count(*) filter (where ${users.role} = 'admin')`,
        moderators: sql<number>`count(*) filter (where ${users.role} = 'moderator')`,
        activeUsers: sql<number>`count(*) filter (where ${users.role} = 'user')`,
        banned: sql<number>`count(*) filter (where ${users.role} = 'banned')`,
      }).from(users),

      ctx.db.select({
        total: count(),
        today: sql<number>`count(*) filter (where ${waitlist.createdAt} >= date_trunc('day', now()))`,
        thisWeek: sql<number>`count(*) filter (where ${waitlist.createdAt} >= now() - interval '7 days')`,
      }).from(waitlist),

      ctx.db.select({
        total: count(),
        accepted: sql<number>`count(*) filter (where ${invites.acceptedAt} is not null)`,
        pending: sql<number>`count(*) filter (where ${invites.acceptedAt} is null and ${invites.expiresAt} > now())`,
        expired: sql<number>`count(*) filter (where ${invites.acceptedAt} is null and ${invites.expiresAt} <= now())`,
      }).from(invites),

      ctx.db.select({
        total: count(),
        converted: sql<number>`count(*) filter (where ${referrals.status} = 'converted')`,
        pending: sql<number>`count(*) filter (where ${referrals.status} = 'pending')`,
      }).from(referrals),
    ]);

    const totalUsers = Number(userStats.total);
    const usersThisWeek = Number(userStats.thisWeek);
    const usersLastWeek = Number(userStats.lastWeek);
    const growthPercent = usersLastWeek > 0
      ? ((usersThisWeek - usersLastWeek) / usersLastWeek) * 100
      : usersThisWeek > 0 ? 100 : 0;

    const totalInvites = Number(inviteStats.total);
    const invitesAccepted = Number(inviteStats.accepted);
    const inviteAcceptanceRate = totalInvites > 0 ? (invitesAccepted / totalInvites) * 100 : 0;

    const totalReferrals = Number(referralStats.total);
    const referralsConverted = Number(referralStats.converted);
    const referralConversionRate = totalReferrals > 0 ? (referralsConverted / totalReferrals) * 100 : 0;

    return {
      totalUsers,
      usersThisWeek,
      usersLastWeek,
      growthPercent,
      totalWaitlist: Number(waitlistStats.total),
      waitlistToday: Number(waitlistStats.today),
      waitlistThisWeek: Number(waitlistStats.thisWeek),
      totalInvites,
      invitesAccepted,
      invitesPending: Number(inviteStats.pending),
      invitesExpired: Number(inviteStats.expired),
      inviteAcceptanceRate,
      totalReferrals,
      referralsConverted,
      referralsPending: Number(referralStats.pending),
      referralConversionRate,
      tierDistribution: {
        johatsu: Number(userStats.johatsu),
        alpha: Number(userStats.alpha),
        beta: Number(userStats.beta),
        public: totalUsers - Number(userStats.johatsu) - Number(userStats.alpha) - Number(userStats.beta) - Number(userStats.banned),
      },
      roleDistribution: {
        admin: Number(userStats.admins),
        moderator: Number(userStats.moderators),
        user: Number(userStats.activeUsers),
        banned: Number(userStats.banned),
      },
    };
  },

  adminUsers: async (_: unknown, { filters, pagination }: { filters?: AdminFilters; pagination?: AdminPagination }, ctx: Context) => {
    requireAdmin(ctx);

    const limit = pagination?.limit || 50;
    const offset = pagination?.offset || 0;
    const where = buildUserFilters(filters);

    const [userRows, [countResult]] = await Promise.all([
      ctx.db.select({
        id: users.id,
        email: users.email,
        name: users.name,
        avatarUrl: users.avatarUrl,
        role: users.role,
        accessTier: users.accessTier,
        referralCode: users.referralCode,
        referralCount: users.referralCount,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
        .from(users)
        .where(where)
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset),
      ctx.db.select({ count: count() }).from(users).where(where),
    ]);

    const totalCount = Number(countResult.count);

    return {
      nodes: userRows,
      totalCount,
      pageInfo: {
        hasNextPage: offset + limit < totalCount,
        hasPreviousPage: offset > 0,
        startCursor: userRows[0]?.id,
        endCursor: userRows[userRows.length - 1]?.id,
      },
    };
  },

  adminUser: async (_: unknown, { id }: { id: string }, ctx: Context) => {
    requireAdmin(ctx);
    const [user] = await ctx.db.select().from(users).where(eq(users.id, id)).limit(1);
    return user || null;
  },

  adminWaitlist: async (_: unknown, { filters, pagination }: { filters?: AdminFilters; pagination?: AdminPagination }, ctx: Context) => {
    requireAdmin(ctx);

    const limit = pagination?.limit || 50;
    const offset = pagination?.offset || 0;
    const where = buildWaitlistFilters(filters);

    const [rows, [countResult]] = await Promise.all([
      ctx.db.select()
        .from(waitlist)
        .where(where)
        .orderBy(desc(waitlist.createdAt))
        .limit(limit)
        .offset(offset),
      ctx.db.select({ count: count() }).from(waitlist).where(where),
    ]);

    const totalCount = Number(countResult.count);

    return {
      nodes: rows,
      totalCount,
      pageInfo: {
        hasNextPage: offset + limit < totalCount,
        hasPreviousPage: offset > 0,
        startCursor: rows[0]?.id,
        endCursor: rows[rows.length - 1]?.id,
      },
    };
  },

  adminInvites: async (_: unknown, { filters, pagination }: { filters?: AdminFilters; pagination?: AdminPagination }, ctx: Context) => {
    requireAdmin(ctx);

    const limit = pagination?.limit || 50;
    const offset = pagination?.offset || 0;
    const where = buildInviteFilters(filters);

    const [rows, [countResult]] = await Promise.all([
      ctx.db.select({
        id: invites.id,
        email: invites.email,
        token: invites.token,
        tier: invites.tier,
        acceptedAt: invites.acceptedAt,
        expiresAt: invites.expiresAt,
        createdAt: invites.createdAt,
        inviterId: invites.invitedBy,
        emailSent: invites.emailSent,
        inviterName: users.name,
      })
        .from(invites)
        .leftJoin(users, eq(invites.invitedBy, users.id))
        .where(where)
        .orderBy(desc(invites.createdAt))
        .limit(limit)
        .offset(offset),
      ctx.db.select({ count: count() }).from(invites).where(where),
    ]);

    const totalCount = Number(countResult.count);

    return {
      nodes: rows,
      totalCount,
      pageInfo: {
        hasNextPage: offset + limit < totalCount,
        hasPreviousPage: offset > 0,
        startCursor: rows[0]?.id,
        endCursor: rows[rows.length - 1]?.id,
      },
    };
  },

  adminReferrals: async (_: unknown, { filters, pagination }: { filters?: AdminFilters; pagination?: AdminPagination }, ctx: Context) => {
    requireAdmin(ctx);

    const limit = pagination?.limit || 50;
    const offset = pagination?.offset || 0;
    const where = buildReferralFilters(filters);

    const [rows, [countResult]] = await Promise.all([
      ctx.db.select({
        id: referrals.id,
        referrerId: referrals.referrerId,
        refereeEmail: referrals.refereeEmail,
        status: referrals.status,
        createdAt: referrals.createdAt,
        convertedAt: referrals.convertedAt,
        referrerEmail: users.email,
        referrerName: users.name,
      })
        .from(referrals)
        .leftJoin(users, eq(referrals.referrerId, users.id))
        .where(where)
        .orderBy(desc(referrals.createdAt))
        .limit(limit)
        .offset(offset),
      ctx.db.select({ count: count() }).from(referrals).where(where),
    ]);

    const totalCount = Number(countResult.count);

    return {
      nodes: rows,
      totalCount,
      pageInfo: {
        hasNextPage: offset + limit < totalCount,
        hasPreviousPage: offset > 0,
        startCursor: rows[0]?.id,
        endCursor: rows[rows.length - 1]?.id,
      },
    };
  },

  adminAuditLog: async (_: unknown, { pagination, targetType }: { pagination?: AdminPagination; targetType?: string }, ctx: Context) => {
    requireAdmin(ctx);

    const limit = pagination?.limit || 50;
    const offset = pagination?.offset || 0;

    const conditions = [];
    if (targetType) {
      conditions.push(eq(adminAuditLog.targetType, targetType));
    }
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, [countResult]] = await Promise.all([
      ctx.db.select({
        id: adminAuditLog.id,
        adminId: adminAuditLog.adminId,
        adminEmail: users.email,
        action: adminAuditLog.action,
        targetType: adminAuditLog.targetType,
        targetId: adminAuditLog.targetId,
        details: adminAuditLog.details,
        createdAt: adminAuditLog.createdAt,
      })
        .from(adminAuditLog)
        .leftJoin(users, eq(adminAuditLog.adminId, users.id))
        .where(where)
        .orderBy(desc(adminAuditLog.createdAt))
        .limit(limit)
        .offset(offset),
      ctx.db.select({ count: count() }).from(adminAuditLog).where(where),
    ]);

    const totalCount = Number(countResult.count);

    return {
      nodes: rows,
      totalCount,
      pageInfo: {
        hasNextPage: offset + limit < totalCount,
        hasPreviousPage: offset > 0,
        startCursor: rows[0]?.id,
        endCursor: rows[rows.length - 1]?.id,
      },
    };
  },

  exportUsers: async (_: unknown, { filters }: { filters?: AdminFilters }, ctx: Context) => {
    requireAdmin(ctx);

    const where = buildUserFilters(filters);
    const rows = await ctx.db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      accessTier: users.accessTier,
      referralCode: users.referralCode,
      referralCount: users.referralCount,
      createdAt: users.createdAt,
    })
      .from(users)
      .where(where)
      .orderBy(desc(users.createdAt));

    const headers = ["ID", "Email", "Name", "Role", "Access Tier", "Referral Code", "Referral Count", "Created At"];
    const csvRows = rows.map(row => [
      row.id,
      row.email,
      row.name || "",
      row.role,
      row.accessTier || "",
      row.referralCode || "",
      row.referralCount,
      row.createdAt.toISOString(),
    ].join(","));

    const csv = [headers.join(","), ...csvRows].join("\n");
    const filename = `users-export-${new Date().toISOString().split("T")[0]}.csv`;
    const base64 = Buffer.from(csv).toString("base64");

    return {
      success: true,
      url: `data:text/csv;base64,${base64}`,
      filename,
      rowCount: rows.length,
    };
  },

  exportWaitlist: async (_: unknown, { filters }: { filters?: AdminFilters }, ctx: Context) => {
    requireAdmin(ctx);

    const where = buildWaitlistFilters(filters);
    const rows = await ctx.db.select().from(waitlist).where(where).orderBy(desc(waitlist.createdAt));

    const headers = ["ID", "Email", "Source", "Created At"];
    const csvRows = rows.map(row => [
      row.id,
      row.email,
      row.source || "",
      row.createdAt.toISOString(),
    ].join(","));

    const csv = [headers.join(","), ...csvRows].join("\n");
    const filename = `waitlist-export-${new Date().toISOString().split("T")[0]}.csv`;
    const base64 = Buffer.from(csv).toString("base64");

    return {
      success: true,
      url: `data:text/csv;base64,${base64}`,
      filename,
      rowCount: rows.length,
    };
  },

  exportReferrals: async (_: unknown, { filters }: { filters?: AdminFilters }, ctx: Context) => {
    requireAdmin(ctx);

    const where = buildReferralFilters(filters);
    const rows = await ctx.db.select({
      id: referrals.id,
      refereeEmail: referrals.refereeEmail,
      status: referrals.status,
      createdAt: referrals.createdAt,
      convertedAt: referrals.convertedAt,
      referrerEmail: users.email,
      referrerName: users.name,
    })
      .from(referrals)
      .leftJoin(users, eq(referrals.referrerId, users.id))
      .where(where)
      .orderBy(desc(referrals.createdAt));

    const headers = ["ID", "Referee Email", "Referrer Email", "Referrer Name", "Status", "Created At", "Converted At"];
    const csvRows = rows.map(row => [
      row.id,
      row.refereeEmail,
      row.referrerEmail || "",
      row.referrerName || "",
      row.status,
      row.createdAt.toISOString(),
      row.convertedAt?.toISOString() || "",
    ].join(","));

    const csv = [headers.join(","), ...csvRows].join("\n");
    const filename = `referrals-export-${new Date().toISOString().split("T")[0]}.csv`;
    const base64 = Buffer.from(csv).toString("base64");

    return {
      success: true,
      url: `data:text/csv;base64,${base64}`,
      filename,
      rowCount: rows.length,
    };
  },
};
