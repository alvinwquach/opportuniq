"use client";

import { useEffect, useState } from "react";
import { IncomeSummary } from "./IncomeSummary";
import { IncomeManager } from "./IncomeManager";
import {
  useEncryptedFinancials,
  type RawIncomeStream,
  type DecryptedIncomeStream,
} from "@/hooks/useEncryptedFinancials";

interface IncomePageClientProps {
  userId: string;
  initialStreams: RawIncomeStream[];
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
      <div className="h-3 w-64 bg-[#1f1f1f] rounded mt-4" />
    </div>
  );
}

function IncomeCardSkeleton() {
  return (
    <div className="p-4 rounded-xl bg-[#161616] border border-[#1f1f1f] animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-4 w-28 bg-[#1f1f1f] rounded" />
            <div className="h-4 w-16 bg-[#1f1f1f] rounded" />
          </div>
          <div className="h-6 w-24 bg-[#1f1f1f] rounded" />
        </div>
        <div className="flex gap-1">
          <div className="h-8 w-8 bg-[#1f1f1f] rounded-lg" />
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
      <div className="space-y-2">
        <IncomeCardSkeleton />
        <IncomeCardSkeleton />
      </div>
    </div>
  );
}

export function IncomePageClient({ userId, initialStreams }: IncomePageClientProps) {
  const [decryptedStreams, setDecryptedStreams] = useState<DecryptedIncomeStream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { decryptIncomeStreams } = useEncryptedFinancials();

  useEffect(() => {
    async function decrypt() {
      setIsLoading(true);
      const decrypted = await decryptIncomeStreams(initialStreams);
      setDecryptedStreams(decrypted);
      setIsLoading(false);
    }
    decrypt();
  }, [initialStreams, decryptIncomeStreams]);


  if (isLoading && initialStreams.length > 0) {
    return (
      <>
        <SummarySkeleton />
        <ManagerSkeleton />
      </>
    );
  }

  return (
    <>
      <IncomeSummary streams={decryptedStreams} />
      <IncomeManager
        userId={userId}
        initialStreams={initialStreams}
        decryptedStreams={decryptedStreams}
        setDecryptedStreams={setDecryptedStreams}
      />
    </>
  );
}
