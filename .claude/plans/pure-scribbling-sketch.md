# fal.ai Replica - Implementation Plan

## Context
Building a full replica of fal.ai with Next.js + Tailwind, Supabase Auth/DB, and a Gradio-style AI playground where users bring their own API keys.

## Tech Stack
- Next.js 14+ (App Router, TypeScript)
- Tailwind CSS (dark theme)
- Supabase (Auth + Postgres)
- Framer Motion (animations)
- Radix UI (accessible primitives)
- Zustand (state management)
- @fal-ai/client (AI inference)

## Pages
| Route | Description |
|-------|-------------|
| `/` | Homepage - hero, features, model preview, code examples, pricing, CTA |
| `/models` | Model gallery with category filters and search |
| `/models/[id]` | Model playground (Gradio-style) |
| `/pricing` | Pricing tiers |
| `/sign-in` | Sign in (email + OAuth) |
| `/sign-up` | Sign up |
| `/dashboard` | User overview, recent generations |
| `/dashboard/api-keys` | Manage fal.ai API keys |
| `/dashboard/generations` | Generation history |
| `/dashboard/settings` | Profile settings |

## Database (Supabase)
- `profiles` - extends auth.users (name, avatar)
- `api_keys` - encrypted fal.ai keys per user
- `generations` - generation history (model, input, output, status)
- `models` - optional server-side model catalog

## Design System
- Dark theme only (bg: #09090b)
- Glass cards: bg-white/[0.03], border-white/[0.06]
- Accent: indigo-500 (#6366f1) gradient
- Fonts: Inter Tight (headings), Inter (body), JetBrains Mono (code)
- Generous spacing (py-24+ between sections)
- Framer Motion scroll reveals + hover effects

## Build Order (10 Phases)

### Phase 1: Foundation
- Create Next.js project, install deps
- Set up design tokens in globals.css
- Build Button component, verify rendering

### Phase 2: Layout Shell
- Navbar (sticky, blur, responsive)
- Footer (4-column grid)
- Marketing layout, stub all pages

### Phase 3: Homepage
- Hero section with animated code demo + gradient glow
- Stats row, features grid, model preview cards
- Code examples (tabbed), pricing preview, bottom CTA
- Scroll-reveal animations

### Phase 4: UI Components
- Input, Slider, Select, Tabs, Dialog, Badge, Card
- Skeleton, Toast, CodeBlock, Tooltip (all Radix-based)

### Phase 5: Model Gallery
- Static model catalog (~30 models with inputSchema)
- Model cards, category tabs, search/sort filters
- Responsive grid layout

### Phase 6: Supabase Setup
- Create migrations (profiles, api_keys, generations)
- Configure Auth (email, Google, GitHub OAuth)
- Supabase client helpers (browser, server, middleware)

### Phase 7: Auth Pages
- Sign in/up forms with OAuth buttons
- OAuth callback handler
- Middleware for route protection
- Navbar auth state (avatar vs sign-in buttons)

### Phase 8: Playground
- Zustand store for API key (localStorage)
- Dynamic form renderer from model inputSchema
- Split-pane layout (inputs left, output right)
- fal.ai proxy route, queue status, output display
- Live-updating code snippet

### Phase 9: Dashboard
- Sidebar layout, overview page
- Generation history with infinite scroll
- API key CRUD
- Profile settings

### Phase 10: Polish
- Loading skeletons, error boundaries
- SEO metadata, responsive audit
- Keyboard shortcuts, toast notifications
- Accessibility check (contrast, focus rings, tab nav)

## Verification
- Run dev server and test each page visually
- Test auth flow end-to-end (email + OAuth)
- Test playground with a real fal.ai API key
- Check responsive at 320px, 768px, 1024px, 1440px
- Verify dashboard shows real generation history
