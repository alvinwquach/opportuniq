import { getCachedUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OnboardingClient from "./OnboardingClient";

interface OnboardingPageProps {
  searchParams: Promise<{ redirect?: string; preview?: string }>;
}

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const params = await searchParams;

  // Allow preview mode without authentication
  const isPreview = params.preview === "true";

  if (!isPreview) {
    // Use cached getUser() to prevent duplicate API calls
    const user = await getCachedUser();

    if (!user) {
      redirect("/auth/login");
    }
  }

  const customRedirect = params.redirect ?? null;

  return <OnboardingClient customRedirect={customRedirect} isPreview={isPreview} />;
}
