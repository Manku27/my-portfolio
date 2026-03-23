# AGENTS.md — Mayank Portfolio
> Read this before touching any code. This file exists so every coding session
> starts with full context. Update it when decisions change.

---

## Instructions for every session

- Read this file fully before writing any code
- Read `docs/portfolio-ideation.md` for concept and decisions
- Read `docs/game-design.md` for game mechanics, world layout, and aesthetic
- Check `utils/` before creating any utility function — it may already exist
- Put all new utility functions in `utils/` — never inline in components
- Always verify latest stable version before installing any new package
- All data imports come from `lib/data/index.ts` — never individual files
- Never hardcode content in components or pages

---

## What this project is

A **playable 2D side-scrolling platformer that is also a portfolio**.

The game IS the navigation. No traditional nav bar, no links, no menus.
The world is the resume, the diary, the work history. You walk through it.

The person behind this site: grew up poor, fought to go to Kota for JEE
prep, had a mental breakdown, was pulled back by Batman and Spider-Man
(literally), landed at Jadavpur University, barely graduated with multiple
backlogs, chose web development for financial pragmatism, started at 3.5
LPA, grew 7x in five years from zero family advantage. Comics are not a
hobby — they rebuilt him. He builds things because they need to exist.

Full personal story: `lib/data/about.ts`
Full ideation: `docs/portfolio-ideation.md`
Game design: `docs/game-design.md`

---

## The world

```
← [Work world]    [Spawn / Landing]    [Timeline world] →
```

- Visitor spawns at centre
- Left → work world (companies, projects, consulting)
- Right → timeline world (life diary, recent first)
- Charm system routes to other worlds (books, movies, writing, games)
- Camera: room-based snapping — not smooth follow
- Controls: arrow keys / WASD + space to jump (single jump)
- Mobile: out of scope — show "desktop only" message

---

## Game engine

**Canvas 2D with requestAnimationFrame.** Not R3F, not Rapier, not a
game framework. Hand-rolled 2D platformer physics — gravity, velocity,
AABB collision detection. Canvas 2D is the correct tool for a 2D game.

The 3D POC in `components/3d/` is a separate experiment. The game world
renders on a 2D canvas, not WebGL.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.2.1 — App Router |
| Language | TypeScript — strict, always |
| Game engine | Canvas 2D + requestAnimationFrame |
| Animation | GSAP + @gsap/react (UI/transitions, not game loop) |
| Styling | Tailwind CSS v4 (UI only, not game canvas) |
| Database | Neon (Postgres) — NOT YET WIRED |
| Image storage | Vercel Blob — NOT YET WIRED |
| Auth | Not implemented yet |
| Hosting | Vercel |

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

three / R3F / Drei remain installed but are used only for the POC experiment
at `/poc`. The game world does not use them.

Not yet installed:
- `@neondatabase/serverless`
- `@vercel/blob`

---

## Project structure

```
app/
  layout.tsx            Root layout
  page.tsx              Entry point — loads the game
  poc/
    page.tsx            3D particle POC — experiment only, not the game

components/
  3d/                   R3F POC components — experiment only
  game/                 Canvas 2D game components — the actual product
    GameCanvas.tsx      Main canvas, game loop, input handling
    World.tsx           World state, room management
    Character.tsx       Player character — Knight sprite + physics
    ParallaxLayer.tsx   Background depth layers
    Room.tsx            Individual room/section rendering
    CharmMenu.tsx       Charm inventory UI overlay

lib/
  types.ts              All TypeScript interfaces
  data/
    index.ts            Barrel export — only import point
    about.ts            Full personal story and values
    profile.ts          Name, bio, socials, skills
    work.ts             Work experience, consulting, projects
    timeline.ts         Timeline entries
    books.ts            Reading log
    movies.ts           Watch history
    games.ts            Gaming log
    videos.ts           YouTube videos

utils/                  Reusable helpers — check here first
public/
  sprites/              Game sprite sheets and assets
docs/
  portfolio-ideation.md Full ideation and concept
  game-design.md        Game mechanics, world layout, aesthetic spec
```

---

## Data layer

No database connected yet. Static files in `lib/data/`.

- Types: `lib/types.ts`
- Import only from: `lib/data/index.ts`
- When DB wired: only `lib/data/index.ts` exports change

The data layer is agnostic to render target — same data whether rendered
as a game world or a conventional web page.

---

## Aesthetic

Hollow Knight — Greenpath. Deep teal-black, bioluminescent light, sparse
particles, parallax depth. Full spec in `docs/game-design.md`.

Palette:
- Background: `#050a0a` to `#0a1a1a`
- Light: bioluminescent teal-green, cold white wisps
- Accent: faint amber/gold

---

## Conventions

- Named exports only from `lib/` and `utils/`
- No inline styles — Tailwind for UI, Canvas API for game
- No `any` — strict TypeScript
- PascalCase component files, one component per file
- No hardcoded content — everything from `lib/data/index.ts`
- Check `utils/` before writing any helper
- Verify latest stable version before installing packages

---

## Build order

1. ✅ Scaffold
2. ✅ Packages installed
3. ✅ `lib/types.ts` — all types defined
4. ✅ `lib/data/` — seeded with real data
5. ✅ `app/poc/` — 3D particle experiment (parked, not the game)
6. ⬜ **Game canvas foundation** — Canvas 2D setup, game loop, input
7. ⬜ **Character** — Knight sprite, movement, single jump, gravity
8. ⬜ **Spawn room** — landing zone, atmospheric, two paths visible
9. ⬜ **Parallax layers** — three depth layers, cursor-reactive foreground
10. ⬜ **Timeline world** — rooms to the right, entries as world objects
11. ⬜ **Work world** — rooms to the left, buildings per company
12. ⬜ **Charm system** — inventory UI, routing between worlds
13. ⬜ **Interactive objects** — bricks, shake feedback
14. ⬜ **Other worlds** — books, movies, writing, games
15. ⬜ **Polish** — particles, ambient sound (later), performance
16. ⬜ **Admin + DB** — content management, Neon wired
17. ⬜ **Auth** — protect admin

---

## What is NOT done yet

- No game canvas
- No character
- No game world
- No charm system
- No database
- No auth
- No Vercel Blob
- `components/game/` does not exist yet
- `public/sprites/` does not exist yet
