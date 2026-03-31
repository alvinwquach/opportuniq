// Tell Next.js this entire module runs only on the server (Node.js),
// never in the browser — this keeps DB credentials and AI conversation history off the client bundle.
"use server";

// createClient: factory that creates a Supabase auth client scoped to the current
// HTTP request, so we can identify which user is logged in via their session cookie.
import { createClient } from "@/lib/supabase/server";
// db: the Drizzle ORM instance that talks to our PostgreSQL database.
import { db } from "@/app/db/client";
import {
  // issues: the table of repair/maintenance issues logged against a group.
  issues,
  // groupMembers: the join table linking users to groups (with a membership status).
  groupMembers,
  // aiConversations: the table of AI chat sessions associated with a user's group.
  aiConversations,
  // aiMessages: the table of individual messages (user + assistant turns) within a conversation.
  aiMessages,
  // decisionOptions: the table of available DIY or hire options generated for an issue.
  decisionOptions,
  // productRecommendations: the table of specific products suggested for a repair option.
  productRecommendations,
  // vendorContacts: the table of contractor/vendor records associated with an issue.
  vendorContacts,
  // diyGuides: the table of repair guides fetched for an issue's category.
  diyGuides,
  // DecisionOption: the TypeScript type for a single decision option row (used for type annotations).
  type DecisionOption,
  // AttachmentMetadata: the TypeScript type describing the structure of a message attachment JSON field.
  type AttachmentMetadata,
} from "@/app/db/schema";
// eq: builds "WHERE col = value".
// and: combines multiple WHERE conditions with SQL AND.
// inArray: builds "WHERE col IN (array)" — used when filtering by a list of IDs.
// desc: builds "ORDER BY col DESC" (newest first).
// sql: allows writing raw SQL fragments inside Drizzle queries when the ORM's helpers aren't expressive enough.
import { eq, and, inArray, desc, sql } from "drizzle-orm";

// categoryIcons: maps issue category strings to Ionic icon names used in the UI
// to visually distinguish issue types with relevant symbols.
const categoryIcons: Record<string, string> = {
  plumbing: "water", electrical: "flash", hvac: "snow", structural: "home",
  appliance: "construct", roofing: "home", flooring: "home", exterior: "home",
  interior: "home", landscaping: "leaf", safety: "shield", other: "construct",
};
// categoryColors: maps issue category strings to Tailwind CSS text-color classes
// so each category badge renders in a consistent, distinct color.
const categoryColors: Record<string, string> = {
  plumbing: "text-blue-500", electrical: "text-yellow-500", hvac: "text-cyan-500",
  structural: "text-amber-500", appliance: "text-purple-500", roofing: "text-orange-500",
  flooring: "text-green-500", exterior: "text-emerald-500", interior: "text-pink-500",
  landscaping: "text-lime-500", safety: "text-red-500", other: "text-gray-500",
};

// getDifficulty: determines how hard the repair will be for a DIY attempt, based on the issue's
// category and severity, and whether any of the generated options explicitly require a professional.
// This is a heuristic — the actual data (diyViable flag, severity, category) drives the output.
function getDifficulty(issue: { category: string | null; severity: string | null; urgency: string | null }, options: DecisionOption[]): string {
  // If any option explicitly marks itself as not DIY-viable, a professional is required.
  if (options.some((opt) => !opt.diyViable)) return "Professional Required";
  // Critical severity or emergency urgency means the job is too risky for most homeowners.
  if (issue.severity === "critical" || issue.urgency === "emergency") return "Professional Recommended";
  const category = issue.category?.toLowerCase() ?? "";
  // Electrical and structural repairs involve safety risks that elevate difficulty even for
  // technically inclined homeowners.
  if (category === "electrical" || category === "structural") return "Intermediate";
  // Everything else is considered approachable for most people.
  return "Easy";
}

// getEstimatedTime: returns the time estimate string stored on the DIY option (if one exists),
// e.g. "2-3 hours". Returns null if no DIY option was generated, signalling the UI
// to hide the time estimate field entirely.
function getEstimatedTime(options: DecisionOption[]): string | null {
  // Find the first option tagged as DIY type — there should be at most one per issue.
  const diyOption = options.find((opt) => opt.type === "diy");
  return diyOption?.timeEstimate ?? null;
}

// getSafetyNote: produces a safety reminder string tailored to the issue's category and
// any hazards flagged on its options. This ensures the UI always shows relevant safety
// advice rather than a generic warning, reducing liability and guiding safe behaviour.
function getSafetyNote(issue: { category: string | null }, options: DecisionOption[]): string {
  const category = issue.category?.toLowerCase() ?? "";
  // Flatten all hazard arrays from all options into a single list for easy includes() checks.
  const hazards = options.flatMap((opt) => opt.hazards ?? []);
  // Electrical issues can cause fatal shocks — always instruct the user to cut power first.
  if (category === "electrical" || hazards.includes("electrical_shock")) return "Always turn off power at the breaker before working on electrical issues.";
  // Plumbing work requires shutting off the water supply to prevent flooding.
  if (category === "plumbing" || hazards.includes("water_damage")) return "Turn off water supply before starting. Have towels ready for residual water.";
  // HVAC refrigerant is regulated and dangerous — DIY is legally prohibited without certification.
  if (category === "hvac" || hazards.includes("refrigerant")) return "HVAC refrigerant handling requires EPA certification. Do not attempt DIY.";
  // Any other flagged hazard gets a generic PPE reminder.
  if (hazards.length > 0) return "Wear appropriate PPE. Follow all safety guidelines in the repair guides.";
  // Default catch-all for issues with no specific hazard data.
  return "Turn off relevant utilities before starting. Wear appropriate PPE.";
}

// getGuideIcon: maps a guide's source string to a UI icon identifier so video guides
// and branded sources display the correct logo/icon instead of a generic article icon.
function getGuideIcon(source: string): string {
  const s = source.toLowerCase();
  if (s.includes("youtube")) return "youtube";
  if (s.includes("ifixit")) return "ifixit";
  // Default to an article icon for written guides from any other source.
  return "article";
}

// getDiagnosePageData: the single server action that fetches every piece of data
// needed to render the Diagnose dashboard page. It accepts an optional issueId so
// the caller can request a specific issue's detail panel; otherwise it selects the
// most relevant active issue automatically.
export async function getDiagnosePageData(issueId?: string) {
  // Create a Supabase auth client tied to this request's cookies/session.
  const supabase = await createClient();
  // Ask Supabase who the currently logged-in user is.
  const { data: { user } } = await supabase.auth.getUser();
  // Stop immediately if no authenticated user — we must not expose another user's diagnoses.
  if (!user) throw new Error("Unauthorized");

  // Fetch only the groupId column from the user's active memberships — we just need
  // the IDs to filter issues, not the full group rows.
  const memberships = await db.select({ groupId: groupMembers.groupId })
    .from(groupMembers)
    .where(and(eq(groupMembers.userId, user.id), eq(groupMembers.status, "active")));

  // Extract the group IDs as a plain array.
  const groupIds = memberships.map((m) => m.groupId);
  // If the user has no active groups they can't have any issues — return an empty state immediately.
  if (groupIds.length === 0) return { issues: [], currentIssue: null };

  // Fetch all issues belonging to any of the user's active groups, sorted newest-first.
  // This gives us the full issue list for the left-hand sidebar panel.
  const allIssues = await db.select().from(issues)
    .where(inArray(issues.groupId, groupIds)).orderBy(desc(issues.createdAt));

  // Transform each issue DB row into the compact shape needed for the issue list sidebar.
  // We only include fields required for the list view to keep the payload lightweight.
  const issuesList = allIssues.map((issue) => {
    // Normalise category to lowercase for consistent icon/color map lookups.
    const category = issue.category?.toLowerCase() ?? "other";
    return {
      id: issue.id, title: issue.title ?? "Untitled Issue",
      // Look up the icon name and Tailwind color class for this category.
      icon: categoryIcons[category] ?? "construct", iconColor: categoryColors[category] ?? "text-gray-500",
      status: issue.status, category: issue.category, createdAt: issue.createdAt.toISOString(),
      // An issue is considered "resolved" if it is completed or intentionally deferred.
      isResolved: issue.status === "completed" || issue.status === "deferred",
      confidence: issue.confidenceLevel,
    };
  });

  // Determine which issue to show in the detail panel.
  // If a specific issueId was passed in, use that. Otherwise auto-select.
  let selectedIssueId = issueId;
  if (!selectedIssueId && allIssues.length > 0) {
    // Auto-select: prefer the first issue that is still active (not completed/deferred),
    // because showing an open issue is more actionable than showing a resolved one.
    const activeIssue = allIssues.find((i) => i.status !== "completed" && i.status !== "deferred");
    // Fall back to the very first issue (newest) if all issues are resolved.
    selectedIssueId = activeIssue?.id ?? allIssues[0].id;
  }
  // If we still have no issue ID (empty list), return just the sidebar data with no detail panel.
  if (!selectedIssueId) return { issues: issuesList, currentIssue: null };

  // Find the full issue row for the selected issue from the array we already fetched —
  // no additional DB query needed since we have all issues in memory.
  const selectedIssue = allIssues.find((i) => i.id === selectedIssueId);
  // Guard against the edge case where the provided issueId doesn't exist in the user's groups.
  if (!selectedIssue) return { issues: issuesList, currentIssue: null };

  // Fetch all detail data for the selected issue in parallel to minimise total wait time.
  const [options, products, vendors, guides, conversations] = await Promise.all([
    // Fetch all decision options (DIY and hire alternatives) generated for this issue.
    db.select().from(decisionOptions).where(eq(decisionOptions.issueId, selectedIssueId)),

    // Fetch product recommendations for this issue's options using a raw SQL subquery,
    // because Drizzle's helpers don't directly support "IN (SELECT ...)" without a subquery helper.
    // This retrieves all products linked to any option belonging to this issue.
    db.select().from(productRecommendations).where(
      sql`${productRecommendations.optionId} IN (SELECT id FROM decision_options WHERE issue_id = ${selectedIssueId})`
    ),

    // Fetch all vendor/contractor contacts associated with this specific issue.
    db.select().from(vendorContacts).where(eq(vendorContacts.issueId, selectedIssueId)),

    // Fetch up to 5 DIY guides that belong to this user AND match the selected issue's category.
    // The limit keeps the guides panel concise and relevant.
    db.select().from(diyGuides).where(and(eq(diyGuides.userId, user.id), eq(diyGuides.issueCategory, selectedIssue.category ?? ""))).limit(5),

    // Fetch the single most recent AI conversation for this user across their groups.
    // We only need the most recent one because the diagnose page shows one active chat session.
    db.select().from(aiConversations)
      .where(and(eq(aiConversations.userId, user.id), inArray(aiConversations.groupId, groupIds)))
      .orderBy(desc(aiConversations.createdAt)).limit(1),
  ]);

  // Define the shape of a single chat message for the diagnose page chat panel.
  interface ChatMessageData { id: string; role: string; content: string; hasImage: boolean; hasVoice: boolean; visionAnalysis: boolean; createdAt: string; }
  let chatMessages: ChatMessageData[] = [];
  // If a conversation exists, fetch all its messages in chronological order
  // (oldest first so the chat renders top-to-bottom naturally).
  if (conversations.length > 0) {
    const messages = await db.select().from(aiMessages)
      .where(eq(aiMessages.conversationId, conversations[0].id)).orderBy(aiMessages.createdAt);
    // Transform each raw message row into the UI shape, deriving display flags from
    // the JSONB attachments column and the toolCalls column.
    chatMessages = messages.map((msg) => {
      // Parse the attachments JSONB field into a typed array so we can inspect it safely.
      const attachments = msg.attachments as AttachmentMetadata[] | null;
      return {
        id: msg.id, role: msg.role, content: msg.content ?? "",
        // hasImage: true if any attachment in this message is of type "image"
        // — used to show an image preview indicator in the chat bubble.
        hasImage: attachments?.some((a) => a.type === "image") ?? false,
        // hasVoice: true if any attachment is of type "video" (voice notes are stored as video).
        hasVoice: attachments?.some((a) => a.type === "video") ?? false,
        // visionAnalysis: true if this is an assistant message that used tool calls
        // — indicates the AI performed image analysis or used an external tool.
        visionAnalysis: msg.role === "assistant" && msg.toolCalls !== null, createdAt: msg.createdAt.toISOString(),
      };
    });
  }

  // If there are no real messages yet (new issue, no conversation started), inject a
  // synthetic welcome message so the chat panel is never empty and guides the user to act.
  if (chatMessages.length === 0) {
    chatMessages = [{
      id: "welcome", role: "assistant",
      content: "Hey! I'm here to help diagnose your home issue. You can describe the problem, upload a photo, or record a voice note. What's going on?",
      hasImage: false, hasVoice: false, visionAnalysis: false, createdAt: new Date().toISOString(),
    }];
  }

  // Find the DIY option and hire option from the fetched decision options.
  // There should be at most one of each type per issue.
  const diyOption = options.find((opt) => opt.type === "diy");
  const hireOption = options.find((opt) => opt.type === "hire");
  // Calculate the DIY cost estimate:
  // If a DIY option exists, average its min and max cost.
  // Otherwise, sum up all product recommendation prices as a parts-only estimate.
  const diyCost = diyOption
    ? parseFloat(diyOption.costMin ?? "0") + parseFloat(diyOption.costMax ?? "0") / 2
    : products.reduce((sum, p) => sum + parseFloat(p.estimatedCost ?? "0"), 0);
  // Calculate the professional cost estimate:
  // If a hire option exists, average its min and max cost.
  // If a vendor quote is available, use the first vendor's quote.
  // Otherwise, estimate professional cost as 3× the DIY cost — a rough industry heuristic.
  const proCost = hireOption
    ? parseFloat(hireOption.costMin ?? "0") + parseFloat(hireOption.costMax ?? "0") / 2
    : vendors.length > 0 ? parseFloat(vendors[0].quoteAmount ?? "0") : diyCost * 3;

  // Transform product recommendation rows into the parts list shape the UI expects,
  // including store availability and PPE flag (so safety equipment is visually highlighted).
  const parts = products.map((p) => ({
    id: p.id, name: p.productName, price: parseFloat(p.estimatedCost ?? "0"),
    store: p.storeName, distance: p.storeDistance, inStock: p.inStock ?? false,
    storeUrl: p.storeUrl,
    // Mark safety equipment (PPE) so the UI can apply a warning badge or different styling.
    isPPE: p.productCategory === "safety_equipment",
  }));

  // Transform vendor contact rows into the pro-list shape the UI expects.
  const pros = vendors.map((v) => {
    // The contactInfo column is a JSONB field — cast it to the expected shape for safe access.
    const contactInfo = v.contactInfo as { email?: string; phone?: string } | null;
    return {
      id: v.id, name: v.vendorName, rating: parseFloat(v.rating ?? "4.5"),
      // reviews is hardcoded to 50 as a placeholder until we track actual review counts.
      reviews: 50,
      distance: v.distance ?? "Unknown", price: parseFloat(v.quoteAmount ?? "0"),
      available: "Contact for availability",
      // Infer which platform (Angi, Thumbtack, Yelp) the vendor came from based on their specialty text,
      // since the source platform is not stored as a separate column.
      source: v.specialty?.includes("plumb") ? "angi" : v.specialty?.includes("electric") ? "thumbtack" : "yelp",
      email: contactInfo?.email ?? null, phone: contactInfo?.phone ?? null, specialty: v.specialty,
    };
  });

  // Transform DIY guide rows into the guides list shape the UI expects.
  const guidesList = guides.map((g) => ({
    id: g.id, source: g.source ?? "Article", title: g.title, url: g.url,
    duration: g.duration ?? null, steps: g.steps ?? null,
    // stepContent is a JSONB array of step objects — cast it to the expected type for safe access.
    stepContent: g.stepContent as { stepNumber: number; title: string; description: string }[] | null,
    toolsNeeded: g.toolsNeeded ?? null,
    // Convert the relevanceScore (0–100) to a 0–5 star rating for display.
    // Default to 4.5 stars if no relevance score is available.
    rating: g.relevanceScore ? g.relevanceScore / 20 : 4.5,
    // Derive the display icon based on the guide's source name.
    icon: getGuideIcon(g.source ?? ""),
  }));

  // Normalise the category to lowercase for icon/color lookups.
  const category = selectedIssue.category?.toLowerCase() ?? "other";
  // Assemble the full "current issue" detail object — the main payload for the detail panel.
  const currentIssue = {
    id: selectedIssue.id, title: selectedIssue.title ?? "Untitled Issue",
    icon: categoryIcons[category] ?? "construct", iconColor: categoryColors[category] ?? "text-gray-500",
    status: selectedIssue.status, category: selectedIssue.category, createdAt: selectedIssue.createdAt.toISOString(),
    isResolved: selectedIssue.status === "completed" || selectedIssue.status === "deferred",
    diagnosis: selectedIssue.diagnosis,
    // Compute difficulty, time estimate, and safety note using the helper functions defined above.
    difficulty: getDifficulty(selectedIssue, options),
    estimatedTime: getEstimatedTime(options),
    // Only include costs if they are non-zero — zero means we have no data, and showing "$0"
    // would be misleading in the UI.
    diyCost: diyCost > 0 ? diyCost : null, proCost: proCost > 0 ? proCost : null,
    // Default confidence to 85% if the AI didn't emit a confidence level for this diagnosis.
    confidence: selectedIssue.confidenceLevel ?? 85, safetyNote: getSafetyNote(selectedIssue, options),
    chatMessages, guides: guidesList, parts, pros,
  };

  // Return the complete page payload: the sidebar issue list and the selected issue detail.
  // The TanStack Query hook in lib/hooks/ will cache this and feed it to the React components.
  return { issues: issuesList, currentIssue };
}
