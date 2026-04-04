/**
 * Draft Contractor Email Tool
 *
 * Generates a personalized email draft to send to a contractor
 * based on the diagnosis context from the conversation.
 */

import { tool } from "ai";
import { z } from "zod";
import type { ToolContext } from "./types";

export interface ContractorEmailDraftResult {
  success: boolean;
  contractor: {
    name: string;
    phone?: string;
    website?: string;
  };
  email: {
    subject: string;
    body: string;
  };
  actions: {
    mailtoLink: string;
    copyText: string;
  };
  /** Pre-formatted draft for rendering as interactive card - include this in your response */
  formattedDraft: string;
  tips: string[];
}

export function createDraftContractorEmailTool(ctx: ToolContext) {
  return tool({
    description:
      "Generate a professional email draft to send to a contractor requesting a quote or consultation. Use this after finding contractors to help the user reach out. The email will be personalized based on the issue details. IMPORTANT: When presenting the email draft to the user, format it exactly like this so it renders as an interactive card:\n\n<!-- EMAIL_DRAFT contractor=\"Company Name\" phone=\"123-456-7890\" website=\"example.com\" -->\n**Subject:** Your subject here\n**Body:**\n```\nYour email body here\n```\n<!-- /EMAIL_DRAFT -->",
    inputSchema: z.object({
      contractorName: z
        .string()
        .describe("Name of the contractor or company to contact"),
      contractorPhone: z
        .string()
        .optional()
        .describe("Contractor's phone number if available"),
      contractorWebsite: z
        .string()
        .optional()
        .describe("Contractor's website if available"),
      issueDescription: z
        .string()
        .describe(
          "Brief description of the issue/work needed (e.g., 'leaking faucet in kitchen', 'AC not cooling')"
        ),
      issueCategory: z
        .string()
        .optional()
        .describe(
          "Category of work (e.g., 'plumbing', 'HVAC', 'electrical', 'roofing')"
        ),
      urgency: z
        .enum(["low", "medium", "high", "emergency"])
        .optional()
        .describe("How urgent is this repair"),
      propertyType: z
        .enum(["house", "condo", "apartment", "townhouse", "commercial"])
        .optional()
        .describe("Type of property"),
      additionalContext: z
        .string()
        .optional()
        .describe(
          "Any additional context from the diagnosis (symptoms, age of system, etc.)"
        ),
      preferredContactMethod: z
        .enum(["email", "phone", "either"])
        .optional()
        .default("either")
        .describe("How the user prefers to be contacted"),
      availabilityNotes: z
        .string()
        .optional()
        .describe(
          "User's availability for appointments (e.g., 'weekday mornings', 'flexible')"
        ),
    }),
    execute: async ({
      contractorName,
      contractorPhone,
      contractorWebsite,
      issueDescription,
      issueCategory,
      urgency,
      propertyType,
      additionalContext,
      preferredContactMethod,
      availabilityNotes,
    }): Promise<ContractorEmailDraftResult> => {

      // Build urgency language
      const urgencyText = {
        emergency: "This is an urgent/emergency situation.",
        high: "I would appreciate a response at your earliest convenience as this is a priority issue.",
        medium:
          "I'm hoping to address this within the next week or two if possible.",
        low: "There's no rush, but I'd like to get this scheduled when convenient.",
      };

      // Build property context
      const propertyText = propertyType
        ? `This is for my ${propertyType}.`
        : "";

      // Build availability section
      const availabilityText = availabilityNotes
        ? `\n\nRegarding availability: ${availabilityNotes}`
        : "\n\nI'm flexible with scheduling and can accommodate most times.";

      // Build contact preference
      const contactText = {
        email: "Email is the best way to reach me.",
        phone: contractorPhone
          ? "Feel free to call or text me to discuss."
          : "Please reply to this email with your availability.",
        either: "Feel free to reply by email or give me a call.",
      };

      // Generate subject line
      const categoryLabel = issueCategory
        ? `${issueCategory.charAt(0).toUpperCase() + issueCategory.slice(1)} `
        : "";
      const subject = `Quote Request: ${categoryLabel}${issueDescription}`;

      // Get user's name from context, fallback to placeholder
      const userName = ctx.userName || "[Your Name]";

      // Generate email body
      const body = `Hi ${contractorName},

I'm reaching out because I need help with ${issueDescription.toLowerCase()}. ${propertyText}

${additionalContext ? `Some additional details: ${additionalContext}\n` : ""}${urgency ? urgencyText[urgency] : ""}

I would appreciate if you could provide:
1. An estimate or quote for the work
2. Your availability for an initial assessment
3. Any information about your process and timeline

${contactText[preferredContactMethod || "either"]}${availabilityText}

Please let me know if you need any additional details, photos, or videos of the issue.

Thank you for your time,
${userName}
[Your Phone Number]
[Your Address]`;

      // Generate mailto link (without 'to' since we may not have contractor email)
      const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      // Generate copy-friendly text
      const copyText = `Subject: ${subject}\n\n${body}`;

      // Generate formatted draft for rendering as interactive card
      const phoneAttr = contractorPhone ? ` phone="${contractorPhone}"` : "";
      const websiteAttr = contractorWebsite
        ? ` website="${contractorWebsite}"`
        : "";
      const formattedDraft = `<!-- EMAIL_DRAFT contractor="${contractorName}"${phoneAttr}${websiteAttr} -->
**Subject:** ${subject}
**Body:**
\`\`\`
${body}
\`\`\`
<!-- /EMAIL_DRAFT -->`;


      return {
        success: true,
        contractor: {
          name: contractorName,
          phone: contractorPhone,
          website: contractorWebsite,
        },
        email: {
          subject,
          body,
        },
        actions: {
          mailtoLink,
          copyText,
        },
        formattedDraft,
        tips: [
          ctx.userName
            ? "Add your phone number and address before sending"
            : "Personalize the [Your Name], [Your Phone Number], and [Your Address] placeholders before sending",
          "Consider attaching photos or videos of the issue if you have them",
          contractorPhone
            ? `You can also call ${contractorName} directly at ${contractorPhone}`
            : "If you have their email address, paste it in the 'To' field",
          contractorWebsite
            ? `Visit ${contractorWebsite} to learn more about their services`
            : "Check their reviews on Google, Yelp, or Angi before contacting",
          "Get at least 3 quotes to compare pricing and services",
          "Ask about licensing, insurance, and warranty on work",
        ],
      };
    },
  });
}
