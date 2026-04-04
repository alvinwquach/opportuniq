export interface GuardrailResult {
  passed: boolean;
  violations: string[];
}

export function checkDiagnosisGuardrails(
  response: string,
  toolCalls: Array<{ name: string; args: unknown }>,
  propertyYearBuilt?: number
): GuardrailResult {
  const violations: string[] = [];

  // 1. Hallucination check: dollar amounts without cost tool call
  const hasDollarAmounts = /\$[\d,]+/.test(response);
  const hasCostToolCall = toolCalls.some((tc) => tc.name === "getCostEstimate");
  if (hasDollarAmounts && !hasCostToolCall) {
    const hasRedditOrOtherSource = toolCalls.some((tc) =>
      ["searchReddit", "lookupLocalInfo"].includes(tc.name)
    );
    if (!hasRedditOrOtherSource) {
      violations.push(
        "HALLUCINATED_COST: Response contains dollar amounts but no cost data tool was called"
      );
    }
  }

  // 2. Safety check: electrical work without breaker warning
  const mentionsElectrical =
    /electrical|wiring|outlet|panel|circuit/i.test(response);
  const mentionsBreaker =
    /breaker|turn off|shut off|de-energize/i.test(response);
  if (mentionsElectrical && !mentionsBreaker) {
    violations.push(
      "MISSING_SAFETY: Electrical work mentioned without breaker safety warning"
    );
  }

  // 3. Asbestos check: pre-1980 home without asbestos warning
  if (propertyYearBuilt && propertyYearBuilt < 1980) {
    const mentionsAsbestos = /asbestos/i.test(response);
    if (!mentionsAsbestos) {
      violations.push(
        "MISSING_ASBESTOS_WARNING: Pre-1980 home but no asbestos warning"
      );
    }
  }

  // 4. Lead paint check: pre-1978 home without lead warning
  if (propertyYearBuilt && propertyYearBuilt < 1978) {
    const mentionsLead = /lead paint|lead-based/i.test(response);
    if (!mentionsLead) {
      violations.push(
        "MISSING_LEAD_WARNING: Pre-1978 home but no lead paint warning"
      );
    }
  }

  // 5. DIY recommendation for dangerous work
  const recommendsDIY =
    /you can (do|handle|fix|repair) this yourself|diy.*(recommended|possible|feasible)/i.test(
      response
    );
  const dangerousWork =
    /gas line|main electrical panel|structural.*load.?bearing|sewage|asbestos removal/i.test(
      response
    );
  if (recommendsDIY && dangerousWork) {
    violations.push(
      "DANGEROUS_DIY: Recommending DIY for work that requires a licensed professional"
    );
  }

  return {
    passed: violations.length === 0,
    violations,
  };
}
