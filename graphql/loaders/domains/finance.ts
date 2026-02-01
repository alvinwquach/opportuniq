/**
 * Finance DataLoaders
 */

import DataLoader from "dataloader";
import { inArray } from "drizzle-orm";
import { db } from "@/app/db/client";
import {
  userIncomeStreams,
  userExpenses,
  userBudgets,
  type UserIncomeStream,
  type UserExpense,
  type UserBudget,
} from "@/app/db/schema";

export function createFinanceLoaders() {
  return {
    incomeStreamsByUserId: new DataLoader<string, UserIncomeStream[]>(async (userIds) => {
      const results = await db
        .select()
        .from(userIncomeStreams)
        .where(inArray(userIncomeStreams.userId, [...userIds]));

      const map = new Map<string, UserIncomeStream[]>();
      for (const stream of results) {
        const existing = map.get(stream.userId) ?? [];
        existing.push(stream);
        map.set(stream.userId, existing);
      }
      return userIds.map((id) => map.get(id) ?? []);
    }),

    incomeStreamById: new DataLoader<string, UserIncomeStream | null>(async (ids) => {
      const results = await db
        .select()
        .from(userIncomeStreams)
        .where(inArray(userIncomeStreams.id, [...ids]));

      const map = new Map(results.map((s) => [s.id, s]));
      return ids.map((id) => map.get(id) ?? null);
    }),

    expensesByUserId: new DataLoader<string, UserExpense[]>(async (userIds) => {
      const results = await db
        .select()
        .from(userExpenses)
        .where(inArray(userExpenses.userId, [...userIds]));

      const map = new Map<string, UserExpense[]>();
      for (const expense of results) {
        const existing = map.get(expense.userId) ?? [];
        existing.push(expense);
        map.set(expense.userId, existing);
      }
      return userIds.map((id) => map.get(id) ?? []);
    }),

    expenseById: new DataLoader<string, UserExpense | null>(async (ids) => {
      const results = await db
        .select()
        .from(userExpenses)
        .where(inArray(userExpenses.id, [...ids]));

      const map = new Map(results.map((e) => [e.id, e]));
      return ids.map((id) => map.get(id) ?? null);
    }),

    budgetsByUserId: new DataLoader<string, UserBudget[]>(async (userIds) => {
      const results = await db
        .select()
        .from(userBudgets)
        .where(inArray(userBudgets.userId, [...userIds]));

      const map = new Map<string, UserBudget[]>();
      for (const budget of results) {
        const existing = map.get(budget.userId) ?? [];
        existing.push(budget);
        map.set(budget.userId, existing);
      }
      return userIds.map((id) => map.get(id) ?? []);
    }),

    budgetById: new DataLoader<string, UserBudget | null>(async (ids) => {
      const results = await db
        .select()
        .from(userBudgets)
        .where(inArray(userBudgets.id, [...ids]));

      const map = new Map(results.map((b) => [b.id, b]));
      return ids.map((id) => map.get(id) ?? null);
    }),
  };
}
