import { getCurrentUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/app/db/client";
import { users } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { AdminSidebar } from "./components/AdminSidebar";
import { SidebarProvider } from "./components/SidebarContext";
import { AdminContent } from "./components/AdminContent";

// Force dynamic rendering - admin pages require auth and database access
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

  const adminEmails = ["alvinwquach@gmail.com", "binarydecisions1111@gmail.com"];
  const isAdminEmail = adminEmails.includes(user.email || "");
  
  let userData;
  
  // For known admin emails, skip DB query entirely if it's slow
  // This dramatically speeds up page loads when DB is having issues
  if (isAdminEmail) {
    const dbQueryPromise = db
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
    
    const dbQueryTimeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), 1000) // 1 second timeout
    );
    
    try {
      const result = await Promise.race([dbQueryPromise, dbQueryTimeout]) as Awaited<typeof dbQueryPromise>;
      [userData] = result;
      console.log("[Admin Layout] Database query completed quickly");
    } catch {
      // DB is slow - use email fallback immediately
      console.log("[Admin Layout] Database slow, using email fallback for admin");
      userData = {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        role: "admin" as const,
        postalCode: null,
      };
    }
  } else {
    // For non-admin emails, we need to check the database
    // Try with timeout, but allow longer for non-admins
    try {
      console.log("[Admin Layout] Starting database query for user:", user.id);
      
      const selectPromise = db
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
      
      const selectTimeout = new Promise<never>((_, reject) =>
        setTimeout(() => {
          console.warn("[Admin Layout] Database query timeout after 2 seconds");
          reject(new Error("Database query timeout"));
        }, 2000)
      );

      const result = await Promise.race([selectPromise, selectTimeout]) as Awaited<typeof selectPromise>;
      [userData] = result;
      console.log("[Admin Layout] Database query completed");
    } catch (dbError) {
      console.error("[Admin Layout] Database query failed:", dbError instanceof Error ? dbError.message : String(dbError));
      // Not admin email and DB failed - redirect to login
      redirect("/auth/login?redirect=/admin");
    }
  }

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
