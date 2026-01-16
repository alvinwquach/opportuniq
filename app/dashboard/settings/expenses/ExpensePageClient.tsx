"use client";


import { useEffect, useState } from "react";
import { ExpenseSummary } from "./ExpenseSummary";
import { ExpenseManager } from "./ExpenseManager";
import {
  useEncryptedFinancials,
  type RawExpense,
  type DecryptedExpense,
} from "@/hooks/useEncryptedFinancials";

interface ExpensePageClientProps {
  userId: string;
  initialExpenses: RawExpense[];
}

function SummarySkeleton() {
  return (
    <div className="p-5 rounded-xl bg-[#161616] border border-[#1f1f1f] mb-6 animate-pulse">
      <div className="grid grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i}>
            <div className="h-3 w-16 bg-[#1f1f1f] rounded mb-2" />
            <div className="h-7 w-24 bg-[#1f1f1f] rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ExpenseCardSkeleton() {
  return (
    <div className="p-4 rounded-xl bg-[#161616] border border-[#1f1f1f] animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-4 w-24 bg-[#1f1f1f] rounded" />
            <div className="h-4 w-16 bg-[#1f1f1f] rounded" />
          </div>
          <div className="h-6 w-20 bg-[#1f1f1f] rounded mb-1" />
          <div className="h-3 w-32 bg-[#1f1f1f] rounded" />
        </div>
        <div className="flex gap-1">
          <div className="h-8 w-8 bg-[#1f1f1f] rounded-lg" />
          <div className="h-8 w-8 bg-[#1f1f1f] rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function ManagerSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-3 w-32 bg-[#1f1f1f] rounded mb-3 animate-pulse" />
        <div className="space-y-2">
          <ExpenseCardSkeleton />
          <ExpenseCardSkeleton />
        </div>
      </div>
    </div>
  );
}

export function ExpensePageClient({ userId, initialExpenses }: ExpensePageClientProps) {
  const [decryptedExpenses, setDecryptedExpenses] = useState<DecryptedExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { decryptExpenses } = useEncryptedFinancials();

  useEffect(() => {
    async function decrypt() {
      setIsLoading(true);
      const decrypted = await decryptExpenses(initialExpenses);
      setDecryptedExpenses(decrypted);
      setIsLoading(false);
    }
    decrypt();
  }, [initialExpenses, decryptExpenses]);


  if (isLoading && initialExpenses.length > 0) {
    return (
      <>
        <SummarySkeleton />
        <ManagerSkeleton />
      </>
    );
  }

  return (
    <>
      <ExpenseSummary expenses={decryptedExpenses} />
      <ExpenseManager
        userId={userId}
        decryptedExpenses={decryptedExpenses}
      />
    </>
  );
}
