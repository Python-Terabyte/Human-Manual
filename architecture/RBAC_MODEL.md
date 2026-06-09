# Human Manual — RBAC Model

## Role Hierarchy

```
super_admin
    └── company_admin
            └── employee
                    └── individual
                            └── friend_circle_owner (additive role)
```

---

## Roles & Capabilities Matrix

| Capability | super_admin | company_admin | employee | individual | guest |
|------------|:-----------:|:-------------:|:--------:|:----------:|:-----:|
| Manage platform | ✓ | — | — | — | — |
| View all tenants | ✓ | — | — | — | — |
| Create organization | ✓ | ✓ | — | — | — |
| Manage organization | ✓ | ✓ | — | — | — |
| Invite employees | ✓ | ✓ | — | — | — |
| Create departments | ✓ | ✓ | — | — | — |
| Manage templates | ✓ | ✓ | — | — | — |
| View employee manuals | ✓ | ✓ | ✓* | — | — |
| Create manual | ✓ | ✓ | ✓ | ✓ | — |
| Edit own manual | ✓ | ✓ | ✓ | ✓ | — |
| Delete own manual | ✓ | ✓ | ✓ | ✓ | — |
| Upload media | ✓ | ✓ | ✓ | ✓ | — |
| Social features | ✓ | ✓ | ✓ | ✓ | — |
| View public manuals | ✓ | ✓ | ✓ | ✓ | ✓ |
| Search public profiles | ✓ | ✓ | ✓ | ✓ | ✓ |
| AI features | ✓ | ✓ | ✓ | ✓* | — |
| Analytics (own) | ✓ | ✓ | ✓ | ✓ | — |
| Analytics (org) | ✓ | ✓ | — | — | — |
| Suspend users | ✓ | ✓* | — | — | — |
| Audit logs | ✓ | ✓ | — | — | — |

*within tenant scope only / plan-gated

---

## Permissions (Fine-Grained)

```typescript
// permissions.ts
export enum Permission {
  // Manual
  MANUAL_CREATE        = 'manual:create',
  MANUAL_READ          = 'manual:read',
  MANUAL_UPDATE_OWN    = 'manual:update:own',
  MANUAL_DELETE_OWN    = 'manual:delete:own',
  MANUAL_READ_PRIVATE  = 'manual:read:private',   // company/department-scoped
  MANUAL_FEATURE       = 'manual:feature',         // admin only

  // Sections
  SECTION_MANAGE       = 'section:manage',
  SECTION_REACT        = 'section:react',
  SECTION_COMMENT      = 'section:comment',

  // Media
  MEDIA_UPLOAD         = 'media:upload',
  MEDIA_DELETE_OWN     = 'media:delete:own',

  // Organization
  ORG_CREATE           = 'org:create',
  ORG_MANAGE           = 'org:manage',
  ORG_INVITE           = 'org:invite',
  ORG_ANALYTICS        = 'org:analytics',

  // Users
  USER_VIEW            = 'user:view',
  USER_FOLLOW          = 'user:follow',
  USER_SUSPEND         = 'user:suspend',

  // AI
  AI_GENERATE          = 'ai:generate',
  AI_GENERATE_ADVANCED = 'ai:generate:advanced',

  // Admin
  PLATFORM_ADMIN       = 'platform:admin',
  AUDIT_VIEW           = 'audit:view',
}
```

---

## Role-Permission Mapping

```typescript
export const RolePermissions: Record<UserRole, Permission[]> = {
  super_admin: Object.values(Permission),  // all permissions

  company_admin: [
    Permission.MANUAL_CREATE,
    Permission.MANUAL_READ,
    Permission.MANUAL_UPDATE_OWN,
    Permission.MANUAL_DELETE_OWN,
    Permission.MANUAL_READ_PRIVATE,
    Permission.MANUAL_FEATURE,
    Permission.SECTION_MANAGE,
    Permission.SECTION_REACT,
    Permission.SECTION_COMMENT,
    Permission.MEDIA_UPLOAD,
    Permission.MEDIA_DELETE_OWN,
    Permission.ORG_CREATE,
    Permission.ORG_MANAGE,
    Permission.ORG_INVITE,
    Permission.ORG_ANALYTICS,
    Permission.USER_VIEW,
    Permission.USER_FOLLOW,
    Permission.USER_SUSPEND,
    Permission.AI_GENERATE,
    Permission.AI_GENERATE_ADVANCED,
    Permission.AUDIT_VIEW,
  ],

  employee: [
    Permission.MANUAL_CREATE,
    Permission.MANUAL_READ,
    Permission.MANUAL_UPDATE_OWN,
    Permission.MANUAL_DELETE_OWN,
    Permission.MANUAL_READ_PRIVATE,
    Permission.SECTION_MANAGE,
    Permission.SECTION_REACT,
    Permission.SECTION_COMMENT,
    Permission.MEDIA_UPLOAD,
    Permission.MEDIA_DELETE_OWN,
    Permission.USER_VIEW,
    Permission.USER_FOLLOW,
    Permission.AI_GENERATE,
  ],

  individual: [
    Permission.MANUAL_CREATE,
    Permission.MANUAL_READ,
    Permission.MANUAL_UPDATE_OWN,
    Permission.MANUAL_DELETE_OWN,
    Permission.SECTION_MANAGE,
    Permission.SECTION_REACT,
    Permission.SECTION_COMMENT,
    Permission.MEDIA_UPLOAD,
    Permission.MEDIA_DELETE_OWN,
    Permission.USER_VIEW,
    Permission.USER_FOLLOW,
    Permission.AI_GENERATE,
  ],
};
```

---

## Guards (NestJS)

```typescript
// roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermissions?.length) return true;

    const { user } = context.switchToHttp().getRequest();
    const userPermissions = RolePermissions[user.role] ?? [];

    return requiredPermissions.every(p => userPermissions.includes(p));
  }
}

// Usage:
@Get('org/:id/analytics')
@RequirePermissions(Permission.ORG_ANALYTICS)
getAnalytics(@Param('id') id: string) { ... }
```

---

## Tenant Isolation

Every database query for tenant-scoped data is filtered by `tenant_id`:

```typescript
// tenant.interceptor.ts — auto-injects tenant context
@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const req = context.switchToHttp().getRequest();
    if (req.user?.tenantId) {
      req.tenantContext = { tenantId: req.user.tenantId };
    }
    return next.handle();
  }
}

// base.service.ts — all tenant queries
async findEmployees(tenantId: string) {
  return this.db.select()
    .from(users)
    .where(eq(users.tenantId, tenantId))  // always scoped
    .where(isNull(users.deletedAt));
}
```

---

## Multi-Tenant Architecture

```
                    ┌─────────────────────────────────┐
                    │         SINGLE DATABASE          │
                    │  (Row-level tenant isolation)    │
                    │                                  │
                    │  tenants table (root)            │
                    │  users.tenant_id (FK)            │
                    │  manuals.tenant_id (FK)          │
                    │  departments.tenant_id (FK)      │
                    │  analytics_events.tenant_id      │
                    └─────────────────────────────────┘

Tenant A (TechCorp)         Tenant B (StartupXYZ)
users WHERE tenant_id=A  |  users WHERE tenant_id=B
Cross-tenant queries BLOCKED by RLS + application layer
```

### PostgreSQL Row-Level Security

```sql
-- Enable RLS on tenant-scoped tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON users
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid
         OR tenant_id IS NULL   -- individual users
         OR current_setting('app.user_role') = 'super_admin');

-- Set per-request in NestJS:
-- SET LOCAL app.current_tenant_id = 'uuid-here';
-- SET LOCAL app.user_role = 'employee';
```
