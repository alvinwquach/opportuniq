import { GraphQLClient } from "graphql-request";

// GraphQL client for making requests to our API
export const graphqlClient = new GraphQLClient("/api/graphql", {
  // Automatically include credentials (cookies for auth)
  credentials: "include",
  // Add common headers
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper function for authenticated requests
export async function graphqlRequest<T = unknown>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  try {
    return await graphqlClient.request<T>(query, variables);
  } catch (error) {
    console.error("GraphQL request failed:", error);
    throw error;
  }
}
