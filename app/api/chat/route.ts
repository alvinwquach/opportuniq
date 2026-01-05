/**
 * Chat API Route
 *
 * Handles AI-powered diagnosis conversations with GPT-4o.
 * Uses structured requests for initial diagnosis (anti-hallucination).
 * Uses simple follow-up requests for conversation continuity.
 */

import { openai } from "@ai-sdk/openai";
import { streamText, generateText, stepCountIs } from "ai";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/app/db/client";
import { aiConversations, aiMessages } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import FirecrawlApp from "@mendable/firecrawl-js";
import { createChatTools } from "./tools";
import { diagnosisRequestSchema, type DiagnosisRequest } from "@/lib/schemas/diagnosis";
import { buildDiagnosisPrompt, buildFollowUpPrompt } from "@/lib/prompts/diagnosis";

// Generate a short title for the conversation
async function generateConversationTitle(aiResponse: string): Promise<string> {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system:
        "Generate a very short title (3-6 words max) summarizing this home/auto diagnosis. Be specific about the issue and severity if mentioned. Examples: 'Ceiling Crack - Minor', 'Water Damage - Urgent', 'Bathroom Mold Issue', 'Car Engine Noise'. Return ONLY the title, no quotes or extra punctuation.",
      prompt: `Diagnosis:\n${aiResponse.substring(0, 1000)}`,
      maxOutputTokens: 20,
    });
    return text.trim() || "New Diagnosis";
  } catch (error) {
    console.error("[Chat API] Title generation failed:", error);
    return "New Diagnosis";
  }
}

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;

// GPT-4o pricing (as of Jan 2025)
const GPT4O_INPUT_PRICE_PER_1K = 0.0025;
const GPT4O_OUTPUT_PRICE_PER_1K = 0.01;

// Initialize Firecrawl if API key is available
const firecrawl = process.env.FIRECRAWL_API_KEY
  ? new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY })
  : null;

// ============================================================================
// REQUEST TYPES
// ============================================================================

// Structured diagnosis request (initial)
interface StructuredRequest {
  type: "structured";
  diagnosis: DiagnosisRequest;
  conversationId?: string;
}

// Follow-up message request
interface FollowUpRequest {
  type: "followup";
  conversationId: string;
  message: string;
  postalCode?: string | null;
}

type RequestBody = StructuredRequest | FollowUpRequest;

// ============================================================================
// MAIN HANDLER
// ============================================================================

export async function POST(req: Request) {
  const startTime = Date.now();

  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body: RequestBody = await req.json();

    if (body.type === "structured") {
      return handleStructuredRequest(body, user.id, startTime);
    } else if (body.type === "followup") {
      return handleFollowUpRequest(body, user.id, startTime);
    } else {
      return new Response("Invalid request type", { status: 400 });
    }
  } catch (error) {
    console.error("[Chat API] Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

// ============================================================================
// STRUCTURED REQUEST HANDLER (Initial Diagnosis)
// ============================================================================

async function handleStructuredRequest(body: StructuredRequest, userId: string, startTime: number) {
  // Validate request
  console.log("[Chat API] Validating diagnosis:", JSON.stringify(body.diagnosis, null, 2));
  const parseResult = diagnosisRequestSchema.safeParse(body.diagnosis);
  if (!parseResult.success) {
    console.error("[Chat API] Validation failed:", JSON.stringify(parseResult.error.flatten(), null, 2));
    console.error("[Chat API] Zod issues:", JSON.stringify(parseResult.error.issues, null, 2));
    return new Response(
      JSON.stringify({ error: "Invalid request", details: parseResult.error.flatten() }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const diagnosis = parseResult.data;
  let conversationId = body.conversationId;
  let isNewConversation = false;

  // Create conversation if needed
  if (!conversationId) {
    isNewConversation = true;
    const [newConversation] = await db
      .insert(aiConversations)
      .values({
        userId,
        type: "diagnosis",
        title: "New Diagnosis",
        category: diagnosis.issue.category,
      })
      .returning({ id: aiConversations.id });

    conversationId = newConversation.id;
    console.log("[Chat API] Created conversation:", conversationId);
  }

  // Build attachments metadata
  const attachments = diagnosis.attachments?.map((att) => ({
    type: "image",
    mediaType: att.mimeType,
    attachmentId: att.attachmentId,
    storagePath: att.storagePath,
    iv: att.iv,
  }));

  // Store user message
  await db.insert(aiMessages).values({
    conversationId,
    role: "user",
    content: diagnosis.issue.description,
    attachments: attachments?.length ? attachments : null,
    metadata: {
      structured: true,
      category: diagnosis.issue.category,
      location: diagnosis.issue.location,
      propertyType: diagnosis.property.type,
      yearBuilt: diagnosis.property.yearBuilt,
      skillLevel: diagnosis.preferences.diySkillLevel,
      urgency: diagnosis.preferences.urgency,
    },
  });

  // Build focused system prompt
  const systemPrompt = buildDiagnosisPrompt(diagnosis);
  console.log("[Chat API] Prompt length:", systemPrompt.length);

  // Create tools
  const tools = createChatTools(firecrawl, userId, conversationId);

  // Build user message content (text + optional images)
  let textContent = diagnosis.issue.description;
  if (diagnosis.issue.symptomsObserved?.length) {
    textContent += `\n\nSymptoms observed: ${diagnosis.issue.symptomsObserved.join(", ")}`;
  }

  // Build message content array for GPT-4o vision
  type MessageContent =
    | { type: "text"; text: string }
    | { type: "image"; image: string; mimeType?: string };

  const messageContent: MessageContent[] = [{ type: "text", text: textContent }];

  // Add images if provided (base64 data from client-side decryption)
  if (diagnosis.attachments?.length) {
    for (const att of diagnosis.attachments) {
      if (att.base64Data) {
        messageContent.push({
          type: "image",
          image: att.base64Data,
          mimeType: att.mimeType,
        });
        console.log("[Chat API] Including image:", att.mimeType, "size:", att.base64Data.length);
      }
    }
  }

  // Track tool calls
  const allToolCalls: Array<{ name: string; args: unknown }> = [];

  // Stream response
  const result = streamText({
    model: openai("gpt-4o"),
    system: systemPrompt,
    messages: [{ role: "user", content: messageContent }],
    tools,
    toolChoice: "auto",
    stopWhen: stepCountIs(12),
    onStepFinish: (stepResult) => {
      if (stepResult.toolCalls?.length) {
        console.log("[Chat API] Tools:", stepResult.toolCalls.map((tc) => tc.toolName));
        for (const tc of stepResult.toolCalls) {
          allToolCalls.push({
            name: tc.toolName,
            args: "input" in tc ? tc.input : null,
          });
        }
      }
    },
    onFinish: async ({ text, usage, finishReason }) => {
      await saveAssistantMessage(
        conversationId!,
        text,
        usage,
        finishReason,
        allToolCalls,
        startTime,
        isNewConversation
      );
    },
  });

  const response = result.toUIMessageStreamResponse();
  response.headers.set("X-Conversation-Id", conversationId);
  return response;
}

// ============================================================================
// FOLLOW-UP REQUEST HANDLER
// ============================================================================

async function handleFollowUpRequest(body: FollowUpRequest, userId: string, startTime: number) {
  const { conversationId, message, postalCode } = body;

  if (!conversationId || !message.trim()) {
    return new Response("Missing conversationId or message", { status: 400 });
  }

  // Verify conversation belongs to user
  const [conversation] = await db
    .select({ userId: aiConversations.userId })
    .from(aiConversations)
    .where(eq(aiConversations.id, conversationId));

  if (!conversation || conversation.userId !== userId) {
    return new Response("Conversation not found", { status: 404 });
  }

  // Get conversation history
  const history = await db
    .select({
      role: aiMessages.role,
      content: aiMessages.content,
    })
    .from(aiMessages)
    .where(eq(aiMessages.conversationId, conversationId))
    .orderBy(aiMessages.createdAt);

  // Store user message
  await db.insert(aiMessages).values({
    conversationId,
    role: "user",
    content: message,
  });

  // Build messages for model
  const modelMessages = [
    ...history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user" as const, content: message },
  ];

  // Build prompt
  const systemPrompt = postalCode
    ? buildFollowUpPrompt(postalCode)
    : "You are OpportunIQ's diagnostic assistant. Continue helping with the user's issue.";

  // Create tools
  const tools = createChatTools(firecrawl, userId, conversationId);

  // Track tool calls
  const allToolCalls: Array<{ name: string; args: unknown }> = [];

  // Stream response
  const result = streamText({
    model: openai("gpt-4o"),
    system: systemPrompt,
    messages: modelMessages,
    tools,
    toolChoice: "auto",
    stopWhen: stepCountIs(12),
    onStepFinish: (stepResult) => {
      if (stepResult.toolCalls?.length) {
        console.log("[Chat API] Tools:", stepResult.toolCalls.map((tc) => tc.toolName));
        for (const tc of stepResult.toolCalls) {
          allToolCalls.push({
            name: tc.toolName,
            args: "input" in tc ? tc.input : null,
          });
        }
      }
    },
    onFinish: async ({ text, usage, finishReason }) => {
      await saveAssistantMessage(
        conversationId,
        text,
        usage,
        finishReason,
        allToolCalls,
        startTime,
        false
      );
    },
  });

  const response = result.toUIMessageStreamResponse();
  response.headers.set("X-Conversation-Id", conversationId);
  return response;
}

// ============================================================================
// HELPERS
// ============================================================================

async function saveAssistantMessage(
  conversationId: string,
  text: string,
  usage: { inputTokens?: number; outputTokens?: number } | undefined,
  finishReason: string | undefined,
  toolCalls: Array<{ name: string; args: unknown }>,
  startTime: number,
  isNewConversation: boolean
) {
  const latencyMs = Date.now() - startTime;
  const inputTokens = usage?.inputTokens || 0;
  const outputTokens = usage?.outputTokens || 0;
  const inputCost = (inputTokens * GPT4O_INPUT_PRICE_PER_1K) / 1000;
  const outputCost = (outputTokens * GPT4O_OUTPUT_PRICE_PER_1K) / 1000;
  const totalCost = inputCost + outputCost;

  // Store assistant message
  await db.insert(aiMessages).values({
    conversationId,
    role: "assistant",
    content: text,
    model: "gpt-4o",
    inputTokens,
    outputTokens,
    costUsd: totalCost.toFixed(6),
    latencyMs,
    finishReason,
    toolCalls: toolCalls.length > 0 ? toolCalls : null,
  });

  // Update conversation
  const updateData: Record<string, unknown> = {
    totalInputTokens: inputTokens,
    totalOutputTokens: outputTokens,
    totalCostUsd: totalCost.toFixed(6),
    lastMessageAt: new Date(),
    updatedAt: new Date(),
  };

  if (isNewConversation && text) {
    updateData.title = await generateConversationTitle(text);
  }

  await db.update(aiConversations).set(updateData).where(eq(aiConversations.id, conversationId));

  console.log("[Chat API] Response completed", {
    conversationId,
    inputTokens,
    outputTokens,
    cost: totalCost.toFixed(6),
    latencyMs,
  });
}
