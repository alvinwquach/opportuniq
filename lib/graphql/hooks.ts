/**
 * GraphQL Hooks
 *
 * Re-exports all hooks from the modular hooks directory.
 * This file maintains backward compatibility with existing imports.
 *
 * For new code, prefer importing directly from the domain modules:
 * @example
 * import { useMe } from "@/lib/graphql/hooks/user";
 * import { useMyGroups } from "@/lib/graphql/hooks/group";
 *
 * Or use the barrel export:
 * @example
 * import { useMe, useMyGroups } from "@/lib/graphql/hooks";
 */

// Re-export all hooks
export * from "./hooks/index";

// Re-export query keys and types
export { queryKeys } from "./keys";
export * from "./types";
