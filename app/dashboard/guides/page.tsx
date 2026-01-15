import { getCurrentUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getUserGuides } from "./actions";
import { GuidesClient } from "./GuidesClient";

export default async function GuidesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?redirect=/dashboard/guides");
  }

  const { bookmarked, recent, helpful } = await getUserGuides();

  return (
    <div className="min-h-[calc(100vh-48px)] lg:min-h-screen bg-[#0c0c0c]">
      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-white mb-1">DIY Guides</h1>
          <p className="text-sm text-[#666]">
            Search community guides from Reddit, DIY forums, and more
          </p>
        </div>
        <GuidesClient
          initialBookmarked={bookmarked}
          initialRecent={recent}
          initialHelpful={helpful}
        />
      </div>
    </div>
  );
}
