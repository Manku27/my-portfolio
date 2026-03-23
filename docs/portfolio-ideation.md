# Portfolio Website — Ideation & Brief
> Living document. Built through conversation. Last updated: March 2026.
> NOTE: This document reflects a significant pivot from the original brief.
> The site is now a playable 2D platformer, not a conventional portfolio.
> The game design document lives at docs/game-design.md.

---

## The Concept

A playable 2D side-scrolling platformer that is also a portfolio. The game
IS the navigation — not a feature on top of a website, not a gimmick. The
world is the resume, the diary, the work history. You walk through it.

This is not a standard portfolio. It never was going to be. This is the
logical conclusion of that instinct — someone whose identity was rebuilt by
games and comics building a portfolio that IS a game.

---

## Why this, not a standard portfolio

A standard portfolio says "here's what I've done, hire me." It adds nothing
a resume doesn't do. A game portfolio says something entirely different —
this person builds for the joy of it, thinks in systems, and has the
confidence to do things differently.

The audience is an international engineer or hiring manager who finds this
organically. They will play it. The charm system will make them curious.
Walking past the timeline will make them stay. Nobody forgets this.

---

## The world layout

```
← [Work world]      [Spawn / Landing]      [Timeline world] →
```

Visitor spawns at centre. Lamp posts to the left nudge toward work. The
open path to the right leads into the timeline. Each direction is a
different layer of the same life.

Full world design in: `docs/game-design.md`

---

## Navigation — the charm system

No traditional nav bar. No links. No menus.

The charm system IS the navigation, styled after Hollow Knight's charm
equipping. Open the charm inventory, equip a charm, get routed to that
world.

| Charm | Destination |
|---|---|
| Work | Left world — companies, projects, consulting |
| Timeline | Right world — life diary, recent first |
| Books | Books world |
| Movies | Movies world |
| Writing | Content / blog world |
| Games | Games world |

---

## Content philosophy

Nothing is hidden. All content is visible in the world as you walk through
it — thematic font, in the environment. Hitting interactive objects gives
tactile feedback (shake) but reveals nothing new. The world IS the content.

---

## Aesthetic

Hollow Knight — Greenpath specifically. Deep teal-black, bioluminescent
light, sparse particles, depth via parallax. See docs/game-design.md for
full visual spec.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.2.1 — App Router |
| Language | TypeScript — strict |
| Game engine | R3F + Rapier physics OR pure Canvas 2D — decided during build |
| Animation | GSAP + @gsap/react |
| Styling | Tailwind CSS v4 |
| Database | Neon (Postgres) — not yet wired |
| Image storage | Vercel Blob — not yet wired |
| Hosting | Vercel |

**Mobile:** Explicitly out of scope. Desktop only. A message is shown on
mobile viewports.

---

## Data layer

Unchanged from original brief. Types-first, mock data seeded, DB later.

- `lib/types.ts` — all interfaces
- `lib/data/index.ts` — single import point
- `lib/data/about.ts` — full personal story
- `lib/data/profile.ts` — name, bio, socials
- `lib/data/work.ts` — experience, consulting, projects
- `lib/data/timeline.ts` — life entries
- `lib/data/books.ts`, `movies.ts`, `games.ts`, `videos.ts`

When the game world renders content, it pulls from these files. The data
layer is agnostic to whether it's rendered as a web page or a game world.

---

## Scope and risk

This is ambitious. The risk of not shipping is real and acknowledged by
both parties. Mitigation: if the game build stalls at any point, a
conventional Next.js portfolio can be scaffolded quickly from the same
data layer — nothing is wasted. Ship the game when ready.

---

## What's decided

| Decision | Answer |
|---|---|
| Concept | Playable 2D platformer — the game IS the portfolio |
| World layout | Bidirectional — work left, timeline right, spawn centre |
| Navigation | Charm system — no nav bar, no links, no menus |
| Content surfacing | Visible in world, nothing hidden, hits give tactile feedback |
| Character | Hollow Knight's Knight — personal use, no commercial |
| Aesthetic | Hollow Knight / Greenpath — deep teal-black, bioluminescent |
| Mobile | Explicitly out of scope — desktop only |
| Controls | Keyboard — arrows/WASD + space to jump |
| Background reactivity | Cursor-reactive ambient elements throughout |
| Data layer | Types-first, lib/data/, DB wired later |
| Ratings | 1–10 everywhere |
| Tags | Freeform |
| SEO | Blog posts statically generated, metadata on all pages |
| Auth | Parked — added later |
| Fallback plan | Conventional Next.js portfolio from same data if needed |

---

## Open questions (see game-design.md for full list)

1. Charm world architecture — separate routes or layers in one world?
2. Camera behaviour — smooth follow or room-based?
3. Jump physics — single or double jump?
4. Game engine decision — R3F + Rapier or Canvas 2D?

---

## What's NOT changed from original brief

- Data layer structure and files
- SEO approach for blog content
- Admin panel concept (parked)
- Database choice (Neon, parked)
- Image storage (Vercel Blob, parked)
- Personal story and content (lib/data/about.ts)

---

*The portfolio is now a game. Build accordingly.*
