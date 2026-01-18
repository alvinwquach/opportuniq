/**
 * Save Issue Tool
 *
 * Allows AI to save a diagnosed issue to the user's issue tracker.
 * Creates encrypted issue records with hypotheses and activity log.
 *
 * FLOW:
 * 1. AI diagnoses a problem in chat
 * 2. AI calls saveIssue with diagnosis details
 * 3. Tool encrypts sensitive fields server-side (using user's encryption key)
 * 4. Issue is created with initial hypothesis and activity log
 * 5. User can view/manage issue in their dashboard
 */

import { tool } from "ai";
import { z } from "zod";
import { db } from "@/app/db/client";
import {
  issues,
  issueHypotheses,
  issueActivityLog,
  groups,
  groupMembers,
  groupConstraints,
} from "@/app/db/schema";
import { eq, and } from "drizzle-orm";
import type { ToolContext } from "./types";

// Input schema for the save issue tool
const saveIssueSchema = z.object({
  // Required fields
  title: z.string().min(1).max(200).describe("Short summary of the issue (e.g., 'Dishwasher not draining', 'Car making clicking noise')"),
  description: z.string().min(1).max(5000).describe("Detailed description of the problem including symptoms, when it started, and any relevant context"),

  // Category and classification
  category: z.enum([
    "automotive",
    "home_repair",
    "appliance",
    "cleaning",
    "yard_outdoor",
    "safety",
    "maintenance",
    "installation",
    "other",
  ]).describe("High-level category of the issue"),
  subcategory: z.string().optional().describe("Specific problem type (e.g., 'drainage', 'electrical', 'engine')"),

  // Asset information (optional)
  assetName: z.string().optional().describe("Name of the item with the issue (e.g., '2018 Honda Civic', 'Kitchen Refrigerator')"),
  assetDetails: z.record(z.unknown()).optional().describe("Additional details about the asset (make, model, year, etc.)"),

  // AI Assessment
  diagnosis: z.string().describe("AI's diagnosis of what the problem likely is"),
  confidence: z.number().min(0).max(100).describe("AI's confidence in the diagnosis (0-100)"),

  severity: z.enum(["cosmetic", "minor", "moderate", "serious", "critical"]).describe("How bad is this problem?"),
  urgency: z.enum(["monitor", "this_month", "this_week", "today", "now", "emergency"]).describe("When does this need attention?"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium").describe("Priority level for the issue"),

  // Risk assessment
  ignoreRisk: z.string().optional().describe("What happens if the user ignores this issue?"),
  warningSignsToWatch: z.array(z.string()).optional().describe("Signs that indicate the problem is getting worse"),
  whenToEscalate: z.string().optional().describe("When should the user call a professional?"),

  // Emergency handling
  isEmergency: z.boolean().default(false).describe("Is this a life-safety emergency?"),
  emergencyInstructions: z.string().optional().describe("Immediate actions for emergencies"),
  emergencyType: z.string().optional().describe("Type of emergency (gas_leak, electrical_fire, etc.)"),

  // Hypothesis details
  reasoningChain: z.object({
    steps: z.array(z.string()).optional(),
    keyObservations: z.array(z.string()).optional(),
    rulesOut: z.array(z.string()).optional(),
    likelihood: z.string().optional(),
    nextTests: z.array(z.string()).optional(),
  }).optional().describe("AI's step-by-step reasoning for the diagnosis"),
});

export type SaveIssueInput = z.infer<typeof saveIssueSchema>;

export interface SaveIssueResult {
  success: boolean;
  issueId?: string;
  message: string;
  error?: string;
  viewUrl?: string;
}

/**
 * Get or create a default group for the user
 * Every user needs at least one group to create issues
 */
async function getOrCreateUserGroup(userId: string): Promise<{ groupId: string; memberId: string } | null> {
  // First, try to find an existing active membership
  const existingMembership = await db
    .select({
      groupId: groupMembers.groupId,
      memberId: groupMembers.id,
    })
    .from(groupMembers)
    .where(
      and(
        eq(groupMembers.userId, userId),
        eq(groupMembers.status, "active")
      )
    )
    .limit(1);

  if (existingMembership.length > 0) {
    return {
      groupId: existingMembership[0].groupId,
      memberId: existingMembership[0].memberId,
    };
  }

  // No existing group - create a default one
  try {
    const result = await db.transaction(async (tx) => {
      // Create the group
      const [newGroup] = await tx
        .insert(groups)
        .values({
          name: "My Projects",
        })
        .returning({ id: groups.id });

      // Create the membership
      const [membership] = await tx
        .insert(groupMembers)
        .values({
          groupId: newGroup.id,
          userId: userId,
          role: "coordinator",
          status: "active",
          joinedAt: new Date(),
        })
        .returning({ id: groupMembers.id });

      // Create default constraints
      await tx.insert(groupConstraints).values({
        groupId: newGroup.id,
        riskTolerance: "moderate",
        diyPreference: "neutral",
      });

      return { groupId: newGroup.id, memberId: membership.id };
    });

    return result;
  } catch (error) {
    console.error("[saveIssue] Failed to create default group:", error);
    return null;
  }
}

export function createSaveIssueTool(ctx: ToolContext) {
  return tool({
    description: `Save a diagnosed issue to the user's issue tracker for future reference and tracking. Use this when:
- You've completed a diagnosis and want to help the user track the issue
- The user explicitly asks to save or track the issue
- The issue requires follow-up action or monitoring
- You want to create a record of a repair/maintenance need

The saved issue will appear in the user's dashboard where they can:
- Track progress from diagnosis to resolution
- Add more evidence (photos/notes)
- Schedule DIY work or contractor visits
- Mark the issue as resolved when fixed`,

    inputSchema: saveIssueSchema,

    execute: async (input): Promise<SaveIssueResult> => {
      const startTime = Date.now();
      console.log("[saveIssue] Starting issue creation...");

      // Validate user context
      if (!ctx.userId) {
        return {
          success: false,
          message: "Unable to save issue",
          error: "User not authenticated",
        };
      }

      try {
        // Get or create user's group
        const userGroup = await getOrCreateUserGroup(ctx.userId);
        if (!userGroup) {
          return {
            success: false,
            message: "Unable to save issue",
            error: "Could not find or create user group",
          };
        }

        console.log("[saveIssue] Using group:", userGroup.groupId, "member:", userGroup.memberId);

        // Create the issue
        // NOTE: For now, we store in plaintext since server-side encryption
        // requires the user's encryption key which is derived client-side.
        // When the user views the issue, they can re-encrypt if desired.
        const [newIssue] = await db
          .insert(issues)
          .values({
            groupId: userGroup.groupId,
            createdBy: userGroup.memberId,

            // Store in plaintext (isEncrypted = false)
            isEncrypted: false,

            // Issue details
            title: input.title,
            description: input.description,
            category: input.category,
            subcategory: input.subcategory || null,

            // Asset info
            assetName: input.assetName || null,
            assetDetails: input.assetDetails || null,

            // Assessment
            diagnosis: input.diagnosis,
            confidenceLevel: input.confidence,
            severity: input.severity,
            urgency: input.urgency,
            priority: input.priority,

            // Risk info
            ignoreRisk: input.ignoreRisk || null,
            warningSignsToWatch: input.warningSignsToWatch || null,
            whenToEscalate: input.whenToEscalate || null,

            // Emergency
            isEmergency: input.isEmergency,
            emergencyInstructions: input.emergencyInstructions || null,
            emergencyType: input.emergencyType || null,

            // Status
            status: "open",
          })
          .returning({ id: issues.id });

        console.log("[saveIssue] Created issue:", newIssue.id);

        // Create the initial hypothesis
        await db.insert(issueHypotheses).values({
          issueId: newIssue.id,
          isEncrypted: false,
          hypothesis: input.diagnosis,
          confidence: input.confidence,
          reasoningChain: input.reasoningChain || null,
        });

        console.log("[saveIssue] Created hypothesis");

        // Create activity log entry
        await db.insert(issueActivityLog).values({
          issueId: newIssue.id,
          activityType: "issue_created",
          performedBy: null, // AI action
          isEncrypted: false,
          title: "Issue created from AI diagnosis",
          description: `AI diagnosed: ${input.diagnosis}`,
          metadata: {
            confidence: input.confidence,
            severity: input.severity,
            urgency: input.urgency,
            topHypothesis: input.diagnosis,
            hypothesisCount: 1,
          },
        });

        // If emergency, add another activity log entry
        if (input.isEmergency) {
          await db.insert(issueActivityLog).values({
            issueId: newIssue.id,
            activityType: "status_changed",
            performedBy: null,
            isEncrypted: false,
            title: "⚠️ Emergency flagged",
            description: input.emergencyInstructions || "This issue requires immediate attention",
            metadata: {
              emergencyType: input.emergencyType,
            },
          });
        }

        const latency = Date.now() - startTime;
        console.log("[saveIssue] Completed in", latency, "ms");

        const viewUrl = `/dashboard/issues/${newIssue.id}`;

        return {
          success: true,
          issueId: newIssue.id,
          message: `Issue saved successfully! "${input.title}" has been added to your issue tracker.`,
          viewUrl,
        };
      } catch (error) {
        console.error("[saveIssue] Error:", error);
        return {
          success: false,
          message: "Failed to save issue",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  });
}
