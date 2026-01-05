import { getCachedUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/app/db/client";
import { users } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { DiagnosePageClient } from "@/components/chat/DiagnosePageClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Photo Diagnosis | OpportunIQ",
  description: "Upload a photo to diagnose home and auto issues",
};

export default async function DiagnosePage() {
  const user = await getCachedUser();

  if (!user) {
    redirect("/auth/login?redirect=/dashboard/diagnose");
  }

  // Get user details including postal code for location-based lookups
  const [userData] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      postalCode: users.postalCode,
    })
    .from(users)
    .where(eq(users.id, user.id));

  if (!userData) {
    redirect("/auth/login");
  }

  return (
    <DiagnosePageClient
      userId={userData.id}
      userName={userData.name}
      userPostalCode={userData.postalCode}
    />
  );
}
