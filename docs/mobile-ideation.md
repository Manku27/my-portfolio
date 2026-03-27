# Mobile Experience — Ideation
> Parked for later. Last updated: March 2026.

---

## Decision

The desktop game (Canvas 2D platformer) does not work on mobile.
A separate mobile experience is needed. The choice is an **endless runner**.

---

## The concept

A Hollow Knight-aesthetic endless runner for mobile. The Knight runs
automatically from left to right. The player taps to jump. Obstacles
and platforms represent content from the portfolio — jump over or onto
them to progress.

---

## Menu on landing

On mobile, show a startup menu before the game begins. Player picks
a mode:

| Mode | Content | Obstacle/platform theme |
|---|---|---|
| Career | Work experience, companies, consulting | Company milestones, tech stack items |
| Timeline | Life diary entries, recent first | Life events, personal milestones |
| About | Personal story beats from lib/data/about.ts | Story chapters as platforms |

Each mode pulls from the existing `lib/data/` files — same data layer,
different rendering context.

---

## Mechanics

- Knight runs automatically, constant speed
- Tap anywhere to jump — single tap
- Double tap for double jump (already exists in desktop game)
- Obstacles: items to avoid — gap years, rejected applications (fun, not real)
- Platforms: items to land on — company rooftops, milestone stones
- Content surfaces as you land on or pass platforms — short label visible
  in the world, consistent with desktop game philosophy (nothing hidden)
- Fall = reset to last checkpoint, not game over
- Progress is linear — running through time

---

## Visual aesthetic

Same Hollow Knight / Greenpath palette as desktop:
- Background: teal-black with volumetric bloom
- Parallax layers: vines, mid-ground shapes
- Knight sprite: same sprite sheet already in public/sprites/knight.webp
- Ground: same town_floor_01.png tiles
- Platforms: dream_plat_mid0005.png, wp_plat_top.png

---

## Tech approach

- Canvas 2D, same as desktop game — no new rendering dependencies
- Separate route: served at `/mobile` or detected via user-agent and
  served at `/`
- Touch events: touchstart for jump, no complex gesture recognition needed
- Reuses all existing lib/data/ exports — no new data work needed
- Reuses sprite assets already in public/sprites/

---

## What needs to be built (when we get to it)

1. Mobile detection — serve mobile runner at `/`, desktop game redirect
   to `/desktop` or vice versa
2. MobileGameCanvas.tsx — separate canvas component, touch input
3. RunnerWorld.tsx — endless world generation from lib/data entries
4. ModeSelect.tsx — the startup menu (Career / Timeline / About)
5. MobileRoom.tsx — simplified room rendering (no room snapping needed,
   continuous scroll)
6. Reuse: knight-frames.ts, loadAssets.ts, ParallaxLayer logic

---

## Open questions

1. What happens at the end of a mode — loop, show summary, or
   transition to a static page?
2. Should score / distance be tracked and shown?
3. Is there a charm/filter system equivalent on mobile, or is the
   mode select menu the only navigation?

---

*Parked. Build desktop experience fully first. Come back to this.*
