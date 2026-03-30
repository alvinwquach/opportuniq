/**
 * Reddit Community Search Tool
 *
 * Search Reddit for real user experiences, costs, and advice
 * on home repair topics. Much more valuable than generic tutorials
 * because it includes actual costs, mistakes made, and lessons learned.
 *
 * Saves discovered guides to database for later reference.
 */

import * as Sentry from "@sentry/nextjs";
import { tool } from "ai";
import { z } from "zod";
import type { ToolContext } from "./types";
import { scrapeWithTimeout } from "./types";
import { db } from "@/app/db/client";
import { diyGuides } from "@/app/db/schema";
import { getFeatureFlag } from "@/lib/feature-flags";
import { firecrawlSearch } from "@/lib/integrations/firecrawl-search";

// Relevant subreddits for home repair advice
const HOME_REPAIR_SUBREDDITS = [
  "HomeImprovement",
  "DIY",
  "homeowners",
  "Plumbing",
  "electricians",
  "HVAC",
  "Roofing",
  "Carpentry",
];

// Auto repair subreddits
const AUTO_REPAIR_SUBREDDITS = [
  "MechanicAdvice",
  "Cartalk",
  "AutoDIY",
  "AskMechanics",
];

/**
 * Parse Reddit markdown to extract individual posts
 */
function parseRedditPosts(markdown: string): Array<{
  title: string;
  url: string;
  subreddit: string;
  upvotes?: number;
  commentCount?: number;
  excerpt?: string;
}> {
  const posts: Array<{
    title: string;
    url: string;
    subreddit: string;
    upvotes?: number;
    commentCount?: number;
    excerpt?: string;
  }> = [];

  // Match Reddit post links - format: [Title](https://www.reddit.com/r/subreddit/comments/...)
  const postPattern = /\[([^\]]+)\]\((https:\/\/(?:www\.)?reddit\.com\/r\/([^/]+)\/comments\/[^)]+)\)/g;
  let match;

  while ((match = postPattern.exec(markdown)) !== null) {
    const [, title, url, subreddit] = match;

    // Skip if already found (dedup)
    if (posts.some(p => p.url === url)) continue;

    // Try to extract upvotes (patterns like "123 points" or "123 upvotes")
    const upvotePattern = new RegExp(`${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^\\d]*(\\d+)\\s*(?:points?|upvotes?)`, 'i');
    const upvoteMatch = upvotePattern.exec(markdown);
    const upvotes = upvoteMatch ? parseInt(upvoteMatch[1], 10) : undefined;

    // Try to extract comment count
    const commentPattern = new RegExp(`${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^\\d]*(\\d+)\\s*comments?`, 'i');
    const commentMatch = commentPattern.exec(markdown);
    const commentCount = commentMatch ? parseInt(commentMatch[1], 10) : undefined;

    posts.push({
      title,
      url,
      subreddit,
      upvotes,
      commentCount,
    });
  }

  return posts.slice(0, 10); // Limit to top 10 posts
}

/**
 * Extract subreddit name from a Reddit URL
 */
function extractSubreddit(url: string): string {
  const match = url.match(/reddit\.com\/r\/([^/]+)/i);
  return match ? match[1] : "unknown";
}

export function createRedditSearchTool(ctx: ToolContext) {
  return tool({
    description:
      "Search Reddit for real user experiences, actual costs, and advice on home repairs. Use this to find what real homeowners paid, mistakes to avoid, and whether DIY is realistic for this repair.",
    inputSchema: z.object({
      query: z
        .string()
        .describe(
          "The home repair topic to search (e.g., 'water heater replacement cost', 'DIY electrical panel', 'roof leak repair experience')"
        ),
      focusOn: z
        .enum(["cost", "diy_difficulty", "contractor_experience", "general"])
        .optional()
        .describe("What aspect to focus on: cost estimates, DIY difficulty, contractor experiences, or general advice"),
      category: z
        .enum(["home", "auto"])
        .optional()
        .describe("Whether this is a home repair or auto repair question"),
    }),
    execute: async ({ query, focusOn = "general", category = "home" }) => {
      console.log(`[redditSearch] Searching Reddit for: ${query} (focus: ${focusOn}, category: ${category})`);

      // Choose subreddits based on category
      const subreddits = category === "auto" ? AUTO_REPAIR_SUBREDDITS : HOME_REPAIR_SUBREDDITS;
      const subredditFilter = subreddits.join("+");

      // Add focus-specific terms to query
      let enhancedQuery = query;
      switch (focusOn) {
        case "cost":
          enhancedQuery = `${query} cost price paid quote`;
          break;
        case "diy_difficulty":
          enhancedQuery = `${query} DIY difficulty beginner experience`;
          break;
        case "contractor_experience":
          enhancedQuery = `${query} contractor hired experience review`;
          break;
      }

      const redditUrl = `https://www.reddit.com/r/${subredditFilter}/search?q=${encodeURIComponent(enhancedQuery)}&restrict_sr=on&sort=relevance&t=all`;

      if (!ctx.firecrawl) {
        console.log(`[redditSearch] Firecrawl not available`);
        Sentry.captureMessage("Tool returned error", {
          level: "warning",
          extra: { tool: "searchReddit", error: "Firecrawl not available", query },
        });
        return {
          error: "Reddit search not available",
          suggestion: `Search Reddit for "${query}" in r/HomeImprovement`,
          redditUrl,
        };
      }

      // Feature flag: use Firecrawl search() instead of scraping Reddit directly
      const useNewSearch = ctx.userId
        ? await getFeatureFlag("firecrawl-search-v2", ctx.userId)
        : false;

      if (useNewSearch) {
        const searchResults = await firecrawlSearch(
          ctx.firecrawl,
          enhancedQuery,
          {
            limit: 10,
            scrapeOptions: { formats: ["markdown"] },
            location: { country: "US" },
            zipCode: ctx.zipCode,
          }
        );

        if (searchResults?.web?.length) {
          console.log(`[redditSearch] firecrawlSearch success, ${searchResults.web.length} results`);

          // Map search results to post shape, extracting subreddit from URL
          const posts = searchResults.web.map((item, index) => {
            const url = "url" in item ? (item.url as string) : "";
            const title = "title" in item ? ((item.title as string | undefined) ?? url) : url;
            const subreddit = extractSubreddit(url);
            const markdown = "markdown" in item ? (item.markdown as string | undefined) : undefined;
            const description = "description" in item ? (item.description as string | undefined) : undefined;

            return {
              title,
              url,
              subreddit,
              excerpt: description?.substring(0, 500),
              markdown,
              relevanceScore: Math.max(1, 10 - index),
            };
          });

          // Save guides to database if we have user context
          if (ctx.userId && ctx.conversationId && posts.length > 0) {
            try {
              const guidesToInsert = posts.map((post) => ({
                conversationId: ctx.conversationId!,
                userId: ctx.userId!,
                title: post.title.substring(0, 500),
                url: post.url,
                source: "reddit" as const,
                subreddit: post.subreddit !== "unknown" ? post.subreddit : undefined,
                excerpt: post.excerpt,
                relevanceScore: post.relevanceScore,
                focusArea: focusOn,
                searchQuery: query,
                issueCategory: category,
              }));

              await db.insert(diyGuides).values(guidesToInsert);
              console.log(`[redditSearch] Saved ${guidesToInsert.length} guides to database`);
            } catch (err) {
              console.error(`[redditSearch] Failed to save guides:`, err);
              Sentry.captureException(err, { extra: { tool: "searchReddit", query, category } });
              // Don't fail the tool call if DB insert fails
            }
          }

          return {
            searchQuery: query,
            focusArea: focusOn,
            category,
            redditUrl,
            subredditsSearched: subreddits,
            postsFound: posts.length,
            posts: posts.map((p) => ({
              title: p.title,
              url: p.url,
              subreddit: p.subreddit !== "unknown" ? `r/${p.subreddit}` : undefined,
            })),
            interpretation: getInterpretationTips(focusOn),
          };
        }

        console.log(`[redditSearch] firecrawlSearch returned no results, falling back`);
      }

      // FALLBACK: scrape Reddit search directly
      const result = await scrapeWithTimeout(ctx.firecrawl, redditUrl, 15000);

      if (result?.markdown) {
        console.log(`[redditSearch] Success, got ${result.markdown.length} chars`);

        // Parse posts from markdown
        const posts = parseRedditPosts(result.markdown);
        console.log(`[redditSearch] Found ${posts.length} posts`);

        // Save guides to database if we have user context
        if (ctx.userId && ctx.conversationId && posts.length > 0) {
          try {
            const guidesToInsert = posts.map((post, index) => ({
              conversationId: ctx.conversationId!,
              userId: ctx.userId!,
              title: post.title.substring(0, 500),
              url: post.url,
              source: "reddit" as const,
              subreddit: post.subreddit,
              upvotes: post.upvotes,
              commentCount: post.commentCount,
              excerpt: post.excerpt?.substring(0, 500),
              relevanceScore: Math.max(1, 10 - index), // First result = 10, decreasing
              focusArea: focusOn,
              searchQuery: query,
              issueCategory: category,
            }));

            await db.insert(diyGuides).values(guidesToInsert);
            console.log(`[redditSearch] Saved ${guidesToInsert.length} guides to database`);
          } catch (err) {
            console.error(`[redditSearch] Failed to save guides:`, err);
            Sentry.captureException(err, { extra: { tool: "searchReddit", query, category } });
            // Don't fail the tool call if DB insert fails
          }
        }

        return {
          searchQuery: query,
          focusArea: focusOn,
          category,
          redditUrl,
          subredditsSearched: subreddits,
          postsFound: posts.length,
          posts: posts.map(p => ({
            title: p.title,
            url: p.url,
            subreddit: `r/${p.subreddit}`,
            upvotes: p.upvotes,
            comments: p.commentCount,
          })),
          results: result.markdown.substring(0, 3000),
          interpretation: getInterpretationTips(focusOn),
        };
      }

      console.log(`[redditSearch] Failed or timed out`);
      return {
        error: "Reddit search timed out",
        suggestion: `Search Reddit for "${query}" in r/HomeImprovement or r/DIY`,
        redditUrl,
        fallbackSubreddits: subreddits,
      };
    },
  });
}

function getInterpretationTips(focusOn: string): string[] {
  const baseTips = [
    "Reddit costs vary by location - adjust for your area",
    "Check post dates - prices from 2+ years ago may be outdated",
    "Look for posts with multiple replies confirming the advice",
  ];

  switch (focusOn) {
    case "cost":
      return [
        ...baseTips,
        "Costs typically range 20-40% depending on region and market conditions",
        "Ask for 3 quotes - Reddit users often report wide price variations",
        "Materials costs are more consistent than labor costs",
      ];
    case "diy_difficulty":
      return [
        ...baseTips,
        "If multiple experienced DIYers say 'hire a pro', take that seriously",
        "Factor in tool costs if you don't already own them",
        "Time estimates from Reddit are often optimistic - add 50%",
      ];
    case "contractor_experience":
      return [
        ...baseTips,
        "Red flags: unlicensed, no contract, cash-only, unusually low quote",
        "Get everything in writing including warranty terms",
        "Check your state's contractor licensing board",
      ];
    default:
      return baseTips;
  }
}
