import { getCurrentUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/app/db/client";
import { users } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { AdminSidebar } from "./components/AdminSidebar";
import { SidebarProvider } from "./components/SidebarContext";
import { AdminContent } from "./components/AdminContent";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?redirect=/admin");
  }

  const [userData] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      postalCode: users.postalCode,
    })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  if (!userData || userData.role !== "admin") {
    redirect("/dashboard");
  }

  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-[#0c0c0c] flex">
        <AdminSidebar
          user={{
            name: userData.name,
            email: userData.email,
            avatarUrl,
          }}
        />
        <AdminContent
          user={{
            name: userData.name,
            email: userData.email,
            avatarUrl,
            postalCode: userData.postalCode,
          }}
        >
          {children}
        </AdminContent>
      </div>
    </SidebarProvider>
  );
}
