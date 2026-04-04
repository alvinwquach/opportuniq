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

// Verify connection string format (only when connectionString is available)
const isPooledConnection = connectionString
  ? connectionString.includes("pgbouncer=true") ||
    connectionString.includes(":6543") ||
    connectionString.includes("/pooler")
  : false;
const isDirectConnection = connectionString
  ? connectionString.includes(":5432") && !connectionString.includes(":6543")
  : false;

if (connectionString) {
  if (isDirectConnection && process.env.NODE_ENV === "development") {
  } else if (!isPooledConnection && process.env.NODE_ENV === "production") {
    console.warn(
      "[DB Client] WARNING: DATABASE_URL may not be using Supabase pooled connection.\n" +
      "Pooled connections should include '?pgbouncer=true' or use port 6543.\n" +
      "Direct connections (port 5432) can cause connection limits in production."
    );
  }
}

// Create postgres client — throws at runtime (not build time) if DATABASE_URL is missing
const client = connectionString
  ? postgres(connectionString, {
      prepare: isDirectConnection,
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    })
  : (new Proxy({} as ReturnType<typeof postgres>, {
      get() {
        throw new Error(
          "DATABASE_URL is not set. Please ensure your .env file contains DATABASE_URL with the Supabase pooled connection string.\n" +
          "For local development, you can optionally set DATABASE_URL_DIRECT to use a direct connection (port 5432) to bypass pool limits."
        );
      },
    }) as ReturnType<typeof postgres>);

export const db = drizzle({ client, schema });
