"use server";

import { db } from "@/app/db/client";
import { users } from "@/app/db/schema";
import { desc, sql } from "drizzle-orm";

export async function getUsersData() {
  const allUsers = await db
    .select()
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(100);

  const [userStats] = await db
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
    .from(users);

  return {
    allUsers,
    userStats,
  };
}
