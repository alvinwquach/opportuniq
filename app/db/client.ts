import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Create a single postgres client for Drizzle
// This uses the DIRECT_URL from your .env (bypassing Supabase connection pooler)
const connectionString = process.env.DIRECT_URL!;

// Disable prefetch for Vercel compatibility
const client = postgres(connectionString, { prepare: false });

export const db = drizzle({ client, schema });
