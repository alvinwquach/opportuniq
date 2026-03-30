import { NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/app/db/client";
import { decisionOutcomes } from "@/app/db/schema";
import { decisions, decisionOptions } from "@/app/db/schema/decisions";
import { issues, groupMembers } from "@/app/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { embedCompletedDiagnosis } from "@/lib/embeddings";

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const recordOutcomeSchema = z.object({
  decisionId: z.string().uuid(),
  actualCost: z.number().min(0).optional(),
  actualTime: z.string().min(1).optional(),
  success: z.boolean(),
  completedAt: z.string().datetime().optional(),
  notes: z.string().optional(),
  // Optional: link to an AI conversation for RAG embedding
  conversationId: z.string().uuid().optional(),
});

const json = (data: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(data), {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });

// ============================================================================
// POST /api/outcomes — Record an outcome for a decision
// ============================================================================

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parseResult = recordOutcomeSchema.safeParse(body);
  if (!parseResult.success) {
    return json(
      { error: "Invalid request", details: parseResult.error.flatten() },
      { status: 400 }
    );
  }

  const { decisionId, actualCost, actualTime, success, completedAt, notes, conversationId } =
    parseResult.data;

  // Load the decision + its selected option (for predicted cost) + verify ownership
  const [decisionRow] = await db
    .select({
      decisionId: decisions.id,
      issueId: decisions.issueId,
      costMin: decisionOptions.costMin,
      costMax: decisionOptions.costMax,
      groupId: issues.groupId,
    })
    .from(decisions)
    .innerJoin(decisionOptions, eq(decisions.selectedOptionId, decisionOptions.id))
    .innerJoin(issues, eq(decisions.issueId, issues.id))
    .where(eq(decisions.id, decisionId));

  if (!decisionRow) {
    return json({ error: "Decision not found" }, { status: 404 });
  }

  // Verify user is an active member of the issue's group
  const [membership] = await db
    .select({ id: groupMembers.id })
    .from(groupMembers)
    .where(
      and(
        eq(groupMembers.groupId, decisionRow.groupId),
        eq(groupMembers.userId, user.id),
        eq(groupMembers.status, "active")
      )
    );

  if (!membership) {
    return json({ error: "Not authorised for this decision" }, { status: 404 });
  }

  // Auto-calculate costDelta: actualCost – midpoint of predicted range
  let costDelta: number | null = null;
  if (actualCost !== undefined && decisionRow.costMin !== null) {
    const costMinNum = parseFloat(String(decisionRow.costMin));
    const costMaxNum =
      decisionRow.costMax !== null ? parseFloat(String(decisionRow.costMax)) : costMinNum;
    const predictedMid = (costMinNum + costMaxNum) / 2;
    costDelta = actualCost - predictedMid;
  }

  const [outcome] = await db
    .insert(decisionOutcomes)
    .values({
      decisionId,
      actualCost: actualCost !== undefined ? String(actualCost) : null,
      actualTime: actualTime ?? null,
      success,
      completedAt: completedAt ? new Date(completedAt) : new Date(),
      costDelta: costDelta !== null ? String(costDelta) : null,
      whatWentWell: null,
      whatWentWrong: null,
      lessonsLearned: notes ?? null,
    })
    .onConflictDoUpdate({
      target: decisionOutcomes.decisionId,
      set: {
        actualCost: actualCost !== undefined ? String(actualCost) : null,
        actualTime: actualTime ?? null,
        success,
        completedAt: completedAt ? new Date(completedAt) : new Date(),
        costDelta: costDelta !== null ? String(costDelta) : null,
        lessonsLearned: notes ?? null,
        updatedAt: new Date(),
      },
    })
    .returning();

  // Trigger background embedding if a conversationId was provided.
  // Don't block the response — embedding can take a few seconds.
  if (conversationId) {
    const resolutionTypeMap: Record<string, "diy" | "hired_pro" | "deferred" | "replaced"> = {
      diy: "diy",
      hire: "hired_pro",
      defer: "deferred",
      replace: "replaced",
    };

    // Load the selected option type to derive resolutionType
    const [optionRow] = await db
      .select({ type: decisionOptions.type })
      .from(decisions)
      .innerJoin(decisionOptions, eq(decisions.selectedOptionId, decisionOptions.id))
      .where(eq(decisions.id, decisionId));

    const resolutionType = optionRow
      ? (resolutionTypeMap[optionRow.type] ?? "diy")
      : "diy";

    const actualCostCents =
      actualCost !== undefined ? Math.round(actualCost * 100) : undefined;

    void embedCompletedDiagnosis(conversationId, {
      actualCostCents,
      resolutionType,
      wasSuccessful: success,
    }).catch((err) => {
      console.error("[Outcomes] Embedding failed (non-fatal):", err);
    });
  }

  return json({ outcome, issueId: decisionRow.issueId }, { status: 201 });
}

// ============================================================================
// GET /api/outcomes — List outcomes for the current user's decisions
// ============================================================================

export async function GET(_request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Return outcomes for decisions belonging to the user's group issues
  const outcomes = await db
    .select({
      id: decisionOutcomes.id,
      decisionId: decisionOutcomes.decisionId,
      actualCost: decisionOutcomes.actualCost,
      actualTime: decisionOutcomes.actualTime,
      success: decisionOutcomes.success,
      costDelta: decisionOutcomes.costDelta,
      completedAt: decisionOutcomes.completedAt,
      lessonsLearned: decisionOutcomes.lessonsLearned,
      createdAt: decisionOutcomes.createdAt,
      issueId: issues.id,
      issueTitle: issues.title,
      issueCategory: issues.category,
      costMin: decisionOptions.costMin,
      costMax: decisionOptions.costMax,
    })
    .from(decisionOutcomes)
    .innerJoin(decisions, eq(decisionOutcomes.decisionId, decisions.id))
    .innerJoin(decisionOptions, eq(decisions.selectedOptionId, decisionOptions.id))
    .innerJoin(issues, eq(decisions.issueId, issues.id))
    .innerJoin(groupMembers, eq(issues.groupId, groupMembers.groupId))
    .where(
      and(
        eq(groupMembers.userId, user.id),
        eq(groupMembers.status, "active")
      )
    )
    .orderBy(desc(decisionOutcomes.createdAt));

  return json({ outcomes });
}
