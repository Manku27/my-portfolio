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

Wire up the `loadAllAssets()` utility from `docs/assets-map.md`. Create
`utils/loadAssets.ts` using the exact pattern in that doc. Check `utils/`
first — do not duplicate any existing asset loading code.

Both `document.fonts.ready` and `loadAllAssets()` must resolve before
the first frame renders.

**Success criteria:**
- All in-game text renders in Trajan Pro or Perpetua — no fallback serif
- All sprite assets loaded and cached before frame 1
- Console warning in dev if any font or asset fails to load

---

## Landing screen assets

### Objective 3 — Replace code-drawn elements in spawn room with real assets

**Scope: spawn room only (roomIndex === 1). Do not touch any other room.**

All assets in `public/sprites/`. Load via `loadImage` from
`utils/loadAssets.ts`. Full usage spec in `docs/assets-map.md`.

**1. Ground** — replace `ctx.fillRect('#152e2e')` with `town_floor_01.png`
tiled horizontally. Split around the pit gap. Keep `drawSpawnGroundGlow`
drawn on top as a gradient overlay.

**2. Lamp post** — replace `drawLampPost()` rectangles/arcs with
`station_pole.png`. Centre at `canvasWidth * LAMP_X_FACTOR`, base at
groundY, ~180-220px tall. Keep existing radial glow logic on top.

**3. Foreground grass** — replace rectangle stalks in `drawForeLayer()`
with `grass_01_idle0000.png`, `grass_03_idle0015.png`,
`simple_grass0007.png`. Already partially implemented — verify sprites
are rendering and sway is working.

**4. Signposts** — replace `drawSpawnSignposts()` rectangle boards with
`sign_post_01.png` (left, `w * 0.24`) and `sign_post_02.png`
(right, `w * 0.76`). ~120-150px tall. Keep Trajan Pro / Perpetua
text rendered on top, centred on the sign board area.

**5. Bench** — add `town_bench.png` as static ambient prop near lamp
post, base at groundY, ~80-100px tall. No collision.

**6. Floating platforms** — replace brick rectangles in spawn room
(roomIndex === 1 only) with `wp_plat_float_01.png`. Keep all collision
logic unchanged — visual only.

**7. Character ambient glow** — soft radial gradient drawn behind the
sprite each frame. Spec in `docs/assets-map.md` under
"Character — Ambient Glow".

**Success criteria:**
- No rectangle-based drawing visible in the spawn room
- Atmospheric effects (ground glow, vignette, particles) remain unchanged
- All other rooms completely untouched

---

## Background atmosphere

### Objective 4 — Replace parallax background layers with Greenpath atmosphere

**Scope: `drawFarLayer()` and `drawMidLayer()` in ParallaxLayer.tsx only.**

Reference: Hollow Knight Greenpath bench scene (images/03) and title
screen (images/02). The background has three tonal bands top-to-bottom:
1. Top — deep blue-purple darkness
2. Mid — soft luminous teal-white volumetric bloom (cave light)
3. Bottom — darker, where ground and foliage sit

**Replace `drawFarLayer()` — volumetric light bloom**

Remove the dark triangle silhouettes entirely. Replace with a large
radial gradient that creates a soft glowing cave-light effect:

```
Centre: (w * 0.5, h * 0.38) — upper-centre of screen
Radius: w * 0.55
Stops:
  0.00 → rgba(60, 160, 140, 0.22)   teal-white core
  0.35 → rgba(30, 100, 110, 0.14)   mid teal
  0.70 → rgba(10,  40,  70, 0.10)   fading blue-purple
  1.00 → rgba(5,   10,  25, 0)      transparent edge
```

Apply very gentle parallax to bloomX: `w * 0.5 + charX * 0.03`
so the light source shifts subtly as the character walks — feels
fixed in the world, not pinned to screen.

**Replace `drawMidLayer()` — hanging vine silhouettes**

Remove the dark rectangle pillars. Replace with organic hanging vine
shapes descending from the top edge of the screen:

- Tile across width, parallax factor 0.25 (same as current mid layer)
- Each vine cluster: a tapered curved shape, 40-80px wide, 120-240px tall
- Use bezier curves (`ctx.bezierCurveTo`) for organic taper — not rectangles
- Colour: `rgba(5, 15, 20, 0.85)` — near-black with dark teal tinge
- Vary heights across the tile for natural feel
- Some vines overlap, some have gaps — irregular, not evenly spaced

The vines hang against the bloom light behind them, creating the
depth layering seen in the reference images — dark silhouettes against
a bright mid-ground.

**Keep unchanged:**
- `drawForeLayer()` — foreground grass sprites, do not touch
- All Room.tsx ground and prop drawing
- All particle systems
- The parallax function signatures and call sites in GameCanvas.tsx

**Success criteria:**
- Dark triangles gone, replaced by soft glowing cave atmosphere
- Dark rectangle pillars gone, replaced by organic hanging vines
- The scene reads as luminous teal-blue mid-ground with dark framing
- Foreground grass, ground, and all room props remain exactly as-is
- No visual regressions in any other room

---

## Spawn room text

### Objective 5 — Verify fonts on landing screen
After Objectives 2 and 3, verify all text in the spawn room renders
in Trajan Pro and Perpetua correctly. Adjust any text positioning
that sits awkwardly on the sprite sign boards.

---

## Speech bubble system

### Objective 6 — Speech bubble component
Reusable Canvas 2D speech bubble. Uses `Controller_Dialogue_0000_top.png`
and `Controller_Dialogue_0001_bot.png` as top and bottom borders.
Dark background, Trajan Pro title, Perpetua body. Animates in, dismisses
on character moving away. No game pause.

### Objective 7 — Wire speech bubble to work buildings
Character stands on building roof → speech bubble with full company
detail. Data from `lib/data/work.ts` via `lib/data/index.ts`.

### Objective 8 — Wire speech bubble to timeline entries
Same mechanic. Data from `lib/data/timeline.ts`.

---

## Work world — left of spawn

### Objective 9 — Work world buildings
Real buildings for Merkle, Tech Mahindra, PwC, Infosys. Most recent
closest to spawn. Roofs use `wp_plat_top_wide.png`. Exterior shows
company name (Trajan Pro), duration, one line (Perpetua). Workstation
area for personal projects. Consulting structures for Wohana and
RaiseMatters.

---

## Timeline world — right of spawn

### Objective 10 — Timeline world with real data
Real entries from `lib/data/timeline.ts`. Milestone entries larger
and more prominent. Walking right = further back in time.
Platforms use `dream_plat_mid0005.png` and `dream_small_plat0000.png`.

---

## About Me world — vertical descent

### Objective 11 — About Me world rooms
Vertical world via the pit. Content from `lib/data/about.ts`.
Platforms use `vine_platform_01.png` for organic feel.
Return mechanism at the bottom.

---

## Charm system

### Objective 12 — Charm routing
Wire all charms: Work → left, Timeline → right, About → pit,
Books/Movies/Writing/Games → stub worlds.
Use `head_cracked_option.png` as the player icon in the charm menu UI.

---

## Remaining worlds

### Objective 13 — Books world
Data from `lib/data/books.ts`. Speech bubble for review detail.

### Objective 14 — Movies world
Data from `lib/data/movies.ts`.

### Objective 15 — Games world
Data from `lib/data/games.ts`.

### Objective 16 — Writing world
Data from `lib/data/videos.ts` and posts.

---

## Polish

### Objective 17 — Mobile fallback
Detect mobile viewport. Show: "This experience is designed for desktop."

### Objective 18 — Performance pass
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
