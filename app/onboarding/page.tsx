import { getCurrentUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OnboardingClient from "./OnboardingClient";

interface OnboardingPageProps {
  searchParams: Promise<{ redirect?: string; preview?: string }>;
}

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const params = await searchParams;

  // Allow preview mode without authentication
  const isPreview = params.preview === "true";

  let userName: string | null = null;

  if (!isPreview) {
    const user = await getCurrentUser();

    if (!user) {
      redirect("/auth/login");
    }

    userName = user.user_metadata?.full_name || user.user_metadata?.name || null;
  }

  const customRedirect = params.redirect ?? null;

  return (
    <OnboardingClient
      customRedirect={customRedirect}
      isPreview={isPreview}
      userName={userName}
    />
  );
}
