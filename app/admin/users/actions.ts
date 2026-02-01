"use server";

import { db } from "@/app/db/client";
import { users } from "@/app/db/schema";
import { desc, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";

async function fetchUsersData() {
  const [allUsers, [userStats], userGrowthData] = await Promise.all([
    db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        avatarUrl: users.avatarUrl,
        role: users.role,
        accessTier: users.accessTier,
        referralCode: users.referralCode,
        referralCount: users.referralCount,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(100),
    db
      .select({
        total: sql<number>`count(*)`,
        admins: sql<number>`count(*) filter (where ${users.role} = 'admin')`,
        moderators: sql<number>`count(*) filter (where ${users.role} = 'moderator')`,
        activeUsers: sql<number>`count(*) filter (where ${users.role} = 'user')`,
        banned: sql<number>`count(*) filter (where ${users.role} = 'banned')`,
        johatsu: sql<number>`count(*) filter (where ${users.accessTier} = 'johatsu')`,
        alpha: sql<number>`count(*) filter (where ${users.accessTier} = 'alpha')`,
        beta: sql<number>`count(*) filter (where ${users.accessTier} = 'beta')`,
      })
      .from(users),
    // User growth over last 30 days
    db
      .select({
        date: sql<string>`DATE(${users.createdAt})`,
        count: sql<number>`count(*)`,
      })
      .from(users)
      .where(sql`${users.createdAt} >= now() - interval '30 days'`)
      .groupBy(sql`DATE(${users.createdAt})`)
      .orderBy(sql`DATE(${users.createdAt})`),
  ]);

  return {
    allUsers,
    userStats,
    userGrowthData,
  };
}

// Cache for 30 seconds
export const getUsersData = unstable_cache(
  fetchUsersData,
  ["admin-users-data"],
  { revalidate: 30, tags: ["admin-users"] }
);
