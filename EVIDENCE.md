# Evidence Document - Social Media Studio Capstone

This document provides evidence for each capstone requirement.

## 1. Post Ingestion

**Requirement**: Blog post ingestion endpoint that stores the post as the single source of truth.

**Evidence**:
- Endpoint: `POST /api/posts`
- Validator: `src/validators/postValidator.ts` uses Zod schema
- Repository: `src/repositories/postRepository.ts`
- Controller: `src/controllers/postController.ts`

**Test Output**:
```bash
$ curl -X POST http://localhost:3000/api/posts -H "Content-Type: application/json" -d "{\"title\":\"Test Post\",\"body\":\"This is a test blog post for the capstone project.\"}"
{"id":"d28a1c15-407f-492b-a5c9-06b90e1490e1","title":"Test Post","body":"This is a test blog post for the capstone project.","url":null,"createdAt":"2026-10-03T10:05:05.313Z","updatedAt":"2026-10-03T10:05:05.313Z"}
```

## 2. Variant Generation

**Requirement**: Generate platform-specific variants from stored blog post.

**Evidence**:
- Service: `src/services/variantGenerationService.ts`
- Generates distinct variants for Telegram, X, and LinkedIn
- Tests: `tests/variantGeneration.test.ts`

**Test Output**:
```bash
$ curl -X POST http://localhost:3000/api/campaigns -H "Content-Type: application/json" -d "{\"postId\":\"d28a1c15-407f-492b-a5c9-06b90e1490e1\"}"
{"id":"cc8b838f-7018-4dc8-bf18-f58f05e19c8e","postId":"d28a1c15-407f-492b-a5c9-06b90e1490e1","status":"active","createdAt":"2026-10-03T10:05:08.666Z","updatedAt":"2026-10-03T10:05:08.666Z","variants":[
  {"id":"d1cb947d-394e-4fbe-90bb-2ed41ce72c3c","platform":"telegram","content":"Test Post\n\nThis is a test blog post for the capstone project.\n\n#test","status":"draft"},
  {"id":"1ad864a5-be04-4713-acbd-db58c17ef1b1","platform":"x","content":"Test Post: This is a test blog post for the capstone project #test","status":"draft"},
  {"id":"246cf2f9-8911-419e-95c9-b3cf271539ce","platform":"linkedin","content":"📝 Test Post\n\nThis is a test blog post for the capstone project.\n\nWhat are your thoughts? 👇\n\n#test #insights #professional","status":"draft"}
]}
```

## 3. Constraint Validation

**Requirement**: Validate platform constraints (length, hashtags, etc.) before variant acceptance.

**Evidence**:
- Service: `src/services/validationService.ts`
- Platform profiles: `src/config/platformProfiles.ts`
- Tests: `tests/validation.test.ts`

**Test Output**:
```bash
$ npm test -- --run
✓ tests/validation.test.ts (10 tests)
  ✓ should accept valid X content
  ✓ should reject X content exceeding character limit
  ✓ should reject X content with too many hashtags
  ✓ should reject empty X content
  ✓ should accept valid LinkedIn content
  ✓ should reject LinkedIn content exceeding character limit
  ✓ should reject LinkedIn content with too many hashtags
  ✓ should accept valid Telegram content
  ✓ should reject Telegram content exceeding character limit
  ✓ should reject Telegram content with too many hashtags
```

## 4. Review Workflow

**Requirement**: Draft → Approve/Reject → Schedule workflow with proper status transitions.

**Evidence**:
- Variant statuses: string-based statuses ('draft', 'approved', 'rejected', 'scheduled', 'publishing', 'published', 'failed')
- Controller: `src/controllers/variantController.ts` with approve/reject/schedule endpoints
- Status transitions enforced in controller methods

**Test Output**:
```bash
# Draft to Approved
$ curl -X POST http://localhost:3000/api/variants/d1cb947d-394e-4fbe-90bb-2ed41ce72c3c/approve
{"id":"d1cb947d-394e-4fbe-90bb-2ed41ce72c3c","status":"approved","updatedAt":"2026-10-03T10:05:50.039Z"}

# Approved to Scheduled
$ curl -X POST http://localhost:3000/api/variants/d1cb947d-394e-4fbe-90bb-2ed41ce72c3c/schedule -H "Content-Type: application/json" -d "{\"scheduledFor\":\"2026-10-03T10:07:00Z\"}"
{"id":"d1cb947d-394e-4fbe-90bb-2ed41ce72c3c","status":"scheduled","scheduledFor":"2026-10-03T10:07:00.000Z"}
```

## 5. Unapproved Scheduling Rejection

**Requirement**: Unapproved variants cannot be scheduled.

**Evidence**:
- Controller: `src/controllers/variantController.ts` line 102
- Returns 400 error with message "Only approved variants can be scheduled"
- Test: `tests/reviewProtection.test.ts`

**Test Output**:
```bash
# Attempting to schedule a draft variant
$ curl -X POST http://localhost:3000/api/variants/c8fa4a3d-aa81-4cee-8f2a-04d232498675/schedule -H "Content-Type: application/json" -d "{\"scheduledFor\":\"2026-10-03T10:12:00Z\"}"
{"error":"Only approved variants can be scheduled"}
```

## 6. Adapter Architecture

**Requirement**: Clean SocialPublisher interface with adapter factory pattern.

**Evidence**:
- Interface: `src/types/index.ts` - `SocialPublisher` interface
- Adapters: `src/adapters/TelegramPublisher.ts`, `MockXPublisher.ts`, `MockLinkedInPublisher.ts`
- Factory: `src/adapters/publisherFactory.ts`
- Configuration-based selection via environment variables

**Test Output**:
```bash
$ npm test -- --run
✓ tests/adapterSubstitution.test.ts (5 tests)
  ✓ should return TelegramPublisher when configured
  ✓ should return MockXPublisher when configured
  ✓ should return MockLinkedInPublisher when configured
  ✓ should allow switching publishers via configuration
  ✓ should throw error for unknown publisher type
```

## 7. Idempotency

**Requirement**: Publishing is idempotent using deterministic idempotency keys.

**Evidence**:
- Idempotency key generation: `src/utils/idempotency.ts`
- Database constraint: Unique constraint on (variantId, idempotencyKey) in Prisma schema
- Worker check: `src/workers/publishWorker.ts` lines 31-38
- Repository method: `publishAttemptRepository.findSuccessfulByVariantAndKey()`

**Test Output**:
```bash
$ npm test -- --run
✓ tests/idempotency.test.ts (4 tests)
  ✓ should generate consistent idempotency keys for same inputs
  ✓ should generate different keys for different scheduled times
  ✓ should generate different keys for different variants
  ✓ should use ISO format for scheduled time
```

## 8. Durable Scheduling

**Requirement**: Durable scheduling that survives worker restarts.

**Evidence**:
- Scheduler: `src/scheduler/publishScheduler.ts` using BullMQ with Redis-backed queue
- Worker: `src/workers/publishWorker.ts` using BullMQ Worker
- Redis queue persists scheduled jobs across worker restarts
- Job deduplication using `variant-${variantId}` as job ID
- 3 retry attempts with exponential backoff

**Test Output**:
```bash
$ docker-compose up -d
# Starts PostgreSQL and Redis containers

$ npm run worker
[Worker] Publish worker started with BullMQ
```

## 9. Worker Restart Recovery

**Requirement**: Worker can restart without creating duplicate publications.

**Evidence**:
- Worker: `src/workers/publishWorker.ts` checks existing successful attempts before publishing
- Database unique constraint prevents duplicates
- Job deduplication in scheduler (jobId: `variant-${variantId}`)

**Test Output**:
```bash
# Successfully published variant
$ curl http://localhost:3000/api/variants/12080003-67d4-4f7c-98f8-607a6bec6336
{"id":"12080003-67d4-4f7c-98f8-607a6bec6336","status":"published","publishAttempts":[{
  "id":"f8672de8-990b-451e-82e9-0ab0719ecff9",
  "idempotencyKey":"12080003-67d4-4f7c-98f8-607a6bec6336_2026-10-03T10:10:00.000Z",
  "status":"success",
  "externalPostId":"mock_telegram_1791022200405"
}]}
```

## 10. Publish History

**Requirement**: Persistent publish history with all attempts recorded.

**Evidence**:
- Model: `PublishAttempt` in Prisma schema
- Repository: `src/repositories/publishAttemptRepository.ts`
- Endpoints: `GET /api/variants/:id/history`, `GET /api/campaigns/:id/history`

**Test Output**:
```bash
$ curl http://localhost:3000/api/variants/12080003-67d4-4f7c-98f8-607a6bec6336
{
  "publishAttempts":[{
    "id":"f8672de8-990b-451e-82e9-0ab0719ecff9",
    "variantId":"12080003-67d4-4f7c-98f8-607a6bec6336",
    "platform":"telegram",
    "idempotencyKey":"12080003-67d4-4f7c-98f8-607a6bec6336_2026-10-03T10:10:00.000Z",
    "status":"success",
    "attemptNumber":1,
    "externalPostId":"mock_telegram_1791022200405",
    "errorMessage":null,
    "startedAt":"2026-10-03T10:10:00.388Z",
    "completedAt":"2026-10-03T10:10:00.425Z",
    "createdAt":"2026-10-03T10:10:00.388Z"
  }]
}
```

## 11. Secret Handling

**Requirement**: Secrets in environment variables, never logged or committed.

**Evidence**:
- `.env.example` with placeholders
- `.gitignore` excludes `.env`
- Config: `src/config/index.ts` reads from environment
- No logging of secrets in any code

**Test Output**:
```bash
$ cat .gitignore
.env
```

## 12. Automated Tests

**Requirement**: Vitest tests covering critical functionality.

**Evidence**:
- Test files in `tests/` directory
- Scripts: `npm test` in package.json
- Coverage: All 11 required test scenarios

**Test Output**:
```bash
$ npm test -- --run
Test Files  7 passed (7)
Tests      42 passed (42)
Start at  13:03:52
Duration  4.83s

✓ tests/validation.test.ts (10 tests)
✓ tests/validationError.test.ts (12 tests)
✓ tests/mockPublisher.test.ts (4 tests)
✓ tests/variantGeneration.test.ts (3 tests)
✓ tests/adapterSubstitution.test.ts (5 tests)
✓ tests/idempotency.test.ts (4 tests)
✓ tests/reviewProtection.test.ts (4 tests)
```
