import { getCurrentUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { GuidesClient } from "./GuidesClient";

export default async function GuidesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?redirect=/dashboard/guides");
  }

  // Data is now fetched client-side via GraphQL
  return <GuidesClient />;
}
