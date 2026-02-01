import { getCurrentUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getIncomeData } from "./actions/getIncomeData";
import { IncomePageClient } from "./IncomePageClient";

/**
 * INCOME PAGE (Server Component)
 *
 * This is a server component that:
 *   1. Authenticates the user
 *   2. Fetches encrypted income data from the database
 *   3. Passes it to IncomePageClient for client-side decryption
 *
 * WHY SERVER + CLIENT SPLIT?
 *   - Server: Auth + data fetching (fast, secure, no client JS)
 *   - Client: Decryption (requires encryption key from browser)
 */
export default async function IncomePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  // ─────────────────────────────────────────────────────────────────
  // FETCH ENCRYPTED DATA ON SERVER
  // ─────────────────────────────────────────────────────────────────
  // Server fetches ciphertext from database. It can't decrypt because
  // it doesn't have the user's encryption key (that's in the browser).
  // ─────────────────────────────────────────────────────────────────
  const { incomeStreams } = await getIncomeData(user.id);

  return (
    <div className="min-h-screen bg-[#0c0c0c]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <Link
            href="/dashboard/settings"
            className="text-[#666] hover:text-white transition-colors"
          >
            Settings
          </Link>
          <span className="text-[#444]">/</span>
          <span className="text-white">Income</span>
        </div>

        <div className="mb-8">
          <h1 className="text-xl font-semibold text-white mb-1">Income</h1>
          <p className="text-sm text-[#666]">
            Track your income to calculate your hourly rate and make better DIY vs hire decisions.
          </p>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            CLIENT COMPONENT HANDLES DECRYPTION
            ─────────────────────────────────────────────────────────────
            IncomePageClient receives encrypted data, decrypts it ONCE,
            then passes decrypted data to IncomeSummary and IncomeManager.
            This prevents duplicate decryption and loading flashes.
            ───────────────────────────────────────────────────────────── */}
        <IncomePageClient userId={user.id} initialStreams={incomeStreams} />
      </div>
    </div>
  );
}
