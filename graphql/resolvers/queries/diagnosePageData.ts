/**
 * Diagnose Page Data Resolver
 *
 * Fetches comprehensive data for the AI diagnosis interface.
 */

import { eq, and, inArray, desc, sql } from "drizzle-orm";
import {
  issues,
  groupMembers,
  aiConversations,
  aiMessages,
  decisionOptions,
  productRecommendations,
  vendorContacts,
  diyGuides,
  type DecisionOption,
  type AttachmentMetadata,
} from "@/app/db/schema";
import type { Context } from "../../utils/context";
import { requireAuth } from "../../utils/errors";

// Issue type for helper functions
interface IssueData {
  id: string;
  category: string | null;
  severity: string | null;
  urgency: string | null;
}

// Chat message type for the response
interface ChatMessageData {
  id: string;
  role: string;
  content: string;
  hasImage: boolean;
  hasVoice: boolean;
  visionAnalysis: boolean;
  createdAt: Date;
}

// Category icons mapping
const categoryIcons: Record<string, string> = {
  plumbing: "water",
  electrical: "flash",
  hvac: "snow",
  structural: "home",
  appliance: "construct",
  roofing: "home",
  flooring: "home",
  exterior: "home",
  interior: "home",
  landscaping: "leaf",
  safety: "shield",
  other: "construct",
};

// Category colors mapping
const categoryColors: Record<string, string> = {
  plumbing: "text-blue-500",
  electrical: "text-yellow-500",
  hvac: "text-cyan-500",
  structural: "text-amber-500",
  appliance: "text-purple-500",
  roofing: "text-orange-500",
  flooring: "text-green-500",
  exterior: "text-emerald-500",
  interior: "text-pink-500",
  landscaping: "text-lime-500",
  safety: "text-red-500",
  other: "text-gray-500",
};

// Difficulty based on category and DIY viability
function getDifficulty(issue: IssueData, options: DecisionOption[]): string {
  // Check if any option is not DIY viable
  const hasNonDiyOption = options.some((opt) => !opt.diyViable);
  if (hasNonDiyOption) {
    return "Professional Required";
  }

  // Check severity/urgency
  if (issue.severity === "critical" || issue.urgency === "emergency") {
    return "Professional Recommended";
  }

  // Default based on category
  const category = issue.category?.toLowerCase() ?? "";
  if (category === "electrical" || category === "structural") {
    return "Intermediate";
  }

  return "Easy";
}

// Get estimated time from options
function getEstimatedTime(options: DecisionOption[]): string | null {
  const diyOption = options.find((opt) => opt.type === "diy");
  return diyOption?.timeEstimate ?? null;
}

// Get safety note based on category and options
function getSafetyNote(issue: IssueData, options: DecisionOption[]): string {
  const category = issue.category?.toLowerCase() ?? "";
  const hazards = options.flatMap((opt) => opt.hazards ?? []);

  if (category === "electrical" || hazards.includes("electrical_shock")) {
    return "Always turn off power at the breaker before working on electrical issues.";
  }

  if (category === "plumbing" || hazards.includes("water_damage")) {
    return "Turn off water supply before starting. Have towels ready for residual water.";
  }

  if (category === "hvac" || hazards.includes("refrigerant")) {
    return "HVAC refrigerant handling requires EPA certification. Do not attempt DIY.";
  }

  if (hazards.length > 0) {
    return "Wear appropriate PPE. Follow all safety guidelines in the repair guides.";
  }

  return "Turn off relevant utilities before starting. Wear appropriate PPE.";
}

// Guide icon mapping
function getGuideIcon(source: string): string {
  const s = source.toLowerCase();
  if (s.includes("youtube")) return "youtube";
  if (s.includes("ifixit")) return "ifixit";
  return "article";
}

export async function diagnosePageDataResolver(
  _: unknown,
  args: { issueId?: string },
  ctx: Context
) {
  requireAuth(ctx);

  // Get user's group IDs
  const memberships = await ctx.db
    .select({ groupId: groupMembers.groupId })
    .from(groupMembers)
    .where(
      and(
        eq(groupMembers.userId, ctx.userId),
        eq(groupMembers.status, "active")
      )
    );

  const groupIds = memberships.map((m) => m.groupId);

  if (groupIds.length === 0) {
    return {
      issues: [],
      currentIssue: null,
    };
  }

  // Fetch all issues for the user's groups
  const allIssues = await ctx.db
    .select()
    .from(issues)
    .where(inArray(issues.groupId, groupIds))
    .orderBy(desc(issues.createdAt));

  // Transform issues for dropdown
  const issuesList = allIssues.map((issue) => {
    const category = issue.category?.toLowerCase() ?? "other";
    return {
      id: issue.id,
      title: issue.title ?? "Untitled Issue",
      icon: categoryIcons[category] ?? "construct",
      iconColor: categoryColors[category] ?? "text-gray-500",
      status: issue.status,
      category: issue.category,
      createdAt: issue.createdAt,
      isResolved: issue.status === "completed" || issue.status === "deferred",
      confidence: issue.confidenceLevel,
    };
  });

  // Determine which issue to show details for
  let selectedIssueId = args.issueId;
  if (!selectedIssueId && allIssues.length > 0) {
    // Select the most recent active issue
    const activeIssue = allIssues.find(
      (i) => i.status !== "completed" && i.status !== "deferred"
    );
    selectedIssueId = activeIssue?.id ?? allIssues[0].id;
  }

  if (!selectedIssueId) {
    return {
      issues: issuesList,
      currentIssue: null,
    };
  }

  // Find the selected issue
  const selectedIssue = allIssues.find((i) => i.id === selectedIssueId);
  if (!selectedIssue) {
    return {
      issues: issuesList,
      currentIssue: null,
    };
  }

  // Fetch related data in parallel
  const [options, products, vendors, guides, conversations] = await Promise.all(
    [
      // Decision options for this issue
      ctx.db
        .select()
        .from(decisionOptions)
        .where(eq(decisionOptions.issueId, selectedIssueId)),

      // Product recommendations (parts)
      ctx.db
        .select()
        .from(productRecommendations)
        .where(
          sql`${productRecommendations.optionId} IN (
          SELECT id FROM decision_options WHERE issue_id = ${selectedIssueId}
        )`
        ),

      // Vendor contacts (pros)
      ctx.db
        .select()
        .from(vendorContacts)
        .where(eq(vendorContacts.issueId, selectedIssueId)),

      // DIY guides for this issue
      ctx.db
        .select()
        .from(diyGuides)
        .where(
          and(
            eq(diyGuides.userId, ctx.userId),
            eq(diyGuides.issueCategory, selectedIssue.category ?? "")
          )
        )
        .limit(5),

      // AI conversations for this issue (for chat messages)
      ctx.db
        .select()
        .from(aiConversations)
        .where(
          and(
            eq(aiConversations.userId, ctx.userId),
            inArray(aiConversations.groupId, groupIds)
          )
        )
        .orderBy(desc(aiConversations.createdAt))
        .limit(1),
    ]
  );

  // Fetch chat messages if we have a conversation
  let chatMessages: ChatMessageData[] = [];
  if (conversations.length > 0) {
    const conversationId = conversations[0].id;
    const messages = await ctx.db
      .select()
      .from(aiMessages)
      .where(eq(aiMessages.conversationId, conversationId))
      .orderBy(aiMessages.createdAt);

    chatMessages = messages.map((msg) => {
      const attachments = msg.attachments as AttachmentMetadata[] | null;
      return {
        id: msg.id,
        role: msg.role,
        content: msg.content ?? "",
        hasImage: attachments?.some((a) => a.type === "image") ?? false,
        hasVoice: attachments?.some((a) => a.type === "video") ?? false,
        visionAnalysis: msg.role === "assistant" && msg.toolCalls !== null,
        createdAt: msg.createdAt,
      };
    });
  }

  // If no messages, create a default welcome message
  if (chatMessages.length === 0) {
    chatMessages = [
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hey! I'm here to help diagnose your home issue. You can describe the problem, upload a photo, or record a voice note. What's going on?",
        hasImage: false,
        hasVoice: false,
        visionAnalysis: false,
        createdAt: new Date(),
      },
    ];
  }

  // Calculate costs from options
  const diyOption = options.find((opt) => opt.type === "diy");
  const hireOption = options.find((opt) => opt.type === "hire");

  const diyCost = diyOption
    ? parseFloat(diyOption.costMin ?? "0") +
      parseFloat(diyOption.costMax ?? "0") / 2
    : products.reduce((sum, p) => sum + parseFloat(p.estimatedCost ?? "0"), 0);

  const proCost = hireOption
    ? parseFloat(hireOption.costMin ?? "0") +
      parseFloat(hireOption.costMax ?? "0") / 2
    : vendors.length > 0
    ? parseFloat(vendors[0].quoteAmount ?? "0")
    : diyCost * 3;

  // Transform parts
  const parts = products.map((p) => ({
    id: p.id,
    name: p.productName,
    price: parseFloat(p.estimatedCost ?? "0"),
    store: p.storeName,
    distance: p.storeDistance,
    inStock: p.inStock ?? false,
    storeUrl: p.storeUrl,
  }));

  // Transform pros
  const pros = vendors.map((v) => {
    const contactInfo = v.contactInfo as { email?: string; phone?: string } | null;
    return {
      id: v.id,
      name: v.vendorName,
      rating: parseFloat(v.rating ?? "4.5"),
      reviews: 50, // Default, would need separate review count
      distance: v.distance ?? "Unknown",
      price: parseFloat(v.quoteAmount ?? "0"),
      available: "Contact for availability",
      source: v.specialty?.includes("plumb")
        ? "angi"
        : v.specialty?.includes("electric")
        ? "thumbtack"
        : "yelp",
      email: contactInfo?.email ?? null,
      phone: contactInfo?.phone ?? null,
      specialty: v.specialty,
    };
  });

  // Transform guides
  const guidesList = guides.map((g) => ({
    id: g.id,
    source: g.source ?? "Article",
    title: g.title,
    url: g.url,
    duration: null, // Would need video duration
    steps: null, // Would need step count
    rating: g.relevanceScore ? g.relevanceScore / 20 : 4.5,
    icon: getGuideIcon(g.source ?? ""),
  }));

  // Build the current issue detail
  const category = selectedIssue.category?.toLowerCase() ?? "other";
  const currentIssue = {
    id: selectedIssue.id,
    title: selectedIssue.title ?? "Untitled Issue",
    icon: categoryIcons[category] ?? "construct",
    iconColor: categoryColors[category] ?? "text-gray-500",
    status: selectedIssue.status,
    category: selectedIssue.category,
    createdAt: selectedIssue.createdAt,
    isResolved:
      selectedIssue.status === "completed" ||
      selectedIssue.status === "deferred",
    diagnosis: selectedIssue.diagnosis,
    difficulty: getDifficulty(selectedIssue, options),
    estimatedTime: getEstimatedTime(options),
    diyCost: diyCost > 0 ? diyCost : null,
    proCost: proCost > 0 ? proCost : null,
    confidence: selectedIssue.confidenceLevel ?? 85,
    safetyNote: getSafetyNote(selectedIssue, options),
    chatMessages,
    guides: guidesList,
    parts,
    pros,
  };

  return {
    issues: issuesList,
    currentIssue,
  };
}
