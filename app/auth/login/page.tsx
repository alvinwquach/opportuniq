import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { LoginClient } from "./LoginClient";

interface LoginPageProps {
  searchParams: Promise<{ token?: string; group?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  // Use cached getUser() to prevent duplicate API calls
  // Add timeout protection to prevent hanging - if auth check is slow, proceed to login form
  let user = null;
  try {
    const getUserPromise = getCurrentUser();
    const timeoutPromise = new Promise<null>((resolve) => 
      setTimeout(() => {
        console.warn("[Login Page] Auth check timed out - proceeding to login form");
        resolve(null);
      }, 3000)
    );
    
    user = await Promise.race([getUserPromise, timeoutPromise]);
  } catch (error) {
    console.error("[Login Page] Auth check error:", error);
    // Continue to login form on error
  }

  if (user) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const inviteToken = params.token ?? null;
  const groupName = params.group ?? null;

  return <LoginClient inviteToken={inviteToken} groupName={groupName} />;
}
