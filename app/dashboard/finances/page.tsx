import { getCurrentUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FinancesClient } from "./FinancesClient";

export default async function FinancesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?redirect=/dashboard/finances");
  }

  // Data is fetched client-side via GraphQL
  return <FinancesClient />;
}
