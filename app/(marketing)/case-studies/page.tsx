import { getCurrentUser } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";

const ADMIN_EMAILS = ["alvinwquach@gmail.com", "binarydecisions1111@gmail.com"];

export default async function CaseStudiesPage() {
  const user = await getCurrentUser();

  // If not logged in or not admin, show 404
  if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
    notFound();
  }

  // Redirect admins to the admin case-studies page
  redirect("/admin/case-studies");
}
