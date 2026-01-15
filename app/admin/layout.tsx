import { getCurrentUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminSidebar } from "./components/AdminSidebar";
import { SidebarProvider } from "./components/SidebarContext";
import { AdminContent } from "./components/AdminContent";

const ADMIN_EMAILS = ["alvinwquach@gmail.com", "binarydecisions1111@gmail.com"];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?redirect=/admin");
  }

  if (!ADMIN_EMAILS.includes(user.email || "")) {
    redirect("/dashboard");
  }

  // Get user info from Supabase auth metadata (already loaded, no extra query)
  const name = user.user_metadata?.full_name || user.user_metadata?.name || null;
  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-[#0c0c0c] flex">
        <AdminSidebar
          user={{
            name,
            email: user.email || "",
            avatarUrl,
          }}
        />
        <AdminContent
          user={{
            name,
            email: user.email || "",
            avatarUrl,
            postalCode: null,
          }}
        >
          {children}
        </AdminContent>
      </div>
    </SidebarProvider>
  );
}
