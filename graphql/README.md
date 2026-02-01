# OpportunIQ GraphQL API

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT                                         │
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │
│  │   urql Client   │    │  React Query    │    │   Mobile App    │        │
│  │   (GraphQL)     │    │  (REST/Chat)    │    │   (Future)      │        │
│  └────────┬────────┘    └────────┬────────┘    └────────┬────────┘        │
└───────────┼──────────────────────┼──────────────────────┼─────────────────┘
            │                      │                      │
            ▼                      ▼                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                           NEXT.JS API LAYER                               │
│                                                                           │
│  ┌─────────────────────────┐    ┌─────────────────────────────────────┐  │
│  │    /api/graphql         │    │    /api/chat (REST)                 │  │
│  │                         │    │                                     │  │
│  │  • Data queries         │    │  • AI diagnosis streaming           │  │
│  │  • CRUD mutations       │    │  • Tool calling (12-step max)       │  │
│  │  • Subscriptions (WS)   │    │  • Image/video/audio processing     │  │
│  │                         │    │  • Vercel AI SDK integration        │  │
│  └───────────┬─────────────┘    └─────────────────────────────────────┘  │
│              │                                                            │
│              ▼                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                      GraphQL Yoga Server                            │ │
│  │                                                                     │ │
│  │  schema/          resolvers/         loaders/         utils/        │ │
│  │  ├── typeDefs.ts  ├── index.ts       ├── index.ts     ├── auth.ts   │ │
│  │  └── (SDL)        ├── Query.ts       └── (DataLoader) └── errors.ts │ │
│  │                   ├── Mutation.ts                                   │ │
│  │                   └── types/                                        │ │
│  └───────────┬─────────────────────────────────────────────────────────┘ │
└──────────────┼────────────────────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                           DATA LAYER                                      │
│                                                                           │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐      │
│  │   Drizzle ORM   │    │    Supabase     │    │   External APIs │      │
│  │   (PostgreSQL)  │    │   (Auth/Storage)│    │   (Firecrawl)   │      │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘      │
└──────────────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
graphql/
├── README.md                 # This file
├── schema/
│   ├── typeDefs.ts          # All GraphQL SDL type definitions
│   └── index.ts             # Schema exports
├── resolvers/
│   ├── index.ts             # Resolver map assembly
│   ├── Query.ts             # Root query resolvers
│   ├── Mutation.ts          # Root mutation resolvers
│   └── types/               # Type-specific field resolvers
│       ├── User.ts
│       ├── Group.ts
│       ├── Issue.ts
│       ├── Decision.ts
│       └── Guide.ts
├── loaders/
│   └── index.ts             # DataLoader factory (N+1 prevention)
├── utils/
│   ├── auth.ts              # Authentication helpers
│   ├── errors.ts            # Custom GraphQL errors
│   └── context.ts           # Context type definitions
└── generated/
    └── types.ts             # (Optional) Generated TS types from SDL
```

## Why GraphQL + REST Hybrid?

### Use GraphQL For:
- **Data fetching** - Nested queries (group → issues → decisions)
- **CRUD operations** - Create/update/delete via mutations
- **Real-time** - Subscriptions for group activity (future)
- **Type safety** - Schema serves as contract

### Keep REST For:
- **AI Chat** (`/api/chat`) - Streaming SSE responses, Vercel AI SDK
- **File uploads** - Binary data handling
- **Webhooks** - External service integrations

## Authentication Flow

```
1. Client sends request with Authorization header (Supabase JWT)
2. GraphQL context extracts and validates token
3. Context includes: user, userId, groupId (from header), groupMembership
4. Resolvers check authorization via context
```

## DataLoader Pattern (N+1 Prevention)

Without DataLoader:
```
Query: 10 issues, each needs group → 11 database queries
```

With DataLoader:
```
Query: 10 issues, batch load groups → 2 database queries
```

Each request gets fresh loader instances (no data leaking between users).

## Error Handling

```typescript
// Custom error codes
UNAUTHENTICATED     - Not logged in
FORBIDDEN           - Logged in but no permission
NOT_FOUND           - Resource doesn't exist
VALIDATION_ERROR    - Invalid input
INTERNAL_ERROR      - Server error (logged, not exposed)
```

## Adding New Types/Resolvers

1. Add SDL types to `schema/typeDefs.ts`
2. Create resolver file in `resolvers/types/`
3. Add to resolver map in `resolvers/index.ts`
4. Add DataLoader if needed in `loaders/index.ts`

## Local Development

```bash
# Start dev server
npm run dev

# GraphQL Playground available at:
http://localhost:3000/api/graphql

# Example query
query {
  me {
    id
    email
    groups {
      name
      issueCount
    }
  }
}
```

## Performance Considerations

1. **DataLoaders** - Always use for relations
2. **Query complexity** - Consider adding depth/complexity limits
3. **Pagination** - Use cursor-based for large lists
4. **Caching** - urql normalized cache on client
5. **Persisted queries** - Consider for production (reduces payload)
