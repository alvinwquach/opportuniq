/**
 * Custom GraphQL Scalars
 *
 * Scalars are primitive data types in GraphQL.
 * GraphQL has 5 built-in scalars: String, Int, Float, Boolean, ID
 * We define custom scalars for complex data types.
 */

export const scalarTypeDefs = /* GraphQL */ `
  # ============================================
  # CUSTOM SCALARS
  # ============================================

  # JSON scalar - for flexible, unstructured data
  # Use for fields that can contain:
  # - Objects: { key: "value", nested: { data: true } }
  # - Arrays: ["item1", "item2", "item3"]
  # - Mixed types: { tags: ["tag1", "tag2"], meta: { count: 5 } }
  #
  # Examples in OpportuniQ:
  # - assetDetails: { vin: "...", mileage: 85000, year: 2018 }
  # - extractedInfo: { objects: ["mold", "stain"], colors: ["black"] }
  # - contactInfo: { phone: "555-1234", email: "...", address: "..." }
  # - participants: ["user-id-1", "user-id-2"]
  #
  # Note: JSON fields are flexible but less type-safe.
  # Use sparingly - prefer structured types when possible.
  scalar JSON
`;
