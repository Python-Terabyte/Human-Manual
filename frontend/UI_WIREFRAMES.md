# Human Manual — UI Wireframes & Screen Descriptions

All screens are **dark mode first**, using the design system tokens.

---

## 1. Landing Page (`/`)

```
┌─────────────────────────────────────────────────────────────────┐
│ NAVBAR                                                          │
│  🔖 Human Manual          [Explore] [Companies] [Sign In] [CTA]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│              HERO SECTION                                       │
│                                                                 │
│    ┌────────────────────────────────────────────────────┐      │
│    │  Because people don't come with instruction        │      │
│    │  manuals.                                  ← H1   │      │
│    │                                                    │      │
│    │  Create your interactive personal manual —         │      │
│    │  share who you are, how you work, and what         │      │
│    │  makes you, you.                           ← H2   │      │
│    │                                                    │      │
│    │  [✨ Build My Manual — It's Free] [See Examples →]│      │
│    └────────────────────────────────────────────────────┘      │
│                                                                 │
│    ┌──────────────────────────────────────────────────────┐    │
│    │  ANIMATED MANUAL PREVIEW (3D rotating card)          │    │
│    │  Shows: Avatar, Name, Tagline, Personality type,     │    │
│    │  Skills, Story timeline — auto-cycling demo data     │    │
│    └──────────────────────────────────────────────────────┘    │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  SOCIAL PROOF BAR                                               │
│  "10,000+ Manuals Created"  "500+ Companies"  "4.9★ Rating"    │
├─────────────────────────────────────────────────────────────────┤
│  FEATURES GRID (3 columns)                                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │
│  │ 🎨 Beautiful │ │ 🤝 Connect   │ │ 🏢 For Teams │           │
│  │ Interactive  │ │ With Your    │ │ Onboard      │           │
│  │ Profiles     │ │ People       │ │ Faster       │           │
│  └──────────────┘ └──────────────┘ └──────────────┘           │
├─────────────────────────────────────────────────────────────────┤
│  EXAMPLE MANUALS CAROUSEL (real user examples)                  │
├─────────────────────────────────────────────────────────────────┤
│  PRICING TABLE                                                  │
│  Free │ Pro $9/mo │ Team $49/mo │ Enterprise (Custom)          │
├─────────────────────────────────────────────────────────────────┤
│  FOOTER                                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Manual View Page (`/@asim-saleem` or `/m/asim-saleem`)

```
┌─────────────────────────────────────────────────────────────────┐
│ NAVBAR (minimal, transparent over cover)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  COVER IMAGE (full-width, parallax scroll)                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  [Stunning cover photo / gradient based on theme]        │   │
│  │                                                          │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │  👤 [Avatar 96px]  Asim Saleem                 │    │   │
│  │  │                    Builder. Dreamer. INTJ.     │    │   │
│  │  │                    🏙️ Lahore, Pakistan          │    │   │
│  │  │                    💼 Senior Engineer @ TechCorp│    │   │
│  │  │                                                │    │   │
│  │  │  [❤️ 247]  [👥 Follow]  [🔗 Share]  [⋯]       │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  STICKY NAV (appears on scroll)                                 │
│  [About] [Story] [Skills] [Work With Me] [Media] [Contact]     │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  PERSONALITY CARD                                               │
│  ┌─────────────────────────────────────┐                       │
│  │  🧠 INTJ — The Architect            │                       │
│  │  ████████████░ Strategic            │                       │
│  │  ████████░░░░ Independent           │                       │
│  │  ██████████░░ Analytical            │                       │
│  └─────────────────────────────────────┘                       │
│                                                                 │
│  ── ABOUT ME ─────────────────────────────────────────────     │
│  "I'm a software engineer who builds products that matter.     │
│  I love clean code, strong coffee, and good books..."          │
│  [💬 Comment] [❤️ 45]                                          │
│                                                                 │
│  ── MY STORY (Timeline) ──────────────────────────────────     │
│  ●─── 2010 Born in Lahore, Pakistan                            │
│  ●─── 2018 Started CS at FAST-NUCES 🎓                        │
│  ●─── 2020 Built first SaaS — learned from failure 💡         │
│  ●─── 2022 Joined TechCorp as Backend Engineer 💼              │
│  ●─── 2024 Promoted to Tech Lead 🚀                           │
│                                                                 │
│  ── HOW TO WORK WITH ME ──────────────────────────────────     │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐  │
│  │💬 Direct   │ │📱 Slack    │ │🕙 9am-1pm  │ │🤝 Async    │  │
│  │  Comms    │ │  Preferred │ │  Peak hrs  │  first     │  │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘  │
│                                                                 │
│  ── MY SKILLS ─────────────────────────────────────────────    │
│  TypeScript  ████████████████████ Expert (4 yrs)               │
│  NestJS      ████████████████░░░░ Advanced (3 yrs)             │
│  PostgreSQL  ████████████████████ Expert (5 yrs)               │
│  AWS         ████████████░░░░░░░░ Intermediate (2 yrs)         │
│                                                                 │
│  ── STRENGTHS ─────────────────────────────────────────────    │
│  ┌───────────────────┐ ┌───────────────────┐                   │
│  │ 🧠 System Thinking│ │ ⚡ Fast Learner    │                   │
│  └───────────────────┘ └───────────────────┘                   │
│  ┌───────────────────┐ ┌───────────────────┐                   │
│  │ 💛 Empathy        │ │ 🎯 Leadership     │                   │
│  └───────────────────┘ └───────────────────┘                   │
│                                                                 │
│  ── THINGS I LOVE / HATE ──────────────────────────────────    │
│  Love: ☕ Specialty Coffee  🌙 Dark Mode  🧹 Clean Code        │
│  Hate: 😤 Meetings w/o agendas  📶 Slow Wi-Fi                  │
│                                                                 │
│  ── FUN FACTS ─────────────────────────────────────────────    │
│  [Random Fact Generator — click to reveal next]                 │
│  "⌨️ I type at 120 WPM"  →  [Next Fact]                        │
│                                                                 │
│  ── MY MEDIA ──────────────────────────────────────────────    │
│  BOOKS: [The Pragmatic Programmer] [Clean Code] [Atomic Habits] │
│  MOVIES: [Interstellar] [The Social Network] [Inception]        │
│  MUSIC: [Spotify embed — "Deep Work Playlist"]                  │
│                                                                 │
│  ── TRAVEL MAP ────────────────────────────────────────────    │
│  [Interactive world map with visited countries highlighted]     │
│                                                                 │
│  ── GIF COLLECTION ─────────────────────────────────────────   │
│  [Grid of favorite GIFs from Giphy]                             │
│                                                                 │
│  COMMENTS SECTION                                               │
│  [Avatar] Great manual! Really helpful before our 1:1 👍        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Manual Builder (`/builder`)

```
┌─────────────────────────────────────────────────────────────────┐
│ BUILDER HEADER                                                  │
│  ← Back   Asim's Manual   [Preview] [Publish ✓] [⚙ Settings]  │
│  Completion: ████████████████░░░░ 80%                           │
├─────────────┬───────────────────────────────────────────────────┤
│ LEFT PANEL  │  CANVAS (drag-and-drop)                           │
│ (Sections)  │                                                   │
│             │  ┌──── Basic Info ──────────────── [✎] [⋮] ─┐   │
│ + Add       │  │  Asim Saleem · he/him · Lahore, Pakistan   │   │
│   Section   │  │  Senior Engineer @ TechCorp                │   │
│             │  └────────────────────────────────────────────┘   │
│ ──────────  │                                                   │
│ ☑ Basic     │  ┌──── About Me ────────────────── [✎] [⋮] ─┐   │
│ ☑ About     │  │  "I'm a software engineer who builds..."   │   │
│ ☑ Story     │  │  [AI Beautify ✨]                           │   │
│ ☑ Skills    │  └────────────────────────────────────────────┘   │
│ ☑ Work      │                                                   │
│ ☑ Strengths │  ┌──── My Story ─────────────────── [✎] [⋮] ─┐  │
│ ○ Weaknesses│  │  Timeline view with events...               │  │
│ ○ Media     │  └────────────────────────────────────────────┘   │
│ ○ Travel    │                                                   │
│ ○ Goals     │  [+ Add Section]                                  │
│ ○ Quotes    │                                                   │
│ ○ Memes     │  ← Drag sections to reorder →                    │
│             │                                                   │
│ ──────────  │                                                   │
│ AI Assist ✨│  SECTION PALETTE (click to add)                   │
│ Generate    │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐            │
│ entire bio  │  │📸  │ │🎵  │ │🗺️  │ │🎮  │ │😂  │            │
│             │  │ Photos│ │Music│ │Travel│ │Games│ │Memes│       │
│             │  └────┘ └────┘ └────┘ └────┘ └────┘            │
└─────────────┴───────────────────────────────────────────────────┘
```

---

## 4. Dashboard (`/dashboard`)

```
┌─────────────────────────────────────────────────────────────────┐
│ SIDEBAR                │  MAIN CONTENT                          │
│                        │                                        │
│ 🏠 Home                │  Good morning, Asim ☀️                 │
│ 📖 My Manual           │                                        │
│ 🔍 Explore             │  ┌──── Your Manual ────────────────┐   │
│ 💬 Activity            │  │  Completion: 80%                 │   │
│ 🔔 Notifications (3)   │  │  ████████████████░░░░           │   │
│ 📌 Bookmarks           │  │  Views this week: 247 (+12%)    │   │
│ ──────────             │  │  [Continue Building →]           │   │
│ 🏢 TechCorp            │  └─────────────────────────────────┘   │
│   Engineering          │                                        │
│   Backend Team         │  ┌──── Notifications ─────────────┐   │
│ ──────────             │  │  ❤️ Sarah liked your manual      │   │
│ ⚙️ Settings            │  │  👥 James started following you  │   │
│ 🌙 Dark Mode           │  │  💬 Ahmed commented on Story     │   │
│                        │  └─────────────────────────────────┘   │
│                        │                                        │
│                        │  ┌──── People You May Know ───────┐   │
│                        │  │  [Avatar] Fatima · PM · TechCorp│   │
│                        │  │  [Avatar] Bilal · Dev · Remote   │   │
│                        │  └─────────────────────────────────┘   │
│                        │                                        │
│                        │  ┌──── Your Achievements ─────────┐   │
│                        │  │  🏆 Profile Complete  ⭐ x3 Streak│   │
│                        │  │  📖 First Manual  🌟 Social     │   │
│                        │  └─────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Company Dashboard (`/org/techcorp`)

```
┌─────────────────────────────────────────────────────────────────┐
│ 🏢 TechCorp                            [Invite Employee] [⚙]   │
├─────────────────────────────────────────────────────────────────┤
│ STATS ROW                                                       │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│ │  48      │ │  38      │ │  92%     │ │  4       │          │
│ │ Employees│ │ Manuals  │ │ Completion│ │ Depts    │          │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌── NEW JOINERS THIS WEEK ─────────────────────────────┐     │
│  │  👤 Zara Khan  →  Product Design  (Joined Mon)        │     │
│  │  👤 Umar Farooq →  Backend Eng   (Joined Tue)         │     │
│  └──────────────────────────────────────────────────────┘     │
│                                                                 │
│  ┌── BIRTHDAY WALL 🎂 ────────────────────────────────────┐    │
│  │  Today: 🎉 Ahmed Ali (Engineering) — wish them!         │    │
│  │  Friday: 🎂 Sara Malik (Design)                          │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌── EMPLOYEE DIRECTORY ──────────────────────────────────┐    │
│  │ [Search employees...]  [Filter: All Depts ▾]           │    │
│  │                                                         │    │
│  │ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐           │    │
│  │ │ 👤     │ │ 👤     │ │ 👤     │ │ 👤     │           │    │
│  │ │ Asim   │ │ Sarah  │ │ James  │ │ Fatima │           │    │
│  │ │ Tech   │ │ Design │ │ PM     │ │ HR     │           │    │
│  │ │ INTJ   │ │ ENFP   │ │ ENTJ   │ │ ISFJ   │           │    │
│  │ └────────┘ └────────┘ └────────┘ └────────┘           │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌── ORG CHART ───────────────────────────────────────────┐    │
│  │  [Interactive org chart with zoom/pan]                  │    │
│  │  CEO → CTO → Engineering → Backend Team                 │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Explore Page (`/explore`)

```
┌─────────────────────────────────────────────────────────────────┐
│  SEARCH BAR (full-width)                                        │
│  🔍 [Search by name, skill, hobby, personality, location...]    │
│                                                                 │
│  FILTER CHIPS:                                                  │
│  [All] [INTJ] [Developer] [Designer] [Lahore] [Remote] [+More] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  FEATURED MANUALS                                               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │
│  │ 👤 Asim     │ │ 👤 Sarah    │ │ 👤 James    │             │
│  │ Engineer    │ │ Designer    │ │ PM          │             │
│  │ Lahore 🇵🇰  │ │ Dubai 🇦🇪   │ │ London 🇬🇧  │             │
│  │ INTJ        │ │ ENFP        │ │ ENTJ        │             │
│  │ 1.2k views  │ │ 890 views   │ │ 673 views   │             │
│  │ [View →]    │ │ [View →]    │ │ [View →]    │             │
│  └─────────────┘ └─────────────┘ └─────────────┘             │
│                                                                 │
│  TRENDING SKILLS                                                │
│  TypeScript (234) · React (198) · Figma (176) · NestJS (145)  │
│                                                                 │
│  BY PERSONALITY                                                 │
│  [INTJ 45] [ENFP 67] [ENTJ 38] [INFJ 89] [ENTP 43] [+More]   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Notifications Panel

```
┌─────────────────────────────┐
│ Notifications            ✓ Mark all read │
├─────────────────────────────┤
│ TODAY                       │
│ ┌─────────────────────────┐ │
│ │ ❤️ Sarah liked your manual│ │
│ │    2 minutes ago         │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ 💬 Ahmed: "Great story  │ │
│ │   section!"  5 min ago  │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ 🏆 Badge Unlocked!      │ │
│ │   "Storyteller"  10m ago│ │
│ └─────────────────────────┘ │
│ YESTERDAY                   │
│ ┌─────────────────────────┐ │
│ │ 👥 James started        │ │
│ │   following you  1d ago │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```
