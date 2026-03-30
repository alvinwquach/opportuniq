/**
 * Translation API Route
 *
 * Translates text between languages using GPT-4o-mini.
 * Supports toggling between original language and English.
 * Includes comprehensive language support with Chinese dialect detection.
 */

import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import {
  getLanguageName,
  detectChineseDialect,
  normalizeLanguageCode,
} from "@/lib/schemas/voice";

// Request schema
const translateRequestSchema = z.object({
  text: z.string().min(1).max(10000),
  sourceLanguage: z.string().min(2).max(20),
  targetLanguage: z.string().min(2).max(20),
});

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request
    const body = await request.json();
    const parseResult = translateRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { text } = parseResult.data;
    let { sourceLanguage, targetLanguage } = parseResult.data;

    // Normalize language codes
    sourceLanguage = normalizeLanguageCode(sourceLanguage);
    targetLanguage = normalizeLanguageCode(targetLanguage);

    // Auto-detect Chinese dialect if source is generic "zh"
    if (sourceLanguage === "zh") {
      sourceLanguage = detectChineseDialect(text);
      console.log(
        `[Translate API] Detected Chinese dialect: ${getLanguageName(sourceLanguage)}`
      );
    }

    // Skip if same language
    if (sourceLanguage === targetLanguage) {
      return NextResponse.json({
        translatedText: text,
        cached: true,
        detectedDialect: sourceLanguage.startsWith("zh") ? sourceLanguage : undefined,
      });
    }

    const sourceName = getLanguageName(sourceLanguage);
    const targetName = getLanguageName(targetLanguage);

    console.log(
      `[Translate API] Translating ${text.length} chars from ${sourceName} to ${targetName}`
    );

    // Build dialect-aware system prompt
    let dialectNote = "";
    if (sourceLanguage === "yue" || sourceLanguage === "zh-HK") {
      dialectNote = `\nNote: The source text is in Cantonese. Preserve Cantonese-specific expressions and cultural nuances.`;
    } else if (sourceLanguage === "zh-TW") {
      dialectNote = `\nNote: The source text is in Traditional Chinese (Taiwan). Use appropriate Traditional Chinese characters and Taiwan-specific terminology.`;
    } else if (targetLanguage === "yue" || targetLanguage === "zh-HK") {
      dialectNote = `\nNote: Translate to Cantonese using colloquial Cantonese expressions and characters (e.g., 係, 唔, 嘅, 咗, 喺, 啲, 嚟, 佢哋, 冇).`;
    } else if (targetLanguage === "zh-TW") {
      dialectNote = `\nNote: Translate to Traditional Chinese using Taiwan-specific terminology and expressions.`;
    }

    // Use GPT-4o-mini for fast, cost-effective translation
    const { text: translatedText } = await generateText({
      model: openai("gpt-4o-mini"),
      system: `You are a professional translator specializing in accurate, culturally-aware translations. Translate the following text from ${sourceName} to ${targetName}.${dialectNote}

Rules:
1. Preserve the original meaning, tone, and register
2. Keep technical terms accurate
3. Maintain formatting (markdown, lists, etc.)
4. Return ONLY the translation, no explanations or notes
5. If the text contains code blocks, keep them as-is
6. For medical or health-related terms, use standard terminology appropriate for the target language
7. Preserve proper nouns and names unless there's a well-known localized version`,
      prompt: text,
      maxOutputTokens: 4000,
    });

    console.log(
      `[Translate API] Success: ${text.length} chars → ${translatedText.length} chars`
    );

    return NextResponse.json({
      translatedText,
      sourceLanguage,
      targetLanguage,
      detectedDialect: sourceLanguage.startsWith("zh") || sourceLanguage === "yue"
        ? sourceLanguage
        : undefined,
    });
  } catch (error) {
    console.error("[Translate API] Error:", error);
    return NextResponse.json(
      { error: "Translation failed" },
      { status: 500 }
    );
  }
}
