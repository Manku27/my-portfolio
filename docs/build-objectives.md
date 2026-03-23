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

## Fonts

### Objective 1 — Wire up custom fonts and render name as jumpable platform

**Step 1 — Font setup**

Font files are already in `public/fonts/`:
- `Trajan-Pro.otf` — regular weight, headings and logo
- `Trajan-Pro-Bold.otf` — bold weight
- `Perpetua-Regular.woff2` — body text
- `Perpetua-Bold.woff2` — bold body text

In `app/globals.css`, declare all four using `@font-face`. Use:
- `font-family: 'Trajan Pro'` for the Trajan files
- `font-family: 'Perpetua'` for the Perpetua files

Add two CSS custom properties:
- `--font-heading: 'Trajan Pro', serif`
- `--font-body: 'Perpetua', serif`

**Step 2 — Font usage in Canvas**

The game renders on a Canvas 2D element, not in the DOM, so CSS variables
do not apply automatically. Wherever `ctx.font` is set in any game
component, use the literal font family name strings:
- Headings, name, signposts, labels: `'Trajan Pro'`
- Body text, speech bubbles, entry detail: `'Perpetua'`

Fonts must be loaded before the canvas renders. Use the FontFace API or
`document.fonts.ready` to ensure fonts are available before the first
frame draws. If fonts are not loaded, the canvas will fall back to serif
silently — add a console warning in dev if fonts are not found.

**Step 3 — Name as jumpable platform**

Render "Mayank Jhunjhunwala" in the centre of the spawn room using
`'Trajan Pro'`, large size (aim for the name spanning roughly 50-60%
of the viewport width). The text sits above the ground, vertically
centred in the upper half of the room.

The name behaves as a solid platform — character can jump onto the
letters and stand on top of the text. The collision box spans the full
width of the rendered text at the top edge of the letters.

It does not look like a brick. It is atmospheric large text — colour
should be a dim teal-white, slightly luminous, consistent with the
world palette. No box, no border, no background behind it.

**Step 4 — One liner**

Below the name, render the tagline in `'Perpetua'` regular:
"I build things because they need to exist."

Smaller than the name, muted colour (`--color-text-muted` equivalent),
centred under the name. Not a platform — purely decorative text.

---

## Spawn room redesign

### Objective 2 — Landing screen elements
Add all remaining spawn room elements from game-design.md:
- Left edge: role text "Senior Fullstack Engineer" + signpost pointing left
- Right edge: environmental hint pointing right toward the timeline
- Pit in the ground: a visible gap in the floor
- "Who are you?" label near the pit edge
All text in Trajan Pro (labels/signposts) or Perpetua (body hints).
Styled to fit the world — not UI overlays.

### Objective 3 — The pit and vertical descent
When the character falls into the pit, transition to the About Me world.
Vertical camera snapping downward through sections. Stub rooms with
placeholder text for now. Return mechanism at the bottom sends character
back to spawn.

---

## Speech bubble system

### Objective 4 — Speech bubble component
Reusable Canvas 2D speech bubble. Given a position and content, draws
a styled bubble pointing at the trigger object. Animated in. Dismisses
on character moving away. Perpetua for body text, Trajan Pro for titles.
No game pause.

### Objective 5 — Wire speech bubble to work buildings
Character stands on building roof → speech bubble with full company
detail. Data from `lib/data/work.ts` via `lib/data/index.ts`.

### Objective 6 — Wire speech bubble to timeline entries
Same mechanic for timeline world objects. Data from `lib/data/timeline.ts`.

---

## Work world — left of spawn

### Objective 7 — Work world buildings
Real buildings for Merkle, Tech Mahindra, PwC, Infosys. Most recent
closest to spawn. Exterior shows company name (Trajan Pro), duration,
one line. Roof is a solid platform. Workstation area for personal projects.

### Objective 8 — Consulting structures
Wohana and RaiseMatters as distinct structures. Same speech bubble
interaction on roof.

---

## Timeline world — right of spawn

### Objective 9 — Timeline world with real data
Real entries from `lib/data/timeline.ts`. Milestone entries larger and
more prominent. Walking right = further back in time. Multiple rooms.

---

## About Me world — vertical descent

### Objective 10 — About Me world rooms
Vertical world via the pit. Content from `lib/data/about.ts`. Each
story beat is a room. Return mechanism at the bottom.

---

## Charm system

### Objective 11 — Charm routing
Wire all charms: Work → left, Timeline → right, About → pit,
Books/Movies/Writing/Games → stub worlds.

---

## Remaining worlds

### Objective 12 — Books world
Data from `lib/data/books.ts`. Speech bubble for review detail.

### Objective 13 — Movies world
Data from `lib/data/movies.ts`.

### Objective 14 — Games world
Data from `lib/data/games.ts`.

### Objective 15 — Writing world
Data from `lib/data/videos.ts` and posts.

---

## Polish

### Objective 16 — Mobile fallback
Detect mobile viewport. Show: "This experience is designed for desktop."

### Objective 17 — Performance pass
Audit render loop. Memory leaks. 60fps verification. Dev frame monitor.

---

## Notes

- One objective per Claude Code session
- Verify visually before moving to the next objective
- All data from `lib/data/index.ts` — never hardcode content
- Check `utils/` before writing any helper
- Verify latest stable package versions before installing anything new
- Refer to `docs/game-design.md` for mechanic and aesthetic decisions
- Refer to `AGENTS.md` for project conventions
