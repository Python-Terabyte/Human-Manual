# Human Manual — Flutter Mobile Screens

Platform: Android (Phase 2) + iOS (Phase 2)  
Framework: Flutter 3.x  
State: Riverpod + GoRouter  

---

## App Architecture

```
lib/
├── main.dart
├── app/
│   ├── app.dart
│   ├── router.dart          -- GoRouter
│   └── theme.dart           -- Theme tokens from design system
├── core/
│   ├── api/                 -- Dio HTTP client
│   ├── auth/                -- JWT + SecureStorage
│   ├── cache/               -- Hive local cache
│   └── websocket/           -- WebSocket client
├── features/
│   ├── auth/
│   ├── manual/
│   ├── explore/
│   ├── notifications/
│   ├── organizations/
│   └── profile/
└── shared/
    ├── widgets/
    └── utils/
```

---

## Screen 1: Splash / Onboarding

```
┌─────────────────────────┐
│                         │
│                         │
│      📖 Human Manual    │
│                         │
│   "Because people don't │
│   come with instruction │
│   manuals."             │
│                         │
│  ── ● ○ ○ ──           │
│                         │
│  [Get Started]          │
│  [Sign In]              │
│                         │
└─────────────────────────┘

Onboarding slides:
1. "Your Personal Manual" — show animated profile card
2. "Connect With People" — show social features
3. "Your Team, Finally Understood" — company features
```

---

## Screen 2: Sign In

```
┌─────────────────────────┐
│  ← Back                 │
│                         │
│  Welcome back 👋        │
│                         │
│  [G] Continue w/ Google │
│  [M] Continue w/ Microsoft│
│  [L] Continue w/ LinkedIn│
│  [A] Continue w/ Apple  │
│                         │
│  ────── or ──────       │
│                         │
│  Email                  │
│  [asim@example.com    ] │
│                         │
│  Password               │
│  [••••••••••••        ] │
│                         │
│  [Sign In]              │
│                         │
│  Forgot password?       │
│  Don't have account?    │
│  [Create Manual →]      │
└─────────────────────────┘
```

---

## Screen 3: Home Feed

```
┌─────────────────────────┐
│  Good morning, Asim 👋  │
│  [🔔 3]          [⚙]   │
├─────────────────────────┤
│                         │
│  YOUR MANUAL            │
│  ┌─────────────────────┐│
│  │ 👤 Asim Saleem      ││
│  │ Builder. INTJ.      ││
│  │ ████████████░ 80%   ││
│  │ [Continue Building] ││
│  └─────────────────────┘│
│                         │
│  RECENT ACTIVITY        │
│  ┌─────────────────────┐│
│  │ ❤️ Sarah liked your  ││
│  │    manual  2m ago   ││
│  └─────────────────────┘│
│  ┌─────────────────────┐│
│  │ 👥 James following  ││
│  │    you  1h ago      ││
│  └─────────────────────┘│
│                         │
│  DISCOVER               │
│  ┌───────┐ ┌───────┐   │
│  │ 👤    │ │ 👤    │   │
│  │ Fatima│ │ Omar  │   │
│  │ PM    │ │ Dev   │   │
│  └───────┘ └───────┘   │
├─────────────────────────┤
│ 🏠  🔍  📖  🔔  👤     │
│Home Exp. Manual Notif Me│
└─────────────────────────┘
```

---

## Screen 4: My Manual View (Mobile)

```
┌─────────────────────────┐
│                         │
│  [COVER IMAGE - full]   │
│                         │
│  ┌─────────────────────┐│
│  │ 👤(96px)            ││
│  │ Asim Saleem         ││
│  │ Builder. INTJ.      ││
│  │ 🏙️ Lahore, Pakistan  ││
│  │                     ││
│  │ [❤️247] [+Follow]   ││
│  └─────────────────────┘│
│                         │
│  ─── About Me ──────── │
│  "I'm a software eng... ││
│  [read more]            │
│                         │
│  ─── INTJ Personality ─│
│  ┌─────────────────────┐│
│  │ 🧠 The Architect    ││
│  │ Strategic • Independent│
│  └─────────────────────┘│
│                         │
│  ─── Skills ───────────│
│  TypeScript ●●●●●      │
│  NestJS     ●●●●○      │
│  PostgreSQL ●●●●●      │
│                         │
│  ─── My Story ─────────│
│  ● 2024 Tech Lead 🚀   │
│  ● 2022 TechCorp 💼    │
│  ● 2018 University 🎓  │
│                         │
│  ─── Fun Facts ────────│
│  "⌨️ I type at 120 WPM" │
│  [Tap for another →]   │
│                         │
│ 🏠  🔍  📖  🔔  👤     │
└─────────────────────────┘
```

---

## Screen 5: Manual Builder (Mobile)

```
┌─────────────────────────┐
│  ← Builder   [Preview] │
│  Completion: 80% ████░  │
├─────────────────────────┤
│                         │
│  ┌─────────────────────┐│
│  │ 📝 Basic Info  [✎] ││
│  │ Asim Saleem         ││
│  │ Lahore, Pakistan    ││
│  └─────────────────────┘│
│                         │
│  ┌─────────────────────┐│
│  │ 📖 About Me    [✎] ││
│  │ "I'm a software..." ││
│  │ [✨ AI Rewrite]     ││
│  └─────────────────────┘│
│                         │
│  ┌─────────────────────┐│
│  │ 🗓️ My Story    [✎] ││
│  │ 4 events            ││
│  └─────────────────────┘│
│                         │
│  ───── Add Section ─────│
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐  │
│  │🏋│ │📸│ │🎵│ │🗺│  │
│  │Goals│Photos│Music│Map│
│  └──┘ └──┘ └──┘ └──┘  │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐  │
│  │💪│ │😂│ │🌟│ │📝│  │
│  │Strengths│Memes│Goals│Custom│
│  └──┘ └──┘ └──┘ └──┘  │
│                         │
│  [✨ Generate with AI]  │
│                         │
│ 🏠  🔍  📖  🔔  👤     │
└─────────────────────────┘
```

---

## Screen 6: Section Editor (Bottom Sheet)

```
┌─────────────────────────┐
│  Edit: Skills      [✓] │
├─────────────────────────┤
│                         │
│  + Add Skill            │
│                         │
│  ┌─────────────────────┐│
│  │ TypeScript          ││
│  │ Frontend  ●●●●●     ││
│  │ 4 years  [✎] [✕]  ││
│  └─────────────────────┘│
│                         │
│  ┌─────────────────────┐│
│  │ NestJS              ││
│  │ Backend   ●●●●○     ││
│  │ 3 years  [✎] [✕]  ││
│  └─────────────────────┘│
│                         │
│  [+ Add Another Skill]  │
│                         │
│  [✨ AI Suggest Skills] │
└─────────────────────────┘
```

---

## Screen 7: Explore (Search)

```
┌─────────────────────────┐
│  🔍 [Search people...]  │
├─────────────────────────┤
│  Filters:               │
│  [INTJ] [Dev] [Lahore] │
│         [+ Filter]      │
├─────────────────────────┤
│  FEATURED               │
│  ┌───────┐ ┌───────┐   │
│  │ 👤    │ │ 👤    │   │
│  │ Asim  │ │ Sarah │   │
│  │ INTJ  │ │ ENFP  │   │
│  │ Eng   │ │ Design│   │
│  │ 1.2k  │ │ 890   │   │
│  └───────┘ └───────┘   │
│                         │
│  ALL USERS (52)         │
│  ┌─────────────────────┐│
│  │ 👤 Asim Saleem      ││
│  │ Engineer · INTJ     ││
│  │ Lahore, Pakistan    ││
│  │ [View Manual →]     ││
│  └─────────────────────┘│
│  ┌─────────────────────┐│
│  │ 👤 Sarah Ahmad      ││
│  │ Designer · ENFP     ││
│  │ Dubai, UAE          ││
│  │ [View Manual →]     ││
│  └─────────────────────┘│
│                         │
│ 🏠  🔍  📖  🔔  👤     │
└─────────────────────────┘
```

---

## Screen 8: Company View (Mobile)

```
┌─────────────────────────┐
│  🏢 TechCorp       [⚙] │
├─────────────────────────┤
│  ┌──────┐ ┌──────┐     │
│  │  48  │ │  38  │     │
│  │ Emp  │ │Manual│     │
│  └──────┘ └──────┘     │
├─────────────────────────┤
│  🎂 TODAY'S BIRTHDAYS   │
│  🎉 Ahmed Ali           │
├─────────────────────────┤
│  👋 NEW JOINERS         │
│  Zara Khan (Mon)        │
├─────────────────────────┤
│  🔍 [Search employees...]│
│                         │
│  ┌─────────────────────┐│
│  │ 👤 Asim Saleem      ││
│  │ Tech Lead · Eng     ││
│  │ INTJ                ││
│  └─────────────────────┘│
│  ┌─────────────────────┐│
│  │ 👤 Sarah Ahmad      ││
│  │ Sr. Designer · Des  ││
│  │ ENFP                ││
│  └─────────────────────┘│
│                         │
│ 🏠  🔍  📖  🔔  👤     │
└─────────────────────────┘
```

---

## Push Notification Examples

```
📱 "Sarah liked your manual"
📱 "🏆 Achievement Unlocked: Storyteller!"
📱 "James from TechCorp started following you"
📱 "🎂 Today is Ahmed's birthday — wish them!"
📱 "Your manual just hit 500 views 🎉"
📱 "Ahmed commented: 'Great story section!'"
```
