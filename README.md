# Human Manual

> **"Because people don't come with instruction manuals."**

A production-grade SaaS platform for creating beautiful interactive personal manuals.  
Think: **LinkedIn + Instagram + Employee Handbook + Personal Website** — alive, animated, and deeply personal.

---

## What's In This Repository

```
D:\Code\My Manual\
│
├── README.md                              ← You are here
│
├── docs/
│   ├── PROJECT_OVERVIEW.md               ← Platform overview, user types, metrics
│   ├── DEVELOPMENT_ROADMAP.md            ← 35-week phased plan, tasks, team
│   ├── TESTING_STRATEGY.md               ← Unit, integration, E2E, performance
│   ├── SECURITY_ARCHITECTURE.md          ← Auth, RBAC, XSS, SQL injection, GDPR
│   └── SCALABILITY_ARCHITECTURE.md       ← 1M user scaling plan, caching, CDN
│
├── database/
│   ├── SCHEMA.sql                        ← Complete PostgreSQL schema (annotated)
│   └── DRIZZLE_SCHEMA.ts                 ← TypeScript Drizzle ORM schema
│
├── api/
│   └── API_ARCHITECTURE.md              ← All endpoints with request/response examples
│
├── architecture/
│   ├── RBAC_MODEL.md                    ← Roles, permissions, tenant isolation
│   └── SYSTEM_ARCHITECTURE.md          ← AWS infra, caching, queues, CI/CD
│
├── frontend/
│   ├── DESIGN_SYSTEM.md                ← Colors, typography, animations, components
│   └── UI_WIREFRAMES.md                ← ASCII wireframes for all key screens
│
├── mobile/
│   └── MOBILE_SCREENS.md               ← Flutter screen designs + architecture
│
└── infrastructure/
    └── DEPLOYMENT_ARCHITECTURE.md      ← Docker, Terraform, GitHub Actions, monitoring
```

---

## Quick Reference

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind, ShadCN, Framer Motion |
| Mobile | Flutter 3.x (Android + iOS) |
| Backend | NestJS, TypeScript |
| Database | PostgreSQL 16 + Drizzle ORM |
| Cache | Redis 7.2 |
| Search | OpenSearch |
| Storage | AWS S3 + CloudFront |
| Queue | BullMQ |
| AI | Anthropic (Claude) |
| Infra | AWS ECS Fargate, Terraform |
| CI/CD | GitHub Actions |

### Example Data Throughout

All schemas and examples use consistent test data:

- **User**: Asim Saleem (`asim_saleem`) — Senior Software Engineer, Lahore, INTJ
- **Company**: TechCorp (`techcorp`) — Engineering department, Backend Team
- **Manual**: `humanmanual.app/@asim-saleem`

### Scale Targets

| Metric | Target |
|--------|--------|
| Registered Users | 1,000,000+ |
| Concurrent Users | 100,000 |
| API Latency p95 | < 200ms |
| Uptime | 99.9% |

---

## Start Building

Read in this order:

1. **[docs/PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md)** — What we're building
2. **[database/SCHEMA.sql](database/SCHEMA.sql)** — Data model (start here for backend)
3. **[api/API_ARCHITECTURE.md](api/API_ARCHITECTURE.md)** — API contracts
4. **[architecture/RBAC_MODEL.md](architecture/RBAC_MODEL.md)** — Access control
5. **[frontend/DESIGN_SYSTEM.md](frontend/DESIGN_SYSTEM.md)** — Tokens + components
6. **[frontend/UI_WIREFRAMES.md](frontend/UI_WIREFRAMES.md)** — Screen designs
7. **[docs/DEVELOPMENT_ROADMAP.md](docs/DEVELOPMENT_ROADMAP.md)** — Phase-by-phase plan
8. **[infrastructure/DEPLOYMENT_ARCHITECTURE.md](infrastructure/DEPLOYMENT_ARCHITECTURE.md)** — Deploy to AWS
