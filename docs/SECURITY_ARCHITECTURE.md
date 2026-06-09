# Human Manual — Security Architecture

## Security Principles

1. **Defense in depth** — multiple layers, no single point of failure
2. **Least privilege** — every service/user gets only what it needs
3. **Zero trust** — verify every request, even internal ones
4. **Encrypt everywhere** — data at rest and in transit
5. **Audit everything** — immutable logs for all sensitive actions

---

## Authentication Security

### JWT Strategy

```typescript
// Token lifetimes
ACCESS_TOKEN_TTL  = '15m'     // short-lived, in-memory only
REFRESH_TOKEN_TTL = '7d'      // stored hashed in DB

// Access token payload
{
  sub:      'user-uuid',
  role:     'employee',
  tenantId: 'tenant-uuid',
  iat:      1710500000,
  exp:      1710500900,
  jti:      'unique-token-id'  // for revocation
}

// Refresh token: opaque 256-bit random → bcrypt hashed in DB
// Stored in HttpOnly, Secure, SameSite=Strict cookie
```

### OAuth Security

- State parameter: random 32-byte nonce, verified on callback
- PKCE: required for all OAuth flows
- Redirect URI: strict allowlist, no wildcards
- Token storage: never in localStorage — httpOnly cookies only

---

## Input Validation & Sanitization

### API Layer

```typescript
// All request bodies validated with class-validator
class CreateManualDto {
  @IsString()
  @MaxLength(255)
  @Transform(({ value }) => DOMPurify.sanitize(value))
  title: string;

  @IsEnum(Visibility)
  visibility: Visibility;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @Transform(({ value }) => sanitizeHtml(value, {
    allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'li'],
    allowedAttributes: { 'a': ['href'] },
  }))
  content?: string;
}
```

### XSS Prevention

- All rich text sanitized server-side with `sanitize-html`
- Content Security Policy headers on all responses:
  ```
  Content-Security-Policy:
    default-src 'self';
    script-src 'self' 'nonce-{random}';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https://cdn.humanmanual.app https://*.giphy.com;
    frame-src https://open.spotify.com https://www.youtube.com;
    connect-src 'self' https://api.humanmanual.app wss://api.humanmanual.app;
  ```

---

## SQL Injection Prevention

- **Drizzle ORM**: parameterized queries by default
- Never construct raw SQL from user input
- Raw query safety (when needed):
  ```typescript
  // WRONG (never do this):
  db.execute(`SELECT * FROM users WHERE name = '${name}'`);

  // RIGHT (Drizzle parameterized):
  db.select().from(users).where(eq(users.displayName, name));
  ```

---

## File Upload Security

```typescript
// media.service.ts
const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'video/mp4', 'video/webm',
  'audio/mpeg', 'audio/ogg', 'audio/wav',
];

const MAX_FILE_SIZES = {
  image: 10 * 1024 * 1024,    // 10MB
  gif:   5  * 1024 * 1024,    // 5MB
  video: 500 * 1024 * 1024,   // 500MB
  audio: 50  * 1024 * 1024,   // 50MB
};

async validateUpload(file: Express.Multer.File) {
  // 1. Check declared MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) throw new BadRequestException();

  // 2. Verify actual file signature (magic bytes) — not just extension
  const fileType = await fromBuffer(file.buffer);
  if (!fileType || !ALLOWED_MIME_TYPES.includes(fileType.mime)) {
    throw new BadRequestException('File type mismatch');
  }

  // 3. Check file size
  if (file.size > MAX_FILE_SIZES[category]) throw new PayloadTooLargeException();

  // 4. Scan for malware (ClamAV or AWS Macie)
  await this.virusScanner.scan(file.buffer);

  // 5. Store in quarantine bucket first, then move after scan passes
}
```

---

## Rate Limiting

```typescript
// main.ts
app.use(rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: (req) => {
    if (!req.user) return 30;
    if (req.user.role === 'individual') return 120;
    if (req.user.tenantId) return 300;
    return 120;
  },
  keyGenerator: (req) => req.user?.id ?? req.ip,
  handler: (req, res) => res.status(429).json({
    statusCode: 429,
    message: 'Too many requests. Please slow down.',
  }),
}));

// AI endpoints: stricter limits
@UseGuards(AiRateLimitGuard)  // 10 AI calls per hour per user
```

---

## Tenant Data Isolation

```sql
-- PostgreSQL Row Level Security (enforced at DB layer)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE manuals ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Employees can only see their own tenant's data
CREATE POLICY tenant_isolation_users ON users
  FOR ALL
  USING (
    tenant_id IS NULL  -- individual users visible to all
    OR tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid
    OR current_setting('app.user_role', TRUE) = 'super_admin'
  );

-- Set per-connection in NestJS interceptor
await this.db.execute(sql`
  SET LOCAL app.current_tenant_id = ${tenantId};
  SET LOCAL app.user_role = ${userRole};
`);
```

---

## Sensitive Data Handling

| Data Type | Storage | Encryption |
|-----------|---------|-----------|
| Passwords | DB (bcrypt hash) | bcrypt rounds=12 |
| Refresh tokens | DB | bcrypt hash |
| OAuth tokens | DB | AES-256-GCM (KMS key) |
| User PII (email) | DB citext | At-rest: RDS encryption |
| Media files | S3 | SSE-S3 |
| JWT secrets | AWS Secrets Manager | Managed |
| Birth dates | DB | At-rest: RDS encryption |

---

## Security Headers (NestJS Helmet)

```typescript
app.use(helmet({
  contentSecurityPolicy: { ... },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xFrameOptions: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
}));
```

---

## Audit Logging

Every sensitive action is logged immutably:

```typescript
// audit.service.ts
async log(params: {
  userId: string;
  action: string;       // 'user.created' | 'manual.published' | 'org.invite_sent' | ...
  entityType: string;
  entityId: string;
  oldData?: object;
  newData?: object;
  req: Request;
}) {
  await this.db.insert(auditLogs).values({
    userId:     params.userId,
    tenantId:   params.req.user?.tenantId,
    action:     params.action,
    entityType: params.entityType,
    entityId:   params.entityId,
    oldData:    params.oldData,
    newData:    params.newData,
    ipAddress:  params.req.ip,
    userAgent:  params.req.headers['user-agent'],
  });
}

// Example audit events:
// user.registered, user.login, user.password_changed
// manual.created, manual.published, manual.deleted, manual.visibility_changed
// org.created, org.member_invited, org.member_removed
// media.uploaded, media.deleted
// admin.user_suspended, admin.tenant_deleted
```

---

## GDPR / Privacy Compliance

| Right | Implementation |
|-------|---------------|
| Right to access | `GET /users/me/data-export` — full JSON export |
| Right to erasure | `DELETE /users/me` — hard deletes all PII |
| Data portability | JSON export of entire Manual |
| Consent | Explicit consent on signup, stored with timestamp |
| Cookie consent | Cookiebot integration on web |

---

## SOC2 Readiness Checklist

- ✓ Access control (RBAC + tenant isolation)
- ✓ Encryption at rest and in transit
- ✓ Audit logging (immutable)
- ✓ Vulnerability management (Snyk + CodeQL)
- ✓ Incident response runbook
- ✓ Business continuity (daily backups, multi-AZ)
- ✓ Vendor management (AWS, Anthropic, Stripe)
- ○ Annual pen test (pending)
- ○ Security awareness training (pending)
- ○ Formal ISMS documentation (pending)
