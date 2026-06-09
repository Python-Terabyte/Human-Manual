# Human Manual — System Architecture

## High-Level Architecture

```
                              ┌─────────────────────────────────────────────┐
                              │              CLIENTS                         │
                              │  Next.js Web   Flutter Android   Flutter iOS │
                              └───────────────┬─────────────────────────────┘
                                              │ HTTPS / WSS
                              ┌───────────────▼─────────────────────────────┐
                              │           AWS CloudFront CDN                 │
                              │     (Static assets + API edge cache)         │
                              └───────────────┬─────────────────────────────┘
                                              │
                              ┌───────────────▼─────────────────────────────┐
                              │         AWS Application Load Balancer        │
                              └───┬───────────────────────────┬─────────────┘
                                  │                           │
                    ┌─────────────▼────────┐    ┌────────────▼─────────────┐
                    │   NestJS API Pods    │    │   NestJS WebSocket Pods  │
                    │   (Auto-scaling ECS) │    │   (Sticky sessions)      │
                    │   Min: 3, Max: 50    │    │   Min: 2, Max: 20        │
                    └─────┬───────────────┘    └────────────┬─────────────┘
                          │                                 │
          ┌───────────────┼─────────────────────────────────┤
          │               │                                 │
┌─────────▼──────┐ ┌──────▼──────┐ ┌──────────────┐ ┌─────▼───────────────┐
│  PostgreSQL 16  │ │  Redis 7.2  │ │  OpenSearch  │ │   BullMQ Workers    │
│  Primary + 2    │ │  Cluster    │ │  3-node      │ │   (Email, AI,       │
│  Read Replicas  │ │  (Cache +   │ │  (Full-text  │ │    Media process,   │
│  AWS RDS        │ │   Sessions) │ │   search)    │ │    Notifications)   │
└─────────────────┘ └─────────────┘ └──────────────┘ └─────────────────────┘
                                                               │
                              ┌────────────────────────────────▼──────────┐
                              │              AWS S3                        │
                              │  Media storage (images/videos/audio/docs)  │
                              │  + CloudFront distribution                 │
                              └───────────────────────────────────────────┘
```

---

## Service Decomposition

### API Server (NestJS Monolith → Modular Monolith)

Start as a well-structured monolith. Extract to microservices at 100k+ users.

```
apps/api/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── config/
│   │   ├── database.config.ts      -- Drizzle + PostgreSQL
│   │   ├── redis.config.ts         -- ioredis
│   │   ├── storage.config.ts       -- AWS S3
│   │   └── ai.config.ts            -- Anthropic SDK
│   ├── common/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── decorators/
│   │   ├── pipes/
│   │   └── filters/
│   └── modules/
│       ├── auth/
│       ├── users/
│       ├── manuals/
│       ├── sections/
│       ├── media/
│       ├── social/
│       ├── organizations/
│       ├── search/
│       ├── ai/
│       ├── notifications/
│       ├── analytics/
│       ├── gamification/
│       └── admin/
```

---

## Caching Strategy

### Cache Layers

| Layer | Technology | TTL | What |
|-------|-----------|-----|------|
| CDN | CloudFront | 24h | Static assets, public manual HTML |
| API response | Redis | 5 min | Public manual data, user profiles |
| Session | Redis | 7 days | User sessions |
| Search | Redis | 2 min | Search result pages |
| Rate limit | Redis | 1 min | Request counters |

### Cache Keys

```typescript
// cache-keys.ts
export const CacheKeys = {
  manual:         (slug: string)      => `manual:${slug}`,
  manualSections: (manualId: string)  => `manual:${manualId}:sections`,
  userProfile:    (username: string)  => `user:${username}`,
  orgDirectory:   (tenantId: string)  => `org:${tenantId}:directory`,
  searchResults:  (query: string)     => `search:${Buffer.from(query).toString('base64')}`,
  featured:       ()                  => `manuals:featured`,
};
```

---

## Background Jobs (BullMQ)

### Queue Definitions

```typescript
// Queues
export enum Queue {
  EMAIL         = 'email',
  MEDIA         = 'media-processing',
  AI            = 'ai-generation',
  NOTIFICATIONS = 'notifications',
  ANALYTICS     = 'analytics',
  SEARCH        = 'search-index',
}

// Jobs
// email queue:
//   - welcome-email
//   - verify-email
//   - password-reset
//   - invitation
//   - digest

// media-processing queue:
//   - compress-image      (sharp)
//   - transcode-video     (ffmpeg)
//   - generate-thumbnail  (sharp/ffmpeg)
//   - extract-audio-waveform

// ai-generation queue:
//   - generate-bio
//   - analyze-strengths
//   - batch-suggestions

// notifications queue:
//   - push-notification   (FCM/APNs)
//   - in-app-notification
//   - email-digest

// analytics queue:
//   - flush-events        (batch write to DB)
//   - recalculate-metrics

// search-index queue:
//   - index-manual
//   - index-user
//   - delete-index
```

---

## Performance Targets

| Metric | Target |
|--------|--------|
| API p95 latency | < 200ms |
| Manual page load (LCP) | < 1.5s |
| Time to first byte | < 100ms (CDN hit) |
| Concurrent WebSocket connections | 100,000+ |
| Database query p99 | < 50ms |
| Search response time | < 100ms |
| Media upload (10MB) | < 5s |

---

## Scaling Strategy

### Database

```
Phase 1 (0–100k users):
  - RDS PostgreSQL db.r6g.2xlarge (8 vCPU, 64GB RAM)
  - 1 read replica for analytics queries
  - Connection pooling: PgBouncer (pool_size=100)

Phase 2 (100k–1M users):
  - RDS PostgreSQL db.r6g.4xlarge
  - 2 read replicas
  - analytics_events table partitioned by month
  - Read replicas for /analytics and /search endpoints

Phase 3 (1M+ users):
  - Aurora PostgreSQL Serverless v2
  - Up to 64 ACUs auto-scaling
  - Global database for multi-region read
```

### API Pods

```yaml
# ECS Task Definition
cpu: 1024        # 1 vCPU
memory: 2048     # 2GB RAM
min_instances: 3
max_instances: 50
scale_up:   CPU > 70% for 2 minutes
scale_down: CPU < 30% for 5 minutes
```

---

## Infrastructure as Code (Terraform)

```
infrastructure/
├── environments/
│   ├── dev/
│   ├── staging/
│   └── production/
├── modules/
│   ├── vpc/
│   ├── rds/
│   ├── elasticache/
│   ├── ecs/
│   ├── s3/
│   ├── cloudfront/
│   ├── opensearch/
│   └── alb/
└── main.tf
```

---

## Security Architecture

### Network Security

```
Internet → CloudFront (WAF) → ALB (SSL termination) → ECS (private subnet)
                                                      ↓
                                            RDS, Redis, OpenSearch (isolated VPC)
```

### WAF Rules

- OWASP Top 10 managed rule group
- Rate limiting: 1000 req/5min per IP
- SQL injection detection
- XSS prevention
- Bot protection

### Data Encryption

| Data | Encryption |
|------|-----------|
| Database at rest | AES-256 (RDS encryption) |
| S3 objects | SSE-S3 / SSE-KMS |
| In transit | TLS 1.3 |
| JWT secrets | AWS Secrets Manager |
| Passwords | bcrypt (rounds=12) |
| PII in DB | Application-level AES-256 |

---

## CI/CD Pipeline

```
Developer → GitHub PR
    ↓
GitHub Actions:
    ├── Lint (ESLint + Prettier)
    ├── Type check (tsc --noEmit)
    ├── Unit tests (Jest)
    ├── Integration tests (Testcontainers)
    ├── Security scan (Snyk + CodeQL)
    └── Build Docker image
         ↓
    PR merged to main:
         ├── Push image to ECR
         ├── Deploy to Staging (ECS Blue/Green)
         ├── Run E2E tests (Playwright)
         └── Manual approval gate
              ↓
         Deploy to Production (ECS Blue/Green)
              ├── 10% traffic → new version
              ├── Monitor error rate + latency
              └── 100% traffic rollover (if OK)
```
