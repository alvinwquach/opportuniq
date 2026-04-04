import { getCurrentUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NotificationsPageClient } from "./NotificationsPageClient";

export const dynamic = "force-dynamic";

export default async function NotificationsSettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?redirect=/dashboard/settings/notifications");
  }

  return <NotificationsPageClient />;
}
