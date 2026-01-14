import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Use DATABASE_URL (pooled via PgBouncer) for app queries
// IMPORTANT: Supabase pooled connection should include ?pgbouncer=true or use port 6543
// For local development on nano/micro tiers, use DATABASE_URL_DIRECT to bypass pool limits
const connectionString = 
  process.env.NODE_ENV === "development" && process.env.DATABASE_URL_DIRECT
    ? process.env.DATABASE_URL_DIRECT // Use direct connection in dev if available (bypasses pool limits)
    : process.env.DATABASE_URL; // Use pooled connection (production or if DIRECT not set)

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Please ensure your .env file contains DATABASE_URL with the Supabase pooled connection string.\n" +
    "For local development, you can optionally set DATABASE_URL_DIRECT to use a direct connection (port 5432) to bypass pool limits."
  );
}

// Verify connection string format
const isPooledConnection = 
  connectionString.includes("pgbouncer=true") || 
  connectionString.includes(":6543") ||
  connectionString.includes("/pooler");
const isDirectConnection = connectionString.includes(":5432") && !connectionString.includes(":6543");

if (isDirectConnection && process.env.NODE_ENV === "development") {
  console.log(
    "[DB Client] Using DIRECT connection (port 5432) for local development.\n" +
    "This bypasses PgBouncer pool limits, which is helpful for nano/micro tiers.\n" +
    "Production will still use pooled connection (port 6543)."
  );
} else if (!isPooledConnection && process.env.NODE_ENV === "production") {
  console.warn(
    "[DB Client] WARNING: DATABASE_URL may not be using Supabase pooled connection.\n" +
    "Pooled connections should include '?pgbouncer=true' or use port 6543.\n" +
    "Direct connections (port 5432) can cause connection limits in production."
  );
}

// Singleton pattern for serverless environments
const globalForDb = globalThis as unknown as {
  client: ReturnType<typeof postgres> | undefined;
  connectionString: string | undefined;
};

// Reset client if connection string changed (helps recover from circuit breaker)
const previousConnectionString = globalForDb.connectionString;
if (previousConnectionString && previousConnectionString !== connectionString) {
  console.log("[DB Client] Connection string changed, resetting client");
  if (globalForDb.client) {
    // Close connection asynchronously (don't await at module level)
    globalForDb.client.end({ timeout: 2 }).catch(() => {
      // Ignore errors when closing
    });
  }
  globalForDb.client = undefined;
}

// Create new client if needed or if connection string changed
const client =
  globalForDb.client && previousConnectionString === connectionString
    ? globalForDb.client
    : postgres(connectionString, {
        prepare: isDirectConnection, // Can use prepared statements with direct connection, but not with PgBouncer
        max: 1, // Limit connections per serverless instance
        idle_timeout: 20, // Close idle connections after 20 seconds
        connect_timeout: 5, // Connection timeout in seconds (reduced to fail fast)
        // Note: statement_timeout doesn't work with PgBouncer transaction mode
        // Supabase has a default statement timeout (~2-5 seconds)
        // If queries are slow, ensure indexes exist on frequently queried columns:
        // - users.role, users.access_tier, users.created_at
        // - Consider using EXPLAIN ANALYZE to identify slow queries
        onnotice: process.env.NODE_ENV === "development" ? console.log : undefined,
      });

if (process.env.NODE_ENV !== "production") {
  globalForDb.client = client;
  globalForDb.connectionString = connectionString;
}

export const db = drizzle({ client, schema });
