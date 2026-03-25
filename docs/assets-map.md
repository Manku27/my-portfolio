# Game Assets — Map & Usage Guide
> All assets in public/sprites/. Last updated: March 2026.

---

## Environment — Ground

| File | Description | Usage |
|---|---|---|
| `town_floor_01.png` | Wide dark stone ground tile | Ground plane — tile horizontally across all rooms |
| `town_floor_03.png` | Shorter stone ground tile variant | Ground plane — mix with town_floor_01 for variety |

Both tiles repeat horizontally. Draw them flush with the ground Y line.
town_floor_01 is wider — use as the primary tile, town_floor_03 for
variation at room edges.

---

## Environment — Platforms

| File | Description | Usage |
|---|---|---|
| `wp_plat_top_wide.png` | Wide stone slab | Company building roofs in work world |
| `wp_plat_top.png` | Narrow stone slab | Small platforms, brick replacements |
| `wp_plat_float_01.png` | Floating stone slab with chain | Mid-air floating platforms |
| `dream_plat_mid0005.png` | Stone platform with stalactites | Mid-air platforms — timeline and about me worlds |
| `dream_small_plat0000.png` | Small stone chunk platform | Small elevated platforms |
| `vine_platform_01.png` | Mossy vine platform, purple/teal | About Me world platforms — organic feel for descent |

---

## Environment — Props

| File | Description | Usage |
|---|---|---|
| `station_pole.png` | Hollow Knight station lamp post | Spawn room — replaces the current code-drawn lamp post |
| `sign_post_01.png` | Ornate post, sign pointing LEFT | Spawn room left edge — Work world direction hint |
| `sign_post_02.png` | Ornate post, sign pointing RIGHT | Spawn room right edge — Timeline direction hint |
| `town_bench.png` | Ornate iron bench | Spawn room ambient prop — sits near the lamp post |

---

## Environment — Foreground Plants (cursor-reactive)

| File | Description | Usage |
|---|---|---|
| `grass_01_idle0000.png` | Tall leafy plant, two stalks | Foreground layer — replaces code-drawn stalk A |
| `grass_03_idle0015.png` | Thin single stalk with leaves | Foreground layer — replaces code-drawn stalk B |
| `simple_grass0007.png` | Blade grass cluster | Foreground layer — replaces code-drawn stalk C/D |

These three replace the rectangle-based foreground stalks in
ParallaxLayer.tsx. They tile horizontally and sway with a time-based
sin oscillation (already implemented in drawForeLayer).

---

## Background — Parallax layers (code-drawn, no assets)

The far and mid background layers are rendered entirely in canvas code —
no sprite assets. See "Objective 4 — Background atmosphere" in
build-objectives.md for the full spec of what replaces the current
dark triangles and rectangles.

**Area_Green_Path.png** — this asset was evaluated and rejected for
background use. The 117px tall horizontal strip does not blend well
as a tiled background layer at any position. Do not use it.

---

## UI — Speech Bubble Decorations

| File | Description | Usage |
|---|---|---|
| `Controller_Dialogue_0000_top.png` | Ornate scroll divider — top | Top border of every speech bubble |
| `Controller_Dialogue_0001_bot.png` | Ornate scroll divider — bottom | Bottom border of every speech bubble |

**How to use:**
- Draw the speech bubble dark background rectangle
- Draw `Controller_Dialogue_0000_top.png` scaled to the bubble width at the top edge
- Render text content (Trajan Pro title, Perpetua body) in the middle
- Draw `Controller_Dialogue_0001_bot.png` scaled to the bubble width at the bottom edge

The decorations are white/light on transparent — sit naturally against
the dark speech bubble background.

---

## UI — Charm Menu / Player Icon

| File | Description | Usage |
|---|---|---|
| `head_cracked_option.png` | Knight's cracked mask, face only | Charm menu player icon |

---

## Character — Ambient Glow

Not a file asset — rendered in code. Drawn behind the sprite each frame:

```typescript
// Draw BEFORE the sprite so glow sits behind it
const centerX = destX + KNIGHT_COLLISION_W / 2
const centerY = destY + KNIGHT_COLLISION_H / 2
const glowRadius = 70

const gradient = ctx.createRadialGradient(
  centerX, centerY, 0,
  centerX, centerY, glowRadius
)
gradient.addColorStop(0, 'rgba(180, 230, 220, 0.18)')
gradient.addColorStop(1, 'rgba(180, 230, 220, 0)')
ctx.fillStyle = gradient
ctx.beginPath()
ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2)
ctx.fill()
```

Glow radius ~70px. Max opacity 0.18. Cold teal-white.

---

## Background atmosphere — code-drawn spec

Reference: Hollow Knight Greenpath bench scene and title screen.
Three tonal bands top-to-bottom:
1. Top — deep blue-purple darkness
2. Mid — soft luminous teal-white volumetric bloom (the cave light)
3. Bottom — darker, where the ground and foliage sit

### Volumetric light bloom (replaces far layer triangles)
A large radial gradient centred upper-mid screen:

```typescript
// Replaces drawFarLayer() entirely
const bloomX = w * 0.5
const bloomY = h * 0.38
const bloomR = w * 0.55

const bloom = ctx.createRadialGradient(bloomX, bloomY, 0, bloomX, bloomY, bloomR)
bloom.addColorStop(0,    'rgba(60, 160, 140, 0.22)')   // teal-white core
bloom.addColorStop(0.35, 'rgba(30, 100, 110, 0.14)')   // mid teal
bloom.addColorStop(0.7,  'rgba(10,  40,  70, 0.10)')   // fading to blue-purple
bloom.addColorStop(1,    'rgba(5,   10,  25, 0)')       // edge transparent
ctx.fillStyle = bloom
ctx.fillRect(0, 0, w, h)
```

Slight parallax on bloomX — shifts very gently with charX * 0.05 so
the light source feels fixed in the world, not pinned to screen.

### Hanging vines from top (replaces mid layer rectangles)
Dark organic silhouettes descending from the top edge:

```typescript
// Replaces drawMidLayer() entirely
// Tile vine clusters across the width, parallax factor 0.25
// Each cluster: a curved tapered shape, 40-80px wide, 120-220px tall
// Colour: rgba(5, 18, 22, 0.88) — near-black with dark teal tinge
// Shape: use bezier curves for organic taper, not rectangles
// Vary heights per cluster for natural feel
```

The vine shapes sit against the bloom light, creating depth — dark
foreground against bright mid-ground, same as the reference images.

---

## Assets NOT to use

| File | Reason |
|---|---|
| `title.png` | Hollow Knight game logo — identifiable IP branding |
| `Area_Green_Path.png` | Evaluated, does not blend as background layer |

---

## File placement

All assets in `public/sprites/`. Reference as `/sprites/filename.png`.
Load via the `loadImage` utility in `utils/loadAssets.ts`. Never load
inside the render loop.

---

## Asset loading pattern

```typescript
// utils/loadAssets.ts
const cache = new Map<string, HTMLImageElement>()

export function loadImage(src: string): Promise<HTMLImageElement> {
  if (cache.has(src)) return Promise.resolve(cache.get(src)!)
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => { cache.set(src, img); resolve(img) }
    img.onerror = reject
    img.src = src
  })
}

export async function loadAllAssets() {
  await Promise.all([
    loadImage('/sprites/knight.webp'),
    loadImage('/sprites/town_floor_01.png'),
    loadImage('/sprites/town_floor_03.png'),
    loadImage('/sprites/wp_plat_top.png'),
    loadImage('/sprites/wp_plat_top_wide.png'),
    loadImage('/sprites/wp_plat_float_01.png'),
    loadImage('/sprites/dream_plat_mid0005.png'),
    loadImage('/sprites/dream_small_plat0000.png'),
    loadImage('/sprites/vine_platform_01.png'),
    loadImage('/sprites/station_pole.png'),
    loadImage('/sprites/sign_post_01.png'),
    loadImage('/sprites/sign_post_02.png'),
    loadImage('/sprites/town_bench.png'),
    loadImage('/sprites/grass_01_idle0000.png'),
    loadImage('/sprites/grass_03_idle0015.png'),
    loadImage('/sprites/simple_grass0007.png'),
    loadImage('/sprites/Controller_Dialogue_0000_top.png'),
    loadImage('/sprites/Controller_Dialogue_0001_bot.png'),
    loadImage('/sprites/head_cracked_option.png'),
  ])
}
```
