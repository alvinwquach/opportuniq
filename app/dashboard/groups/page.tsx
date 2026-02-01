import { getCurrentUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { GroupsClient } from "./GroupsClient";

export const dynamic = "force-dynamic";

export default async function GroupsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?redirect=/dashboard/groups");
  }

  // Render the client component that fetches data via GraphQL
  return <GroupsClient />;
}
