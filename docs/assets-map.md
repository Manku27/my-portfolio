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

These three replace ALL the rectangle-based foreground stalks in
ParallaxLayer.tsx. They tile horizontally with the same parallax factor
(~0.8). Each sways independently based on cursor position — apply the
existing sway logic to the draw X position of each plant sprite.

---

## UI — Speech Bubble Decorations

| File | Description | Usage |
|---|---|---|
| `Controller_Dialogue_0000_top.png` | Ornate scroll divider — top | Top border of every speech bubble |
| `Controller_Dialogue_0001_bot.png` | Ornate scroll divider — bottom | Bottom border of every speech bubble |

These are the authentic Hollow Knight dialogue box decorations. Use them
as the top and bottom borders of the speech bubble system (Objective 6).

**How to use:**
- Draw the speech bubble dark background rectangle
- Draw `Controller_Dialogue_0000_top.png` scaled to the bubble width at the top edge
- Render the text content (Trajan Pro title, Perpetua body) in the middle
- Draw `Controller_Dialogue_0001_bot.png` scaled to the bubble width at the bottom edge

The decorations are white/light on transparent — they sit naturally
against the dark speech bubble background. Scale width to match bubble
width, maintain aspect ratio for height.

---

## UI — Charm Menu / Player Icon

| File | Description | Usage |
|---|---|---|
| `head_cracked_option.png` | Knight's cracked mask, face only | Charm menu player icon, or UI indicator for current player position |

---

## Character — Ambient Glow

Not a file asset — rendered in code. The character has a soft radial
glow halo drawn behind the sprite each frame:

```typescript
// Draw BEFORE the sprite so glow sits behind it
const centerX = destX + KNIGHT_COLLISION_W / 2
const centerY = destY + KNIGHT_COLLISION_H / 2
const glowRadius = 70

const gradient = ctx.createRadialGradient(
  centerX, centerY, 0,
  centerX, centerY, glowRadius
)
gradient.addColorStop(0, 'rgba(180, 230, 220, 0.18)')  // soft teal-white
gradient.addColorStop(1, 'rgba(180, 230, 220, 0)')
ctx.fillStyle = gradient
ctx.beginPath()
ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2)
ctx.fill()
// Then draw sprite on top
```

Glow radius: ~70px. Max opacity at centre: 0.18. Should feel like
ambient bioluminescence, not a spotlight. Cold teal-white matches
the world palette. The glow makes the character and immediate
surroundings subtly more visible against the dark world.

---

## Assets NOT to use

| File | Reason |
|---|---|
| `title.png` | Hollow Knight game logo — identifiable IP branding, skip entirely |

---

## File placement

All assets live in `public/sprites/`. Reference in code as:
`/sprites/filename.png`

Load via HTMLImageElement, cache in a shared asset map so each image
loads once. Never load assets inside the render loop.

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

Call `loadAllAssets()` before the game loop starts. Canvas should not
render until this resolves. The knight sprite loader and this can be
combined into a single pre-render promise.
