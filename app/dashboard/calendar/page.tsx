import { getCurrentUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CalendarClient } from "./CalendarClient";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?redirect=/dashboard/calendar");
  }

  // Render the client component that fetches data via GraphQL
  return <CalendarClient />;
}
