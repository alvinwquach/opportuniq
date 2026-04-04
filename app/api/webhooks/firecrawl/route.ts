/**
 * Firecrawl Batch Scrape Webhook Handler
 *
 * Receives Firecrawl webhook callbacks when async batch scrape jobs complete.
 * Processes completed results and updates the cost data cache.
 *
 * Configure in Firecrawl dashboard: https://www.firecrawl.dev/webhooks
 * Webhook URL: https://opportuniq.app/api/webhooks/firecrawl
 */

import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { scrapeCostGuide } from "@/lib/integrations/cost-scraper";
import { db } from "@/app/db/client";
import { costData } from "@/app/db/schema";
import { eq, and } from "drizzle-orm";

// In-memory dedup set — prevents double-processing if Firecrawl retries delivery.
// Note: resets on cold start; acceptable for this use case.
const processedJobIds = new Set<string>();

interface FirecrawlWebhookPage {
  url: string;
  markdown?: string;
  metadata?: {
    statusCode?: number;
    title?: string;
  };
}

interface FirecrawlWebhookPayload {
  type: string;
  jobId: string;
  data?: FirecrawlWebhookPage[];
  error?: string;
}

/**
 * Extract source + slug from a HomeAdvisor or Angi cost guide URL.
 */
function parseGuideUrl(
  url: string
): { source: "homeadvisor" | "angi"; slug: string } | null {
  const haMatch = url.match(/homeadvisor\.com\/cost\/(.+?)\/?$/);
  if (haMatch) return { source: "homeadvisor", slug: haMatch[1].replace(/\/$/, "") };

  const angiMatch = url.match(/angi\.com\/articles\/(.+?)\.htm$/);
  if (angiMatch) return { source: "angi", slug: angiMatch[1] };

  return null;
}

export async function POST(req: Request) {
  let payload: FirecrawlWebhookPayload;

  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const { type, jobId, data } = payload;

  if (!type || !jobId) {
    return NextResponse.json(
      { error: "Missing required fields: type, jobId" },
      { status: 400 }
    );
  }

  // Deduplicate — ignore if this job was already processed
  if (processedJobIds.has(jobId)) {
    return NextResponse.json({ ok: true, skipped: "already processed" });
  }
  processedJobIds.add(jobId);

  Sentry.addBreadcrumb({
    category: "firecrawl-webhook",
    message: `Received ${type} for job ${jobId}`,
    level: "info",
    data: { type, jobId, pageCount: data?.length ?? 0 },
  });

  if (type !== "batch_scrape.completed" || !Array.isArray(data)) {
    // Unknown type or no data — acknowledge and skip
    return NextResponse.json({ ok: true });
  }


  let updated = 0;
  let skipped = 0;

  for (const page of data) {
    const guide = parseGuideUrl(page.url);
    if (!guide) {
      skipped++;
      continue;
    }

    try {
      // Re-parse using existing cost guide logic (handles JSON extraction flag)
      const costGuideData = await scrapeCostGuide(guide.source, guide.slug);
      if (!costGuideData || (!costGuideData.proMinCents && !costGuideData.diyMinCents)) {
        skipped++;
        continue;
      }

      // Upsert into cost_data table for "national" region
      await db
        .insert(costData)
        .values({
          serviceType: guide.slug.split("/").pop()?.replace(/-/g, "_") ?? guide.slug,
          region: "national",
          source: guide.source,
          sourceUrl: page.url,
          proMinCents: costGuideData.proMinCents,
          proMaxCents: costGuideData.proMaxCents,
          proAvgCents: costGuideData.proAvgCents,
          diyMinCents: costGuideData.diyMinCents,
          diyMaxCents: costGuideData.diyMaxCents,
          diyAvgCents: costGuideData.diyAvgCents,
          costFactors: costGuideData.costFactors,
          timeEstimate: costGuideData.timeEstimate,
          rawContent: costGuideData.rawContent,
          scrapedAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        })
        .onConflictDoUpdate({
          target: [costData.serviceType, costData.region, costData.source],
          set: {
            proMinCents: costGuideData.proMinCents,
            proMaxCents: costGuideData.proMaxCents,
            proAvgCents: costGuideData.proAvgCents,
            diyMinCents: costGuideData.diyMinCents,
            diyMaxCents: costGuideData.diyMaxCents,
            diyAvgCents: costGuideData.diyAvgCents,
            costFactors: costGuideData.costFactors,
            timeEstimate: costGuideData.timeEstimate,
            rawContent: costGuideData.rawContent,
            updatedAt: new Date(),
            scrapedAt: new Date(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });

      updated++;
    } catch (error) {
        `[Firecrawl Webhook] Failed to process ${page.url}:`,
        error
      );
      Sentry.captureException(error, {
        extra: { tool: "firecrawl-webhook", url: page.url, jobId },
      });
      skipped++;
    }
  }

  Sentry.addBreadcrumb({
    category: "firecrawl-webhook",
    message: `Batch complete: ${updated} updated, ${skipped} skipped`,
    level: "info",
    data: { jobId, updated, skipped },
  });


  return NextResponse.json({ ok: true, updated, skipped });
}
