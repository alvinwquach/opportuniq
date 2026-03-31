// This directive tells Next.js that every function exported from this file
// is a "Server Action" — meaning the code runs only on the server, never
// in the user's browser. React components can call these functions directly
// and Next.js handles the network round-trip automatically.
"use server";

// Import the factory function that creates a Supabase client configured for
// server-side use. This client can securely read the current user's session
// from cookies without exposing credentials to the browser.
import { createClient } from "@/lib/supabase/server";

// Import the Drizzle ORM database client. All SQL queries in this file go
// through this object — it manages the connection to the PostgreSQL database.
import { db } from "@/app/db/client";

// Import the vendorContacts table definition from the schema file. Drizzle
// uses these definitions to know which table and columns to query.
import { vendorContacts } from "@/app/db/schema";

// Import the `eq` (equals) helper from Drizzle ORM. When used inside a
// .where() clause, eq(column, value) generates SQL like: WHERE column = value
import { eq } from "drizzle-orm";

// A shared private helper — not exported, so it cannot be called directly
// from outside this file. Its sole job is to confirm that someone is
// logged in before allowing any action to proceed.
async function getAuthUser() {
  // Create a fresh Supabase server client for this request.
  const supabase = await createClient();
  // Ask Supabase: "Who is currently logged in?"
  // The result is destructured to pull out just the `user` object.
  const { data: { user } } = await supabase.auth.getUser();
  // If there is no authenticated user (not logged in, session expired, etc.),
  // throw an error immediately. This stops the action from doing anything and
  // returns a 401-style failure to the caller.
  if (!user) throw new Error("Unauthorized");
  // Return the authenticated user object so callers can access user.id, etc.
  return user;
}

// Exported server action: marks a specific vendor contact as "contacted".
// Parameters:
//   vendorId — the UUID of the vendorContacts row to update
// Returns: the updated vendorContacts row
export async function markVendorContacted(vendorId: string) {
  // Verify the caller is logged in. We don't need the user object here — we
  // just need to know a real authenticated user is making this request.
  await getAuthUser();
  // Run a SQL UPDATE on the vendorContacts table:
  //   SET contacted = true
  //   WHERE id = vendorId
  // .returning() tells the database to send back the updated row instead of
  // just reporting how many rows changed. The result is an array; we
  // destructure the first (and only) element into `updated`.
  const [updated] = await db.update(vendorContacts)
    .set({ contacted: true })
    .where(eq(vendorContacts.id, vendorId))
    .returning();
  // Return the updated row to the caller (e.g. a React hook using TanStack Query).
  return updated;
}

// Exported server action: saves a price quote on a vendor contact record.
// Parameters:
//   vendorId — the UUID of the vendorContacts row to update
//   amount   — the quoted price as a string (e.g. "1500.00")
//   details  — optional free-text notes about the quote (what it includes, caveats, etc.)
// Returns: the updated vendorContacts row
export async function addVendorQuote(vendorId: string, amount: string, details?: string) {
  // Verify the caller is logged in before modifying any data.
  await getAuthUser();
  // Run a SQL UPDATE on the vendorContacts table:
  //   SET quoteAmount = amount, quoteDetails = details
  //   WHERE id = vendorId
  // Destructure the first element of the returned array to get the saved row.
  const [updated] = await db.update(vendorContacts)
    .set({ quoteAmount: amount, quoteDetails: details })
    .where(eq(vendorContacts.id, vendorId))
    .returning();
  // Return the updated row so the UI can reflect the new quote data immediately.
  return updated;
}
