/**
 * Nightly eval cron job
 *
 * Runs automated quality checks on AI outputs:
 *   - Hallucination detection (last 24 h of conversations)
 *   - Tool failure rates (last 7 days)
 *   - Cost accuracy metrics (last 30 days)
 *
 * Alerts via Sentry when:
 *   - Hallucination rate > 10 %
 *   - Any tool failure rate > 30 %
 *
 * Setup in Vercel:
 *   Settings → Cron Jobs → GET /api/cron/eval → 0 3 * * * (nightly 3 am UTC)
 */

import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { db } from "@/app/db/client";
import { aiConversations, aiMessages } from "@/app/db/schema";
import { sql, desc } from "drizzle-orm";
import { detectHallucination } from "@/lib/eval/hallucination-detector";
import { getToolFailureRates } from "@/lib/eval/tool-failure-tracker";
import { getAccuracyMetrics } from "@/lib/eval/accuracy-tracker";
import {
  trackEvalRunCompleted,
  trackHallucinationDetected,
} from "@/lib/analytics-server";

type RawToolCall = { name: string; args?: unknown; result?: unknown };

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── 1. Fetch conversations from last 24 h ────────────────────────────────
    const recentConversations = await db
      .select({ id: aiConversations.id })
      .from(aiConversations)
      .where(sql`${aiConversations.createdAt} >= NOW() - INTERVAL '24 hours'`)
      .orderBy(desc(aiConversations.createdAt));

    let hallucinationCount = 0;

    for (const conv of recentConversations) {
      // Load messages and tool calls for this conversation
      const msgs = await db
        .select({
          role: aiMessages.role,
          content: aiMessages.content,
          toolCalls: aiMessages.toolCalls,
        })
        .from(aiMessages)
        .where(sql`${aiMessages.conversationId} = ${conv.id}`);

      const messages = msgs.map((m) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      }));

      const toolCalls: RawToolCall[] = msgs.flatMap((m) => {
        const calls = m.toolCalls as RawToolCall[] | null;
        return Array.isArray(calls) ? calls : [];
      });

      const result = detectHallucination(messages, toolCalls);
      if (result.hallucinated) {
        hallucinationCount += 1;
        trackHallucinationDetected({
          conversationId: conv.id,
          hallucinatedAmounts: result.amounts,
        });
      }
    }

    // ── 2. Tool failure rates (last 7 days) ──────────────────────────────────
    const toolFailureRates = await getToolFailureRates(7);
    const maxToolFailureRate = toolFailureRates.reduce(
      (max, t) => Math.max(max, t.rate),
      0
    );

    // ── 3. Cost accuracy metrics (last 30 days) ───────────────────────────────
    const accuracyMetrics = await getAccuracyMetrics();
    const accuracyScore = accuracyMetrics.overall.withinThirtyPercent * 100;

    // ── 4. PostHog summary event ─────────────────────────────────────────────
    const conversationsChecked = recentConversations.length;
    const hallucinationRate =
      conversationsChecked === 0
        ? 0
        : hallucinationCount / conversationsChecked;

    trackEvalRunCompleted({
      conversationsChecked,
      hallucinations: hallucinationCount,
      toolFailures: toolFailureRates.filter((t) => t.failed > 0).length,
      accuracyScore,
    });

    // ── 5. Sentry alerts ─────────────────────────────────────────────────────
    if (hallucinationRate > 0.1) {
      Sentry.captureMessage(
        `High hallucination rate: ${(hallucinationRate * 100).toFixed(1)}% of recent conversations`,
        { level: "warning", extra: { hallucinationCount, conversationsChecked } }
      );
    }

    const highFailureTools = toolFailureRates.filter((t) => t.rate > 0.3);
    if (highFailureTools.length > 0) {
      Sentry.captureMessage(
        `High tool failure rate detected: ${highFailureTools.map((t) => `${t.toolName} (${(t.rate * 100).toFixed(0)}%)`).join(", ")}`,
        { level: "warning", extra: { highFailureTools } }
      );
    }

    return NextResponse.json({
      success: true,
      results: {
        conversationsChecked,
        hallucinationCount,
        hallucinationRate: parseFloat((hallucinationRate * 100).toFixed(2)),
        toolFailureRates,
        accuracy: {
          overall: accuracyMetrics.overall,
          byServiceType: accuracyMetrics.byServiceType,
        },
      },
    });
  } catch (error) {
    Sentry.captureException(error);
    console.error("Eval cron error:", error);
    return NextResponse.json({ error: "Eval run failed" }, { status: 500 });
  }
}
