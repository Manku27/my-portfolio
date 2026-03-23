# Portfolio Game — Build Objectives
> One objective per Claude Code session. Complete and verify before moving on.
> Last updated: March 2026.

---

## Foundation

### Objective 1 — Game canvas
Set up a full-viewport Canvas 2D element that renders a solid `#050a0a`
background and runs a game loop at 60fps via requestAnimationFrame. Log the
frame delta to console to prove the loop is running. Nothing else.

---

## Character

### Objective 2 — Placeholder character
Render a white rectangle (32×48px) centred in the spawn room. No movement
yet. Just prove a game object renders on the canvas at the right position.

### Objective 3 — Horizontal movement
Left/right arrow keys and A/D keys move the rectangle left and right.
Movement feels responsive. Character does not walk off the edge of the canvas.

### Objective 4 — Gravity and single jump
The rectangle falls under gravity. Spacebar or up arrow makes it jump once.
It lands on a ground plane drawn across the bottom of the room. No
double-jump — if you are in the air, jump does nothing.

### Objective 5 — Room-based camera
The world is wider than the viewport. Define at least 3 rooms side by side.
As the character walks into a new room, the camera snaps to that room.
No smooth follow — discrete snap only.

---

## World

### Objective 6 — Spawn room
The starting room. Dark background (`#050a0a`), ground plane, two visible
paths. Left path has a lamp post placeholder (a rectangle with a circle on
top). Right path is open. No content yet — just the environment.

### Objective 7 — Parallax layers
Three background depth layers moving at different speeds as the character
moves horizontally:
- Far layer — barely moves (parallax factor ~0.1)
- Mid layer — moderate movement (parallax factor ~0.4)
- Foreground layer — fastest (parallax factor ~0.8)
Placeholder colours for each layer for now.

### Objective 8 — Cursor-reactive foreground
Foreground layer elements subtly shift or sway toward the cursor position.
Gentle, not snappy. Feels like plants in a breeze.

---

## Aesthetic

### Objective 9 — Hollow Knight palette
Apply the full colour spec from docs/game-design.md:
- Background: `#050a0a`
- Ambient teal-green light sources placed in the spawn room
- Ground with a slight bioluminescent edge
The spawn room should feel atmospheric, not like a test environment.

### Objective 10 — Ambient particles
20-30 sparse wisps rendered in the spawn room. Spec from game-design.md:
- Mostly still — imperceptible drift at rest
- Variable sizes — a few large soft wisps, medium motes, near-invisible specks
- Colour: cold white and faint teal, not blue-grey
- Large portions of screen remain pure dark

---

## Content — Timeline world

### Objective 11 — First timeline room
One room to the right of spawn. Pull 2-3 entries from
`lib/data/timeline.ts`. Render each entry as a world object — title and
short body visible in the world in a thematic font. No interaction yet.

### Objective 12 — Full timeline world
All timeline rooms. Entries spaced across rooms, walking right goes
further back in time. Milestone entries (`isMilestone: true`) are
visually larger and more prominent than short entries.

---

## Content — Work world

### Objective 13 — First work room
One room to the left of spawn. Render one company from
`lib/data/work.ts` as a building placeholder — a rectangle with the
company name above it. Content (role, bullets) visible in the world
in thematic font.

### Objective 14 — Full work world
All company buildings (Infosys → PwC → Tech Mahindra → Merkle), a
workstation area for personal projects, consulting structures for
Wohana and RaiseMatters. Walking further left goes further back in time.

---

## Interactivity

### Objective 15 — Interactive bricks
Place brick objects in the world. Character can jump and hit them from
below (character's head collides with brick from underneath). On hit,
the brick plays a shake animation. Content is already visible — the hit
is tactile feedback only, not a reveal.

---

## Charm system

### Objective 16 — Charm inventory UI
Press Tab to open the charm inventory. Dark overlay, charm slots, Hollow
Knight aesthetic. Close with Tab or Escape. No routing yet — just the UI.

### Objective 17 — Charm routing (Work + Timeline)
Equipping the Work charm navigates to the work world (left).
Equipping the Timeline charm navigates to the timeline world (right).
These two charms work end-to-end.

### Objective 18 — Remaining charms
Add Books, Movies, Writing, Games charms. Each routes to a stub world —
a room with the world name displayed, no content yet. Content populated
in a later pass.

---

## Polish

### Objective 19 — Mobile fallback
Detect mobile viewport on load. Show a full-screen message:
"This experience is designed for desktop." No game canvas rendered on
mobile. Clean, on-brand typography.

### Objective 20 — Performance pass
Audit the render loop. Check for memory leaks (event listeners, animation
frames not cancelled). Verify 60fps on a mid-range machine. Add frame rate
monitoring in dev mode.

---

## Notes

- Each objective is one Claude Code session
- Do not start the next objective until the current one is visually verified
- The data layer (`lib/data/`) is already seeded — pull from it, never hardcode
- Check `utils/` before writing any helper function
- Always verify latest stable package versions before installing anything new
- Refer to `docs/game-design.md` for all aesthetic and mechanic decisions
- Refer to `AGENTS.md` for all project conventions
