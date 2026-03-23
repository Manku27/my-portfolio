# Portfolio Game Design Document
> The playable portfolio. Solidified from conversation. Last updated: March 2026.

---

## The concept in one sentence

A playable 2D side-scrolling platformer that is also a portfolio — the game
IS the navigation, not a feature on top of it.

---

## The world — three directions from spawn

```
        ← [Work world]

[Spawn / Landing]          → [Timeline world]

        ↓ [About Me world — vertical descent]
```

The spawn room is the centre of three axes:
- **Left** — work history, companies, projects, consulting
- **Right** — timeline, life diary, recent first
- **Down** — about me, personal story, life experiences

The vertical axis (down) is accessed by falling into a pit in the ground
of the spawn room.

---

## The spawn room — landing screen

This is what every visitor sees first. All elements coexist in the world —
nothing is a UI overlay.

### Centre
- **Your name** — rendered in the world using the thematic font
- Behaves as a brick/platform — the character can jump onto the letters
- Does NOT look like a regular brick — styled as large atmospheric text
- **One liner** beneath or near the name:
  "I build things because they need to exist."

### Left edge of spawn room
- Your role: "Senior Fullstack Engineer"
- A signpost pointing left — labelled something evocative (not just "Work")
- Hints at the work world without being a UI element

### Right edge of spawn room
- A signpost or environmental hint pointing right
- Something like "What have I been up to?" — pointing toward the timeline
- Casual, curious tone — matches the timeline's diary nature

### The pit — vertical descent
- A gap in the ground, visible from the spawn room
- Falling into it descends into the About Me world
- Near the pit edge: text or a sign reading "Who are you?" as the hint
- The pit should look intentional — a designed opening, not a hole

---

## The About Me world — vertical descent

Accessed by falling into the pit in the spawn room. Scrolls vertically
downward. This is the most personal layer — the story behind the resume.

Content pulled from `lib/data/about.ts`:
- The Kota story — JEE prep, mental breakdown, love for physics
- Batman and Spider-Man pulling him back (named explicitly)
- Jadavpur University, backlogs, barely graduating
- The pragmatic switch to web development
- Comics as a value system, not a hobby
- The pattern: hits walls, doesn't quit, finds another way through
- Honest self-assessment — strengths and gaps

Each story beat is a world object — a platform, a sign, a structure.
Walking/falling down reveals more of the story.

To return to spawn: a platform or door at the bottom that sends you back up.

---

## The work world — left of spawn

Company buildings, each with an exterior and a roof.

### Building exterior (visible as you walk past)
- Company logo / name
- Duration (e.g. "2 years")
- One line description — what kind of company it was
- Visible without any interaction

### Roof interaction — speech bubble
When the character stands on the roof of a building:
- A speech bubble rises from the building
- Contains the detailed view:
  - Full role title
  - All bullet points / achievements
  - Tech used
- Speech bubble is diegetic — the building is talking to you
- Not a browser modal, not a separate route
- Close by walking off the roof

### Buildings (left to right = most recent to oldest)
- Merkle/Dentsu — current, most prominent, closest to spawn
- Tech Mahindra — Microsoft Bing Ads signage
- PwC India — government/corporate aesthetic
- Infosys — first building, modest, early
- Workstation area — personal projects (Moebius, PK Chai, Vishuddha etc.)
- Consulting structures — Wohana, RaiseMatters

---

## The timeline world — right of spawn

Life diary. Walking right goes further back in time. Recent first.

Each timeline entry is a world object:
- Milestone entries (`isMilestone: true`) — larger, more prominent structures
- Short entries — smaller environmental details, signs, objects
- Rich entries — have an image or embed visible in the world

### Speech bubble interaction
Same mechanic as work world. Standing near or on a timeline object
triggers a speech bubble with full entry detail.

Content pulled from `lib/data/timeline.ts`.

---

## The charm system — navigation

Styled after Hollow Knight's charm equipping. Opens a charm inventory.
Each charm routes you to a different content world.

| Charm | Routes to |
|---|---|
| Work | Left world — professional layer |
| Timeline | Right world — life diary |
| About | Down — personal story |
| Books | Books world |
| Movies | Movies world |
| Writing | Content / blog world |
| Games | Games world |

Charm UI: dark inventory screen, charms as small glowing objects.
Tab to open/close. This IS the site navigation — no nav bar, no links.

---

## Speech bubble system — interaction mechanic

Used throughout all worlds. Replaces modals entirely.

**Trigger:** character stands on a roof / near a world object
**Behaviour:**
- Speech bubble animates in from the object
- Styled in the world aesthetic — dark background, teal border, thematic font
- Contains full detail for that object
- Dismisses when character walks away
- Never pauses the game — world continues underneath

**Why not a modal:**
- Modals break the game feel
- Speech bubbles are diegetic — the world is speaking
- Consistent with the platformer language

---

## The character

Using Hollow Knight's Knight character assets. Personal portfolio, no
commercial use, no monetization — fair use for personal project.

Currently: white rectangle placeholder (32×48px).
Replace with Knight sprite sheet when assets are sourced.

Animations needed:
- Idle
- Walk left / walk right
- Jump
- Land
- Hit reaction (brick hit)

---

## Controls

Desktop only. Mobile explicitly out of scope.

| Input | Action |
|---|---|
| Arrow left / A | Walk left |
| Arrow right / D | Walk right |
| Space / Arrow up | Jump (single jump only) |
| Tab | Open / close charm inventory |
| Cursor movement | Background elements react |

Note: W and S not used. W conflicts with jump, S has no action.

---

## Camera

**Room-based snapping.** World divided into rooms. Camera snaps to each
room as character enters it. Not smooth follow — discrete transitions.

For the vertical About Me world: camera snaps downward as character
descends through sections.

---

## Physics

**Single jump.** No double jump. Heavy gravity — Hollow Knight-style.
Character has weight. Jump feels deliberate, not floaty.

---

## Game engine

**Canvas 2D with requestAnimationFrame.**
Not R3F, not Rapier. Hand-rolled 2D platformer physics.
Canvas 2D is the correct tool — fast, appropriate for 2D games.

---

## Aesthetic

### Reference
Hollow Knight — Greenpath. Deep teal-black, bioluminescent light,
sparse particles, depth via parallax layers.

### Palette
- Background: `#050a0a` to `#0a1a1a`
- Light sources: bioluminescent teal-green, cold white wisps
- Accent: faint amber/gold for important elements
- Typography: thematic, weighted, slightly hand-drawn feel

### Parallax layers
- Far: barely moves (factor ~0.1)
- Mid: moderate (factor ~0.4)
- Foreground: fastest, cursor-reactive (factor ~0.8)

### Particles
Sparse. ~20-30 across viewport. Mostly still. Variable sizes.
Cold white and faint teal. Large portions of screen pure dark.

---

## Mobile

Explicitly out of scope. Show on mobile viewports:
"This experience is designed for desktop."

---

## Scope and risk

Ambitious. Risk of not shipping is acknowledged.

Mitigation: if game build stalls, a conventional Next.js portfolio
scaffolds from the same `lib/data/` files — nothing is wasted.

---

## What is decided

| Decision | Answer |
|---|---|
| World layout | Three-directional — left work, right timeline, down about me |
| Landing elements | Name (jumpable), one liner, role + signpost left, hint right, pit down |
| Interaction mechanic | Speech bubble on roof / near object — not a modal |
| About Me access | Pit in spawn room floor, vertical descent |
| Navigation | Charm system — no nav bar, no links |
| Content surfacing | Visible in world, speech bubble for detail |
| Character | Knight placeholder (white rect), sprite later |
| Camera | Room-based snapping |
| Jump | Single jump, heavy gravity |
| Game engine | Canvas 2D + requestAnimationFrame |
| Mobile | Out of scope |
| Aesthetic | Hollow Knight / Greenpath |

---

## Open questions

1. What does the About Me world look like visually — cave descent, roots,
   something else?
2. How far left/right does each world extend — how many rooms?
3. What does "returning from the pit" feel like — a door, a vine, a lift?
4. Sound design — out of scope for now, revisit later
