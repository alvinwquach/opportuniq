import { db } from "@/app/db/client";
import { aiConversations, aiMessages, voiceApiUsage } from "@/app/db/schema";
import { users } from "@/app/db/schema/users";
import { desc, sql, eq, count } from "drizzle-orm";
import { AIUsageClient } from "./AIUsageClient";

export const dynamic = "force-dynamic";

export default async function AIUsagePage() {
  // Get overall stats
  const [stats] = await db
    .select({
      totalConversations: count(aiConversations.id),
      totalInputTokens: sql<number>`COALESCE(SUM(${aiConversations.totalInputTokens}), 0)`,
      totalOutputTokens: sql<number>`COALESCE(SUM(${aiConversations.totalOutputTokens}), 0)`,
      totalCost: sql<string>`COALESCE(SUM(CAST(${aiConversations.totalCostUsd} AS DECIMAL)), 0)`,
    })
    .from(aiConversations);

  // Get message stats
  const [messageStats] = await db
    .select({
      totalMessages: count(aiMessages.id),
      avgLatency: sql<number>`COALESCE(AVG(${aiMessages.latencyMs}), 0)`,
      totalImages: sql<number>`COALESCE(SUM(jsonb_array_length(${aiMessages.attachments})), 0)`,
      totalVoiceInputs: sql<number>`COALESCE(SUM(CASE WHEN (${aiMessages.metadata}->>'usedVoice')::boolean = true THEN 1 ELSE 0 END), 0)`,
      totalPhotoInputs: sql<number>`COALESCE(SUM(CASE WHEN (${aiMessages.metadata}->>'usedPhoto')::boolean = true THEN 1 ELSE 0 END), 0)`,
    })
    .from(aiMessages);

  // Get tool call stats
  const toolCallStats = await db
    .select({
      toolCalls: aiMessages.toolCalls,
    })
    .from(aiMessages)
    .where(sql`${aiMessages.toolCalls} IS NOT NULL`);

  // Aggregate tool calls
  const toolUsage: Record<string, number> = {};
  toolCallStats.forEach((row) => {
    const calls = row.toolCalls as Array<{ name: string; args: unknown }> | null;
    if (calls) {
      calls.forEach((call) => {
        toolUsage[call.name] = (toolUsage[call.name] || 0) + 1;
      });
    }
  });

  // Get recent conversations with user info and input type stats
  const recentConversationsRaw = await db
    .select({
      id: aiConversations.id,
      title: aiConversations.title,
      type: aiConversations.type,
      category: aiConversations.category,
      severity: aiConversations.severity,
      totalInputTokens: aiConversations.totalInputTokens,
      totalOutputTokens: aiConversations.totalOutputTokens,
      totalCostUsd: aiConversations.totalCostUsd,
      createdAt: aiConversations.createdAt,
      lastMessageAt: aiConversations.lastMessageAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(aiConversations)
    .leftJoin(users, eq(aiConversations.userId, users.id))
    .orderBy(desc(aiConversations.lastMessageAt))
    .limit(20);

  // Get voice/photo usage per conversation
  let recentConversations = recentConversationsRaw.map(c => ({
    ...c,
    usedVoice: false,
    usedPhoto: false,
    toolCallCount: 0,
  }));

  if (recentConversationsRaw.length > 0) {
    const conversationInputTypes = await db
      .select({
        conversationId: aiMessages.conversationId,
        usedVoice: sql<boolean>`bool_or((${aiMessages.metadata}->>'usedVoice')::boolean)`,
        usedPhoto: sql<boolean>`bool_or((${aiMessages.metadata}->>'usedPhoto')::boolean)`,
        toolCallCount: sql<number>`COALESCE(SUM(jsonb_array_length(${aiMessages.toolCalls})), 0)`,
      })
      .from(aiMessages)
      .where(sql`${aiMessages.conversationId} IN (${sql.join(recentConversationsRaw.map(c => sql`${c.id}`), sql`, `)})`)
      .groupBy(aiMessages.conversationId);

    const inputTypeMap = new Map(conversationInputTypes.map(c => [c.conversationId, c]));

    recentConversations = recentConversationsRaw.map(c => ({
      ...c,
      usedVoice: inputTypeMap.get(c.id)?.usedVoice || false,
      usedPhoto: inputTypeMap.get(c.id)?.usedPhoto || false,
      toolCallCount: Number(inputTypeMap.get(c.id)?.toolCallCount) || 0,
    }));
  }

  // Get recent messages with tool calls
  const recentToolCalls = await db
    .select({
      id: aiMessages.id,
      conversationId: aiMessages.conversationId,
      model: aiMessages.model,
      inputTokens: aiMessages.inputTokens,
      outputTokens: aiMessages.outputTokens,
      costUsd: aiMessages.costUsd,
      latencyMs: aiMessages.latencyMs,
      toolCalls: aiMessages.toolCalls,
      createdAt: aiMessages.createdAt,
    })
    .from(aiMessages)
    .where(sql`${aiMessages.toolCalls} IS NOT NULL`)
    .orderBy(desc(aiMessages.createdAt))
    .limit(50);

  // Get daily usage for chart (last 30 days)
  const dailyUsage = await db
    .select({
      date: sql<string>`DATE(${aiConversations.createdAt})`,
      conversations: count(aiConversations.id),
      inputTokens: sql<number>`COALESCE(SUM(${aiConversations.totalInputTokens}), 0)`,
      outputTokens: sql<number>`COALESCE(SUM(${aiConversations.totalOutputTokens}), 0)`,
      cost: sql<string>`COALESCE(SUM(CAST(${aiConversations.totalCostUsd} AS DECIMAL)), 0)`,
    })
    .from(aiConversations)
    .where(sql`${aiConversations.createdAt} >= NOW() - INTERVAL '30 days'`)
    .groupBy(sql`DATE(${aiConversations.createdAt})`)
    .orderBy(sql`DATE(${aiConversations.createdAt})`);

  // Get daily image counts (last 30 days)
  const dailyImages = await db
    .select({
      date: sql<string>`DATE(${aiMessages.createdAt})`,
      images: sql<number>`COALESCE(SUM(jsonb_array_length(${aiMessages.attachments})), 0)`,
    })
    .from(aiMessages)
    .where(sql`${aiMessages.createdAt} >= NOW() - INTERVAL '30 days' AND ${aiMessages.attachments} IS NOT NULL`)
    .groupBy(sql`DATE(${aiMessages.createdAt})`);

  // Merge daily images into daily usage
  const imagesByDate = new Map(dailyImages.map((d) => [d.date, d.images]));
  const dailyUsageWithImages = dailyUsage.map((d) => ({
    ...d,
    images: imagesByDate.get(d.date) || 0,
  }));

  // Get voice API usage stats
  const [voiceStats] = await db
    .select({
      totalSttCalls: sql<number>`COALESCE(SUM(CASE WHEN ${voiceApiUsage.apiType} = 'stt' THEN 1 ELSE 0 END), 0)`,
      totalTtsCalls: sql<number>`COALESCE(SUM(CASE WHEN ${voiceApiUsage.apiType} = 'tts' THEN 1 ELSE 0 END), 0)`,
      totalSttDurationMs: sql<number>`COALESCE(SUM(CASE WHEN ${voiceApiUsage.apiType} = 'stt' THEN ${voiceApiUsage.durationMs} ELSE 0 END), 0)`,
      totalTtsCharacters: sql<number>`COALESCE(SUM(CASE WHEN ${voiceApiUsage.apiType} = 'tts' THEN ${voiceApiUsage.characterCount} ELSE 0 END), 0)`,
      totalVoiceCost: sql<string>`COALESCE(SUM(CAST(${voiceApiUsage.costUsd} AS DECIMAL)), 0)`,
      avgSttLatency: sql<number>`COALESCE(AVG(CASE WHEN ${voiceApiUsage.apiType} = 'stt' THEN ${voiceApiUsage.latencyMs} END), 0)`,
      avgTtsLatency: sql<number>`COALESCE(AVG(CASE WHEN ${voiceApiUsage.apiType} = 'tts' THEN ${voiceApiUsage.latencyMs} END), 0)`,
      googleSttCalls: sql<number>`COALESCE(SUM(CASE WHEN ${voiceApiUsage.provider} = 'google_stt' THEN 1 ELSE 0 END), 0)`,
      openaiSttCalls: sql<number>`COALESCE(SUM(CASE WHEN ${voiceApiUsage.provider} = 'openai_whisper' THEN 1 ELSE 0 END), 0)`,
      googleTtsCalls: sql<number>`COALESCE(SUM(CASE WHEN ${voiceApiUsage.provider} = 'google_tts' THEN 1 ELSE 0 END), 0)`,
      openaiTtsCalls: sql<number>`COALESCE(SUM(CASE WHEN ${voiceApiUsage.provider} = 'openai_tts' THEN 1 ELSE 0 END), 0)`,
    })
    .from(voiceApiUsage);

  // Get recent voice API calls
  const recentVoiceCalls = await db
    .select({
      id: voiceApiUsage.id,
      userId: voiceApiUsage.userId,
      apiType: voiceApiUsage.apiType,
      provider: voiceApiUsage.provider,
      languageCode: voiceApiUsage.languageCode,
      durationMs: voiceApiUsage.durationMs,
      characterCount: voiceApiUsage.characterCount,
      latencyMs: voiceApiUsage.latencyMs,
      costUsd: voiceApiUsage.costUsd,
      model: voiceApiUsage.model,
      voiceName: voiceApiUsage.voiceName,
      success: voiceApiUsage.success,
      errorMessage: voiceApiUsage.errorMessage,
      createdAt: voiceApiUsage.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(voiceApiUsage)
    .leftJoin(users, eq(voiceApiUsage.userId, users.id))
    .orderBy(desc(voiceApiUsage.createdAt))
    .limit(50);

  // Get daily voice API usage (last 30 days)
  const dailyVoiceUsage = await db
    .select({
      date: sql<string>`DATE(${voiceApiUsage.createdAt})`,
      sttCalls: sql<number>`COALESCE(SUM(CASE WHEN ${voiceApiUsage.apiType} = 'stt' THEN 1 ELSE 0 END), 0)`,
      ttsCalls: sql<number>`COALESCE(SUM(CASE WHEN ${voiceApiUsage.apiType} = 'tts' THEN 1 ELSE 0 END), 0)`,
      cost: sql<string>`COALESCE(SUM(CAST(${voiceApiUsage.costUsd} AS DECIMAL)), 0)`,
    })
    .from(voiceApiUsage)
    .where(sql`${voiceApiUsage.createdAt} >= NOW() - INTERVAL '30 days'`)
    .groupBy(sql`DATE(${voiceApiUsage.createdAt})`)
    .orderBy(sql`DATE(${voiceApiUsage.createdAt})`);

  return (
    <AIUsageClient
      stats={{
        totalConversations: stats?.totalConversations || 0,
        totalInputTokens: Number(stats?.totalInputTokens) || 0,
        totalOutputTokens: Number(stats?.totalOutputTokens) || 0,
        totalCost: parseFloat(stats?.totalCost || "0"),
        totalMessages: messageStats?.totalMessages || 0,
        avgLatency: Math.round(Number(messageStats?.avgLatency) || 0),
        totalImages: Number(messageStats?.totalImages) || 0,
        totalVoiceInputs: Number(messageStats?.totalVoiceInputs) || 0,
        totalPhotoInputs: Number(messageStats?.totalPhotoInputs) || 0,
      }}
      toolUsage={toolUsage}
      recentConversations={recentConversations.map((c) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
        lastMessageAt: c.lastMessageAt.toISOString(),
      }))}
      recentToolCalls={recentToolCalls.map((tc) => ({
        ...tc,
        createdAt: tc.createdAt.toISOString(),
        toolCalls: tc.toolCalls as Array<{ name: string; args: unknown }> | null,
      }))}
      dailyUsage={dailyUsageWithImages.map((d) => ({
        date: d.date,
        conversations: d.conversations,
        inputTokens: Number(d.inputTokens) || 0,
        outputTokens: Number(d.outputTokens) || 0,
        cost: parseFloat(String(d.cost)) || 0,
        images: Number(d.images) || 0,
      }))}
      voiceStats={{
        totalSttCalls: Number(voiceStats?.totalSttCalls) || 0,
        totalTtsCalls: Number(voiceStats?.totalTtsCalls) || 0,
        totalSttDurationMs: Number(voiceStats?.totalSttDurationMs) || 0,
        totalTtsCharacters: Number(voiceStats?.totalTtsCharacters) || 0,
        totalVoiceCost: parseFloat(voiceStats?.totalVoiceCost || "0"),
        avgSttLatency: Math.round(Number(voiceStats?.avgSttLatency) || 0),
        avgTtsLatency: Math.round(Number(voiceStats?.avgTtsLatency) || 0),
        googleSttCalls: Number(voiceStats?.googleSttCalls) || 0,
        openaiSttCalls: Number(voiceStats?.openaiSttCalls) || 0,
        googleTtsCalls: Number(voiceStats?.googleTtsCalls) || 0,
        openaiTtsCalls: Number(voiceStats?.openaiTtsCalls) || 0,
      }}
      recentVoiceCalls={recentVoiceCalls.map((vc) => ({
        ...vc,
        createdAt: vc.createdAt.toISOString(),
      }))}
      dailyVoiceUsage={dailyVoiceUsage.map((d) => ({
        date: d.date,
        sttCalls: Number(d.sttCalls) || 0,
        ttsCalls: Number(d.ttsCalls) || 0,
        cost: parseFloat(String(d.cost)) || 0,
      }))}
    />
  );
}
