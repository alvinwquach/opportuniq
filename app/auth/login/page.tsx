import { redirect } from "next/navigation";
import { getCachedUser } from "@/lib/supabase/server";
import { LoginClient } from "./LoginClient";

interface LoginPageProps {
  searchParams: Promise<{ token?: string; group?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  // Use cached getUser() to prevent duplicate API calls
  const user = await getCachedUser();

  if (user) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const inviteToken = params.token ?? null;
  const groupName = params.group ?? null;

  return <LoginClient inviteToken={inviteToken} groupName={groupName} />;
}
