/**
 * User DataLoaders
 */

import DataLoader from "dataloader";
import { inArray } from "drizzle-orm";
import { db } from "@/app/db/client";
import { users, type User } from "@/app/db/schema";

export function createUserLoaders() {
  return {
    userById: new DataLoader<string, User | null>(async (ids) => {
      const results = await db
        .select()
        .from(users)
        .where(inArray(users.id, [...ids]));

      const map = new Map(results.map((u) => [u.id, u]));
      return ids.map((id) => map.get(id) ?? null);
    }),
  };
}
