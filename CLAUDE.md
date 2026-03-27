# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (Next.js)
npm run build    # Production build
npm run lint     # Run ESLint
npm start        # Start production server
```

## Architecture

This portfolio is a **2D canvas-based game engine** — a fully interactive game world where visitors explore rooms to discover the portfolio owner's work, timeline, and about info. There is no traditional page/component UI; all game elements are rendered via the Canvas 2D API.

### Entry Point

`app/page.tsx` renders `<GameCanvas />`, which is the entire application. The `/poc` route is a separate sandbox page.

### Game Engine (`components/game/`)

`GameCanvas.tsx` (~950 lines) is the core: it owns the game loop, physics state, input handling, collision detection, and orchestrates all rendering. It uses a single large `useEffect` with `requestAnimationFrame`.

**World layout:**
- **Horizontal world**: 4 rooms side by side — Room 0 (work), Room 1 (spawn), Rooms 2–3 (timeline)
- **Vertical world**: AboutRoom — accessible by falling through a gap in the spawn room

**Physics constants**: gravity 1800 px/s², character speed 340 px/s, jump velocity 920 px/s

**Input**: arrow keys / WASD for movement, Space to jump, Tab for charm menu (navigation), Enter to interact

All other files in `components/game/` are pure drawing functions (they receive a `CanvasRenderingContext2D` and data, draw to it, and return nothing). They are not React components — they export plain functions called inside the game loop.

### Data Layer (`lib/`)

- `lib/types.ts` — single source of truth for all TypeScript interfaces (WorkExperience, TimelineEntry, Book, Movie, Game, etc.)
- `lib/data/*.ts` — static content files (no database). All exported and re-exported via `lib/data/index.ts`
- `lib/data/sprites/knight-frames.ts` — sprite sheet frame definitions for character animation

To update portfolio content, edit files in `lib/data/`.

### Assets (`public/`)

- `sprites/` — 2D game assets (knight sprite sheet, parallax tiles, skill/company logos). Cached for 1 year (immutable) via `next.config.ts`.
- `fonts/` — Trajan Pro (headings), Perpetua (body). Loaded via FontFace API before first canvas frame.
- `audio/` — sound effects

### Styling

Tailwind CSS 4 (PostCSS plugin mode). Global CSS variables in `app/globals.css` define the dark color palette (`--color-bg`, `--color-accent`, etc.). The canvas itself bypasses Tailwind — all in-game styling is done programmatically.

### SEO

`app/layout.tsx` provides JSON-LD structured data (ProfilePage schema), Open Graph, Twitter cards, sitemap, and robots — no changes needed to individual pages.

## Key Patterns

- **No React for game UI**: game elements (speech bubbles, skill bars, HUD) are drawn directly to canvas, not rendered as DOM/React nodes
- **Asset preloading**: `utils/loadAssets.ts` preloads all images/fonts before the animation loop starts
- **Delta-time physics**: game loop uses elapsed time for frame-rate-independent movement
- **Navigation**: hash-based (`window.location.hash`), not Next.js router — the charm menu (Tab) drives scene transitions
- **Canvas scaling**: canvas resizes to fill the viewport; ground is at 88% canvas height
