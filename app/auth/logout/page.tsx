import { getCachedUser } from "@/lib/supabase/server";
import { LogoutClient } from "./LogoutClient";

export default async function LogoutPage() {
  // Use cached getUser() to prevent duplicate API calls
  const user = await getCachedUser();

  // Pass whether user is logged in - show appropriate state
  return <LogoutClient isLoggedIn={!!user} />;
}
