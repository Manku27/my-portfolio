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
| `station_pole.png` | Hollow Knight station lamp post | Spawn room — central lamp post |
| `sign_post_01.png` | Ornate post, sign pointing LEFT | Spawn room left edge — Work world direction hint |
| `sign_post_02.png` | Ornate post, sign pointing RIGHT | Spawn room right edge — Timeline direction hint |
| `town_bench.png` | Ornate iron bench | Spawn room ambient prop |

---

## Environment — Foreground Plants (cursor-reactive)

| File | Description | Usage |
|---|---|---|
| `grass_01_idle0000.png` | Tall leafy plant, two stalks | Foreground layer — stalk A |
| `grass_03_idle0015.png` | Thin single stalk with leaves | Foreground layer — stalk B |
| `simple_grass0007.png` | Blade grass cluster | Foreground layer — stalk C/D |

---

## Work world — public/sprites/work/

All files referenced as `/sprites/work/filename`.
All files are transparent PNGs/webps — do NOT modify them.

### Company logos

| File | Company | Notes |
|---|---|---|
| `merkle.webp` | Merkle | Primary employer — most prominent building |
| `dentsu.png` | Dentsu | Parent company of Merkle |
| `Extentia.png` | Extentia | Merkle was formerly Extentia — all three on one building |
| `pwc.png` | PwC India | |
| `Infosys.webp` | Infosys | First job — smallest building |
| `Tech_Mahindra.png` | Tech Mahindra | Microsoft Bing Ads contract |

**Extentia/Merkle/Dentsu joke:** On the Merkle building show a small
plaque: `Extentia → Merkle → Dentsu`. The corporate acquisition chain.

**Logo display:** Draw a small dark semi-transparent pill behind each
logo in code: `rgba(8, 18, 16, 0.75)`. Keeps logos readable against
the dark palette without touching the files.

### Building environment props

| File | What it is | Usage |
|---|---|---|
| `elev_lift.png` | Ornate domed pavilion/gazebo | Personal projects area — Moebius, PK Chai, Vishuddha, Wohana, RaiseMatters |
| `town_layered_0028_09.png` | Double-arm ornate lamp post | Street lighting between company buildings |
| `town_layered_0029_08.png` | Arched gothic gateway | Entrance/transition between sections |
| `town_layered_0006_31.png` | Ornate iron fence — left piece | Boundary between sections |
| `town_layered_0007_30.png` | Ornate iron fence — right piece | Boundary between sections |
| `town_layered_0012_25.png` | Thin decorative column/pillar | Accent prop near buildings |
| `town_layered_0013_24.png` | Wider column base | Building corner detail |

### Work world layout

Walking left from spawn, most recent company first:
```
[spawn] ← Merkle ← Tech Mahindra ← PwC India ← [arch] ← Infosys ← [pavilion: projects]
```

- Each company: code-drawn facade + logo on front + name in Trajan Pro
- `wp_plat_top_wide.png` as walkable roof per building
- `town_layered_0028_09.png` lamp posts between buildings
- Fences at section boundaries
- `town_layered_0029_08.png` arch gateway between employment and projects
- `elev_lift.png` pavilion for personal projects and consulting

### Dialogue box — work world spec

Triggers when character enters the horizontal boundary of a building.
No roof required — x-range proximity trigger, any height.

Fixed screen-space — always top of canvas, never follows the building:
- Full-width semi-transparent dark background: `rgba(4, 12, 10, 0.88)`
- `Controller_Dialogue_0000_top.png` scaled to full canvas width at top
- `Controller_Dialogue_0001_bot.png` scaled to full canvas width at bottom
- Company name bottom-left in Trajan Pro bold — large, like "Elderbug"
- Role in Trajan Pro, body bullets in Perpetua
- World keeps running — no pause
- Dismisses when character walks outside building boundary

---

## Background — Parallax layers (code-drawn, no assets)

Far and mid layers are code-drawn gradients and bezier vine shapes.
Area_Green_Path.png — evaluated and rejected. Do not use.

---

## UI — Speech Bubble Decorations

| File | Description | Usage |
|---|---|---|
| `Controller_Dialogue_0000_top.png` | Ornate scroll divider — top | Top border of all dialogue boxes |
| `Controller_Dialogue_0001_bot.png` | Ornate scroll divider — bottom | Bottom border of all dialogue boxes |

---

## UI — Charm Menu / Player Icon

| File | Description | Usage |
|---|---|---|
| `head_cracked_option.png` | Knight's cracked mask | Charm menu player icon |

---

## Character — Ambient Glow

Code-drawn. radialGradient behind sprite, radius ~70px,
`rgba(180, 230, 220, 0.18)` core fading to transparent.

---

## Assets NOT to use

| File | Reason |
|---|---|
| `title.png` | Hollow Knight game logo — IP branding |
| `Area_Green_Path.png` | Does not blend as background layer |

---

## File placement

Spawn room: `public/sprites/` → `/sprites/filename`
Work world: `public/sprites/work/` → `/sprites/work/filename`
Load via `loadImage` in `utils/loadAssets.ts`. Never load inside render loop.

---

## Asset loading

```typescript
export async function loadAllAssets() {
  await Promise.all([
    // Spawn room
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
    // Work world
    loadImage('/sprites/work/merkle.webp'),
    loadImage('/sprites/work/dentsu.png'),
    loadImage('/sprites/work/Extentia.png'),
    loadImage('/sprites/work/pwc.png'),
    loadImage('/sprites/work/Infosys.webp'),
    loadImage('/sprites/work/Tech_Mahindra.png'),
    loadImage('/sprites/work/elev_lift.png'),
    loadImage('/sprites/work/town_layered_0028_09.png'),
    loadImage('/sprites/work/town_layered_0029_08.png'),
    loadImage('/sprites/work/town_layered_0006_31.png'),
    loadImage('/sprites/work/town_layered_0007_30.png'),
    loadImage('/sprites/work/town_layered_0012_25.png'),
    loadImage('/sprites/work/town_layered_0013_24.png'),
  ])
}
```
