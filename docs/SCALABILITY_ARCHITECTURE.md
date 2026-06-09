# Human Manual — Scalability Architecture

## Target Scale

| Metric | Target |
|--------|--------|
| Registered users | 1,000,000+ |
| Concurrent users | 100,000 |
| Manuals | 800,000+ |
| API requests/sec | 10,000+ |
| WebSocket connections | 100,000 |
| Media storage | 50+ TB |
| Database records | 500M+ rows |

---

## Horizontal Scaling Plan

### Application Layer

```
Load Balancer (AWS ALB)
    │
    ├── API Pod 1   (ECS Fargate)
    ├── API Pod 2
    ├── API Pod 3   ← minimum 3 (high availability)
    ├── ...
    └── API Pod 50  ← auto-scales based on CPU/RPS

Auto-scaling policy:
  Scale OUT: CPU > 70% for 120 seconds → add 2 pods
  Scale IN:  CPU < 30% for 300 seconds → remove 1 pod
  Cooldown:  60 seconds between scale actions
```

### Database Scaling

```
Phase 1: 0 → 100k users
  Primary: db.r6g.2xlarge (8 vCPU, 64 GB)
  Read replica × 1 (analytics, search)
  Connection pool: PgBouncer, pool_size=100

Phase 2: 100k → 500k users
  Primary: db.r6g.4xlarge (16 vCPU, 128 GB)
  Read replicas × 2 (separate for API reads vs analytics)
  Connection pool: PgBouncer, pool_size=200
  Partition: analytics_events, audit_logs by month

Phase 3: 500k → 1M+ users
  Aurora PostgreSQL Serverless v2 (auto 2→64 ACUs)
  Read replicas × 3 (cross-AZ)
  Read replica in EU for global users
  Table partitioning: manuals, users by tenant_id range
  Archive old analytics to S3 Parquet (Athena queries)
```

### Read/Write Splitting

```typescript
// database.config.ts
const primaryPool  = new Pool({ connectionString: DATABASE_PRIMARY_URL });
const replicaPool  = new Pool({ connectionString: DATABASE_REPLICA_URL });

// Write operations → primary
async function write(query: SQL) {
  return primaryPool.query(query);
}

// Read operations → replica (with primary fallback)
async function read(query: SQL) {
  try {
    return await replicaPool.query(query);
  } catch (err) {
    return primaryPool.query(query);  // failover
  }
}

// Drizzle usage:
const primaryDb = drizzle(primaryPool);
const replicaDb = drizzle(replicaPool);
```

---

## Caching Architecture

```
Request → CloudFront (CDN cache, 24h for public pages)
    ↓ (cache miss)
API Server → Redis Check
    ↓ (cache miss)
PostgreSQL → Result
    ↓
Redis SET (TTL 5 min)
    ↓
Response
```

### Cache Strategy Per Endpoint

| Endpoint | Cache | TTL | Invalidation |
|----------|-------|-----|-------------|
| `GET /manuals/:slug` | Redis | 5 min | On manual update |
| `GET /users/:username` | Redis | 5 min | On profile update |
| `GET /explore?featured` | Redis | 10 min | Scheduled refresh |
| `GET /search?q=...` | Redis | 2 min | None (expires) |
| `GET /org/:id/directory` | Redis | 15 min | On member change |
| Static assets | CloudFront | 365 days | Cache-busted by hash |
| Manual HTML (public) | CloudFront | 5 min | On publish |

---

## Event-Driven Architecture

```
User action (publish manual)
    ↓
API: Save to DB → Enqueue events
    ↓
BullMQ Queues (Redis):
    ├── search-index → reindex manual in OpenSearch
    ├── notifications → notify followers
    ├── analytics → log view event
    └── media-processing → optimize uploaded images

Workers (separate ECS service):
    ├── search-worker (2–5 instances)
    ├── notification-worker (2–5 instances)
    ├── analytics-worker (1–3 instances)
    └── media-worker (2–10 instances)
```

---

## WebSocket Scaling

```
Problem: WebSocket is stateful, can't naively load-balance

Solution: Redis Pub/Sub as message broker

API Pod 1                API Pod 2
(user A connected)       (user B connected)
     │                        │
     └──── Redis Pub/Sub ─────┘

When event fires for user B:
  API Pod 1 publishes to Redis channel `user:${userId}`
  API Pod 2 subscribes, receives, pushes to user B's socket

// socket.service.ts
@OnEvent('notification.created')
async handleNotification(event: NotificationCreatedEvent) {
  await this.redis.publish(
    `user:${event.userId}`,
    JSON.stringify({ type: 'notification.new', data: event.notification })
  );
}
```

---

## Database Partitioning Strategy

```sql
-- analytics_events: partitioned by month (high-volume writes)
CREATE TABLE analytics_events_2025_01 PARTITION OF analytics_events
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- Auto-create partitions via pg_partman
SELECT partman.create_parent(
  p_parent_table  => 'public.analytics_events',
  p_control       => 'created_at',
  p_type          => 'range',
  p_interval      => 'monthly',
  p_premake       => 3
);

-- audit_logs: same pattern (monthly partitions)
-- Retention: analytics > 1 year → archive to S3 + delete partition
```

---

## CDN Strategy

```
                    CloudFront
                    ├── /api/* → ALB (no cache, pass-through)
                    ├── /_next/static/* → S3 (1 year cache, hash-busted)
                    ├── /avatars/* → S3 (1 day cache)
                    ├── /media/* → S3 (7 day cache)
                    └── /* → Next.js (5 min cache for public pages)

Origins:
  Static assets: humanmanual-assets.s3.amazonaws.com
  Media:         humanmanual-media.s3.amazonaws.com
  API:           api-alb.us-east-1.elb.amazonaws.com
  Web:           web-alb.us-east-1.elb.amazonaws.com

Cache behaviors:
  - Compress: true (gzip + Brotli)
  - HTTP/2: enabled
  - HTTP/3: enabled (QUIC)
  - IPv6: enabled
  - Price class: PriceClass_200 (US, EU, Asia)
```

---

## Background Processing Architecture

```
Heavy operations NEVER block the HTTP response:

1. User uploads video
   → API responds 202 Accepted immediately
   → Returns { jobId: "abc123", status: "processing" }
   → Worker: compress, transcode to HLS, generate thumbnail
   → WebSocket push when ready: { type: "media.ready", assetId: "..." }

2. AI bio generation
   → API: enqueue job → return { jobId: "xyz789" }
   → Worker: call Anthropic API (may take 3-8 seconds)
   → WebSocket push result to user

3. Search indexing
   → On manual publish: enqueue indexing job
   → Worker: upsert document in OpenSearch (async, no user wait)

4. Analytics
   → Events buffered in Redis list (LPUSH)
   → Analytics worker: RPOPLPUSH every 5 seconds → batch INSERT to DB
   → Reduces write pressure: 1000 events → 1 INSERT
```

---

## Failure Modes & Recovery

| Failure | Impact | Mitigation |
|---------|--------|-----------|
| API pod crashes | Brief 503 for some users | ECS auto-restarts, ALB health check routes around |
| Primary DB down | Write failures | Aurora auto-failover to read replica (~30s) |
| Redis down | Cache misses, slower | DB fallback, rate limiting disabled |
| OpenSearch down | Search unavailable | Graceful degradation: return empty search results |
| S3 unreachable | Media uploads fail | Queue uploads, retry on recovery |
| AI provider down | AI features unavailable | Graceful degradation: hide AI buttons |
| BullMQ jobs pile up | Background processing delay | Dead-letter queue, manual retry, alerting |
