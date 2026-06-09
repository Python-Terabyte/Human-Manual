# Human Manual — API Architecture

## Overview

RESTful API built with **NestJS** + **TypeScript**, with WebSocket support for real-time features.

Base URL: `https://api.humanmanual.app/v1`

---

## Authentication

All protected endpoints require:
```
Authorization: Bearer <JWT_ACCESS_TOKEN>
```

Access tokens expire in **15 minutes**. Refresh via `/auth/refresh`.

---

## API Modules

```
src/
├── auth/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── strategies/
│   │   ├── jwt.strategy.ts
│   │   ├── google.strategy.ts
│   │   ├── microsoft.strategy.ts
│   │   ├── apple.strategy.ts
│   │   └── linkedin.strategy.ts
│   └── guards/
│       ├── jwt-auth.guard.ts
│       └── roles.guard.ts
├── users/
├── manuals/
├── sections/
├── media/
├── social/
├── organizations/
├── ai/
├── search/
├── notifications/
├── analytics/
└── admin/
```

---

## Endpoints Reference

### AUTH

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Email registration | — |
| POST | `/auth/login` | Email login | — |
| POST | `/auth/refresh` | Refresh access token | — |
| POST | `/auth/logout` | Revoke refresh token | ✓ |
| GET  | `/auth/google` | Google OAuth redirect | — |
| GET  | `/auth/google/callback` | Google OAuth callback | — |
| GET  | `/auth/microsoft` | Microsoft OAuth redirect | — |
| GET  | `/auth/microsoft/callback` | Microsoft OAuth callback | — |
| GET  | `/auth/linkedin` | LinkedIn OAuth redirect | — |
| GET  | `/auth/linkedin/callback` | LinkedIn OAuth callback | — |
| POST | `/auth/forgot-password` | Send reset email | — |
| POST | `/auth/reset-password` | Reset with token | — |
| POST | `/auth/verify-email` | Verify email token | — |

**Example — Register:**
```json
POST /auth/register
{
  "email": "asim@example.com",
  "password": "SecurePass123!",
  "firstName": "Asim",
  "lastName": "Saleem",
  "username": "asim_saleem"
}

Response 201:
{
  "user": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "email": "asim@example.com",
    "username": "asim_saleem",
    "displayName": "Asim Saleem",
    "role": "individual"
  },
  "accessToken": "eyJhbGci...",
  "refreshToken": "hJFmk3...",
  "expiresIn": 900
}
```

---

### USERS

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET    | `/users/me` | Get current user | ✓ |
| PATCH  | `/users/me` | Update profile | ✓ |
| DELETE | `/users/me` | Delete account | ✓ |
| GET    | `/users/:username` | Get public profile | — |
| GET    | `/users/:id/followers` | List followers | — |
| GET    | `/users/:id/following` | List following | — |
| GET    | `/users/me/notifications` | Get notifications | ✓ |
| PATCH  | `/users/me/notifications/:id/read` | Mark read | ✓ |
| GET    | `/users/me/bookmarks` | Get bookmarks | ✓ |

**Example — Get Profile:**
```json
GET /users/asim_saleem

Response 200:
{
  "id": "a1b2c3d4-...",
  "username": "asim_saleem",
  "displayName": "Asim Saleem",
  "avatarUrl": "https://cdn.humanmanual.app/avatars/asim.jpg",
  "bio": "Builder. Coffee addict. INTJ.",
  "role": "individual",
  "manual": {
    "slug": "asim-saleem",
    "title": "Asim's Manual",
    "tagline": "Builder. Dreamer. Coffee Addict.",
    "completionPct": 87,
    "viewCount": 1247
  },
  "stats": {
    "followersCount": 234,
    "followingCount": 89,
    "manualViews": 1247
  }
}
```

---

### MANUALS

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET    | `/manuals` | List public manuals | — |
| GET    | `/manuals/featured` | Featured manuals | — |
| GET    | `/manuals/:slug` | Get manual by slug | — |
| GET    | `/manuals/me` | Get my manual | ✓ |
| POST   | `/manuals` | Create manual | ✓ |
| PATCH  | `/manuals/:id` | Update manual | ✓ |
| POST   | `/manuals/:id/publish` | Publish manual | ✓ |
| POST   | `/manuals/:id/unpublish` | Unpublish | ✓ |
| DELETE | `/manuals/:id` | Delete manual | ✓ |
| GET    | `/manuals/:id/analytics` | View analytics | ✓ |
| POST   | `/manuals/:id/reactions` | React to manual | ✓ |
| GET    | `/manuals/:id/reactions` | Get reactions | — |
| GET    | `/manuals/:id/comments` | Get comments | — |
| POST   | `/manuals/:id/comments` | Post comment | ✓ |
| POST   | `/manuals/:id/bookmark` | Bookmark manual | ✓ |
| DELETE | `/manuals/:id/bookmark` | Remove bookmark | ✓ |

**Example — Create Manual:**
```json
POST /manuals
{
  "title": "Asim's Manual",
  "tagline": "Builder. Dreamer. Coffee Addict.",
  "visibility": "public",
  "themePreset": "purple_dream"
}

Response 201:
{
  "id": "b2c3d4e5-...",
  "slug": "asim-saleem",
  "title": "Asim's Manual",
  "completionPct": 0,
  "isPublished": false,
  "sections": []
}
```

---

### SECTIONS

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET    | `/manuals/:id/sections` | List all sections | — |
| POST   | `/manuals/:id/sections` | Add section | ✓ |
| PATCH  | `/manuals/:id/sections/reorder` | Reorder sections | ✓ |
| PATCH  | `/sections/:id` | Update section | ✓ |
| DELETE | `/sections/:id` | Delete section | ✓ |
| POST   | `/sections/:id/reactions` | React to section | ✓ |

**Section Types and Payloads:**

```json
// Basic Info
POST /manuals/:id/sections
{
  "sectionType": "basic_info",
  "data": {
    "fullName": "Asim Saleem",
    "nickname": "Sim",
    "pronouns": "he/him",
    "locationCity": "Lahore",
    "locationCountry": "Pakistan",
    "occupation": "Senior Software Engineer",
    "company": "TechCorp",
    "githubUrl": "https://github.com/asim_saleem",
    "linkedinUrl": "https://linkedin.com/in/asim-saleem"
  }
}

// My Story (Timeline)
{
  "sectionType": "my_story",
  "data": {
    "events": [
      { "year": 2018, "title": "Started CS at FAST-NUCES", "emoji": "🎓", "description": "Best decision of my life" },
      { "year": 2020, "title": "Built first SaaS — learned everything from failure", "emoji": "💡" },
      { "year": 2022, "title": "Joined TechCorp as Backend Engineer", "emoji": "💼" },
      { "year": 2024, "title": "Promoted to Tech Lead", "emoji": "🚀" }
    ]
  }
}

// Skills
{
  "sectionType": "skills",
  "data": {
    "skills": [
      { "name": "TypeScript", "category": "Frontend", "level": 5, "yearsExp": 4 },
      { "name": "NestJS", "category": "Backend", "level": 4, "yearsExp": 3 },
      { "name": "PostgreSQL", "category": "Database", "level": 4, "yearsExp": 5 },
      { "name": "AWS", "category": "Cloud", "level": 3, "yearsExp": 2 }
    ]
  }
}
```

---

### MEDIA

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST   | `/media/upload` | Upload media file | ✓ |
| POST   | `/media/upload-url` | Get presigned S3 URL | ✓ |
| GET    | `/media/:id` | Get media asset | — |
| DELETE | `/media/:id` | Delete media | ✓ |
| GET    | `/media/giphy/search` | Search Giphy | ✓ |
| GET    | `/media/giphy/trending` | Trending GIFs | ✓ |

**Example — Get Upload URL:**
```json
POST /media/upload-url
{
  "filename": "profile-photo.jpg",
  "mimeType": "image/jpeg",
  "fileSize": 2097152,
  "mediaType": "image"
}

Response 200:
{
  "uploadUrl": "https://humanmanual-uploads.s3.amazonaws.com/...",
  "cdnUrl": "https://cdn.humanmanual.app/media/uuid.jpg",
  "assetId": "d4e5f6g7-...",
  "expiresIn": 3600
}
```

---

### ORGANIZATIONS

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST   | `/organizations` | Create org | ✓ |
| GET    | `/organizations/:slug` | Get org | — |
| PATCH  | `/organizations/:id` | Update org | ✓ admin |
| POST   | `/organizations/:id/invite` | Invite employee | ✓ admin |
| POST   | `/organizations/:id/departments` | Create dept | ✓ admin |
| GET    | `/organizations/:id/departments` | List depts | ✓ |
| POST   | `/organizations/:id/departments/:deptId/teams` | Create team | ✓ admin |
| GET    | `/organizations/:id/employees` | List employees | ✓ |
| GET    | `/organizations/:id/directory` | Employee directory | ✓ |
| GET    | `/organizations/:id/org-chart` | Org chart data | ✓ |
| GET    | `/organizations/:id/birthdays` | Birthday wall | ✓ |
| GET    | `/organizations/:id/new-joiners` | New joiner portal | ✓ |
| GET    | `/organizations/:id/spotlights` | Culture spotlights | ✓ |

---

### AI

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST   | `/ai/generate-bio` | Generate biography | ✓ |
| POST   | `/ai/analyze-strengths` | Analyze strengths | ✓ |
| POST   | `/ai/communication-style` | Summarize comms style | ✓ |
| POST   | `/ai/beautify-manual` | Beautify manual content | ✓ |
| POST   | `/ai/generate-manual` | Full manual draft | ✓ |
| POST   | `/ai/icebreakers` | Generate icebreakers | ✓ |
| POST   | `/ai/team-compatibility` | Team compatibility | ✓ |
| POST   | `/ai/meeting-prep` | Meeting prep notes | ✓ |
| POST   | `/ai/conversation-starters` | Conversation starters | ✓ |

**Example — Generate Bio:**
```json
POST /ai/generate-bio
{
  "firstName": "Asim",
  "occupation": "Senior Software Engineer",
  "skills": ["TypeScript", "NestJS", "PostgreSQL"],
  "hobbies": ["hiking", "specialty coffee", "reading"],
  "location": "Lahore, Pakistan",
  "personality": "INTJ",
  "tone": "professional_casual"
}

Response 200:
{
  "bio": "I'm Asim — a software engineer based in Lahore who builds systems that scale. By day, I architect backends with NestJS and PostgreSQL. By night, I'm chasing a perfect pour-over or getting lost in a good book. As an INTJ, I'm drawn to complexity and obsessed with elegant solutions. Currently focused on building products that actually matter.",
  "tokensUsed": 312,
  "model": "claude-sonnet-4-6"
}
```

---

### SEARCH

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET    | `/search` | Global search | — |
| GET    | `/search/users` | Search users | — |
| GET    | `/search/manuals` | Search manuals | — |
| GET    | `/search/organizations` | Search orgs | — |

**Example:**
```
GET /search?q=software+engineer+lahore&type=users&personality=INTJ&skill=TypeScript

Response 200:
{
  "users": [
    {
      "id": "...",
      "username": "asim_saleem",
      "displayName": "Asim Saleem",
      "avatarUrl": "...",
      "occupation": "Senior Software Engineer",
      "location": "Lahore, Pakistan",
      "personality": "INTJ",
      "skills": ["TypeScript","NestJS","PostgreSQL"],
      "_score": 0.98
    }
  ],
  "total": 14,
  "page": 1,
  "limit": 20
}
```

---

## Error Response Format

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "details": [
    { "field": "email", "message": "Must be a valid email address" }
  ],
  "timestamp": "2025-03-15T10:30:00Z",
  "path": "/auth/register"
}
```

---

## Rate Limiting

| Tier | Requests / Minute |
|------|-------------------|
| Unauthenticated | 30 |
| Individual (free) | 120 |
| Individual (pro) | 600 |
| Company | 2000 |
| Enterprise | Unlimited |

Headers returned:
```
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 119
X-RateLimit-Reset: 1710500460
```

---

## WebSocket Events (real-time)

Connect: `wss://api.humanmanual.app/socket`

| Event (Server → Client) | Payload |
|--------------------------|---------|
| `notification.new` | `{ notification: NotificationDTO }` |
| `manual.view` | `{ manualId, viewCount }` |
| `reaction.add` | `{ manualId, reaction }` |
| `comment.new` | `{ manualId, comment }` |
| `follower.new` | `{ follower: UserDTO }` |

| Event (Client → Server) | Payload |
|--------------------------|---------|
| `join.manual` | `{ manualId: string }` |
| `leave.manual` | `{ manualId: string }` |
