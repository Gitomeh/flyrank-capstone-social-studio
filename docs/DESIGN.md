# Social Media Studio - Design Document

## Problem Statement

The Social Media Studio solves the problem of converting a single blog post into platform-specific social media content, enabling human review and approval, durable scheduling, and reliable publishing through a clean adapter architecture.

## Architecture

### High-Level Flow

```
Blog Post → Store → Campaign → Generate Variants → Validate → Review → Schedule → Worker → Publish
```

### Architectural Principles

1. **Separation of Concerns**: Clear boundaries between HTTP layer, business logic, persistence, adapters, and scheduling
2. **Dependency Inversion**: Business logic depends on interfaces (SocialPublisher), not concrete implementations
3. **Idempotency**: All operations are designed to be safe to retry
4. **State Machine**: Controlled status transitions for variants
5. **Configuration-Driven**: Platform profiles and adapter selection via configuration

### Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        HTTP Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Controllers │→ │   Routes     │→ │  Validators  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      Business Logic                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Services    │→ │  Repositories│→ │   Schedulers │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                        Adapters                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Social    │  │   Telegram   │  │   Mock X     │      │
│  │  Publisher   │  │   Publisher  │  │   Publisher  │      │
│  │   (Interface)│  └──────────────┘  └──────────────┘      │
│  └──────────────┘  ┌──────────────┐                       │
│                    │  Mock        │                       │
│                    │  LinkedIn    │                       │
│                    │  Publisher   │                       │
│                    └──────────────┘                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      Infrastructure                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL  │  │    Redis     │  │   BullMQ     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Data Model

### Entity Relationships

```
BlogPost (1) ──── (1) Campaign (1) ──── (*) SocialVariant (1) ──── (*) PublishAttempt
```

### Schema Overview

**BlogPost**
- id: UUID (primary key)
- title: String
- body: Text
- url: String (optional)
- createdAt: DateTime
- updatedAt: DateTime

**Campaign**
- id: UUID (primary key)
- postId: UUID (foreign key to BlogPost)
- status: Enum (draft, active, completed)
- createdAt: DateTime
- updatedAt: DateTime

**SocialVariant**
- id: UUID (primary key)
- campaignId: UUID (foreign key to Campaign)
- platform: Enum (telegram, x, linkedin)
- content: Text
- status: Enum (draft, approved, rejected, scheduled, publishing, published, failed)
- scheduledFor: DateTime (optional)
- createdAt: DateTime
- updatedAt: DateTime

**PublishAttempt**
- id: UUID (primary key)
- variantId: UUID (foreign key to SocialVariant)
- platform: Enum
- idempotencyKey: String (unique constraint with variantId)
- status: Enum (started, success, failed, retrying)
- attemptNumber: Int
- externalPostId: String (optional)
- errorMessage: Text (optional)
- startedAt: DateTime
- completedAt: DateTime (optional)
- createdAt: DateTime

### Database Constraints

- Unique constraint on (variantId, idempotencyKey) for idempotency
- Foreign key constraints on all relationships
- Indexes on variantId for query performance

## API Surface

### Posts
- `POST /api/posts` - Ingest a blog post
- `GET /api/posts/:id` - Retrieve a blog post

### Campaigns
- `POST /api/campaigns` - Create a campaign from a post
- `GET /api/campaigns/:id` - Retrieve a campaign with variants

### Variants
- `GET /api/variants/:id` - Retrieve a variant
- `PATCH /api/variants/:id` - Edit a draft variant
- `POST /api/variants/:id/approve` - Approve a variant
- `POST /api/variants/:id/reject` - Reject a variant
- `POST /api/variants/:id/schedule` - Schedule an approved variant
- `GET /api/variants/:id/history` - Get publish history for a variant

### Campaign History
- `GET /api/campaigns/:id/history` - Get publish history for all variants in a campaign

### Health
- `GET /api/health` - Health check

## Platform Constraint Profiles

### X (Twitter)
- maxLength: 280 characters
- maxHashtags: 3
- tone: concise, punchy

### LinkedIn
- maxLength: 3000 characters
- maxHashtags: 10
- tone: professional, informative

### Telegram
- maxLength: 4096 characters
- maxHashtags: 5
- tone: clear, readable

## Explicit Non-Goals

- Real Instagram integration (optional feature)
- Real X/Twitter integration (mock only)
- Real LinkedIn integration (mock only)
- Analytics dashboards
- Social feeds
- Comments/likes systems
- Payment systems
- Complex frontend UI
- Unnecessary microservices

## Idempotency Strategy

### Idempotency Key Generation

```
idempotencyKey = `${variantId}_${scheduledFor.toISOString()}`
```

This ensures:
- Same variant + same scheduled time = same key
- Different scheduled times = different keys (allows rescheduling)
- Deterministic and reproducible

### Duplicate Prevention

1. Database unique constraint on (variantId, idempotencyKey)
2. Application-level check before publish attempt
3. Worker checks existing successful attempts before retry

## Scheduling Strategy

### BullMQ Implementation

- Job queue: `publish-queue`
- Job data: `{ variantId, scheduledFor }`
- Job options: `{ delay: scheduledFor - now }`
- Job deduplication: Based on variantId (only one scheduled job per variant)

### Worker Logic

1. Poll for due jobs
2. Find variant by ID
3. Check if already published (idempotency)
4. Create PublishAttempt record (status: started)
5. Get appropriate publisher via factory
6. Call publisher.publish()
7. Update PublishAttempt status (success/failed)
8. Update Variant status (published/failed)
9. Handle retries with exponential backoff

### Crash Recovery

On worker restart:
1. BullMQ queue preserves scheduled jobs (Redis-backed)
2. Worker checks for in-progress PublishAttempts
3. Completes or retries based on attempt status
4. Unique constraint prevents duplicate successful publications

## Review Workflow

### Status Transitions

```
draft → approved → scheduled → publishing → published
          ↓
        rejected
```

### Business Rules

- Only approved variants can be scheduled
- Draft variants can be edited
- After editing, must re-validate
- Rejected variants cannot be scheduled
- Scheduled variants cannot be edited
- Publishing status is set by worker only

## Security Approach

### Environment Variables

All secrets via environment variables:
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `ENCRYPTION_KEY` (for database credential encryption)

### Encryption at Rest

If storing platform credentials in database:
- Algorithm: AES-GCM
- Key: From ENCRYPTION_KEY environment variable
- IV/Nonce: Random per encryption, stored with ciphertext
- Never store plaintext credentials

### Logging

- Never log secrets
- Redact sensitive data from logs
- Structured logging with correlation IDs

## Adapter Architecture

### SocialPublisher Interface

```typescript
interface SocialPublisher {
  publish(input: PublishInput): Promise<PublishResult>;
}

interface PublishInput {
  content: string;
  platform: Platform;
  idempotencyKey: string;
}

interface PublishResult {
  success: boolean;
  externalPostId?: string;
  error?: string;
}
```

### Adapter Factory

```typescript
function getPublisher(platform: Platform): SocialPublisher {
  const config = {
    telegram: process.env.PUBLISHER_TELEGRAM || 'telegram',
    x: process.env.PUBLISHER_X || 'mock_x',
    linkedin: process.env.PUBLISHER_LINKEDIN || 'mock_linkedin',
  };

  const publisherType = config[platform];

  switch (publisherType) {
    case 'telegram':
      return new TelegramPublisher();
    case 'mock_x':
      return new MockXPublisher();
    case 'mock_linkedin':
      return new MockLinkedInPublisher();
    default:
      throw new Error(`Unknown publisher type: ${publisherType}`);
  }
}
```

### Configuration-Based Selection

Adapter selection controlled by environment variables:
- `PUBLISHER_TELEGRAM=telegram` (real) or `mock_x` (mock)
- `PUBLISHER_X=mock_x` (only mock available)
- `PUBLISHER_LINKEDIN=mock_linkedin` (only mock available)

Changing adapter requires only configuration change, no code modification.

## Technology Stack

- **Runtime**: Node.js with TypeScript
- **Web Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Queue/Cache**: Redis with BullMQ
- **Validation**: Zod
- **Testing**: Vitest
- **Containerization**: Docker Compose (PostgreSQL + Redis)
- **Configuration**: dotenv
- **Encryption**: native Node.js crypto (AES-GCM)
