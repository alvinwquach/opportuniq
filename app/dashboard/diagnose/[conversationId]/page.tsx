import { getCurrentUser } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { db } from "@/app/db/client";
import { users, aiConversations } from "@/app/db/schema";
import { eq, and } from "drizzle-orm";
import { DiagnosePageClient } from "@/components/chat/DiagnosePageClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Diagnosis | OpportunIQ",
  description: "View your diagnosis conversation",
};

interface PageProps {
  params: Promise<{ conversationId: string }>;
}

export default async function ConversationPage({ params }: PageProps) {
  const { conversationId } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/auth/login?redirect=/dashboard/diagnose/${conversationId}`);
  }

  // Verify the conversation exists and belongs to this user
  const [conversation] = await db
    .select({ id: aiConversations.id })
    .from(aiConversations)
    .where(
      and(
        eq(aiConversations.id, conversationId),
        eq(aiConversations.userId, user.id)
      )
    );

  if (!conversation) {
    notFound();
  }

  // Get user details
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
      initialConversationId={conversationId}
    />
  );
}
