# Human Manual — Design System

> Goal: HR software is boring. This should feel **alive**.

---

## Design Philosophy

| Principle | Description |
|-----------|-------------|
| **Alive** | Every interaction has motion. Nothing is static. |
| **Personal** | Feels like it belongs to the individual using it. |
| **Premium** | Not another gray SaaS. Think Notion × Spotify × Linear. |
| **Playful** | Memes, GIFs, emojis are first-class citizens. |
| **Readable** | Beauty never sacrifices clarity. |

---

## Color System

### Core Palette

```css
/* Design Tokens — globals.css */
:root {
  /* ── Background ── */
  --bg-base:        #0A0A0F;   /* near-black, slightly blue */
  --bg-surface:     #12121A;   /* cards, panels */
  --bg-elevated:    #1C1C28;   /* modals, dropdowns */
  --bg-overlay:     #24243A;   /* hover states */

  /* ── Primary: Purple → Blue Gradient ── */
  --primary-500:    #6366F1;   /* Indigo */
  --primary-600:    #4F46E5;
  --primary-400:    #818CF8;
  --primary-gradient: linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A78BFA 100%);

  /* ── Secondary: Orange ── */
  --secondary-500:  #F97316;   /* Orange */
  --secondary-400:  #FB923C;
  --secondary-600:  #EA580C;

  /* ── Accent: Neon Cyan ── */
  --accent-500:     #06B6D4;   /* Cyan */
  --accent-400:     #22D3EE;
  --accent-glow:    rgba(6, 182, 212, 0.3);

  /* ── Semantic ── */
  --success:        #10B981;   /* Emerald */
  --warning:        #F59E0B;   /* Amber */
  --error:          #EF4444;   /* Red */
  --info:           #3B82F6;   /* Blue */

  /* ── Text ── */
  --text-primary:   #F8FAFC;
  --text-secondary: #94A3B8;
  --text-tertiary:  #475569;
  --text-inverse:   #0A0A0F;

  /* ── Border ── */
  --border-subtle:  rgba(255,255,255,0.06);
  --border-default: rgba(255,255,255,0.10);
  --border-strong:  rgba(255,255,255,0.20);

  /* ── Glow Effects ── */
  --glow-primary:   0 0 40px rgba(99, 102, 241, 0.3);
  --glow-cyan:      0 0 40px rgba(6, 182, 212, 0.25);
  --glow-orange:    0 0 40px rgba(249, 115, 22, 0.25);
}
```

---

## Typography

```css
/* Font Stack */
--font-display:  'Cal Sans', 'Inter', system-ui, sans-serif;  /* headings */
--font-body:     'Inter', system-ui, sans-serif;               /* body */
--font-mono:     'JetBrains Mono', 'Fira Code', monospace;    /* code */

/* Type Scale */
--text-xs:    0.75rem;   /* 12px */
--text-sm:    0.875rem;  /* 14px */
--text-base:  1rem;      /* 16px */
--text-lg:    1.125rem;  /* 18px */
--text-xl:    1.25rem;   /* 20px */
--text-2xl:   1.5rem;    /* 24px */
--text-3xl:   1.875rem;  /* 30px */
--text-4xl:   2.25rem;   /* 36px */
--text-5xl:   3rem;      /* 48px */
--text-6xl:   3.75rem;   /* 60px */
--text-7xl:   4.5rem;    /* 72px */

/* Font Weights */
--weight-regular:   400;
--weight-medium:    500;
--weight-semibold:  600;
--weight-bold:      700;
--weight-extrabold: 800;
--weight-black:     900;
```

---

## Spacing System

```css
/* 4px base grid */
--space-1:   0.25rem;   /* 4px */
--space-2:   0.5rem;    /* 8px */
--space-3:   0.75rem;   /* 12px */
--space-4:   1rem;      /* 16px */
--space-5:   1.25rem;   /* 20px */
--space-6:   1.5rem;    /* 24px */
--space-8:   2rem;      /* 32px */
--space-10:  2.5rem;    /* 40px */
--space-12:  3rem;      /* 48px */
--space-16:  4rem;      /* 64px */
--space-20:  5rem;      /* 80px */
--space-24:  6rem;      /* 96px */
```

---

## Border Radius

```css
--radius-sm:   4px;
--radius-md:   8px;
--radius-lg:   12px;
--radius-xl:   16px;
--radius-2xl:  24px;
--radius-3xl:  32px;
--radius-full: 9999px;
```

---

## Shadows & Elevation

```css
--shadow-sm:  0 1px 2px rgba(0,0,0,0.4);
--shadow-md:  0 4px 16px rgba(0,0,0,0.5);
--shadow-lg:  0 8px 32px rgba(0,0,0,0.6);
--shadow-xl:  0 16px 64px rgba(0,0,0,0.7);

/* Glow Cards */
--card-glow-purple: 0 0 0 1px rgba(99,102,241,0.2), 0 8px 32px rgba(99,102,241,0.15);
--card-glow-cyan:   0 0 0 1px rgba(6,182,212,0.2),  0 8px 32px rgba(6,182,212,0.15);
--card-glow-orange: 0 0 0 1px rgba(249,115,22,0.2), 0 8px 32px rgba(249,115,22,0.15);
```

---

## Component Library

### Button

```tsx
// components/ui/Button.tsx
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gradient';
type ButtonSize    = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Variants:
// primary   → solid indigo, scale on hover
// gradient  → purple→cyan gradient, glowing shadow
// secondary → outlined, border-primary
// ghost     → transparent, text-primary on hover
// danger    → red, for destructive actions

<Button variant="gradient" size="lg" loading={false}>
  Build My Manual ✨
</Button>

<Button variant="primary" leftIcon={<PlusIcon />}>
  Add Section
</Button>
```

### Card

```tsx
// Base card with glass morphism
<Card variant="glass" glow="purple">
  <CardHeader>
    <Avatar src={user.avatarUrl} size="lg" />
    <CardTitle>{user.displayName}</CardTitle>
    <CardSubtitle>{user.occupation}</CardSubtitle>
  </CardHeader>
  <CardBody>...</CardBody>
</Card>

// Variants: 'default' | 'glass' | 'gradient' | 'bordered'
// Glow: 'purple' | 'cyan' | 'orange' | 'none'
```

### Badge

```tsx
// Personality type badge
<PersonalityBadge type="INTJ" />
// Renders: purple pill with "INTJ" + "The Architect" tooltip

// Skill level badge
<SkillBadge name="TypeScript" level={5} />

// Achievement badge
<AchievementBadge type="profile_complete" earned />
```

### Section Block

```tsx
// Drag-and-droppable section
<SectionBlock
  type="strengths"
  title="My Strengths"
  isEditing={false}
  onEdit={() => {}}
  onDelete={() => {}}
  onReorder={() => {}}
>
  <StrengthsGrid strengths={strengths} />
</SectionBlock>
```

---

## Animation Tokens (Framer Motion)

```typescript
// animations.ts
export const animations = {
  fadeIn: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.92 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
  slideInLeft: {
    initial: { opacity: 0, x: -24 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
  stagger: {
    animate: { transition: { staggerChildren: 0.08 } },
  },
  hover: {
    whileHover: { scale: 1.02, y: -2 },
    whileTap:   { scale: 0.98 },
    transition: { type: 'spring', stiffness: 400, damping: 20 },
  },
  glow: {
    animate: {
      boxShadow: [
        '0 0 20px rgba(99,102,241,0.2)',
        '0 0 40px rgba(99,102,241,0.4)',
        '0 0 20px rgba(99,102,241,0.2)',
      ],
    },
    transition: { duration: 2, repeat: Infinity },
  },
};
```

---

## Theme Presets

| Preset Name | Primary | Accent | Feel |
|-------------|---------|--------|------|
| `purple_dream` | Indigo #6366F1 | Cyan #06B6D4 | Default – mysterious, modern |
| `sunset_hustle` | Orange #F97316 | Pink #EC4899 | Energetic, bold |
| `ocean_deep` | Teal #0D9488 | Blue #3B82F6 | Calm, trustworthy |
| `midnight_gold` | Gold #EAB308 | Amber #F59E0B | Luxurious, warm |
| `forest_focus` | Green #10B981 | Lime #84CC16 | Natural, grounded |
| `rose_quartz` | Rose #F43F5E | Pink #EC4899 | Romantic, personal |
| `steel_pulse` | Slate #64748B | Cyan #06B6D4 | Minimal, professional |

---

## Micro-interactions

| Trigger | Animation |
|---------|-----------|
| Manual card hover | Lift 4px + glow ring appears |
| Section added | Slide in from top + confetti burst |
| Achievement unlocked | Full-screen particle explosion + badge zoom |
| Profile completion milestone | Progress bar pulse + celebration toast |
| Reaction added | Emoji bounces + counter increments |
| Follow button click | Heart fill animation + counter tick |
| Manual published | Fireworks overlay (3 seconds) |
| Personality badge first set | MBTI type reveals with typewriter effect |
| Skill level 5 reached | "Expert" badge shimmer animation |
| Streak milestone | Flame emoji grows + streak counter spins |
