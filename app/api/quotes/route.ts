import { NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/app/db/client";
import { userSubmittedQuotes } from "@/app/db/schema";
import { eq, desc } from "drizzle-orm";

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const submitQuoteSchema = z.object({
  issueId: z.string().uuid().optional(),
  conversationId: z.string().uuid().optional(),
  serviceType: z.string().min(1),
  zipCode: z.string().min(1),
  quoteCents: z.number().int().min(0),
  quoteType: z.enum(["diy", "professional"]),
  contractorName: z.string().optional(),
  description: z.string().optional(),
  wasAccepted: z.enum(["yes", "no", "pending"]).optional(),
});

const json = (data: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(data), {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });

// ============================================================================
// POST /api/quotes — Submit a new quote
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

  const parseResult = submitQuoteSchema.safeParse(body);
  if (!parseResult.success) {
    return json(
      { error: "Invalid request", details: parseResult.error.flatten() },
      { status: 400 }
    );
  }

  const {
    issueId,
    conversationId,
    serviceType,
    zipCode,
    quoteCents,
    quoteType,
    contractorName,
    description,
    wasAccepted,
  } = parseResult.data;

  const [quote] = await db
    .insert(userSubmittedQuotes)
    .values({
      userId: user.id,
      issueId: issueId ?? null,
      conversationId: conversationId ?? null,
      serviceType,
      zipCode,
      quoteCents,
      quoteType,
      contractorName: contractorName ?? null,
      description: description ?? null,
      wasAccepted: wasAccepted ?? null,
    })
    .returning();

  return json({ quote }, { status: 201 });
}

// ============================================================================
// GET /api/quotes — List current user's submitted quotes
// ============================================================================

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(request.url);
  const conversationId = url.searchParams.get("conversationId");

  let quotes;
  if (conversationId) {
    quotes = await db
      .select()
      .from(userSubmittedQuotes)
      .where(eq(userSubmittedQuotes.conversationId, conversationId))
      .orderBy(desc(userSubmittedQuotes.createdAt));
  } else {
    quotes = await db
      .select()
      .from(userSubmittedQuotes)
      .where(eq(userSubmittedQuotes.userId, user.id))
      .orderBy(desc(userSubmittedQuotes.createdAt));
  }

  return json({ quotes });
}
