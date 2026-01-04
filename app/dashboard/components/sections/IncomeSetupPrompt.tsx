"use client";

import { IncomeSetupDialog } from "./IncomeSetupDialog";

interface IncomeSetupPromptProps {
  userId: string;
}

export function IncomeSetupPrompt({ userId }: IncomeSetupPromptProps) {
  return <IncomeSetupDialog userId={userId} variant="prompt" />;
}
