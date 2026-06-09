# Human Manual — Production Deployment Architecture

## AWS Infrastructure

### Region: us-east-1 (primary) + eu-west-1 (future)

```
┌──────────────────────────────────────────────────────────────────────┐
│                         AWS Account                                   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐     │
│  │                   CloudFront Distribution                    │     │
│  │  Origins: S3 (static), ALB (API), Custom (media CDN)        │     │
│  │  WAF: OWASP rules, rate limiting, bot protection             │     │
│  └──────────────────────┬──────────────────────────────────────┘     │
│                         │                                             │
│  ┌──────────────────────▼──────────────────────────────────────┐     │
│  │                    VPC (10.0.0.0/16)                         │     │
│  │                                                              │     │
│  │  Public Subnets (AZ-a, AZ-b, AZ-c)                         │     │
│  │  ┌──────────────────────────────────────────────────────┐   │     │
│  │  │  Application Load Balancer                           │   │     │
│  │  │  Listeners: 443 (HTTPS), 80→443 redirect             │   │     │
│  │  │  Target Groups: API (3000), WebSocket (3001)         │   │     │
│  │  └─────────────────────┬────────────────────────────────┘   │     │
│  │                        │                                     │     │
│  │  Private Subnets (AZ-a, AZ-b, AZ-c)                        │     │
│  │  ┌──────────────────────────────────────────────────────┐   │     │
│  │  │  ECS Fargate Cluster                                 │   │     │
│  │  │                                                      │   │     │
│  │  │  API Service       WebSocket Service                 │   │     │
│  │  │  Tasks: 3-50       Tasks: 2-20                       │   │     │
│  │  │  1vCPU/2GB         512m/1GB                          │   │     │
│  │  │                                                      │   │     │
│  │  │  Worker Service (BullMQ)                             │   │     │
│  │  │  Tasks: 2-10, 1vCPU/2GB                              │   │     │
│  │  └──────────────────────┬───────────────────────────────┘   │     │
│  │                         │                                    │     │
│  │  Data Subnet (AZ-a, AZ-b)                                   │     │
│  │  ┌──────────────────────────────────────────────────────┐   │     │
│  │  │  RDS Aurora PostgreSQL    ElastiCache Redis Cluster  │   │     │
│  │  │  Writer: db.r6g.2xlarge  cache.r6g.large × 3         │   │     │
│  │  │  Reader × 2               OpenSearch m6g.large × 3   │   │     │
│  │  └──────────────────────────────────────────────────────┘   │     │
│  └──────────────────────────────────────────────────────────────┘     │
│                                                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐             │
│  │  S3 Buckets │  │   Route 53  │  │  Secrets Manager │             │
│  │  - media    │  │  humanmanual│  │  JWT secrets      │             │
│  │  - backups  │  │  .app zones │  │  DB passwords     │             │
│  │  - logs     │  │             │  │  OAuth creds      │             │
│  └─────────────┘  └─────────────┘  └──────────────────┘             │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │  Monitoring & Observability                                   │    │
│  │  CloudWatch Logs | X-Ray Tracing | CloudWatch Metrics        │    │
│  │  PagerDuty alerting | DataDog APM (optional)                  │    │
│  └──────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Docker Images

### API Service

```dockerfile
# apps/api/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "dist/main.js"]
```

### Next.js Web

```dockerfile
# apps/web/Dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3001
CMD ["node", "server.js"]
```

---

## Terraform Modules

```hcl
# infrastructure/production/main.tf

module "vpc" {
  source = "../modules/vpc"
  cidr   = "10.0.0.0/16"
  azs    = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

module "rds" {
  source          = "../modules/rds"
  engine          = "aurora-postgresql"
  engine_version  = "16.1"
  instance_class  = "db.r6g.2xlarge"
  replica_count   = 2
  database_name   = "human_manual"
  multi_az        = true
  backup_retention = 7
}

module "elasticache" {
  source         = "../modules/elasticache"
  node_type      = "cache.r6g.large"
  num_cache_nodes = 3
  engine_version = "7.2"
}

module "opensearch" {
  source         = "../modules/opensearch"
  instance_type  = "m6g.large.search"
  instance_count = 3
  volume_size    = 100
}

module "ecs_api" {
  source         = "../modules/ecs"
  service_name   = "human-manual-api"
  cpu            = 1024
  memory         = 2048
  min_capacity   = 3
  max_capacity   = 50
  image          = "${aws_ecr_repository.api.repository_url}:latest"
  port           = 3000
  health_check   = "/health"
}

module "s3_media" {
  source      = "../modules/s3"
  bucket_name = "humanmanual-media-${var.environment}"
  cors_origins = ["https://humanmanual.app"]
}

module "cloudfront" {
  source     = "../modules/cloudfront"
  origins    = [module.alb.dns_name, module.s3_media.bucket_domain]
  price_class = "PriceClass_200"
  waf_acl_id = module.waf.acl_id
}
```

---

## CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:unit
      - run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
          REDIS_URL: redis://localhost:6379
      - name: Security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  build:
    needs: quality
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      - name: Login to ECR
        uses: aws-actions/amazon-ecr-login@v2
      - name: Build and push API image
        run: |
          docker build -t $ECR_REGISTRY/human-manual-api:$GITHUB_SHA ./apps/api
          docker push $ECR_REGISTRY/human-manual-api:$GITHUB_SHA
      - name: Build and push Web image
        run: |
          docker build -t $ECR_REGISTRY/human-manual-web:$GITHUB_SHA ./apps/web
          docker push $ECR_REGISTRY/human-manual-web:$GITHUB_SHA

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - name: Deploy to ECS (staging)
        run: |
          aws ecs update-service \
            --cluster human-manual-staging \
            --service human-manual-api \
            --force-new-deployment
      - name: Run E2E tests
        run: npx playwright test --project=staging

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production  # requires manual approval
    steps:
      - name: Deploy to ECS (production) — Blue/Green
        run: |
          aws deploy create-deployment \
            --application-name HumanManualAPI \
            --deployment-group-name production \
            --description "Deploy $GITHUB_SHA"
```

---

## Environment Variables

```bash
# .env.example — API

# Database
DATABASE_URL=postgresql://user:pass@host:5432/human_manual
DATABASE_READ_URL=postgresql://user:pass@read-host:5432/human_manual

# Redis
REDIS_URL=redis://host:6379
REDIS_TLS=true

# Auth
JWT_SECRET=<256-bit-random>
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
MICROSOFT_CLIENT_ID=xxx
MICROSOFT_CLIENT_SECRET=xxx
LINKEDIN_CLIENT_ID=xxx
LINKEDIN_CLIENT_SECRET=xxx
APPLE_CLIENT_ID=xxx
APPLE_PRIVATE_KEY=xxx

# AWS
AWS_REGION=us-east-1
AWS_S3_BUCKET=humanmanual-media-production
AWS_CLOUDFRONT_DOMAIN=cdn.humanmanual.app

# AI
ANTHROPIC_API_KEY=sk-ant-xxx

# Search
OPENSEARCH_URL=https://xxx.us-east-1.es.amazonaws.com

# Email
SES_REGION=us-east-1
SES_FROM_EMAIL=hello@humanmanual.app

# Giphy
GIPHY_API_KEY=xxx

# App
APP_URL=https://humanmanual.app
API_URL=https://api.humanmanual.app
PORT=3000
NODE_ENV=production
```

---

## Monitoring & Alerting

### CloudWatch Alarms

| Alarm | Threshold | Action |
|-------|-----------|--------|
| API p99 latency | > 500ms for 5 min | PagerDuty alert |
| Error rate | > 1% for 2 min | PagerDuty alert |
| ECS CPU | > 80% for 3 min | Scale out |
| RDS CPU | > 70% for 5 min | Email warning |
| RDS free storage | < 10GB | PagerDuty alert |
| Redis memory | > 80% | Email warning |
| 5xx error rate | > 0.5% | PagerDuty alert |

### Health Check Endpoints

```
GET /health          → { "status": "ok", "timestamp": "..." }
GET /health/db       → { "status": "ok", "latency_ms": 2 }
GET /health/redis    → { "status": "ok", "latency_ms": 0.5 }
GET /health/search   → { "status": "ok", "latency_ms": 8 }
```
