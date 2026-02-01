/**
 * GraphQL Client
 *
 * Configured client for making GraphQL requests to our API.
 * Used by TanStack Query hooks for data fetching.
 *
 * Features:
 * - Automatic authentication (cookies)
 * - Group context header
 * - Type-safe request/response
 * - Error handling
 */

import { GraphQLClient } from "graphql-request";

/**
 * Get GraphQL endpoint URL
 * Must be absolute URL for graphql-request library
 */
function getGraphQLEndpoint(): string {
  // Server-side: use env var or default
  if (typeof window === "undefined") {
    return `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/graphql`;
  }

  // Client-side: construct from window.location
  return `${window.location.origin}/api/graphql`;
}

/**
 * Create a GraphQL client instance
 *
 * @param groupId - Optional group ID to include in requests
 * @returns Configured GraphQLClient
 *
 * @example
 * const client = createGraphQLClient();
 * const data = await client.request(MyQuery, { id: "123" });
 */
export function createGraphQLClient(groupId?: string): GraphQLClient {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Add group context if provided
  if (groupId) {
    headers["X-Group-Id"] = groupId;
  }

  return new GraphQLClient(getGraphQLEndpoint(), {
    headers,
    credentials: "include", // Include cookies for auth
  });
}

/**
 * Lazy-initialized default client instance
 * Created on first use to ensure window.location is available
 */
let _graphqlClient: GraphQLClient | null = null;

function getDefaultClient(): GraphQLClient {
  if (!_graphqlClient) {
    _graphqlClient = createGraphQLClient();
  }
  return _graphqlClient;
}

/**
 * Make a GraphQL request with automatic error handling
 *
 * @param document - GraphQL query/mutation document
 * @param variables - Query variables
 * @param groupId - Optional group context
 * @returns Response data
 *
 * @example
 * const user = await gqlRequest(MeQuery);
 * const group = await gqlRequest(GroupQuery, { id: "123" }, groupId);
 */
export async function gqlRequest<TData, TVariables extends object = object>(
  document: string,
  variables?: TVariables,
  groupId?: string
): Promise<TData> {
  const client = groupId ? createGraphQLClient(groupId) : getDefaultClient();

  try {
    return await client.request<TData>(document, variables);
  } catch (error: unknown) {
    // Log error in development
    if (process.env.NODE_ENV === "development") {
      console.error("[GraphQL Error]", error);
    }

    // Re-throw for React Query to handle
    throw error;
  }
}

/**
 * Type helper for GraphQL responses
 */
export type GraphQLResponse<T> = {
  data: T;
  errors?: Array<{
    message: string;
    path?: string[];
    extensions?: {
      code?: string;
      [key: string]: unknown;
    };
  }>;
};
