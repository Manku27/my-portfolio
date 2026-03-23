# Portfolio Website — Ideation & Brief
> Living document. Built through conversation. Last updated: March 2026.

---

## The Concept

This is not a standard portfolio. It is a **public record of a life** — work, curiosity, taste, and craft, all in one place.

The professional layer exists and is clean enough for a recruiter. But the site is primarily built for people who want to understand who you are, not just what you've shipped. The interactive 3D aesthetic, the unified timeline, the books and movies and games — all of it signals: this person builds things because they genuinely love it.

The Breakout game is not decoration. It is a statement.

---

## Why This, Not a Standard Portfolio

A standard portfolio says "here's what I've done, hire me." The problem: it adds nothing a resume doesn't already do. It just shows you can copy-paste CSS.

What this site does differently:
- A resume lists Moebius. This site shows *why* it exists — the frustration that created it, what it actually does.
- A resume lists Wohana. This site shows the problem space, the e-signature decision, the tradeoffs.
- The timeline captures a pattern of curiosity across domains — Stable Diffusion one week, billable agents workshop the next, Pratibimb six months ago — that a resume structurally cannot carry.

The audience is not a volume recruiter scanning 200 profiles. It is an international engineer or hiring manager who finds you organically and wants to understand who they'd be working with. That person *will* read the site if it's interesting. The game will make them stay 30 more seconds. The timeline will make them curious. A note on why you built Vishuddha will make them remember you.

---

## Goals

### Immediate
- International remote visibility — show up as a peer, not cheap labor
- A link you can drop in applications that does more than a resume can
- Establish canonical web presence under your own domain

### Medium-term
- SEO authority built under your domain, not Medium's
- Show up when someone searches your name — on Google and increasingly on LLMs
- A living system you actually maintain because the friction is low enough

### Philosophy
- Open book — professional and personal, not partitioned
- Built for curiosity, not just credentialing
- Mobile-first, because you live on your phone

---

## Site Structure

```
/                   Landing (3D hero) → scroll → unified timeline
/work               Clean professional page — resume equivalent
/content            Blogs + YouTube videos — written and recorded
/content/[slug]     Individual blog post — statically generated
/books              Reading log — ratings, reviews, history
/movies             Watchlist + reviews
/games              Gaming log (may launch later)
/admin              Everything goes in here — protected, mobile-friendly
```

---

## Page-by-Page Breakdown

### `/` — Landing + Timeline

The hero is the 3D interactive layer — see 3D Design section below. On scroll, the timeline begins.

**The timeline is the spine of the site.** It is a unified, chronological feed of everything — work milestones, books read, movies watched, blog posts, videos published, workshops attended, personal projects shipped, stories worked on, gym PRs, rabbit holes explored. Think of it as a database of your life, rendered chronologically.

**Filter bar** sits at the top of the timeline. Categories:
- All
- Work
- Projects
- Books
- Movies
- Writing
- Videos
- Fitness
- Gaming
- Personal

Default view is everything. Filter to Work and you get a career timeline. Filter to Books and you get a reading history. A recruiter narrows it. You look back at your own year. Same structure, multiple audiences.

**Entry types vary:**
- Short entries — a few lines, a rating, an optional link (book read, movie watched, workshop attended)
- Rich entries — image, longer text, external link (project shipped, blog post, video)
- Milestone entries — visually distinct, for significant moments (new job, consulting contract, major launch)

---

### `/work` — Professional Layer

Clean, focused, resume-equivalent. No timeline noise. This is the link you drop in job applications and contract pitches.

The timeline filtered to "Work" is right for people who find you organically and want to explore. But for job applications and contracts, you'll be dropping a link. That link needs to land somewhere focused — a recruiter hitting the timeline with diary noise, even filterable, adds friction they won't bother with. Hence this page exists separately.

**Sections:**
- Summary — who you are, what you do, what you're looking for
- Experience — chronological, company + role + impact bullets
- Independent Consulting — Wohana, RaiseMatters, with context on what made each interesting
- Selected Projects — Moebius, PK Chai, ESLint plugins, Vishuddha, with real descriptions
- Skills — languages, frameworks, CMS, cloud, tooling
- Certifications — Contentful, Cloudinary, Azure
- Content & Open Source — Medium, YouTube, ESLint plugins with download numbers
- Education — Jadavpur University, with context

Same data as your resume. More room to breathe. No word count constraint.

---

### `/content` — Blogs + Videos

One page for all creative output — written and recorded. Filterable by type (Writing / Video).

The decision to combine blogs and videos into one `/content` page rather than separate `/writing` and `/videos` pages was deliberate. You're not a YouTuber who also blogs, or a blogger who also makes videos — you're someone who makes things and puts them out into the world. One page reflects that better.

**Blog posts:**
- Written natively on the site or uploaded as markdown
- Statically generated — content lives on your domain, not Medium's
- Medium as a mirror only — canonical URL always points here
- Full SEO metadata on every post

**Videos:**
- YouTube integration via YouTube Data API
- Paste a video URL in `/admin`, metadata and thumbnail pull automatically
- No manual uploads needed

**Individual blog post at `/content/[slug]`:**
- Statically generated at build time
- Proper metadata — title, description, OpenGraph, canonical URL
- Markdown rendered natively
- Reading time estimate
- Timeline entries that reference a post link here

---

### `/books` — Reading Log

Full reading history seeded from a one-time Goodreads scrape. Manual entries after.

**Per entry:**
- Cover art
- Title + author
- Your rating
- Short take (optional)
- Date read
- Genre tags

**Page features:**
- Sort by date read, rating, genre
- Reading stats — books per year, favourite genres, average rating
- Enough history on day one from the Goodreads scrape that it doesn't look empty at launch

---

### `/movies` — Watchlist + Reviews

Full watch history seeded from a one-time IMDB scrape. Manual entries after.

**Per entry:**
- Poster
- Title + year
- Your rating
- Short review (optional)
- Date watched

**Page features:**
- Sort by date watched, rating, genre
- Stats — films per year, favourite directors, average rating

---

### `/games` — Gaming Log

No PSN API (PlayStation has no public API — not feasible). No Steam scrape initially, though Steam does have a public API worth revisiting later for playtime and library data. Manual entry only for now.

**Per entry:**
- Cover image (uploaded manually)
- Title + platform
- Status — playing / completed / dropped
- Your rating
- Short take (optional)

**Launch decision:** if fewer than 10 entries are ready at launch, gaming entries live in the timeline only. `/games` as a dedicated page launches later when there's enough content to not look abandoned.

---

### `/admin` — Content Management

Password-protected. No separate CMS. Built into the Next.js app. Auth implementation parked for later — added after core site is built.

**Mobile-first by design** — you'll be updating this from your phone. Big tap targets, simple forms, no fiddly UI.

**Entry types in admin:**
- Short timeline entry — date, category, title, body, optional link, optional rating, optional image
- Blog post — title, slug, markdown upload or write-in-browser editor, tags, publish date
- Video — paste YouTube URL, metadata pulls automatically
- Book — title, author, rating, date read, short take (or bulk import from Goodreads)
- Movie — title, year, rating, date watched, short review (or bulk import from IMDB)
- Game — title, platform, status, rating, short take, cover image upload

---

## Data Layer

### Approach — Types First, Database Later

No database integration during initial build. The site is built against TypeScript types and mock data. The database schema is derived from the types once they stabilise, not the other way around.

**Why:** types evolve as you discover what the UI actually needs. Locking a schema before the UI is built creates painful migrations. Building against types first means the schema is proven by the time it matters.

**The rule:** all mock data lives in `lib/mock-data.ts`. One file, all exports. When the time comes to wire up the DB, that file's exports are replaced with real data fetching calls. Nothing else in the codebase changes.

**Types live in:** `lib/types.ts`. Every content type is a TypeScript interface. The DB schema is inferred from these — not the other way around.

### Caching Strategy (when DB is wired)

- SSG for all public pages — DB hit at build time, not per request
- Aggressive cache headers on all static pages
- Manual cache invalidation via `revalidatePath` or an on-demand revalidation endpoint
- DB reads are rare and predictable — this is a write-light, read-cached system

### Markdown Storage

Markdown stored directly in the database as a text column, not on disk. Reasons:
- SSG means the DB is hit at build time only — no per-request read cost
- No file system to manage, no deploy-time asset pipeline
- Simpler admin — write or upload markdown, it's stored, it's done

### Image Storage — Vercel Blob

Not Cloudinary (deliberately avoided for this project). Not local disk (Vercel filesystem is ephemeral — resets on every deploy).

**Vercel Blob** — Vercel's native object storage.
- Simple API, integrates natively with Next.js
- 5GB free tier, pay-as-you-go after
- Images upload through `/admin`, stored in Blob, URL saved in DB/mock data
- No third-party account or SDK complexity

### Database (when integrated)

Neon (Postgres). Already familiar, already used in PK Chai and Vishuddha.

**Reference schema** (derived from types, not prescriptive):
- `timeline_entries` — unified diary, with `ref_id`/`ref_type` pointing to books/movies/posts when auto-generated
- `posts` — markdown in a text column, slug as unique key
- `books` — with `goodreads_id` for dedup during scrape
- `movies` — with `imdb_id` for dedup during scrape
- `games` — manual only, cover image URL from Vercel Blob
- `videos` — `youtube_id` as unique key, metadata pulled from YouTube Data API

Ratings: 1–10 across all content types. Consistent scale everywhere.
Tags: freeform `TEXT[]` with GIN index. No fixed taxonomy.

### External Integrations

| Category | Integration | Method |
|---|---|---|
| Books | Goodreads | Scrape once to seed, manual after |
| Movies | IMDB | Scrape once to seed, manual after |
| Videos | YouTube Data API | Auto-pull on URL paste in admin |
| Writing | Medium | Mirror only, canonical on your domain |
| Gaming | — | Manual entry, images via Vercel Blob |

---

## Tech Stack

### Versions (confirmed latest stable, March 2026)

| Package | Version |
|---|---|
| Next.js | 16.2.1 |
| React | 19 |
| TypeScript | latest |
| @react-three/fiber | 9.5.0 |
| @react-three/drei | 10.7.7 |
| GSAP | latest |
| Lenis | latest |
| Tailwind CSS | v4 (ships with Next 16 default) |
| Neon | latest (integrated later) |
| @vercel/blob | latest (integrated later) |

**Important:** R3F 9 pairs with React 19. R3F 8 pairs with React 18. Don't mix these.

### Scaffold command
```bash
pnpm create next-app@latest portfolio --yes
cd portfolio
pnpm add three @react-three/fiber @react-three/drei gsap lenis
pnpm add -D @types/three
```

`--yes` gives you TypeScript, Tailwind v4, ESLint, App Router, and Turbopack out of the box.

### Core
- **Next.js 16** (App Router) — framework
- **TypeScript** — always
- **Neon** — Postgres database (integrated later)
- **Vercel** — hosting, CDN, edge caching
- **Vercel Blob** — image storage (integrated later)

### 3D & Animation
- **React Three Fiber 9 + Drei 10** — 3D scene on the landing
- **GSAP + ScrollTrigger** — scroll choreography
- **Lenis** — smooth scroll feel
- **GLSL shaders** — custom visual effects where needed

### Content
- Markdown — native blog posts, uploadable via admin, stored in DB as text
- Static generation (`generateStaticParams`) — every blog post built at compile time
- YouTube Data API — video metadata auto-pull

### Auth
- Parked. Added after core site is built.

---

## SEO Strategy

**The principle:** every piece of content lives on your domain. Medium is a distribution channel, not the source of truth.

**Implementation:**
- All blog posts statically generated — content in the initial HTML, not client-fetched
- `metadata` export on every page — title, description, OpenGraph, canonical URL
- Semantic HTML throughout — headings, alt tags, structured content
- Core Web Vitals — asset optimization, no blocking resources, performant 3D layer
- `/work` page structured for "Mayank Jhunjhunwala senior fullstack engineer" type searches

**LLM search visibility (emerging, not immediate):**
- Same signals as traditional SEO — crawlable text, structured content, authoritative domain
- Native long-form writing on your domain builds this over time
- Being an open book (the timeline, the reviews, the opinions) creates the kind of content LLMs surface when someone searches for a person

**The WebGL / SEO relationship:**
- 3D runs entirely client-side — crawlers never see it
- `<canvas>` is an empty tag to Googlebot
- All content — blog posts, project descriptions, timeline entries — is SSR'd or statically generated
- The 3D layer being client-only is irrelevant as long as *content* is not client-only

---

## Mobile

First-class constraint, not an afterthought.

- Every public page designed mobile-first
- `/admin` genuinely usable on phone — you will be updating this on the move
- 3D layer degrades gracefully on low-end mobile — flat animated fallback if needed
- `PerformanceMonitor` (Drei) watches FPS and drops `dpr` to 0.75 on weak devices
- Performance budget enforced — no unoptimized assets tanking mobile load time

---

## The Game — Breakout (Built Last)

**Concept:** Classic Breakout, but the bricks are your skills and technologies. TypeScript, Next.js, Contentful, Cloudinary, React Native — you break through them. Subtle meta-commentary. Immediately readable as a portfolio element without being cringe.

### All options considered

Five game concepts were evaluated before landing on Breakout:

| Option | Why considered | Why passed |
|---|---|---|
| Gravity Sketch — cursor-reactive particle field | Visually stunning, feels alive | Slightly overdone on senior dev portfolios. Also, this becomes the 3D hero itself — no need to make it a game too. |
| Asteroids-style game | Classic, universally understood, fun to build | No connection to the content. Generic. |
| Rhythm tap game | Unusual, engaging, shows musical taste | More build effort on timing logic. Interesting but not the best use of time. |
| **Breakout — bricks are your skills** | **Most portfolio-native. Game connects to content without being forced. Meta-commentary is subtle enough to work.** | **Chosen.** |
| Physics sandbox — project name boxes falling into a pile | Most fun and tactile, shows R3F capability immediately | Close second. May revisit as an easter egg or alternate mode. |

**Why last:** fully self-contained component, zero dependency on anything else in the site. Drop it in when everything else is done.

**Tech:** R3F + Rapier physics, or plain Canvas if simpler. Decided when we get there.

---

## Visual Design & Customization

### The constraint
One consistent theme across all pages. Enough visual consistency to feel like a system. Enough per-page customization to feel intentional, not templated.

### What this means in practice
- Shared: typography, color palette, spacing system, component library
- Per-page: layout, hero treatment, how content is displayed
- `/` feels immersive and 3D-forward
- `/work` feels clean and professional — the same person, different mode
- `/books`, `/movies`, `/games` can each have their own visual personality within the system — a books page feeling different from a movies page is intentional, not inconsistent

---

## 3D Layer — Design Decisions

### Mood options considered

Four directions were evaluated:

**A. Dark and cinematic** ← chosen
Deep blacks, slow-moving particles, subtle bloom. Serious, atmospheric. Feels like space or deep water.

**B. Light and architectural**
White/off-white, clean geometric forms, sharp lines. Feels like a design studio. High contrast, precise. Passed — doesn't fit the personality.

**C. Warm and textured**
Earthy tones, grain, ink-like particles. Closer to comics and illustration. Handmade feel. Close, but less immediately striking.

**D. Vibrant and energetic**
Bold colors, fast-moving elements, neon accents. High risk, high reward. Passed — too loud for the tone.

### Why dark and cinematic

The reference given was **Hollow Knight** — dark, hand-drawn, atmospheric. Deep blacks and dark blues, soft glowing accents, particles that feel like spores or embers drifting. Melancholic but not heavy. Beautiful but not flashy.

This fits for two reasons beyond personal taste:
1. **It's biographical.** The site is built by someone whose identity was literally rebuilt by comics and games at his lowest point. A site that visually references that world isn't random — it's honest.
2. **It reads correctly internationally.** Dark, atmospheric, and glowing reads as senior and considered. It doesn't look junior or generic.

### Refinement beyond Hollow Knight

Rather than directly replicating a specific game's aesthetic, the particle behaviour is made personal: **ink dispersing in water** — slow, organic, spreading from where the cursor moves. Ties to the comics and storytelling side of the work without being literal about it. Feels handcrafted. Nobody else will have it.

**Palette:**
- Background: near-blacks, deep navy / indigo
- Accent: one warm glowing color — dim gold, cold blue-white, or soft amber (decided during implementation when we can see it)
- Typography: weighted, with personality — not a generic sans-serif

**Motion language:**
- Slow and deliberate. Nothing snappy or bouncy.
- Things drift, fade, breathe.
- Localized glow — things emerge from darkness rather than being fully lit.

### Interaction model

Both cursor-reactive and scroll-driven, in sequence:

```
Hero state (stationary)
  → Ink-dispersion particle field, cursor-reactive
  → Camera drifts slightly with mouse movement
  → Slow ambient motion — particles drift and breathe

On scroll
  → Particles converge or dissolve downward
  → 3D layer fades / pulls back
  → Timeline emerges below, clean and readable
```

**Why both:** cursor interaction makes the hero feel alive without requiring anything from the user. Scroll then triggers a cinematic transition into the content. One feeds the other naturally. The sequence feels like entering a space and then choosing to explore it.

### Technical implementation notes
- R3F `<Canvas>` is `position: fixed`, full viewport, z-index behind everything
- Normal HTML/CSS content layered on top with `position: relative` and higher z-index
- The 3D is the background, the HTML is the foreground
- `PerformanceMonitor` (Drei) watches FPS — drops `dpr` to 0.75 on weak devices (~44% GPU load reduction)
- Flat CSS-animated fallback for very low-end mobile where WebGL is unreliable
- No design tool mockups before implementation — going straight to code to iterate in the browser

---

## Build Order

1. **TypeScript types** (`lib/types.ts`) — define all content types upfront. Everything is built against these.
2. **Mock data** (`lib/mock-data.ts`) — seeded from real resume and profile. One file, all exports. Replaced with DB calls later.
3. **`/work`** — quickest win, most immediately useful for job applications while the rest is being built.
4. **Timeline on `/`** — content layer first, 3D drops on top after.
5. **Category pages** — `/content`, `/books`, `/movies`, `/games`
6. **3D hero** — once everything under it works correctly.
7. **`/admin`** — form-based CMS, mobile-first.
8. **Auth for `/admin`** — added when core site is stable.
9. **Database + Vercel Blob** — wire up when types and UI are proven.
10. **Game** — last. Self-contained, no dependencies on anything else.

---

## What's Decided

| Decision | Answer |
|---|---|
| Concept | Public record of a life, not a standard portfolio |
| Timeline | On `/`, unified, filterable by category, revealed on scroll |
| Professional layer | `/work` — clean, separate, resume-equivalent |
| Content | `/content` — blogs + videos together, filterable |
| Category pages | `/books`, `/movies`, `/games` |
| Data approach | Types first, mock data, DB wired later |
| Mock data location | `lib/mock-data.ts` — single file, all exports |
| Types location | `lib/types.ts` |
| Database | Neon + Postgres (later) |
| Markdown storage | Text column in DB — not files on disk |
| Image storage | Vercel Blob — not Cloudinary, not local disk |
| Ratings | 1–10 everywhere, consistent scale |
| Tags | Freeform on all content types |
| External data | Goodreads + IMDB scraped once to seed, manual after |
| YouTube | Auto-pull via YouTube Data API on URL paste in admin |
| Blog | Native markdown, statically generated, canonical on your domain |
| Medium | Mirror only |
| Admin | `/admin`, password protected, mobile-first forms, auth parked for later |
| SEO | Statically generated, proper metadata, LLM-ready |
| Mobile | First-class constraint throughout |
| 3D mood | Dark and cinematic — Hollow Knight influenced, ink-dispersion particles |
| 3D interaction | Cursor-reactive hero + scroll-driven transition into timeline |
| Game | Breakout with skills as bricks, built last |
| Design | One theme, per-page visual customization within it |
| Next.js version | 16.2.1 — confirmed latest stable March 2026 |
| R3F version | 9.5.0 paired with React 19 |
| Mockup approach | Straight to code — iterate in browser |

---

## Open Questions

1. **Accent color** — the one warm glow against the dark. Decided during implementation when we can see it render.
2. **Per-page design direction** — what does each category page feel and look like within the shared theme?
3. **Launch scope** — what's the MVP that ships first vs. what comes after?

---

*Structure locked. 3D direction locked. Types-first build starting next.*
