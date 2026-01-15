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

// Create postgres client with appropriate settings
const client = postgres(connectionString, {
  prepare: isDirectConnection,
  max: 10, // Allow more connections
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle({ client, schema });
