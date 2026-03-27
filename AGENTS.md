# AGENTS.md — Mayank Portfolio

> Read this before touching any code. This file exists so every coding session
> starts with full context. Update it when decisions change.
> Last updated: March 2026.

---

## Instructions for every session

- Read this file fully before writing any code
- Read `docs/build-objectives.md` for what is done and what is next
- Read `docs/assets-map.md` for every asset filename, path, and usage
- Read `docs/game-design.md` for game mechanics, world layout, and aesthetic
- Check `utils/` before creating any utility function — it may already exist
- Put all new utility functions in `utils/` — never inline in components
- Always verify latest stable version before installing any new package
- All data imports come from `lib/data/index.ts` — never individual files
- Never hardcode content in components or pages
- Never modify image files without explicit confirmation from Mayank
- Always check `img.mode` and corner pixel alpha before assuming background

---

## What this project is

A **playable 2D side-scrolling platformer that is also a portfolio**.

The game IS the navigation. No traditional nav bar, no links, no menus.
The world is the resume, the diary, the work history. You walk through it.

Full personal story: `lib/data/about.ts`
Full ideation: `docs/portfolio-ideation.md`
Game design: `docs/game-design.md`

---

## The world

```
← [Work world]    [Spawn / Landing]    [Timeline world] →
                         ↓ fall into void
                    [About Me world]
```

- Visitor spawns at centre on a floating island
- Left → work world (companies, projects)
- Right → timeline world (life diary, recent first)
- Fall off island into the void → About Me vertical descent world
- Charm system (Tab key) routes to other worlds
- Camera: room-based snapping — not smooth follow
- Controls: arrow keys / WASD + space/up to jump, double jump supported
- Mobile: separate endless runner (parked — see docs/mobile-ideation.md)

---

## Game engine

**Canvas 2D with requestAnimationFrame.** Not R3F, not Rapier, not a
game framework. Hand-rolled 2D platformer physics.

---

## Stack

| Layer       | Choice                                                    |
| ----------- | --------------------------------------------------------- |
| Framework   | Next.js 16.2.1 — App Router                               |
| Language    | TypeScript — strict                                       |
| Game engine | Canvas 2D + requestAnimationFrame                         |
| Fonts       | Trajan Pro (headings), Perpetua (body) — in public/fonts/ |
| Styling     | Tailwind CSS v4 (UI only)                                 |
| Hosting     | Vercel / manku27.dev                                      |

---

## Project structure

```
app/
  layout.tsx            Root layout — full metadata, OG, canonical
  page.tsx              Entry point — loads GameCanvas
  icon.png              Favicon (Knight mask)
  opengraph-image.png   OG image (1200×630, game palette)

components/game/        Canvas 2D game — the actual product
  GameCanvas.tsx        Main canvas, game loop, all input handling
  Character.tsx         Knight sprite + physics
  ParallaxLayer.tsx     Background depth layers (bloom + vines)
  Room.tsx              Spawn room rendering
  WorkRoom.tsx          Work world buildings, pavilion, triggers
  TimelineRoom.tsx      Timeline world (stub)
  AboutRoom.tsx         About Me vertical world (stub)
  Bricks.tsx            Floating platforms, collision
  CharmMenu.tsx         Charm inventory UI overlay (Tab key)
  SpeechBubble.tsx      Hollow Knight dialogue box (fixed top of screen)
  SocialHUD.tsx         Social icons + resume download (top-left HUD)
  Particles.tsx         Ambient particle system

lib/
  types.ts              All TypeScript interfaces
  sprites/
    knight-frames.ts    Knight sprite frame map — never re-derive
  data/
    index.ts            Only import point — barrel export
    about.ts, profile.ts, work.ts, timeline.ts
    books.ts, movies.ts, games.ts, videos.ts

utils/
  loadAssets.ts         Image cache — loadImage(), getImage()
  audio.ts              Ambient music init — triggers on first keypress
  lerp.ts               Linear interpolation helper
  wrapText.ts           Canvas text word-wrap helper

public/
  sprites/              Spawn room assets
  sprites/work/         Work world assets (logos + props)
  fonts/                Trajan Pro + Perpetua
  audio/                HKnight-Greenpath.mp3
  resume.pdf            Mayank's resume — served at /resume.pdf
  docs/
    build-objectives.md   What's done and what's next
    assets-map.md         Every asset, filename, path, usage
    game-design.md        Mechanics and aesthetic spec
    mobile-ideation.md    Endless runner concept (parked)
    portfolio-ideation.md Concept and all decisions
```

---

## Asset rules

- All spawn room assets: `public/sprites/` → reference as `/sprites/filename`
- All work world assets: `public/sprites/work/` → `/sprites/work/filename`
- Load via `loadImage()` from `utils/loadAssets.ts` — NEVER inside render loop
- Access cached images with `getImage(path)` inside draw functions
- Work world logos MUST be pre-loaded in GameCanvas.tsx `preloadFonts()` asset list
- Never modify image files without asking Mayank first

---

## Conventions

- Named exports only from `lib/` and `utils/`
- No inline styles — Canvas API for game rendering
- No `any` — strict TypeScript
- PascalCase component files, one component per file
- No hardcoded content — everything from `lib/data/index.ts`
- Check `utils/` before writing any helper

---

## Key decisions made (do not revisit without discussion)

- Game engine: Canvas 2D only — not R3F, not Rapier
- Dialogue box: fixed top-of-screen, Hollow Knight Elderbug style
  No tail, no pointer, no floating bubble — see SpeechBubble.tsx
- Dialogue pagination: Space/Enter to advance pages (not scroll)
- Bubble scroll bug fix: compare by trigger `id` string not content object reference
- Wohana and RaiseMatters: under personal projects pavilion, NOT standalone buildings
- Mobile: separate endless runner with mode select menu (Career/Timeline/About)
- Consultation clients: deliberately low-profile for international audience
