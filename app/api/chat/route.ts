/**
 * Chat API Route
 *
 * Handles AI-powered diagnosis conversations with GPT-4o.
 * Uses structured requests for initial diagnosis (anti-hallucination).
 * Uses simple follow-up requests for conversation continuity.
 */

import * as Sentry from "@sentry/nextjs";
import { openai } from "@ai-sdk/openai";
import { streamText, generateText, generateObject, stepCountIs } from "ai";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/app/db/client";
import { aiConversations, aiMessages } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import FirecrawlApp from "@mendable/firecrawl-js";
import OpenAI from "openai";
import { createChatTools } from "./tools";
import { diagnosisRequestSchema, type DiagnosisRequest } from "@/lib/schemas/diagnosis";
import { buildDiagnosisPrompt, buildFollowUpPrompt } from "@/lib/prompts/diagnosis";
import { getLangfuse } from "@/lib/langfuse";
import { checkDiagnosisGuardrails } from "@/lib/guardrails";
import {
  DiagnosisOutputSchema,
  TitleSchema,
  type DiagnosisOutput,
} from "@/lib/schemas/diagnosis-output";
import {
  trackGuardrailViolation,
  trackLangfuseTraceCreated,
  trackStructuredExtractionCompleted,
} from "@/lib/analytics-server";

// Initialize OpenAI client for audio analysis (Vercel AI SDK doesn't support audio input)
const openaiClient = new OpenAI();

// Generate a short title for the conversation using structured output
async function generateConversationTitle(aiResponse: string): Promise<string> {
  try {
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: TitleSchema,
      system:
        "Generate a very short title (3-6 words max) summarizing this home/auto diagnosis. Be specific about the issue and severity if mentioned. Examples: 'Ceiling Crack - Minor', 'Water Damage - Urgent', 'Bathroom Mold Issue', 'Car Engine Noise'.",
      prompt: `Diagnosis:\n${aiResponse.substring(0, 1000)}`,
    });
    return object.title.trim() || "New Diagnosis";
  } catch (error) {
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
  // Language context from voice input
  language?: {
    detected?: string;
  };
  // Optional image/video attachments for follow-up
  attachments?: Array<{
    attachmentId: string;
    storagePath: string;
    iv: string;
    mimeType: string;
    originalSize: number;
    base64Data?: string;
    // Media type
    type?: "image" | "video";
    // Video-specific fields
    durationSeconds?: number;
    diagnosticFramesBase64?: string[];
    transcript?: string;
    transcriptLanguage?: string;
    confidenceScore?: number;
    hasAudio?: boolean;
    audioBase64?: string;
  }>;
}

type RequestBody = StructuredRequest | FollowUpRequest;

// ============================================================================
// MAIN HANDLER
// ============================================================================

export async function POST(req: Request) {
  const startTime = Date.now();

  return Sentry.withServerActionInstrumentation(
    "POST /api/chat",
    { recordResponse: true },
    async () => {
      try {
        // Authenticate user
        console.time("[Chat API] Auth");
        const supabase = await createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        console.timeEnd("[Chat API] Auth");

        if (!user) {
          return new Response("Unauthorized", { status: 401 });
        }

        console.time("[Chat API] Parse body");
        const body: RequestBody = await req.json();
        console.timeEnd("[Chat API] Parse body");

        // Tag the conversation type for Sentry filtering
        Sentry.setTag("conversation_type", body.type);

        // Get user's name from metadata
        const userName = user.user_metadata?.full_name || user.user_metadata?.name || null;

        if (body.type === "structured") {
          return handleStructuredRequest(body, user.id, startTime, userName);
        } else if (body.type === "followup") {
          return handleFollowUpRequest(body, user.id, startTime, userName);
        } else {
          return new Response("Invalid request type", { status: 400 });
        }
      } catch (error) {
        Sentry.captureException(error);
        return new Response("Internal Server Error", { status: 500 });
      }
    }
  );
}

// ============================================================================
// STRUCTURED REQUEST HANDLER (Initial Diagnosis)
// ============================================================================

async function handleStructuredRequest(body: StructuredRequest, userId: string, startTime: number, userName: string | null) {

  // Validate request
  console.time("[Chat API] Validation");
  const parseResult = diagnosisRequestSchema.safeParse(body.diagnosis);
  console.timeEnd("[Chat API] Validation");

  if (!parseResult.success) {
    return new Response(
      JSON.stringify({ error: "Invalid request", details: parseResult.error.flatten() }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const diagnosis = parseResult.data;
  let conversationId = body.conversationId;
  let isNewConversation = false;

  // Log attachment info
  if (diagnosis.attachments?.length) {
  }

  // Create conversation if needed
  if (!conversationId) {
    isNewConversation = true;
    console.time("[Chat API] Create conversation");
    const [newConversation] = await db
      .insert(aiConversations)
      .values({
        userId,
        type: "diagnosis",
        title: "New Diagnosis",
        category: diagnosis.issue.category,
      })
      .returning({ id: aiConversations.id });
    console.timeEnd("[Chat API] Create conversation");

    conversationId = newConversation.id;
  }

  // Build attachments metadata (matches AttachmentMetadata interface)
  const attachments = diagnosis.attachments?.map((att) => ({
    type: (att.type || "image") as "image" | "video" | "document",
    storageUrl: att.storagePath,
    mediaType: att.mimeType,
    fileSize: att.originalSize || 0,
    encrypted: true as const,
    encryptionScope: "user" as const,
    keyVersion: 1,
    algorithm: "AES-GCM-256",
    iv: att.iv,
  }));

  // Check if there are video attachments
  const hasVideo = diagnosis.attachments?.some((att) => att.type === "video");
  const hasImage = diagnosis.attachments?.some((att) => att.type !== "video");

  // Store user message
  console.time("[Chat API] Store user message");
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
      detectedLanguage: diagnosis.language?.detected,
      usedVoice: !!diagnosis.language?.detected, // Voice input detected language
      usedPhoto: hasImage,
      usedVideo: hasVideo,
    },
  });
  console.timeEnd("[Chat API] Store user message");

  // Build focused system prompt
  console.time("[Chat API] Build prompt");
  const systemPrompt = await buildDiagnosisPrompt(diagnosis, { userId, conversationId });
  console.timeEnd("[Chat API] Build prompt");

  // Initialize Langfuse tracing
  const langfuse = getLangfuse();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let trace: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let generation: any;
  if (langfuse) {
    trace = langfuse.trace({
      name: "diagnosis",
      userId,
      metadata: {
        conversationId,
        category: diagnosis.issue.category,
        hasImage: !!diagnosis.attachments?.some((a) => a.type !== "video"),
        hasVideo: !!diagnosis.attachments?.some((a) => a.type === "video"),
      },
    });
    generation = trace.generation({
      name: "gpt-4o-diagnosis",
      model: "gpt-4o",
      input: systemPrompt.substring(0, 2000),
    });
    trackLangfuseTraceCreated({ conversationId: conversationId!, traceId: trace.id });
  }

  // Create tools
  const tools = createChatTools(firecrawl, userId, conversationId, userName || undefined);


  // Build user message content (text + optional images)
  // If no description but has attachments, provide a default analysis prompt
  let textContent = diagnosis.issue.description;
  if (!textContent && diagnosis.attachments?.length) {
    if (hasVideo) {
      const videoHasAudio = diagnosis.attachments.some((att) => att.type === "video" && att.hasAudio);
      const videoHasTranscript = diagnosis.attachments.some((att) => att.type === "video" && att.transcript);
      if (videoHasAudio && videoHasTranscript) {
        textContent = `Please analyze this video - both what you SEE in the frames AND what you HEAR in the audio transcript. Pay special attention to any sounds described (engine noises, rattling, clicking, etc.) as those may be the primary concern. What do you observe visually? What do you hear in the audio? Is there an issue that needs attention?`;
      } else if (videoHasAudio) {
        textContent = `Please analyze this video - both the visual frames and listen for any audio cues. Note: The audio may contain important sounds (engine noise, rattling, etc.) that could indicate an issue. What do you see? What might the audio reveal?`;
      } else {
        textContent = `Please analyze this video and provide your assessment. What do you see in these frames? Is there an issue that needs attention?`;
      }
    } else {
      textContent = `Please analyze this image and provide your assessment. What do you see? Is there an issue that needs attention?`;
    }
  }
  if (diagnosis.issue.symptomsObserved?.length) {
    textContent += `\n\nSymptoms observed: ${diagnosis.issue.symptomsObserved.join(", ")}`;
  }

  // Build message content array for GPT-4o vision
  // Note: Audio is handled separately via OpenAI SDK with input_audio format
  type MessageContent =
    | { type: "text"; text: string }
    | { type: "image"; image: string; mimeType?: string };

  const messageContent: MessageContent[] = [{ type: "text", text: textContent }];

  // Track if we have audio to process (determines which model to use)
  let hasAudioContent = false;
  let audioBase64: string | null = null;

  // Add images/video frames if provided (base64 data from client-side decryption)
  if (diagnosis.attachments?.length) {
    for (const att of diagnosis.attachments) {
      if (att.type === "video") {
        // For video: add diagnostic frames (3 frames at 15%, 50%, 85%)
        if (att.diagnosticFramesBase64?.length) {
          for (let i = 0; i < att.diagnosticFramesBase64.length; i++) {
            messageContent.push({
              type: "image",
              image: att.diagnosticFramesBase64[i],
              mimeType: "image/jpeg",
            });
          }
        }

        // If video has audio, include the audio data for GPT-4o-audio to analyze
        if (att.hasAudio && att.audioBase64) {
          hasAudioContent = true;
          audioBase64 = att.audioBase64;
        }

        // Include video transcript as backup context
        if (att.transcript) {
          messageContent.push({
            type: "text",
            text: `\n\n[Speech transcript from video${att.transcriptLanguage ? ` (${att.transcriptLanguage})` : ""}]: "${att.transcript}"\n\nNote: The transcript above captures speech only. Please also listen to the audio for any mechanical sounds, engine noises, rattling, clicking, or other non-speech sounds that may indicate an issue.`,
          });
        } else if (att.hasAudio) {
          // No speech transcript but has audio - prompt AI to listen
          messageContent.push({
            type: "text",
            text: `\n\n[Video contains audio with no speech detected. Please listen carefully to the audio for any mechanical sounds, engine noises, rattling, clicking, grinding, or other sounds that may indicate an issue.]`,
          });
        }

      } else if (att.base64Data) {
        // For images: add the base64 data directly
        messageContent.push({
          type: "image",
          image: att.base64Data,
          mimeType: att.mimeType,
        });
      }
    }
  }

  // If we have audio, analyze it separately with gpt-4o-audio-preview
  // Use OpenAI SDK directly because Vercel AI SDK doesn't support audio input
  let audioAnalysis: string | null = null;
  if (hasAudioContent && audioBase64) {
    try {
      console.time("[Chat API] Audio analysis with gpt-4o-audio-preview");

      // Use OpenAI SDK directly with input_audio format
      const audioResponse = await openaiClient.chat.completions.create({
        model: "gpt-4o-audio-preview",
        modalities: ["text"],
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Listen to this audio carefully. Describe any sounds you hear - mechanical sounds, engine noises, rattling, clicking, grinding, squeaking, humming, or any other notable sounds. Be specific about the type of sound, its pattern (constant, intermittent, rhythmic), and when it occurs. If it sounds like it could indicate a mechanical issue, describe what type of issue it might suggest."
              },
              {
                type: "input_audio",
                input_audio: {
                  data: audioBase64,
                  format: "mp3",
                },
              },
            ],
          },
        ],
      });

      const content = audioResponse.choices[0]?.message?.content;
      audioAnalysis = typeof content === "string" ? content : null;
      console.timeEnd("[Chat API] Audio analysis with gpt-4o-audio-preview");
    } catch (err) {
      // Continue without audio analysis - not fatal
    }
  }

  // If we got audio analysis, add it to the message content as context
  if (audioAnalysis) {
    messageContent.push({
      type: "text",
      text: `\n\n[AUDIO ANALYSIS - Sounds detected in the video]:\n${audioAnalysis}\n\nPlease incorporate this audio analysis into your diagnosis. The sounds described above were detected in the video and may be relevant to the issue.`,
    });
  }

  // Track tool calls
  const allToolCalls: Array<{ name: string; args: unknown; startTime?: number; endTime?: number }> = [];
  let stepCount = 0;
  const streamStartTime = Date.now();


  // Always use gpt-4o for the main response (supports images)
  // Audio was already analyzed separately with gpt-4o-audio-preview
  const modelId = "gpt-4o";

  // Stream response
  const result = streamText({
    model: openai(modelId),
    system: systemPrompt,
    messages: [{ role: "user", content: messageContent }],
    tools,
    toolChoice: "auto",
    stopWhen: stepCountIs(12),
    onStepFinish: (stepResult) => {
      stepCount++;
      const stepTime = Date.now() - streamStartTime;

      if (stepResult.toolCalls?.length) {
        for (const tc of stepResult.toolCalls) {
          allToolCalls.push({
            name: tc.toolName,
            args: "input" in tc ? tc.input : null,
            startTime: stepTime,
          });
          if (trace) {
            trace.span({
              name: `tool:${tc.toolName}`,
              input: "input" in tc ? tc.input : null,
            });
          }
        }
      }

      if (stepResult.toolResults?.length) {
      }

      if (stepResult.text) {
      }
    },
    onFinish: async ({ text, usage, finishReason }) => {
      const totalTime = Date.now() - streamStartTime;

      // Run guardrails (non-blocking — response already streamed)
      const guardrailResult = checkDiagnosisGuardrails(
        text,
        allToolCalls,
        diagnosis.property.yearBuilt
      );
      if (!guardrailResult.passed) {
        Sentry.captureMessage("Guardrail violation", {
          level: "warning",
          extra: { conversationId, violations: guardrailResult.violations },
        });
        if (trace) {
          trace.update({ metadata: { guardrailViolations: guardrailResult.violations } });
        }
        trackGuardrailViolation({
          conversationId: conversationId!,
          violations: guardrailResult.violations,
        });
      }

      // End Langfuse generation
      if (generation) {
        generation.end({
          output: text,
          usage: { input: usage?.inputTokens, output: usage?.outputTokens },
        });
      }
      if (trace) {
        trace.update({ output: text.substring(0, 500) });
      }

      // Post-response structured extraction (for eval pipeline and RAG)
      let extractedDiagnosis: DiagnosisOutput | undefined;
      try {
        const { object } = await generateObject({
          model: openai("gpt-4o-mini"),
          schema: DiagnosisOutputSchema,
          system: "Extract structured diagnosis data from the following AI response.",
          prompt: `Diagnosis response:\n${text.substring(0, 3000)}`,
        });
        extractedDiagnosis = object;
        trackStructuredExtractionCompleted({
          conversationId: conversationId!,
          severity: object.severity,
          diyFeasibility: object.diyFeasibility,
        });
      } catch (err) {
      }

      await saveAssistantMessage(
        conversationId!,
        text,
        usage,
        finishReason,
        allToolCalls,
        startTime,
        isNewConversation,
        extractedDiagnosis
      );

      if (langfuse) {
        await langfuse.flushAsync();
      }
    },
  });

  const response = result.toUIMessageStreamResponse();
  response.headers.set("X-Conversation-Id", conversationId);
  return response;
}

// ============================================================================
// FOLLOW-UP REQUEST HANDLER
// ============================================================================

async function handleFollowUpRequest(body: FollowUpRequest, userId: string, startTime: number, userName: string | null) {
  const { conversationId, message, postalCode, language, attachments } = body;

  if (!conversationId || (!message.trim() && !attachments?.length)) {
    return new Response("Missing conversationId or message/attachments", { status: 400 });
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

  // Build attachments metadata for storage (matches AttachmentMetadata interface)
  const attachmentsMeta = attachments?.map((att) => ({
    type: (att.type || "image") as "image" | "video" | "document",
    storageUrl: att.storagePath,
    mediaType: att.mimeType,
    fileSize: att.originalSize || 0,
    encrypted: true as const,
    encryptionScope: "user" as const,
    keyVersion: 1,
    algorithm: "AES-GCM-256",
    iv: att.iv,
  }));

  // Check attachment types
  const hasVideo = attachments?.some((att) => att.type === "video");
  const hasImage = attachments?.some((att) => att.type !== "video");
  const contentLabel = hasVideo ? "(Video attached)" : "(Photo attached)";

  // Store user message
  await db.insert(aiMessages).values({
    conversationId,
    role: "user",
    content: message || contentLabel,
    attachments: attachmentsMeta?.length ? attachmentsMeta : null,
    metadata: {
      detectedLanguage: language?.detected || null,
      usedVoice: !!language?.detected,
      usedPhoto: hasImage,
      usedVideo: hasVideo,
    },
  });

  // Build user message content for model (text + optional images)
  // Note: Audio is handled separately via OpenAI SDK with input_audio format
  type MessageContent =
    | { type: "text"; text: string }
    | { type: "image"; image: string; mimeType?: string };

  const userMessageContent: MessageContent[] = [
    { type: "text", text: message || "Please analyze this image." },
  ];

  // Track if we have audio to process
  let hasAudioContent = false;
  let audioBase64: string | null = null;

  // Add images/video frames if provided
  if (attachments?.length) {
    for (const att of attachments) {
      if (att.type === "video") {
        // For video: add diagnostic frames
        if (att.diagnosticFramesBase64?.length) {
          for (let i = 0; i < att.diagnosticFramesBase64.length; i++) {
            userMessageContent.push({
              type: "image",
              image: att.diagnosticFramesBase64[i],
              mimeType: "image/jpeg",
            });
          }
        }

        // If video has audio, include the audio data for GPT-4o-audio
        if (att.hasAudio && att.audioBase64) {
          hasAudioContent = true;
          audioBase64 = att.audioBase64;
        }

        // Include video transcript as backup context
        if (att.transcript) {
          userMessageContent.push({
            type: "text",
            text: `\n\n[Speech transcript from video${att.transcriptLanguage ? ` (${att.transcriptLanguage})` : ""}]: "${att.transcript}"\n\nNote: Please also listen to the audio for any mechanical sounds, engine noises, or other non-speech sounds.`,
          });
        } else if (att.hasAudio) {
          userMessageContent.push({
            type: "text",
            text: `\n\n[Video contains audio with no speech detected. Please listen carefully to the audio for any mechanical sounds, engine noises, or other sounds that may indicate an issue.]`,
          });
        }

      } else if (att.base64Data) {
        // For images
        userMessageContent.push({
          type: "image",
          image: att.base64Data,
          mimeType: att.mimeType,
        });
      }
    }
  }

  // If we have audio, analyze it separately with gpt-4o-audio-preview
  // Use OpenAI SDK directly because Vercel AI SDK doesn't support audio input
  let audioAnalysis: string | null = null;
  if (hasAudioContent && audioBase64) {
    try {
      console.time("[Chat API] Follow-up audio analysis");

      // Use OpenAI SDK directly with input_audio format
      const audioResponse = await openaiClient.chat.completions.create({
        model: "gpt-4o-audio-preview",
        modalities: ["text"],
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Listen to this audio carefully. Describe any sounds you hear - mechanical sounds, engine noises, rattling, clicking, grinding, squeaking, humming, or any other notable sounds. Be specific about the type of sound, its pattern (constant, intermittent, rhythmic), and when it occurs."
              },
              {
                type: "input_audio",
                input_audio: {
                  data: audioBase64,
                  format: "mp3",
                },
              },
            ],
          },
        ],
      });

      const content = audioResponse.choices[0]?.message?.content;
      audioAnalysis = typeof content === "string" ? content : null;
      console.timeEnd("[Chat API] Follow-up audio analysis");
    } catch (err) {
    }
  }

  // Add audio analysis as context if available
  if (audioAnalysis) {
    userMessageContent.push({
      type: "text",
      text: `\n\n[AUDIO ANALYSIS - Sounds detected]:\n${audioAnalysis}`,
    });
  }

  // Build messages for model
  const modelMessages = [
    ...history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user" as const, content: userMessageContent },
  ];

  // Build prompt with language context
  const systemPrompt = postalCode
    ? buildFollowUpPrompt(postalCode, language?.detected)
    : language?.detected && language.detected !== "en"
      ? buildFollowUpPrompt("", language.detected)
      : "You are OpportunIQ's diagnostic assistant. Continue helping with the user's issue.";

  // Create tools
  const tools = createChatTools(firecrawl, userId, conversationId, userName || undefined, postalCode ?? undefined);

  // Track tool calls
  const allToolCalls: Array<{ name: string; args: unknown }> = [];

  // Initialize Langfuse tracing for follow-up
  const langfuse = getLangfuse();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let trace: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let generation: any;
  if (langfuse) {
    trace = langfuse.trace({
      name: "followup",
      userId,
      metadata: { conversationId },
    });
    generation = trace.generation({
      name: "gpt-4o-followup",
      model: "gpt-4o",
      input: systemPrompt.substring(0, 2000),
    });
    trackLangfuseTraceCreated({ conversationId, traceId: trace.id });
  }

  // Always use gpt-4o for the main response (supports images)
  const modelId = "gpt-4o";

  // Stream response
  const result = streamText({
    model: openai(modelId),
    system: systemPrompt,
    messages: modelMessages,
    tools,
    toolChoice: "auto",
    stopWhen: stepCountIs(12),
    onStepFinish: (stepResult) => {
      if (stepResult.toolCalls?.length) {
        for (const tc of stepResult.toolCalls) {
          allToolCalls.push({
            name: tc.toolName,
            args: "input" in tc ? tc.input : null,
          });
          if (trace) {
            trace.span({
              name: `tool:${tc.toolName}`,
              input: "input" in tc ? tc.input : null,
            });
          }
        }
      }
    },
    onFinish: async ({ text, usage, finishReason }) => {
      // Run guardrails (non-blocking — response already streamed)
      const guardrailResult = checkDiagnosisGuardrails(text, allToolCalls);
      if (!guardrailResult.passed) {
        Sentry.captureMessage("Guardrail violation", {
          level: "warning",
          extra: { conversationId, violations: guardrailResult.violations },
        });
        if (trace) {
          trace.update({ metadata: { guardrailViolations: guardrailResult.violations } });
        }
        trackGuardrailViolation({ conversationId, violations: guardrailResult.violations });
      }

      if (generation) {
        generation.end({
          output: text,
          usage: { input: usage?.inputTokens, output: usage?.outputTokens },
        });
      }
      if (trace) {
        trace.update({ output: text.substring(0, 500) });
      }

      await saveAssistantMessage(
        conversationId,
        text,
        usage,
        finishReason,
        allToolCalls,
        startTime,
        false
      );

      if (langfuse) {
        await langfuse.flushAsync();
      }
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
  isNewConversation: boolean,
  extractedDiagnosis?: DiagnosisOutput
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
    metadata: extractedDiagnosis ? { extractedDiagnosis } : null,
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

}
