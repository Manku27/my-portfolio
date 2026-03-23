# AGENTS.md — Mayank Portfolio
> Read this before touching any code. This file exists so every coding session
> starts with full context. Update it when decisions change.

---

## Instructions for every session

- Read this file fully before writing any code
- Read `docs/portfolio-ideation.md` for the full reasoning behind decisions
- Check `utils/` before creating any utility function — it may already exist
- Put all new utility functions in `utils/` — never inline in components
- Always verify latest stable version before installing any new package
- All data imports come from `lib/data/index.ts` — never from individual data files directly
- Never hardcode content in components or pages

---

## What this project is

A personal portfolio and life-diary site for Mayank Jhunjhunwala — Senior Fullstack Engineer.

This is not a standard portfolio. It is a public record of a life — work, curiosity, taste, and craft in one place. The professional layer exists for recruiters. The rest is built for anyone who wants to understand who he is, not just what he's shipped.

The person behind this site: grew up poor, fought to go to Kota for JEE prep, had a mental breakdown, was pulled back by Batman and Spider-Man (literally — not a metaphor), landed at Jadavpur University, barely graduated with multiple backlogs, chose web development for financial pragmatism, started at 3.5 LPA, grew 7x in five years from a standing start with zero family advantage. Comics are not a hobby — they rebuilt him. Vishuddha Comics is that value made into a product. He builds things because they need to exist, not for portfolio or clout.

Full personal story and context lives in `lib/data/about.ts`.
Full ideation and decision reasoning lives in `docs/portfolio-ideation.md`.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.2.1 — App Router |
| Language | TypeScript — strict, always |
| Styling | Tailwind CSS v4 |
| 3D | React Three Fiber 9.5.0 + Drei 10.7.7 |
| Animation | GSAP + @gsap/react + ScrollTrigger + Lenis |
| Database | Neon (Postgres) — NOT YET WIRED |
| Image storage | Vercel Blob — NOT YET WIRED |
| Auth | Not implemented yet |
| Hosting | Vercel |

**R3F version pairing:** R3F 9 requires React 19. Do not downgrade either.

---

## Installed packages

```json
"dependencies": {
  "next": "16.2.1",
  "react": "19.x",
  "react-dom": "19.x",
  "three": "latest",
  "@react-three/fiber": "9.x",
  "@react-three/drei": "10.x",
  "gsap": "latest",
  "@gsap/react": "latest",
  "lenis": "latest"
}
```

**Not yet installed (add when wiring up data layer):**
- `@neondatabase/serverless`
- `@vercel/blob`

---

## Project structure

```
app/                    Next.js App Router pages
  layout.tsx            Root layout — fonts, global metadata
  page.tsx              / — Landing + timeline (spine of the site)
  work/
    page.tsx            /work — Clean professional layer, resume-equivalent
  content/
    page.tsx            /content — Blogs + videos index, filterable
    [slug]/
      page.tsx          /content/[slug] — Individual blog post, SSG
  books/
    page.tsx            /books — Reading log
  movies/
    page.tsx            /movies — Watchlist + reviews
  games/
    page.tsx            /games — Gaming log
  admin/
    page.tsx            /admin — Protected CMS (auth parked for later)

lib/
  types.ts              ALL TypeScript interfaces — single source of truth
  data/                 Real and seeded data — one file per domain
    index.ts            Barrel export — the ONLY import point for data
    about.ts            Full personal story, values, self-assessment
    profile.ts          Name, bio, socials, skills, availability
    work.ts             Work experience, consulting, projects, certs, education
    timeline.ts         Timeline entries — seeded from real life
    books.ts            Reading log
    movies.ts           Watch history
    games.ts            Gaming log — manual only, no API
    videos.ts           YouTube videos

components/
  3d/                   R3F canvas, particle system, scene components
  timeline/             Timeline and filter bar components
  ui/                   Shared UI components

utils/                  Reusable utility functions — always check here first

public/                 Static assets only
docs/
  portfolio-ideation.md Full ideation — concept, all decisions, all reasoning
```

---

## Data layer

**No database is connected yet.** Everything runs on static data files in `lib/data/`.

- Types live in `lib/types.ts`
- All data lives in `lib/data/` — one file per domain
- **Import only from `lib/data/index.ts`** — never from individual files
- When Neon is wired later, only `lib/data/index.ts` exports change — nothing else

### Content types (see `lib/types.ts`)
- `Profile` — name, bio, socials, skills, availability
- `About` — full personal story, values, strengths, gaps (see `lib/data/about.ts`)
- `TimelineEntry` — unified diary, one record per life event
- `WorkExperience` — job history
- `ConsultingEngagement` — consulting engagements
- `Project` — side projects
- `Certification` / `Award` / `Education`
- `Post` — blog post with markdown body
- `Video` — YouTube video
- `Book` — reading log entry
- `Movie` — watch history entry
- `Game` — gaming log entry

### Ratings — 1 to 10 everywhere, no exceptions
### Tags — freeform strings, no fixed taxonomy

---

## Utils

Before writing any helper or utility function:
1. Check `utils/` — it may already exist
2. If not, create it there with a descriptive filename
3. Never write utilities inline in components or pages
4. Named exports only

---

## Routing

| Route | Purpose |
|---|---|
| `/` | 3D hero → scroll → unified timeline |
| `/work` | Clean professional page, no timeline noise |
| `/content` | Blogs + videos, filterable |
| `/content/[slug]` | Individual blog post, SSG |
| `/books` | Reading log |
| `/movies` | Watchlist + reviews |
| `/games` | Gaming log |
| `/admin` | CMS — auth not implemented yet |

---

## 3D layer

Dark, atmospheric — ink dispersing in water. Hollow Knight influenced. Cursor-reactive in hero state, scroll drives transition into timeline.

- R3F `<Canvas>` — `position: fixed`, full viewport, behind everything
- HTML layers on top with `position: relative` and higher z-index
- All 3D in `components/3d/`
- Always `dynamic(() => import(...), { ssr: false })`
- `PerformanceMonitor` (Drei) — drop `dpr` to 0.75 on weak devices
- Flat CSS fallback for very low-end mobile

---

## Rendering strategy

| Content | Strategy |
|---|---|
| Blog posts | SSG via `generateStaticParams` |
| `/work` | Static |
| Timeline, `/books`, `/movies`, `/games` | Static |
| 3D canvas | Client-only, `ssr: false` |
| `/admin` | Client |

Never fetch content client-side for public pages.

---

## SEO

Every page needs a `metadata` export with title, description, openGraph, and canonical URL. Blog posts canonical URL always points to this domain, not Medium.

---

## Mobile

Hard constraint. Mobile styles first, desktop as overrides. `/admin` must work on phone. No hover-only interactions. 375px minimum.

---

## Conventions

- Named exports only from `lib/` and `utils/`
- No inline styles — Tailwind only
- No `any` — strict TypeScript
- PascalCase component files, one component per file
- No hardcoded content in components — everything from `lib/data/index.ts`
- `next/image` always, never raw `<img>`

---

## Build order

1. ✅ Scaffold
2. ✅ Packages installed — three, R3F, Drei, GSAP, @gsap/react, Lenis
3. ✅ `lib/types.ts` — all types defined
4. ✅ `lib/data/` — seeded with real data including personal story
5. ⬜ **Timeline on `/`** — the spine of the site, builds first
6. ⬜ Category pages — `/content`, `/books`, `/movies`, `/games`
7. ⬜ `/work` page
8. ⬜ 3D hero — drops on top of working content
9. ⬜ `/admin` — mobile-first CMS
10. ⬜ Auth for `/admin`
11. ⬜ Database (Neon) + Vercel Blob
12. ⬜ Breakout game — last

---

## What is NOT done yet

- No database
- No auth
- No Vercel Blob
- No routes beyond `/` scaffolded
- No `components/` directory
- No `utils/` directory
