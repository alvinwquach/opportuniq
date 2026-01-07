import { getCachedUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/app/db/client";
import { gmailTokens } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { GmailIntegration } from "./GmailIntegration";
import Link from "next/link";

async function getGmailConnection(userId: string) {
  const [connection] = await db
    .select({
      gmailAddress: gmailTokens.gmailAddress,
      isActive: gmailTokens.isActive,
      connectedAt: gmailTokens.connectedAt,
    })
    .from(gmailTokens)
    .where(eq(gmailTokens.userId, userId))
    .limit(1);

  return connection || null;
}

export default async function IntegrationsPage() {
  const user = await getCachedUser();

  if (!user) {
    redirect("/auth/login");
  }

  const gmailConnection = await getGmailConnection(user.id);

  return (
    <div className="min-h-screen bg-[#0c0c0c]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <Link
            href="/dashboard/settings"
            className="text-[#666] hover:text-white transition-colors"
          >
            Settings
          </Link>
          <span className="text-[#444]">/</span>
          <span className="text-white">Integrations</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white mb-2">
            Integrations
          </h1>
          <p className="text-sm text-[#666]">
            Connect third-party services to enhance your experience.
          </p>
        </div>

        {/* Integrations Grid */}
        <div className="space-y-4">
          <GmailIntegration
            connection={
              gmailConnection
                ? {
                    gmailAddress: gmailConnection.gmailAddress,
                    isActive: gmailConnection.isActive,
                    connectedAt: gmailConnection.connectedAt.toISOString(),
                  }
                : null
            }
          />

          {/* Placeholder for future integrations */}
          <div className="p-6 rounded-xl bg-[#111] border border-dashed border-[#2a2a2a]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#1a1a1a] flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-[#444]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-[#555]">
                  More integrations coming soon
                </h3>
                <p className="text-xs text-[#444] mt-0.5">
                  Calendar sync, smart home devices, and more
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
