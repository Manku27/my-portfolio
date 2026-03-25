# Portfolio Game — Build Objectives
> One objective per Claude Code session. Complete and verify before moving on.
> Last updated: March 2026.

---

## Foundation (done)

- ✅ Game canvas — Canvas 2D, 60fps loop
- ✅ Placeholder character — white rectangle, physics
- ✅ Horizontal movement — arrow keys + A/D
- ✅ Gravity and single jump
- ✅ Room-based camera with character position preserved at edges
- ✅ Spawn room — lamp post, ground, parallax layers
- ✅ Hollow Knight palette applied
- ✅ Ambient particles — sparse, variable sizes, cold white + teal
- ✅ Hittable bricks — jump from below, shake feedback
- ✅ Charm menu UI — Tab to open/close
- ✅ WorkRoom and TimelineRoom stubs exist

---

## Character sprite (done)

- ✅ Objective 1 — Knight sprite with walk, idle, jump animations
- ✅ Favicon — head_cracked_option.png as app/icon.png
- ✅ All environment assets copied to public/sprites/
- ✅ Asset map documented in docs/assets-map.md

---

## Fonts

### Objective 2 — Wire up custom fonts

Font files are already in `public/fonts/`:
- `Trajan-Pro.otf` — regular weight, headings and logo
- `Trajan-Pro-Bold.otf` — bold weight
- `Perpetua-Regular.woff2` — body text
- `Perpetua-Bold.woff2` — bold body text

**Step 1 — globals.css**

Declare all four using `@font-face`:
- `font-family: 'Trajan Pro'` for the Trajan files
- `font-family: 'Perpetua'` for the Perpetua files

Add CSS custom properties:
- `--font-heading: 'Trajan Pro', serif`
- `--font-body: 'Perpetua', serif`

**Step 2 — Canvas font loading**

The game renders on Canvas 2D — CSS variables do not reach the canvas
context automatically. Use `document.fonts.ready` to await font loading
before the first game loop frame runs. Add a console warning in dev if
fonts are not available.

Wherever `ctx.font` is set anywhere in the game components, update to:
- Headings, name, signposts, labels → `'Trajan Pro'`
- Body text, descriptions → `'Perpetua'`

**Step 3 — Asset loading**

Wire up the `loadAllAssets()` utility from `docs/assets-map.md`. This
should run alongside `document.fonts.ready` — both must resolve before
the first frame renders. The canvas should show nothing (or a simple
loading state) until both fonts and assets are ready.

Create `utils/loadAssets.ts` using the pattern in `docs/assets-map.md`.
Check `utils/` first — do not duplicate any existing asset loading code.

**Success criteria:**
- All in-game text renders in Trajan Pro or Perpetua — no fallback serif
- All sprite assets are loaded and cached before frame 1
- No flash of unstyled text on load
- Console warning in dev if any font or asset fails to load

---

## Spawn room redesign

### Objective 3 — Real assets in spawn room
Replace all code-drawn environment elements in the spawn room with
the real assets from `public/sprites/`. Refer to `docs/assets-map.md`
for exact usage of each asset.

Replace:
- Code-drawn lamp post → `station_pole.png`
- Code-drawn foreground stalks → `grass_01_idle0000.png`,
  `grass_03_idle0015.png`, `simple_grass0007.png` (tiled, cursor-reactive)
- Code-drawn ground rectangle → `town_floor_01.png` tiled horizontally
- Code-drawn bricks → `wp_plat_top.png` and `wp_plat_top_wide.png`

Add to spawn room:
- `sign_post_01.png` at left edge (points left toward work)
- `sign_post_02.png` at right edge (points right toward timeline)
- `town_bench.png` as ambient prop near the lamp post

Add character ambient glow — spec in `docs/assets-map.md` under
"Character — Ambient Glow". Drawn behind the sprite each frame.

### Objective 4 — Name as jumpable platform + tagline
Render "Mayank Jhunjhunwala" in the centre of the spawn room in
Trajan Pro, large (name spans ~50% viewport width). Text sits in
upper half of room above the ground.

The name is a solid platform — character can jump onto the letters
and stand on top. Collision box spans the full measured text width
at the top edge of the rendered text.

Not a brick. Atmospheric large text — dim teal-white, slightly
luminous. No box, no border, no background.

Below the name in Perpetua regular, smaller, muted:
"I build things because they need to exist."
Not a platform — decorative only.

### Objective 5 — Landing screen elements
Add remaining spawn room elements:
- Left edge: "Senior Fullstack Engineer" in Perpetua + sign_post_01
  already placed (Objective 3) — add role text above/near it
- Right edge: casual hint in Perpetua pointing toward timeline
- Pit: visible gap in the ground floor
- "Who are you?" label near the pit edge in Trajan Pro

### Objective 6 — The pit and vertical descent
Falling into the pit transitions to the About Me world. Vertical
camera snapping downward through sections. Stub rooms with
placeholder text for now. Return mechanism at the bottom.

---

## Speech bubble system

### Objective 7 — Speech bubble component
Reusable Canvas 2D speech bubble. Uses `Controller_Dialogue_0000_top.png`
and `Controller_Dialogue_0001_bot.png` as the top and bottom borders.
Dark background, text content in middle. Trajan Pro for title,
Perpetua for body. Animates in, dismisses on character moving away.
No game pause.

### Objective 8 — Wire speech bubble to work buildings
Character stands on building roof → speech bubble with full company
detail. Data from `lib/data/work.ts` via `lib/data/index.ts`.

### Objective 9 — Wire speech bubble to timeline entries
Same mechanic for timeline world objects. Data from
`lib/data/timeline.ts`.

---

## Work world — left of spawn

### Objective 10 — Work world buildings
Real buildings for Merkle, Tech Mahindra, PwC, Infosys. Most recent
closest to spawn. Roofs use `wp_plat_top_wide.png`. Exterior shows
company name (Trajan Pro), duration, one line (Perpetua). Workstation
area for personal projects. Consulting structures for Wohana and
RaiseMatters.

---

## Timeline world — right of spawn

### Objective 11 — Timeline world with real data
Real entries from `lib/data/timeline.ts`. Milestone entries larger
and more prominent. Walking right = further back in time.
Platforms use `dream_plat_mid0005.png` and `dream_small_plat0000.png`.

---

## About Me world — vertical descent

### Objective 12 — About Me world rooms
Vertical world via the pit. Content from `lib/data/about.ts`.
Platforms use `vine_platform_01.png` for organic feel.
Return mechanism at the bottom.

---

## Charm system

### Objective 13 — Charm routing
Wire all charms: Work → left, Timeline → right, About → pit,
Books/Movies/Writing/Games → stub worlds.
Use `head_cracked_option.png` as the player icon in the charm menu UI.

---

## Remaining worlds

### Objective 14 — Books world
Data from `lib/data/books.ts`. Speech bubble for review detail.

### Objective 15 — Movies world
Data from `lib/data/movies.ts`.

### Objective 16 — Games world
Data from `lib/data/games.ts`.

### Objective 17 — Writing world
Data from `lib/data/videos.ts` and posts.

---

## Polish

### Objective 18 — Mobile fallback
Detect mobile viewport. Show: "This experience is designed for desktop."

### Objective 19 — Performance pass
Audit render loop. Memory leaks. 60fps verification. Dev frame monitor.

---

## Notes

- One objective per Claude Code session
- Verify visually before moving to the next objective
- All data from `lib/data/index.ts` — never hardcode content
- Sprite frame data from `lib/sprites/knight-frames.ts` — never re-derive
- Asset usage from `docs/assets-map.md` — never guess placement
- Check `utils/` before writing any helper
- Verify latest stable package versions before installing anything new
- Refer to `docs/game-design.md` for mechanic and aesthetic decisions
- Refer to `AGENTS.md` for project conventions
