# OpportunIQ

AI-powered diagnostic assistant for home and auto repairs. Take a photo of something broken, describe the issue, or record a video — the AI diagnoses the problem, assesses severity, pulls real cost estimates, finds local contractors, searches community experiences, checks safety recalls, finds rebates, and drafts a quote request email you can send through Gmail. All in one conversation.

## How It Works

A user opens the chat and shares their problem — a photo of a ceiling stain, a video of a car engine noise, a voice message in Spanish, or a text description. The AI analyzes the input using GPT-4o (vision + audio), then autonomously decides which tools to call and in what order. A typical diagnosis chains 3–5 tool calls in a single response:

1. **Diagnose** — identifies the issue, assesses severity (minor / moderate / urgent / emergency), determines if it's safe, and recommends DIY vs professional
2. **Price** — pulls real cost estimates from HomeAdvisor and Angi via Firecrawl JSON extraction, cached for 7 days
3. **Find help** — searches for rated contractors near the user's zip code using a Yelp → Foursquare → Firecrawl fallback chain
4. **Research** — finds Reddit threads where real people had the same issue, what they paid, and what they recommend
5. **Protect** — checks CPSC and NHTSA for product and vehicle safety recalls
6. **Save money** — finds utility rebates and federal tax credits for energy upgrades
7. **Take action** — drafts a professional quote request email and sends it through the user's Gmail

The model can chain up to 12 autonomous steps per response. After the diagnosis, users report what contractors actually quoted and what the repair ultimately cost. Those outcomes feed back into PgVector embeddings so future diagnoses are grounded in real user data — not just scraped averages.

Data is sourced from 12 live integrations: HomeAdvisor, Angi, Home Depot, Reddit, YouTube, iFixit, Stack Exchange, Instructables, Yelp, Foursquare, CPSC, and NHTSA.

## Features

### AI Diagnosis

- Multi-modal input: text, photos (GPT-4o vision), video (frame extraction via FFmpeg + audio analysis via gpt-4o-audio-preview), and voice (Google Cloud Speech-to-Text with 40+ language support)
- 12 autonomous chat tools: cost estimates, contractor search, product search, Reddit community search, safety recall checks, utility rebates, RFQ email drafting, calendar reminders, inventory checks, product reviews, tutorial finder, and permit lookup
- 604-line dynamic system prompt with conditional sections: language instructions, property age warnings (asbestos for pre-1980, lead paint for pre-1978), RAG context injection, and prompt A/B testing via feature flags
- Severity assessment: minor, moderate, urgent, emergency with PPE recommendations
- DIY feasibility rating: recommended, possible with experience, not recommended, dangerous

### RAG Pipeline

- PgVector embeddings (1536 dimensions via text-embedding-3-small) of completed diagnoses with user-reported outcomes
- Cosine similarity retrieval filtered by region (first 3 digits of zip code)
- Context injection into system prompt: "Based on 12 similar cases in your area: 8 hired a pro ($400–$700), 4 did DIY ($80–$200)"
- Background embedding via Inngest with automatic retry when OpenAI is unavailable

### Web Data (Firecrawl)

- 14 of 18 Firecrawl features integrated: search, JSON extraction (schema + prompt), map, batch scrape, interact, enhanced mode, images, actions, webhooks, change tracking, location, maxAge caching, summary format
- JSON extraction with typed schemas replaces brittle regex parsing for cost data and contractor information
- maxAge caching (7-day for cost guides, 1-day for products) saves 30–40% of the 100K monthly credit budget
- Feature flags control rollout of every Firecrawl feature independently

### Quality Assurance

- **Langfuse tracing**: every conversation traced end-to-end — prompt, tool calls with inputs/outputs, token usage, latency
- **Output guardrails**: post-response checks flag hallucinated costs (dollar amounts without a cost tool call), missing safety warnings (electrical work without breaker warning), asbestos/lead paint omissions for older homes, and dangerous DIY recommendations (gas line, asbestos removal)
- **Eval pipeline**: nightly cron measuring hallucination rate, tool failure rates per tool, and cost accuracy against user-reported actuals
- **Structured output**: DiagnosisOutputSchema (Zod) for consistent machine-readable extraction alongside natural language responses

### Contractor & Email Pipeline

- Contractor search with automatic fallback: Yelp Fusion API → Foursquare Places API → Firecrawl web scraping
- RFQ email drafting with issue summary, cost range, and contractor name
- Gmail OAuth integration: send emails directly from the user's Gmail account
- Resend webhook tracking: delivery, open, click, and bounce status on every sent email
- Google Calendar reminders for deferred repairs

### Household Collaboration

- Groups (households) with role-based membership: admin, member
- Member invitations with email delivery, acceptance/decline, and audit logging
- Decision framework: create decision options (DIY, hire professional, defer, replace), run simulations, vote (approve/reject/abstain), finalize with winning option
- Outcome tracking: record actual cost, time, and success after resolution with cost delta calculation (predicted vs actual)
- Shared group expenses, budget contributions, and expense categories

### Financial Tracking

- Income streams with frequency (weekly, bi-weekly, monthly, quarterly, annual) and monthly normalization
- Expense tracking with categories
- Budget management with utilization calculations and overage alerts
- All financial data supports encryption

### Issue Tracking

- Issue lifecycle: create → add evidence (photos, notes) → hypotheses → comments → decision → outcome
- Activity log tracking all changes
- DIY scheduling with calendar integration
- Vendor contacts linked to issues

### DIY Guides

- Aggregated from 5+ sources: iFixit, YouTube, Stack Exchange, Family Handyman, Instructables
- Firecrawl-powered scraping with structured data extraction
- Guide progress tracking, bookmarks, and helpful ratings
- Step-by-step instructions with difficulty assessment

### Encryption

- AES-GCM-256 symmetric encryption for sensitive data
- Per-user encryption keys with per-conversation keys
- Encrypted attachments with random IV per encryption
- Household key sharing via member key shares table
- Encryption support for issues, comments, evidence, hypotheses, financial data, profile, and location

### Email System

- 28 React Email templates: welcome, magic link, group invitations, decision notifications, issue alerts, referral conversions, waitlist confirmations, abandoned onboarding, marketing campaigns, and more
- Resend integration organized by domain: auth, groups, invites, marketing, notifications, RFQ
- Webhook-based delivery tracking

### Admin Panel

- AI usage dashboard: token consumption, cost tracking, tool call distribution, model usage
- User management with growth analytics
- Waitlist management
- Referral tracking with conversion metrics
- Invite management (alpha, beta, bulk)
- Support chat with real-time messaging
- Case studies and pitch deck pages
- Analytics: user growth charts, waitlist growth, country distribution, engagement metrics

### Growth Features

- Waitlist with email confirmation
- Referral system with unique codes, tracking, and conversion emails
- Alpha/beta invite system with validation
- Onboarding flow with profile setup, location, and preferences

### Additional Integrations

- Weather data via Open-Meteo (free, no API key) for outdoor work scheduling
- Geocoding via Mapbox for zip-to-coordinates conversion with database caching
- Google Maps for location services
- Purchase tracking with payment transactions, approvals, and refunds (schema ready)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript (strict), Tailwind CSS, Radix UI |
| Animations | GSAP Club (SplitText, ScrambleText, MorphSVG, DrawSVG, Observer, Flip), Three.js, Recharts, D3 (charts) |
| Backend | Next.js App Router, Server Actions, REST API routes |
| Database | PostgreSQL on Neon, Drizzle ORM, PgVector, 84 tables |
| AI | GPT-4o (vision + audio), text-embedding-3-small, Vercel AI SDK |
| Web Scraping | Firecrawl (14 features), Yelp Fusion, Foursquare Places |
| Voice | Google Cloud Speech-to-Text, Google Cloud Text-to-Speech |
| Video | FFmpeg (WASM), gpt-4o-audio-preview |
| Email | Resend (28 templates), React Email, Gmail OAuth |
| Calendar | Google Calendar API |
| Maps | Mapbox GL, Google Maps Geocoding |
| Observability | Sentry (errors), Langfuse (LLM traces), PostHog (analytics + feature flags) |
| Rate Limiting | Upstash Redis (@upstash/ratelimit) |
| Infrastructure | Vercel, Supabase, GitHub Actions CI/CD |

## Project Structure

```
app/
├── api/                    # 34 REST API routes
│   ├── chat/               # AI chat with 12 tools
│   │   └── tools/          # Tool implementations
│   ├── gmail/              # OAuth connect, send, status
│   ├── google-calendar/    # OAuth connect, events
│   ├── voice/              # Transcribe, synthesize, translate
│   ├── video/              # Frame extraction, audio analysis
│   ├── webhooks/           # Firecrawl, Resend, Sentry
│   ├── cron/               # Eval pipeline, abandoned onboarding
│   └── ...                 # Quotes, outcomes, invites, waitlist, admin
├── actions/                # 89 server action files
│   ├── dashboard/          # Page data (replaced GraphQL)
│   ├── issues/             # Issue CRUD + evidence, hypotheses, comments
│   ├── decisions/          # Decision options, voting, simulations
│   ├── groups/             # Group actions
│   ├── finance/            # Financial operations
│   └── ...
├── dashboard/              # 18 dashboard pages
├── admin/                  # 13 admin pages
├── auth/                   # Authentication pages
├── onboarding/             # Onboarding flow
└── db/schema/              # 84 Drizzle schema tables

lib/
├── integrations/           # Firecrawl, Yelp, Foursquare, cost scraper, weather
├── eval/                   # Hallucination detector, tool failure tracker, accuracy
├── prompts/                # 604-line dynamic system prompt
├── encryption/             # AES-GCM-256 client encryption
├── gmail/                  # Gmail OAuth client
├── google-calendar/        # Google Calendar client
├── resend/                 # 8 email modules (auth, groups, invites, marketing, etc.)
├── posthog/                # Analytics client + server
├── guardrails.ts           # Output safety checks
├── langfuse.ts             # LLM tracing
├── embeddings.ts           # PgVector embedding generation + similarity search
├── rag-context.ts          # RAG context builder for diagnosis prompt
├── rate-limiter.ts         # Upstash Redis rate limiting
├── firecrawl-limiter.ts    # Credit tracking + concurrency semaphore
├── feature-flags.ts        # PostHog feature flag wrappers
└── geocoding.ts            # Mapbox geocoding with DB cache

hooks/                      # 32 React hooks
├── encrypted-financials/   # Encryption hooks for financial data
├── encrypted-issues/       # Encryption hooks for issue data
├── useChatStream.ts        # AI chat streaming
├── useVoiceRecording.ts    # Voice input
├── useVideoProcessing.ts   # Video processing
└── ...

emails/                     # 28 React Email templates
components/                 # 273 React components
├── landing/                # Landing page with Three.js + GSAP animations
└── ...

__tests__/                  # 94 test files, 942 test cases
e2e/                        # 11 Playwright E2E specs
.github/workflows/          # 3 CI/CD workflows
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- Supabase account (PostgreSQL + Auth)
- OpenAI API key
- Firecrawl API key

### Setup

```bash
git clone https://github.com/alvinwquach/opportuniq.git
cd opportuniq
npm install
cp .env.example .env
# Fill in your environment variables
npm run db:push    # Apply schema to database
npm run dev        # Start development server
```

### Environment Variables

See `.env.example` for the complete list. Key variables:

- `DATABASE_URL` — Neon pooled Postgres connection
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase auth
- `OPENAI_API_KEY` — GPT-4o and embeddings
- `FIRECRAWL_API_KEY` — Web scraping (100K credits/month)
- `NEXT_PUBLIC_POSTHOG_KEY` — Analytics and feature flags
- `SENTRY_DSN` — Error monitoring
- `LANGFUSE_PUBLIC_KEY` / `LANGFUSE_SECRET_KEY` — LLM tracing
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — Rate limiting
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Gmail and Calendar OAuth
- `RESEND_API_KEY` — Transactional email

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |
| `npm test` | Run Jest test suite |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run validate` | Run typecheck + lint + test |
| `npm run db:generate` | Generate Drizzle migration |
| `npm run db:migrate` | Apply migrations |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Drizzle Studio |

## CI/CD

GitHub Actions runs on every push and PR:

1. **Typecheck, lint, test, build** run in parallel
2. **Auto-merge** squashes and merges PRs when all checks pass
3. **Vercel auto-deploys** from main
4. **Post-deploy observability gate** waits 120 seconds, then checks homepage health and queries Sentry for new errors
5. **Discord alert** on any failure

Feature flags via PostHog control all AI changes independently of deploys. Current flags: `firecrawl-search-v2`, `firecrawl-json-extraction`, `firecrawl-interact`, `firecrawl-enhanced-mode`, `rag-enabled`, `prompt-variant`.

## Architecture

The core of OpportunIQ is a 12-step agentic loop. When a user sends a message, GPT-4o analyzes the input and autonomously chains tool calls — each step is one model inference with an optional tool invocation. The loop uses Vercel AI SDK's `streamText` with `toolChoice: "auto"` and `stopWhen: stepCountIs(12)`.

The system prompt is assembled dynamically from conditional sections: language instructions (if non-English), core identity, structured user context, RAG context (if the `rag-enabled` flag is on and similar past cases exist), tool usage rules, response format, legacy home safety warnings (if the property was built before 1980), and grounding rules (with prompt A/B testing via the `prompt-variant` flag).

After every response, output guardrails check for hallucinated costs, missing safety warnings, and dangerous DIY recommendations. Langfuse traces the full conversation. The nightly eval cron measures hallucination rate, tool failure rates, and cost accuracy against user-reported actuals.

The data flywheel: diagnose → user contacts contractor → user reports actual quote → user records outcome → Inngest embeds diagnosis + outcome into PgVector → future diagnoses retrieve similar past cases → AI responses grounded in real user data.

## License

MIT