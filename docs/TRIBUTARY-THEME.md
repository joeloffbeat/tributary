# Tributary Brand & Theme Guide

## Brand Essence

**Tributary** = A stream that flows into a larger river

**Metaphor:** Your royalty income is a tributary — small streams of payment that flow together, growing as they reach more investors, creating a river of value.

---

## Design Philosophy

| Principle | Meaning |
|-----------|---------|
| **Flow** | Everything should feel fluid, connected, continuous |
| **Trust** | Financial product = needs to feel secure, institutional |
| **Modern** | Web3-native but not crypto-bro aesthetic |
| **Creator-friendly** | Approachable, not intimidating |

---

## Color Palette

### Primary Colors

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  DEEP RIVER                    FLOWING TEAL                     │
│  ████████████                  ████████████                     │
│  #0F172A                       #14B8A6                          │
│                                                                 │
│  Primary background            Primary accent                   │
│  Dark, deep like river bed     Fresh, flowing water             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Secondary Colors

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  SURFACE                       MUTED                            │
│  ████████████                  ████████████                     │
│  #1E293B                       #334155                          │
│                                                                 │
│  Cards, elevated surfaces      Borders, disabled states         │
│                                                                 │
│  ──────────────────────────────────────────────────────────     │
│                                                                 │
│  STREAM BLUE                   OCEAN DEEP                       │
│  ████████████                  ████████████                     │
│  #06B6D4                       #0EA5E9                          │
│                                                                 │
│  Secondary accent              Links, interactive               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Semantic Colors

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  SUCCESS (Earnings)            WARNING (Pending)                │
│  ████████████                  ████████████                     │
│  #10B981                       #F59E0B                          │
│  Emerald green                 Amber                            │
│                                                                 │
│  ERROR (Failed)                INFO (Neutral)                   │
│  ████████████                  ████████████                     │
│  #EF4444                       #6366F1                          │
│  Red                           Indigo                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Gradient (Hero/Feature Sections)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  TRIBUTARY FLOW GRADIENT                                        │
│                                                                 │
│  ████████████████████████████████████████████████████████████   │
│  #0F172A → #134E4A → #14B8A6 → #06B6D4                          │
│                                                                 │
│  Deep river → Teal depths → Flowing water → Light stream        │
│                                                                 │
│  CSS: linear-gradient(135deg, #0F172A 0%, #134E4A 40%,          │
│                                #14B8A6 70%, #06B6D4 100%)       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Typography

### Font Stack

```
Primary (Headings):    Inter or Satoshi
Secondary (Body):      Inter
Monospace (Numbers):   JetBrains Mono or IBM Plex Mono

Why Inter?
- Clean, professional, excellent number rendering
- Great for financial data display
- Widely available, fast loading
```

### Scale

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Display      48px / 3rem      Hero headlines                   │
│  H1           36px / 2.25rem   Page titles                      │
│  H2           30px / 1.875rem  Section headers                  │
│  H3           24px / 1.5rem    Card titles                      │
│  H4           20px / 1.25rem   Subsections                      │
│  Body         16px / 1rem      Default text                     │
│  Small        14px / 0.875rem  Labels, captions                 │
│  Tiny         12px / 0.75rem   Badges, tags                     │
│                                                                 │
│  Numbers:     Always use tabular-nums for alignment             │
│               font-variant-numeric: tabular-nums;               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Logo Concepts

### Option A: Abstract River Fork

```
     ╲
      ╲
       ╲________
       /
      /
     /

Represents tributaries merging into main river
Clean, minimal, works at small sizes
```

### Option B: Flow Symbol

```
    ～～～
      ↘
       ●

Wave lines flowing into a point (vault)
More playful, friendly
```

### Option C: Lettermark "T"

```
    ━━━━━━━
       │
       │
       ▼

T with downward flow indicator
Professional, corporate-friendly
```

### Option D: Water Drop + Chart

```
      ◢
     ◢ ◣
    ◢   ◣
   ▔▔▔▔▔▔▔

Drop shape with rising chart inside
Combines water + financial growth
```

**Recommendation:** Option A or C for professional look, Option B for friendly creator vibe.

---

## UI Components

### Cards

```css
/* Vault Card */
.vault-card {
  background: linear-gradient(
    180deg,
    rgba(30, 41, 59, 0.8) 0%,    /* slate-800 */
    rgba(15, 23, 42, 0.9) 100%   /* slate-900 */
  );
  border: 1px solid rgba(51, 65, 85, 0.5); /* slate-700 */
  border-radius: 16px;
  backdrop-filter: blur(12px);

  /* Subtle glow on hover */
  &:hover {
    border-color: rgba(20, 184, 166, 0.3); /* teal-500 */
    box-shadow: 0 0 30px rgba(20, 184, 166, 0.1);
  }
}
```

### Buttons

```css
/* Primary Button - Teal Flow */
.btn-primary {
  background: linear-gradient(135deg, #14B8A6 0%, #0D9488 100%);
  color: white;
  border-radius: 12px;
  font-weight: 600;

  &:hover {
    background: linear-gradient(135deg, #0D9488 0%, #0F766E 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 20px rgba(20, 184, 166, 0.3);
  }
}

/* Secondary Button - Outline */
.btn-secondary {
  background: transparent;
  border: 1px solid #334155;
  color: #E2E8F0;

  &:hover {
    border-color: #14B8A6;
    color: #14B8A6;
  }
}

/* Ghost Button */
.btn-ghost {
  background: rgba(51, 65, 85, 0.3);
  color: #94A3B8;

  &:hover {
    background: rgba(51, 65, 85, 0.5);
    color: #E2E8F0;
  }
}
```

### Input Fields

```css
.input {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid #334155;
  border-radius: 12px;
  color: #E2E8F0;

  &:focus {
    border-color: #14B8A6;
    box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
  }

  &::placeholder {
    color: #64748B;
  }
}
```

### Stats/Numbers Display

```css
/* Big number display (vault value, earnings) */
.stat-value {
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #F1F5F9 0%, #94A3B8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Positive change */
.stat-positive {
  color: #10B981;
}

/* Negative change */
.stat-negative {
  color: #EF4444;
}
```

---

## Visual Motifs

### 1. Flow Lines (Background Pattern)

```
Subtle animated flowing lines in background
Like water currents or data streams

CSS Animation:
- Horizontal wave lines
- Very low opacity (5-10%)
- Slow, gentle movement
- Suggests constant flow of royalties
```

### 2. Particle Flow (Hero Section)

```
Particles flowing from top-left to bottom-right
Representing royalties moving through the system

- Small dots (2-4px)
- Teal/cyan color
- Variable speeds
- Converge toward center (vault)
```

### 3. Ripple Effect (On Actions)

```
When transactions happen:
- Circular ripple expands from point of action
- Teal color, fading to transparent
- Represents impact flowing outward
```

### 4. Stream Connectors (Data Flow)

```
When showing data relationships:
- Curved lines connecting elements
- Animated dashed lines for "in progress"
- Solid lines for "complete"
- Shows how royalties flow through system
```

---

## Page Layouts

### Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  HEADER: Logo | Navigation | Wallet Connect             │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌──────────────────────┐  ┌────────────────────────────────┐   │
│  │                      │  │                                │   │
│  │  HERO STATS          │  │  QUICK ACTIONS                 │   │
│  │  Total Value         │  │  + Create Vault                │   │
│  │  Total Earnings      │  │  Browse Marketplace            │   │
│  │  Active Vaults       │  │  Claim All                     │   │
│  │                      │  │                                │   │
│  └──────────────────────┘  └────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  YOUR VAULTS                                    [View All]│   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐           │    │
│  │  │ Vault 1    │ │ Vault 2    │ │ Vault 3    │           │    │
│  │  │ $1,234     │ │ $567       │ │ $890       │           │    │
│  │  │ +12% APY   │ │ +8% APY    │ │ +15% APY   │           │    │
│  │  └────────────┘ └────────────┘ └────────────┘           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  RECENT ACTIVITY                                        │    │
│  │  ─────────────────────────────────────────────────────  │    │
│  │  → Royalty received: $45.00          2 min ago          │    │
│  │  → Token sold: 500 SONG-ROY          1 hour ago         │    │
│  │  → New investor: 0x1234...           3 hours ago        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Vault Detail Page

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back to Dashboard                                            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                                                         │    │
│  │  ┌────────────┐  SUMMER VIBES ROYALTIES                 │    │
│  │  │            │  SONG-ROY                               │    │
│  │  │  [Cover]   │                                         │    │
│  │  │            │  Created by: 0x1234...5678              │    │
│  │  └────────────┘  Verified on Story Protocol ✓           │    │
│  │                                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐       │
│  │ Total Value    │ │ Your Tokens    │ │ Claimable      │       │
│  │ $12,450        │ │ 1,000 (10%)    │ │ $45.67         │       │
│  │ ▲ 12% 30d      │ │ ≈ $1,245       │ │ [Claim Now]    │       │
│  └────────────────┘ └────────────────┘ └────────────────┘       │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  TABS: [Overview] [Analytics] [Holders] [Trade]         │    │
│  │  ───────────────────────────────────────────────────────│    │
│  │                                                         │    │
│  │  📈 Royalty History                                     │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │     $800 ┤                              ╭────   │    │    │
│  │  │     $600 ┤                    ╭─────────╯       │    │    │
│  │  │     $400 ┤          ╭─────────╯                 │    │    │
│  │  │     $200 ┤──────────╯                           │    │    │
│  │  │          └──────────────────────────────────────│    │    │
│  │  │           Jan   Feb   Mar   Apr   May   Jun     │    │    │
│  │  └─────────────────────────────────────────────────┘    │    │
│  │                                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Animations

### 1. Flow Loading Spinner

```css
/* Water drop ripple effect */
@keyframes ripple {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.loader {
  position: relative;
  width: 40px;
  height: 40px;
}

.loader::before,
.loader::after {
  content: '';
  position: absolute;
  border: 2px solid #14B8A6;
  border-radius: 50%;
  animation: ripple 1.5s infinite;
}

.loader::after {
  animation-delay: 0.5s;
}
```

### 2. Value Update Animation

```css
/* Number counting up animation */
@keyframes countUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.value-update {
  animation: countUp 0.3s ease-out;
}
```

### 3. Stream Flow (Background)

```css
@keyframes streamFlow {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 100% 50%;
  }
}

.stream-bg {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(20, 184, 166, 0.05) 50%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: streamFlow 8s linear infinite;
}
```

### 4. Success Celebration

```css
/* When royalty is received or claimed */
@keyframes celebrate {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 40px rgba(16, 185, 129, 0.4);
  }
  100% {
    transform: scale(1);
  }
}

.success-pulse {
  animation: celebrate 0.5s ease-out;
}
```

---

## Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Primary
        'tributary': {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',  // Primary
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
          950: '#042F2E',
        },
        // Surfaces
        'river': {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',  // Card bg
          900: '#0F172A',  // Main bg
          950: '#020617',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'tributary-gradient': 'linear-gradient(135deg, #0F172A 0%, #134E4A 40%, #14B8A6 70%, #06B6D4 100%)',
        'card-gradient': 'linear-gradient(180deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
      },
      boxShadow: {
        'glow': '0 0 30px rgba(20, 184, 166, 0.15)',
        'glow-lg': '0 0 60px rgba(20, 184, 166, 0.2)',
      },
      animation: {
        'flow': 'streamFlow 8s linear infinite',
        'ripple': 'ripple 1.5s infinite',
      },
    },
  },
}
```

---

## Dark Mode (Default)

Tributary should be **dark mode by default** because:
1. Financial dashboards look more premium in dark mode
2. Easier on eyes for monitoring
3. Teal accents pop better on dark backgrounds
4. Feels more "DeFi native"

Light mode can be optional but dark is primary.

---

## Iconography

Use **Lucide Icons** (already in shadcn/ui) with these for key concepts:

| Concept | Icon |
|---------|------|
| Vault | `Vault` or `Lock` |
| Royalties | `Coins` or `DollarSign` |
| Flow/Stream | `Waves` or `TrendingUp` |
| Token | `Coins` or `CircleDollarSign` |
| Claim | `Download` or `HandCoins` |
| Distribute | `Share2` or `GitBranch` |
| Creator | `User` or `Palette` |
| Investor | `PiggyBank` or `Landmark` |
| IP Asset | `FileAudio` / `Image` / `Code` |
| Analytics | `BarChart3` or `LineChart` |

---

## Summary: Theme at a Glance

| Element | Choice |
|---------|--------|
| **Primary Color** | Teal #14B8A6 |
| **Background** | Dark slate #0F172A |
| **Accent** | Cyan #06B6D4 |
| **Success** | Emerald #10B981 |
| **Font** | Inter + JetBrains Mono |
| **Corners** | Rounded (12-16px) |
| **Shadows** | Soft glows, not hard shadows |
| **Motion** | Flowing, water-like animations |
| **Mode** | Dark by default |
| **Vibe** | Premium DeFi meets creator-friendly |
