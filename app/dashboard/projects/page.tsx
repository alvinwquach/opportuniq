import { getCurrentUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DiagnoseClient } from "./DiagnoseClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Diagnose | OpportunIQ",
  description: "AI-powered home issue diagnosis with guides, parts, and pros",
};

export default async function DiagnosePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?redirect=/dashboard/projects");
  }

  // Data is fetched client-side via GraphQL
  return <DiagnoseClient />;
}
