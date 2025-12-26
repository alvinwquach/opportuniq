/**
 * GraphQL Schema for OpportuniQ
 *
 * This file combines all domain schemas into a single schema.
 *
 * Organization:
 * - enums.ts       - All enums (shared across domains)
 * - scalars.ts     - Custom scalar types (JSON)
 * - user.ts        - User accounts and personal finances
 * - group.ts       - Groups, members, and shared expenses
 * - issue.ts       - Issue tracking, evidence, comments
 * - decision.ts    - AI recommendations, options, voting
 * - outcome.ts     - Repair outcomes and learning
 * - guide.ts       - DIY guides and progress tracking
 *
 * IMPORTANT GRAPHQL SYNTAX GUIDE:
 *
 * Type definitions:
 *   type User { ... }           = An object with fields
 *   enum Status { ... }         = A fixed set of allowed values
 *   input CreateUser { ... }    = Data structure for mutations (like function parameters)
 *   scalar JSON                 = Custom data type (for flexible/complex data)
 *
 * Field nullability (the "!" symbol):
 *   name: String!               = REQUIRED string, cannot be null
 *   name: String                = OPTIONAL string, can be null
 *   tags: [String!]!            = REQUIRED array of REQUIRED strings (array can't be null, items can't be null)
 *   tags: [String!]             = OPTIONAL array of REQUIRED strings (array can be null, but if present, items can't be null)
 *   tags: [String]!             = REQUIRED array of OPTIONAL strings (array can't be null, but items can be null)
 *   tags: [String]              = OPTIONAL array of OPTIONAL strings (both can be null)
 *
 * Special types:
 *   ID!                         = Unique identifier (usually a string or number)
 *   String!                     = Text
 *   Int!                        = Whole number (e.g., 42)
 *   Float!                      = Decimal number (e.g., 3.14)
 *   Boolean!                    = true or false
 *   JSON                        = Any valid JSON (objects, arrays, etc.)
 *
 * Relationships:
 *   group: Group!               = A single related object
 *   members: [User!]!           = A list of related objects
 *
 * How to read this schema:
 * 1. Look at "type Query" to see what data you can READ
 * 2. Look at "type Mutation" to see what data you can CREATE/UPDATE/DELETE
 * 3. Look at individual types to see what fields they have
 */

import { enumTypeDefs } from './enums';
import { scalarTypeDefs } from './scalars';
import { userTypeDefs } from './user';
import { groupTypeDefs } from './group';
import { issueTypeDefs } from './issue';
import { decisionTypeDefs } from './decision';
import { outcomeTypeDefs } from './outcome';
import { guideTypeDefs } from './guide';

// Base Query and Mutation types
// These are extended by each domain schema file
const baseTypeDefs = /* GraphQL */ `
  type Query {
    _empty: String  # Placeholder - extended by domain schemas
  }

  type Mutation {
    _empty: String  # Placeholder - extended by domain schemas
  }
`;

// Combine all schemas
export const typeDefs = [
  baseTypeDefs,
  scalarTypeDefs,
  enumTypeDefs,
  userTypeDefs,
  groupTypeDefs,
  issueTypeDefs,
  decisionTypeDefs,
  outcomeTypeDefs,
  guideTypeDefs,
];
