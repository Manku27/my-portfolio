# Portfolio Game Design Document
> The playable portfolio. Solidified from conversation. Last updated: March 2026.

---

## The concept in one sentence

A playable 2D side-scrolling platformer that is also a portfolio — the game
IS the navigation, not a feature on top of it.

---

## The world

A single continuous horizontal world with the spawn point at the centre.

```
← [Work world]      [Spawn]      [Timeline world] →
```

### Spawn point
Where the visitor arrives. The landing zone. Atmospheric, Hollow Knight
aesthetic — dark, bioluminescent, sparse light sources. Two paths visible.
Lamp posts to the left nudge toward work. The path opening to the right
suggests the timeline.

### Left — the work world
The professional layer rendered as a game environment.

- Different buildings for different companies:
  - Infosys — first building, modest, early
  - PwC India — larger, government/corporate aesthetic
  - Tech Mahindra — tech campus feel, Microsoft Bing Ads signage
  - Merkle/Dentsu — current, most prominent building
- A workstation area for personal projects — Moebius, PK Chai, Vishuddha etc.
- Consulting engagements (Wohana, RaiseMatters) as separate structures
- Content visible in the world in a thematic font — not hidden, not in panels

### Right — the timeline world
Life, recent first. As you walk right, you go further back in time.

- Each timeline entry is an object or location in the world
- Milestone entries are visually distinct — larger structures, more prominent
- Short entries are smaller environmental details
- Content visible in the world, in the environment
- No filters on the timeline — the charm system handles routing to other worlds

---

## The character

Using Hollow Knight's Knight character assets. Personal portfolio, no
commercial use, no monetization — fair use for personal project.

Animations needed:
- Idle
- Walk left / walk right
- Jump
- Land
- Hit reaction (when striking a brick/interactive element)

---

## Controls

Desktop only. Mobile explicitly out of scope.

| Input | Action |
|---|---|
| Arrow left / A | Walk left |
| Arrow right / D | Walk right |
| Space / Arrow up / W | Jump (single jump only) |
| Cursor movement | Background elements react |

---

## Interactivity

### Background elements
Ambient reactivity to cursor proximity — plants sway, wisps drift, light
flickers. The Hollow Knight atmospheric layer. Always on, no input required.

### Bricks / interactive objects
Scattered through the world. Jump and hit from below. On hit — object shakes,
satisfying tactile reaction. Content already visible — the hit is feedback,
not a reveal. Nothing is hidden.

### Content surfacing
Nothing is hidden. All content visible in the environment as you walk.
Hitting objects gives shake feedback only. The world IS the portfolio.

---

## The charm system — navigation

Styled after Hollow Knight's charm equipping. Opens a charm inventory screen.
Equipping a charm routes you to that world. This IS the site navigation —
no traditional nav bar, no links, no menus.

| Charm | Routes to |
|---|---|
| Work charm | Left world — professional layer |
| Timeline charm | Right world — life diary |
| Books charm | Books world |
| Movies charm | Movies world |
| Writing charm | Content / blog world |
| Games charm | Games world |

Charm UI: dark inventory screen, charms as small glowing objects, equip by
selecting. Hollow Knight's actual charm screen is the visual reference.

---

## Camera

**Room-based snapping.** The world is divided into rooms/sections. The camera
snaps to each room as the character enters it. Not smooth follow — discrete
transitions between defined sections. Simpler to build, easier to control
content layout.

---

## Physics

**Single jump.** No double jump. Simple, clean. Gravity weight should feel
heavy — Hollow Knight-style, not floaty Mario-style.

---

## Game engine

**Canvas 2D** with requestAnimationFrame. Not R3F, not Rapier. 2D platformer
physics are straightforward to implement manually — collision detection,
gravity, velocity. Canvas 2D is fast, appropriate for 2D games, no 3D
renderer overhead.

The 3D POC (components/3d/) is now a separate experiment and may not be
used in the final game world. The game renders on a 2D canvas.

---

## Aesthetic

### Reference
Hollow Knight — Greenpath specifically. Deep teal-black, bioluminescent
light sources, sparse particles, depth via parallax layers.

### Palette
- Background: near-black with deep teal undertone — `#050a0a` to `#0a1a1a`
- Light sources: bioluminescent teal-green, cold white wisps
- Accent: faint amber/gold for important elements
- Typography in world: thematic, weighted, slightly hand-drawn feel

### Parallax layers
Three depth layers, moving at different speeds as character walks:
- Far background — near-static, barely moves
- Mid layer — silhouetted structures, moderate parallax
- Foreground — plants, props, fastest parallax, cursor-reactive

### Particles
Sparse. ~20-30 visible light points across viewport. Large portions of screen
are pure dark. Variable sizes — a few large ghost wisps, handful of medium
motes, many near-invisible dust specks. Mostly still. Things have weight.

---

## Mobile

Explicitly out of scope. Show a simple message on mobile viewports:
"This experience is designed for desktop."

---

## Scope and risk

This is ambitious. The risk of not shipping is real and acknowledged.

**Mitigation:**
- The data layer (lib/data/) is already seeded and agnostic to render target
- If the game build stalls, a conventional Next.js portfolio scaffolds quickly
  from the same data — nothing is wasted
- Ship the game when ready, fallback always available

---

## What is decided

| Decision | Answer |
|---|---|
| Concept | Playable 2D platformer — game IS the portfolio |
| World layout | Bidirectional — work left, timeline right, spawn centre |
| Navigation | Charm system — no nav bar, no links |
| Content surfacing | Visible in world, hits give shake feedback only |
| Character | Hollow Knight Knight assets — personal use |
| Camera | Room-based snapping |
| Jump | Single jump, heavy gravity |
| Game engine | Canvas 2D + requestAnimationFrame |
| Background reactivity | Cursor-reactive ambient elements |
| Mobile | Out of scope — desktop only message shown |
| Aesthetic | Hollow Knight / Greenpath |

---

## Open questions

1. **Charm world architecture** — separate canvas contexts per world, or one
   continuous world with section-based content loading?
2. **Room dimensions** — how wide is each room, how many rooms per world?
3. **Death / fall** — if character falls off a platform, what happens?
4. **Sound** — out of scope for now, revisit later
