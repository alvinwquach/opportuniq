import { getCachedUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/app/db/client";
import { gmailTokens, googleCalendarTokens } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { GmailIntegration } from "./GmailIntegration";
import { GoogleCalendarIntegration } from "./GoogleCalendarIntegration";
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

async function getGoogleCalendarConnection(userId: string) {
  const [connection] = await db
    .select({
      email: googleCalendarTokens.email,
      isActive: googleCalendarTokens.isActive,
      connectedAt: googleCalendarTokens.connectedAt,
    })
    .from(googleCalendarTokens)
    .where(eq(googleCalendarTokens.userId, userId))
    .limit(1);

  return connection || null;
}

export default async function IntegrationsPage() {
  const user = await getCachedUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [gmailConnection, googleCalendarConnection] = await Promise.all([
    getGmailConnection(user.id),
    getGoogleCalendarConnection(user.id),
  ]);

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

          <GoogleCalendarIntegration
            connection={
              googleCalendarConnection
                ? {
                    email: googleCalendarConnection.email,
                    isActive: googleCalendarConnection.isActive,
                    connectedAt:
                      googleCalendarConnection.connectedAt.toISOString(),
                  }
                : null
            }
          />
        </div>
      </div>
    </div>
  );
}
