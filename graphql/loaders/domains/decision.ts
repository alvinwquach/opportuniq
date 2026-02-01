/**
 * Decision DataLoaders
 */

import DataLoader from "dataloader";
import { inArray } from "drizzle-orm";
import { db } from "@/app/db/client";
import {
  decisions,
  decisionOptions,
  decisionVotes,
  productRecommendations,
  vendorContacts,
  type Decision,
  type DecisionOption,
  type DecisionVote,
  type ProductRecommendation,
  type VendorContact,
} from "@/app/db/schema";

export function createDecisionLoaders() {
  return {
    optionsByIssueId: new DataLoader<string, DecisionOption[]>(async (issueIds) => {
      const results = await db
        .select()
        .from(decisionOptions)
        .where(inArray(decisionOptions.issueId, [...issueIds]));

      const map = new Map<string, DecisionOption[]>();
      for (const option of results) {
        const existing = map.get(option.issueId) ?? [];
        existing.push(option);
        map.set(option.issueId, existing);
      }
      return issueIds.map((id) => map.get(id) ?? []);
    }),

    optionById: new DataLoader<string, DecisionOption | null>(async (ids) => {
      const results = await db
        .select()
        .from(decisionOptions)
        .where(inArray(decisionOptions.id, [...ids]));

      const map = new Map(results.map((o) => [o.id, o]));
      return ids.map((id) => map.get(id) ?? null);
    }),

    decisionByIssueId: new DataLoader<string, Decision | null>(async (issueIds) => {
      const results = await db
        .select()
        .from(decisions)
        .where(inArray(decisions.issueId, [...issueIds]));

      const map = new Map(results.map((d) => [d.issueId, d]));
      return issueIds.map((id) => map.get(id) ?? null);
    }),

    decisionById: new DataLoader<string, Decision | null>(async (ids) => {
      const results = await db
        .select()
        .from(decisions)
        .where(inArray(decisions.id, [...ids]));

      const map = new Map(results.map((d) => [d.id, d]));
      return ids.map((id) => map.get(id) ?? null);
    }),

    votesByDecisionId: new DataLoader<string, DecisionVote[]>(async (decisionIds) => {
      const results = await db
        .select()
        .from(decisionVotes)
        .where(inArray(decisionVotes.decisionId, [...decisionIds]));

      const map = new Map<string, DecisionVote[]>();
      for (const vote of results) {
        const existing = map.get(vote.decisionId) ?? [];
        existing.push(vote);
        map.set(vote.decisionId, existing);
      }
      return decisionIds.map((id) => map.get(id) ?? []);
    }),

    productsByOptionId: new DataLoader<string, ProductRecommendation[]>(async (optionIds) => {
      const results = await db
        .select()
        .from(productRecommendations)
        .where(inArray(productRecommendations.optionId, [...optionIds]));

      const map = new Map<string, ProductRecommendation[]>();
      for (const product of results) {
        if (product.optionId) {
          const existing = map.get(product.optionId) ?? [];
          existing.push(product);
          map.set(product.optionId, existing);
        }
      }
      return optionIds.map((id) => map.get(id) ?? []);
    }),

    vendorsByOptionId: new DataLoader<string, VendorContact[]>(async (optionIds) => {
      const results = await db
        .select()
        .from(vendorContacts)
        .where(inArray(vendorContacts.optionId, [...optionIds]));

      const map = new Map<string, VendorContact[]>();
      for (const vendor of results) {
        if (vendor.optionId) {
          const existing = map.get(vendor.optionId) ?? [];
          existing.push(vendor);
          map.set(vendor.optionId, existing);
        }
      }
      return optionIds.map((id) => map.get(id) ?? []);
    }),
  };
}
