import { NextResponse } from "next/server";
import { db, checkDatabaseConnection, resetDatabaseConnection } from "@/app/db/client";
import { users } from "@/app/db/schema";
import { sql } from "drizzle-orm";

/**
 * Diagnostic endpoint to test database connection
 * Access at: /admin/test-connection
 */
export async function GET() {
  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
  };

  // Test 1: Connection health check
  try {
    const start = Date.now();
    const health = await checkDatabaseConnection();
    const duration = Date.now() - start;
    results.healthCheck = {
      success: health.success,
      duration: `${duration}ms`,
      error: health.error,
    };
    
    // If circuit breaker error, suggest reset
    if (health.error?.includes("Circuit breaker") || health.error?.includes("authentication")) {
      results.suggestion = "Try resetting the connection or verify your DATABASE_URL credentials";
      results.resetAvailable = true;
    }
  } catch (error: any) {
    results.healthCheck = {
      success: false,
      error: error.message,
      code: error.code,
    };
  }

  // Test 2: Simple SELECT 1
  try {
    const start = Date.now();
    await db.execute(sql`SELECT 1`);
    const duration = Date.now() - start;
    results.simpleQuery = {
      success: true,
      duration: `${duration}ms`,
    };
  } catch (error: any) {
    results.simpleQuery = {
      success: false,
      error: error.message,
      code: error.code,
    };
  }

  // Test 3: COUNT users
  try {
    const start = Date.now();
    const result = await db.execute(sql`SELECT COUNT(*) as count FROM users`);
    const duration = Date.now() - start;
    results.countUsers = {
      success: true,
      duration: `${duration}ms`,
      count: (result as any)?.rows?.[0]?.count || (result as any)?.[0]?.count,
    };
  } catch (error: any) {
    results.countUsers = {
      success: false,
      error: error.message,
      code: error.code,
    };
  }

  // Test 4: Connection string info (sanitized)
  const connectionString = 
    (process.env.NODE_ENV === "development" && process.env.DATABASE_URL_DIRECT) 
      ? process.env.DATABASE_URL_DIRECT 
      : process.env.DATABASE_URL || "NOT SET";
  const isPooled = connectionString.includes("6543") || connectionString.includes("pgbouncer=true");
  const isDirect = connectionString.includes(":5432") && !connectionString.includes(":6543");
  
  // Sanitize connection string for display
  const sanitized = connectionString !== "NOT SET" 
    ? connectionString.replace(/:([^:@]+)@/, ":***@") 
    : "NOT SET";
  
  results.connectionInfo = {
    hasConnectionString: connectionString !== "NOT SET",
    isPooled: isPooled,
    isDirect: isDirect,
    port: connectionString.includes(":6543") ? "6543 (pooled)" : connectionString.includes(":5432") ? "5432 (direct)" : "unknown",
    hasPgbouncer: connectionString.includes("pgbouncer=true"),
    connectionString: sanitized,
    usingDirect: process.env.NODE_ENV === "development" && !!process.env.DATABASE_URL_DIRECT,
  };

  // Add troubleshooting tips
  if (!results.healthCheck.success) {
    results.troubleshooting = {
      step1: "Verify your connection string in Supabase Dashboard → Settings → Database → Connection String",
      step2: isDirect 
        ? "For direct connection (port 5432), ensure you're using the 'Direct connection' string from Supabase"
        : "For pooled connection (port 6543), ensure you're using the 'Connection pooling' string with ?pgbouncer=true",
      step3: "Check that your database password is correct (you can reset it in Supabase Dashboard)",
      step4: "If you see 'Circuit breaker' errors, wait 1-2 minutes for it to reset, or restart your dev server",
      step5: "For local dev on nano/micro tiers, consider using DATABASE_URL_DIRECT in .env.local to bypass pool limits",
    };
  }

  return NextResponse.json(results, { status: 200 });
}

// POST endpoint to reset connection
export async function POST() {
  try {
    resetDatabaseConnection();
    return NextResponse.json({ 
      success: true, 
      message: "Connection reset. New connection will be created on next query." 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

