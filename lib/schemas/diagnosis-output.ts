import { z } from "zod";

export const DiagnosisOutputSchema = z.object({
  issueIdentified: z.string().describe("What the issue is"),
  severity: z.enum(["minor", "moderate", "urgent", "emergency"]),
  safetyRisks: z.array(z.string()).describe("Immediate safety concerns"),
  diyFeasibility: z.enum([
    "recommended",
    "possible_with_experience",
    "not_recommended",
    "dangerous",
  ]),
  estimatedCostRange: z
    .object({
      diyMin: z.number().optional(),
      diyMax: z.number().optional(),
      proMin: z.number().optional(),
      proMax: z.number().optional(),
    })
    .optional()
    .describe(
      "Cost range in dollars — ONLY if getCostEstimate tool was called"
    ),
  recommendedContractorType: z
    .string()
    .optional()
    .describe("e.g., plumber, electrician, general contractor"),
  ppeRequired: z
    .array(z.string())
    .describe(
      "Personal protective equipment needed for any inspection or DIY work"
    ),
  nextSteps: z
    .array(z.string())
    .describe("Ordered list of what the user should do next"),
  urgencyTimeframe: z
    .string()
    .describe(
      'How quickly this needs attention, e.g., "within 24 hours", "within 2 weeks"'
    ),
});

export type DiagnosisOutput = z.infer<typeof DiagnosisOutputSchema>;

export const TitleSchema = z.object({
  title: z.string().describe("Short conversation title, 3-6 words max"),
});

export type TitleOutput = z.infer<typeof TitleSchema>;
