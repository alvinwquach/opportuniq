/**
 * Hallucination Detector
 *
 * Checks if an AI assistant message cites a dollar amount without ever
 * calling a cost-related tool. If it does, the cost was hallucinated.
 */

const DOLLAR_REGEX = /\$[\d,]+(?:\.\d{1,2})?/g;

const COST_TOOL_NAMES = new Set([
  "getCostEstimate",
  "get_cost_estimate",
  "costEstimate",
  "cost_estimate",
]);

export interface HallucinationResult {
  hallucinated: boolean;
  amounts: string[];
  hasToolCall: boolean;
}

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ToolCall {
  name: string;
  args?: unknown;
  result?: unknown;
}

/**
 * Detect hallucinated cost data in a completed conversation.
 *
 * @param messages  - Full message history for the conversation
 * @param toolCalls - Tool calls recorded for the conversation (flat list across all steps)
 * @returns HallucinationResult
 */
export function detectHallucination(
  messages: Message[],
  toolCalls: ToolCall[]
): HallucinationResult {
  // Collect all dollar amounts mentioned by the assistant
  const amounts: string[] = [];
  for (const msg of messages) {
    if (msg.role !== "assistant") continue;
    const matches = msg.content.match(DOLLAR_REGEX);
    if (matches) {
      amounts.push(...matches);
    }
  }

  // Deduplicate while preserving order
  const uniqueAmounts = [...new Set(amounts)];

  // Check if any cost-related tool was called
  const hasToolCall = toolCalls.some((tc) => COST_TOOL_NAMES.has(tc.name));

  const hallucinated = uniqueAmounts.length > 0 && !hasToolCall;

  return { hallucinated, amounts: uniqueAmounts, hasToolCall };
}
