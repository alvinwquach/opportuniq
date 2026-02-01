/**
 * Issue DataLoaders
 */

import DataLoader from "dataloader";
import { inArray } from "drizzle-orm";
import { db } from "@/app/db/client";
import {
  issues,
  issueEvidence,
  issueHypotheses,
  issueComments,
  type Issue,
  type IssueEvidence,
  type IssueHypothesis,
  type IssueComment,
} from "@/app/db/schema";

export function createIssueLoaders() {
  return {
    issueById: new DataLoader<string, Issue | null>(async (ids) => {
      const results = await db
        .select()
        .from(issues)
        .where(inArray(issues.id, [...ids]));

      const map = new Map(results.map((i) => [i.id, i]));
      return ids.map((id) => map.get(id) ?? null);
    }),

    issuesByGroupId: new DataLoader<string, Issue[]>(async (groupIds) => {
      const results = await db
        .select()
        .from(issues)
        .where(inArray(issues.groupId, [...groupIds]));

      const map = new Map<string, Issue[]>();
      for (const issue of results) {
        const existing = map.get(issue.groupId) ?? [];
        existing.push(issue);
        map.set(issue.groupId, existing);
      }
      return groupIds.map((id) => map.get(id) ?? []);
    }),

    evidenceByIssueId: new DataLoader<string, IssueEvidence[]>(async (issueIds) => {
      const results = await db
        .select()
        .from(issueEvidence)
        .where(inArray(issueEvidence.issueId, [...issueIds]));

      const map = new Map<string, IssueEvidence[]>();
      for (const evidence of results) {
        const existing = map.get(evidence.issueId) ?? [];
        existing.push(evidence);
        map.set(evidence.issueId, existing);
      }
      return issueIds.map((id) => map.get(id) ?? []);
    }),

    hypothesesByIssueId: new DataLoader<string, IssueHypothesis[]>(async (issueIds) => {
      const results = await db
        .select()
        .from(issueHypotheses)
        .where(inArray(issueHypotheses.issueId, [...issueIds]));

      const map = new Map<string, IssueHypothesis[]>();
      for (const hypothesis of results) {
        const existing = map.get(hypothesis.issueId) ?? [];
        existing.push(hypothesis);
        map.set(hypothesis.issueId, existing);
      }
      return issueIds.map((id) => map.get(id) ?? []);
    }),

    commentsByIssueId: new DataLoader<string, IssueComment[]>(async (issueIds) => {
      const results = await db
        .select()
        .from(issueComments)
        .where(inArray(issueComments.issueId, [...issueIds]));

      const map = new Map<string, IssueComment[]>();
      for (const comment of results) {
        const existing = map.get(comment.issueId) ?? [];
        existing.push(comment);
        map.set(comment.issueId, existing);
      }
      return issueIds.map((id) => map.get(id) ?? []);
    }),
  };
}
