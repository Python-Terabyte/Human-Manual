# Human Manual — Testing Strategy

## Testing Pyramid

```
                    ┌──────────────┐
                    │   E2E Tests  │  ~5% — Playwright
                    │  (20 flows)  │
                  ┌─┴──────────────┴─┐
                  │ Integration Tests │  ~25% — Jest + Supertest
                  │  (API contracts)  │          Testcontainers
                ┌─┴───────────────────┴─┐
                │      Unit Tests        │  ~70% — Jest / Vitest
                │  (services, utils)     │
                └────────────────────────┘
```

---

## Unit Tests

### What to Unit Test

- Service business logic (manual completion calculation, RBAC permission checks)
- Utility functions (slug generation, file size validation)
- DTO validation (class-validator pipes)
- AI prompt builders
- Cache key generators

### Example Unit Test

```typescript
// manual.service.spec.ts
describe('ManualService', () => {
  describe('calculateCompletionPct', () => {
    it('returns 0 for manual with no sections', () => {
      expect(calculateCompletionPct([])).toBe(0);
    });

    it('returns 100 when all core sections are filled', () => {
      const sections = [
        { type: 'basic_info',   hasContent: true },
        { type: 'about_me',     hasContent: true },
        { type: 'my_story',     hasContent: true },
        { type: 'skills',       hasContent: true },
        { type: 'personality',  hasContent: true },
      ];
      expect(calculateCompletionPct(sections)).toBe(100);
    });

    it('awards partial credit for partially filled sections', () => {
      const sections = [
        { type: 'basic_info', hasContent: true },
        { type: 'about_me',   hasContent: true },
      ];
      expect(calculateCompletionPct(sections)).toBe(40);
    });
  });
});
```

---

## Integration Tests

### API Integration Tests (Supertest + Testcontainers)

Spin up a real PostgreSQL + Redis in Docker for each test suite.

```typescript
// auth.integration.spec.ts
describe('POST /auth/register', () => {
  it('creates user and returns tokens', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'SecurePass123!',
        firstName: 'Test',
        lastName: 'User',
        username: 'test_user',
      });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      user: {
        email: 'test@example.com',
        username: 'test_user',
        role: 'individual',
      },
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });
  });

  it('rejects duplicate email with 409', async () => {
    await createUser({ email: 'dup@example.com' });
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'dup@example.com', ... });
    expect(res.status).toBe(409);
  });
});
```

---

## E2E Tests (Playwright)

### Critical User Flows

```typescript
// e2e/manual-creation.spec.ts
test('User can create and publish a manual', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="get-started-btn"]');
  await page.fill('[name="email"]', 'e2e@test.com');
  await page.fill('[name="password"]', 'TestPass123!');
  await page.click('[data-testid="register-btn"]');

  // Dashboard loads
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('h1')).toContainText('Good morning');

  // Start building
  await page.click('[data-testid="build-manual-btn"]');
  await expect(page).toHaveURL('/builder');

  // Add basic info
  await page.click('[data-testid="add-section-basic-info"]');
  await page.fill('[name="fullName"]', 'Asim Saleem');
  await page.fill('[name="occupation"]', 'Software Engineer');
  await page.click('[data-testid="save-section"]');

  // Publish
  await page.click('[data-testid="publish-btn"]');
  await expect(page.locator('[data-testid="published-toast"]')).toBeVisible();

  // Verify public URL
  await page.goto('/@asim-saleem');
  await expect(page.locator('h1')).toContainText('Asim Saleem');
});
```

### E2E Test Coverage Targets

| Flow | Priority |
|------|---------|
| Registration + onboarding | P0 |
| Manual creation + publish | P0 |
| Manual view (all sections) | P0 |
| Social: follow + react + comment | P1 |
| Company: invite + directory | P1 |
| Search: find by name/skill | P1 |
| AI: generate bio | P1 |
| Media: upload photo | P1 |
| Notifications: real-time | P2 |
| Mobile: manual view (Playwright device emulation) | P2 |

---

## Performance Tests (k6)

```javascript
// k6/manual-view.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // ramp up
    { duration: '5m', target: 1000 },  // peak load
    { duration: '2m', target: 0 },     // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'],   // 95th pct under 200ms
    http_req_failed:   ['rate<0.01'],   // error rate under 1%
  },
};

export default function () {
  const res = http.get('https://api.humanmanual.app/v1/manuals/asim-saleem');
  check(res, { 'status 200': r => r.status === 200 });
  sleep(1);
}
```

---

## Security Tests

- **OWASP ZAP**: Automated DAST scan on every staging deploy
- **Snyk**: Dependency vulnerability scanning in CI
- **CodeQL**: Static analysis in GitHub Actions
- **Manual pen test**: Quarterly by external firm
- **SQL injection**: Test all query parameters
- **Auth bypass**: Test all protected endpoints without token

---

## Coverage Targets

| Layer | Target |
|-------|--------|
| Unit (services) | 85% |
| Integration (API) | 75% |
| E2E (critical flows) | 100% of P0 flows |

```bash
# Run all tests
npm run test           # unit
npm run test:int       # integration (requires Docker)
npm run test:e2e       # Playwright
npm run test:coverage  # generate coverage report
```
