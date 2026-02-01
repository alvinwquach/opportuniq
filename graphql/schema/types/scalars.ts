/**
 * GraphQL Scalar Type Definitions
 */

export const scalarTypes = /* GraphQL */ `
  """
  ISO 8601 datetime string (e.g., "2025-01-29T12:00:00Z")
  """
  scalar DateTime

  """
  Arbitrary JSON object (use sparingly, prefer typed fields)
  """
  scalar JSON

  """
  Marks a field or query as admin-only.
  Authorization is enforced in resolvers.
  """
  directive @adminOnly on FIELD_DEFINITION
`;
