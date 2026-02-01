/**
 * GraphQL API Route
 *
 * Next.js App Router endpoint for GraphQL requests.
 * Uses GraphQL Yoga as the server implementation.
 *
 * Features:
 * - Supabase JWT authentication
 * - Per-request DataLoaders (N+1 prevention)
 * - Group context via X-Group-Id header
 * - GraphiQL playground in development
 *
 * @see /graphql/README.md for architecture documentation
 */

import { createYoga, createSchema } from "graphql-yoga";
import { typeDefs } from "@/graphql/schema";
import { resolvers } from "@/graphql/resolvers";
import { createLoaders } from "@/graphql/loaders";
import { authenticateRequest, getGroupMembership } from "@/graphql/utils/auth";
import { db } from "@/app/db/client";
import type { Context } from "@/graphql/utils/context";
import { v4 as uuidv4 } from "uuid";

/**
 * Create the GraphQL schema from SDL and resolvers
 */
const schema = createSchema({
  typeDefs,
  resolvers,
});

/**
 * Create GraphQL Yoga instance
 *
 * Yoga handles:
 * - Request parsing
 * - Schema execution
 * - Response formatting
 * - Error handling
 * - GraphiQL playground
 */
const yoga = createYoga({
  schema,
  graphqlEndpoint: "/api/graphql",

  // Enable GraphiQL in development
  graphiql: process.env.NODE_ENV === "development",

  // CORS configuration
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    credentials: true,
    methods: ["POST", "OPTIONS"],
  },

  /**
   * Context factory - runs for each request
   *
   * Creates fresh context with:
   * - Authenticated user (from Supabase JWT)
   * - Group context (from X-Group-Id header)
   * - Fresh DataLoaders (no cross-request caching)
   */
  context: async ({ request }): Promise<Context> => {
    const requestId = uuidv4();
    const startTime = Date.now();

    // Authenticate user
    const { user, userId } = await authenticateRequest();

    // Get group context from header
    const groupId = request.headers.get("X-Group-Id");

    // If group ID provided and user is authenticated, get membership
    let groupMembership = null;
    if (groupId && userId) {
      groupMembership = await getGroupMembership(userId, groupId);
    }

    // Log request (development only)
    if (process.env.NODE_ENV === "development") {
      console.log(`[GraphQL] Request ${requestId}`, {
        authenticated: !!user,
        userId: userId?.slice(0, 8),
        groupId: groupId?.slice(0, 8),
        hasGroupAccess: !!groupMembership,
      });
    }

    return {
      db,
      user,
      userId,
      groupId,
      groupMembership,
      loaders: createLoaders(),
      requestId,
    };
  },

  /**
   * Custom error formatting
   *
   * In production, hide internal error details.
   * Always include error code for client handling.
   */
  maskedErrors: {
    isDev: process.env.NODE_ENV === "development",
  },

  // Logging
  logging: process.env.NODE_ENV === "development" ? "debug" : "warn",
});

/**
 * Next.js App Router handlers
 *
 * Yoga handles both GET (GraphiQL) and POST (queries/mutations)
 */
export const GET = yoga;
export const POST = yoga;
export const OPTIONS = yoga;
