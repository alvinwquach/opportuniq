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
  connectionString.includes("/pooler") ||
  connectionString.includes("pooler.supabase.com");
const isDirectConnection = connectionString.includes(":5432") && !connectionString.includes(":6543");
const usesDirectHostname = connectionString.includes("db.") && connectionString.includes(".supabase.co:5432");

// Validate connection string and provide helpful warnings
if (usesDirectHostname && process.env.NODE_ENV === "production") {
  console.error(
    "[DB Client] ERROR: DATABASE_URL is using direct connection hostname in production!\n" +
    "Direct connections (db.*.supabase.co:5432) often fail with DNS errors in serverless environments.\n" +
    "You MUST use the pooled connection string instead:\n" +
    "  postgresql://postgres.rmeupfihxrqbnurieevp:[PASSWORD]@aws-0-us-west-2.pooler.supabase.com:6543/postgres\n" +
    "Get the correct connection string from: Supabase Dashboard → Settings → Database → Connection String → Pooled connection"
  );
}

if (isDirectConnection && process.env.NODE_ENV === "development") {
  console.log(
    "[DB Client] Using DIRECT connection (port 5432) for local development.\n" +
    "This bypasses PgBouncer pool limits, which is helpful for nano/micro tiers.\n" +
    "Production will still use pooled connection (port 6543)."
  );
} else if (!isPooledConnection && process.env.NODE_ENV === "production") {
  console.warn(
    "[DB Client] WARNING: DATABASE_URL may not be using Supabase pooled connection.\n" +
    "Pooled connections should include '?pgbouncer=true' or use port 6543 or hostname 'pooler.supabase.com'.\n" +
    "Direct connections (port 5432) can cause connection limits and DNS errors in production."
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
    // Use a positive timeout value to avoid negative timeout warnings
    const closeTimeout = Math.max(1, 2); // Ensure timeout is positive
    globalForDb.client.end({ timeout: closeTimeout }).catch(() => {
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

// Connection health check helper
export async function checkDatabaseConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    const startTime = Date.now();
    await client`SELECT 1`;
    const duration = Date.now() - startTime;
    
    if (duration > 2000) {
      return {
        success: false,
        error: `Database connection is slow (${duration}ms). Check your connection string and network.`,
      };
    }
    
    return { success: true };
  } catch (error: any) {
    // Check for circuit breaker or auth errors
    const errorMsg = error?.message || String(error);
    const errorCode = error?.code || error?.cause?.code;
    const errorHostname = error?.cause?.hostname;
    const isAuthError = 
      errorMsg.includes("authentication") ||
      errorMsg.includes("password") ||
      errorMsg.includes("Circuit breaker") ||
      error?.code === "28P01"; // PostgreSQL invalid password error code
    
    if (errorCode === "ENOTFOUND") {
      return {
        success: false,
        error: `DNS resolution failed: Cannot resolve hostname "${errorHostname || "unknown"}". ` +
               `This usually means:\n` +
               `1. The DATABASE_URL has an incorrect or outdated hostname\n` +
               `2. The Supabase project was deleted or paused\n` +
               `3. Network connectivity issues\n` +
               `4. You're using a direct connection (db.*.supabase.co) instead of pooled connection (pooler.supabase.com)\n` +
               `Please verify your DATABASE_URL in your environment variables. ` +
               `Get the correct connection string from Supabase Dashboard → Settings → Database → Connection String → Pooled connection.`,
      };
    }
    
    if (errorCode === "ECONNREFUSED" || errorCode === "ETIMEDOUT") {
      return {
        success: false,
        error: `Connection refused or timed out (${errorCode}). ` +
               `This usually means:\n` +
               `1. The database server is down or unreachable\n` +
               `2. Firewall or network restrictions are blocking the connection\n` +
               `3. The connection string has incorrect port or credentials\n` +
               `Please verify your DATABASE_URL and network connectivity.`,
      };
    }
    
    if (isAuthError) {
      return {
        success: false,
        error: `Authentication failed: ${errorMsg}. Please verify your DATABASE_URL credentials in .env. Get the correct connection string from Supabase Dashboard → Settings → Database → Connection String.`,
      };
    }
    
    return {
      success: false,
      error: errorMsg || "Failed to connect to database",
    };
  }
}

// Helper to reset connection (useful for recovering from circuit breaker)
export function resetDatabaseConnection() {
  if (globalForDb.client) {
    try {
      // Use a positive timeout value to avoid negative timeout warnings
      const closeTimeout = Math.max(1, 2); // Ensure timeout is positive
      globalForDb.client.end({ timeout: closeTimeout });
    } catch (e) {
      // Ignore errors
    }
  }
  globalForDb.client = undefined;
  globalForDb.connectionString = undefined;
  console.log("[DB Client] Connection reset - new client will be created on next query");
}
