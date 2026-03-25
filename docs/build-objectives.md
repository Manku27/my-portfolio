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

## Character sprite

### Objective 1 — Replace white rectangle with Knight sprite

The sprite sheet is at `public/sprites/knight.webp` (1024×1024, RGBA,
transparent background). Frame coordinates are pre-computed in
`lib/sprites/knight-frames.ts` — do not re-derive them, use that file.

**What to implement:**

Load the sprite sheet image once using the browser Image API before the
game loop starts. Use `document.fonts.ready` equivalent — wait for the
image to fully load before the first frame renders. Store the loaded
HTMLImageElement in a ref accessible to the draw function.

Replace the white rectangle in `Character.tsx` (or wherever drawCharacter
is implemented) with sprite rendering:

1. Track animation state: `idle | walk | land | jump`
2. Track current frame index and a frame timer (seconds elapsed in current frame)
3. Each game loop tick, advance the frame timer by delta. When timer exceeds
   `1 / fps` for the current animation, advance frame index and reset timer.
4. Look up the current frame from `ANIM_CONFIG[state].frames[frameIndex]`
5. Draw using:
   `ctx.drawImage(sheet, frame.x, frame.y, frame.w, frame.h, destX, destY, destW, destH)`
   where destW scales proportionally from `KNIGHT_RENDER_HEIGHT`

**Walk left:** use `ctx.save()`, `ctx.scale(-1, 1)`, `ctx.translate()` to
mirror the walk right frames horizontally. No separate assets needed.

**State transitions:**
- Moving left or right → walk
- In air (velY !== 0 and not grounded) → jump
- Just landed (transitioned from jump to grounded) → land, hold 2 frames, then idle
- Standing still → idle

**Collision box:** keep using `KNIGHT_COLLISION_W` and `KNIGHT_COLLISION_H`
from `lib/sprites/knight-frames.ts` for physics. The sprite is drawn centred
on the collision box — the visual may be slightly wider than the hitbox,
that is correct and intentional.

**Success criteria:** the white rectangle is gone. The Knight character
walks, idles, jumps, and lands with the correct animation playing for
each state. Walk left is a horizontal mirror of walk right.

---

## Fonts

### Objective 2 — Wire up custom fonts

Font files are already in `public/fonts/`:
- `Trajan-Pro.otf` — regular weight, headings and logo
- `Trajan-Pro-Bold.otf` — bold weight
- `Perpetua-Regular.woff2` — body text
- `Perpetua-Bold.woff2` — bold body text

In `app/globals.css`, declare all four using `@font-face`:
- `font-family: 'Trajan Pro'` for the Trajan files
- `font-family: 'Perpetua'` for the Perpetua files

Add CSS custom properties:
- `--font-heading: 'Trajan Pro', serif`
- `--font-body: 'Perpetua', serif`

Fonts must be loaded before the canvas renders. Use `document.fonts.ready`
to await font loading before the first game loop frame. Add a console
warning in dev if fonts are not found.

Wherever `ctx.font` is set in any game component, update to use:
- `'Trajan Pro'` for all headings, names, signposts, labels
- `'Perpetua'` for all body text, hints, descriptions

**Success criteria:** all in-game text renders in the correct font.
No fallback serif visible anywhere.

---

## Spawn room redesign

### Objective 3 — Name as jumpable platform + tagline
Render "Mayank Jhunjhunwala" in the centre of the spawn room in Trajan Pro,
large (name spans ~50% viewport width). Text sits in upper half of room.

The name is a solid platform — character can jump onto the letters and
stand on top. Collision box spans the full measured text width at the
top edge.

Not a brick. Atmospheric large text — dim teal-white, slightly luminous.
No box, no border, no background.

Below the name, in Perpetua regular, smaller, muted:
"I build things because they need to exist."
Not a platform — decorative only.

### Objective 4 — Landing screen elements
Add remaining spawn room elements:
- Left edge: "Senior Fullstack Engineer" in Perpetua + signpost pointing left
- Right edge: environmental hint pointing right toward the timeline
- Pit: visible gap in the ground floor near centre
- "Who are you?" label near the pit edge in Trajan Pro
All styled as world elements, not UI overlays.

### Objective 5 — The pit and vertical descent
Falling into the pit transitions to the About Me world. Vertical camera
snapping downward through sections. Stub rooms with placeholder text for
now. Return mechanism at the bottom sends character back to spawn.

---

## Speech bubble system

### Objective 6 — Speech bubble component
Reusable Canvas 2D speech bubble. Given a world position and content
(title + body), draws a styled bubble pointing at the trigger object.
Animates in on trigger. Dismisses when character walks away.
Perpetua for body, Trajan Pro for title. No game pause.

### Objective 7 — Wire speech bubble to work buildings
Character stands on building roof → speech bubble with full company
detail. Data from `lib/data/work.ts` via `lib/data/index.ts`.

### Objective 8 — Wire speech bubble to timeline entries
Same mechanic for timeline world objects. Data from `lib/data/timeline.ts`.

---

## Work world — left of spawn

### Objective 9 — Work world buildings
Real buildings for Merkle, Tech Mahindra, PwC, Infosys. Most recent
closest to spawn. Exterior shows company name (Trajan Pro), duration,
one line (Perpetua). Roof is a solid platform. Workstation area for
personal projects. Consulting structures for Wohana and RaiseMatters.

---

## Timeline world — right of spawn

### Objective 10 — Timeline world with real data
Real entries from `lib/data/timeline.ts`. Milestones larger and more
prominent. Walking right = further back in time. Multiple rooms.

---

## About Me world — vertical descent

### Objective 11 — About Me world rooms
Vertical world via the pit. Content from `lib/data/about.ts`. Each
story beat is a room. Return mechanism at the bottom.

---

## Charm system

### Objective 12 — Charm routing
Wire all charms: Work → left, Timeline → right, About → pit descent,
Books/Movies/Writing/Games → stub worlds.

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
- Check `utils/` before writing any helper
- Verify latest stable package versions before installing anything new
- Refer to `docs/game-design.md` for mechanic and aesthetic decisions
- Refer to `AGENTS.md` for project conventions
