"use server";

import { db } from "@/app/db/client";
import { users } from "@/app/db/schema";
import { desc, sql } from "drizzle-orm";

export async function getUsersData() {
  const [allUsers, [userStats]] = await Promise.all([
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
  ]);

  return {
    allUsers,
    userStats,
  };
}
