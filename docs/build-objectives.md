# Portfolio Game — Build Objectives
> One objective per Claude Code session. Complete and verify before moving on.
> Last updated: March 2026.

---

## Completed

- ✅ Game canvas — Canvas 2D, 60fps loop
- ✅ Knight sprite — walk, idle, jump animations from public/sprites/knight.webp
- ✅ Horizontal movement — arrow keys + A/D
- ✅ Gravity and double jump
- ✅ Room-based camera with character position preserved at edges
- ✅ Hollow Knight palette applied
- ✅ Ambient particles — sparse, variable sizes, cold white + teal
- ✅ Hittable bricks — jump from below, shake feedback
- ✅ Charm menu UI — Tab to open/close
- ✅ Fonts wired — Trajan Pro (headings) + Perpetua (body) in canvas + CSS
- ✅ All environment assets in public/sprites/ — see docs/assets-map.md
- ✅ Asset loader — utils/loadAssets.ts, loadAllAssets() before frame 1
- ✅ Landing screen — central floating island, bench, main lamp post
- ✅ Flanking lamp posts left and right on lower ground
- ✅ Signposts — sign_post_01.png (left/Work) and sign_post_02.png (right/Timeline)
- ✅ Ground tiles — town_floor_01.png tiled on left and right sections
- ✅ Foreground grass — 3 sprite types, wind sway animation
- ✅ Floating platforms — wp_plat_float_01.png replacing code-drawn bricks
- ✅ Character ambient glow — soft teal-white radial gradient behind sprite
- ✅ Name as jumpable platform — "Mayank Jhunjhunwala" in Trajan Pro
- ✅ Tagline below name — Perpetua, muted
- ✅ Dialogue decorations — top/bottom scroll ornaments framing name block
- ✅ Parallax background — volumetric bloom + hanging vine silhouettes
- ✅ Void below island — gaps on either side, falling triggers About Me world
- ✅ "The story behind the resume" void label with fall hint
- ✅ Controls hint overlay — fades after 8 seconds of play
- ✅ Social HUD — health frame + 7 social icons (LinkedIn, GitHub, Gmail,
    YouTube, Medium, WhatsApp, Discord) with hover + click to open
- ✅ Resume download — scroll icon in HUD, downloads /resume.pdf
- ✅ Ambient audio — HKnight-Greenpath.mp3, triggered on first keypress,
    loops, fades in over 2 seconds
- ✅ Favicon — head_cracked_option.png as app/icon.png
- ✅ OG image — app/opengraph-image.png (1200×630, game palette + Knight mask)
- ✅ Metadata — layout.tsx fully populated, canonical manku27.dev
- ✅ WorkRoom stub exists
- ✅ TimelineRoom stub exists

---

## Next — Work world

### Objective 1 — Work world buildings

Left of spawn. Walking left from the central island reaches the work world.
Most recent company closest to spawn, oldest furthest left.

Pull all data from `lib/data/index.ts` — never hardcode content.
Data files: `lib/data/work.ts`

**Building order (left to right = oldest to newest, closest to spawn = Merkle):**
- Infosys — furthest left, modest, first building
- PwC India — larger, government/corporate aesthetic
- Tech Mahindra — tech campus feel
- Merkle/Dentsu — current, most prominent, closest to spawn

**Per building exterior (visible as character walks past):**
- Company name in Trajan Pro above the building
- Duration in Perpetua (e.g. "2 years")
- One line description in Perpetua
- Building roof is a solid platform — use wp_plat_top_wide.png
- Character can stand on the roof

**Consulting structures — separate from main buildings:**
- Wohana (Vienna) — smaller, independent aesthetic
- RaiseMatters (Defence) — same

**Personal projects workstation area:**
- A distinct area for Moebius, PK Chai, Vishuddha etc.
- Workbench / desk aesthetic rather than a building

**Platforms between buildings:**
- Use dream_plat_mid0005.png and wp_plat_float_01.png to connect areas
- Character should be able to navigate the work world by jumping

**Visual style:**
- Same Hollow Knight palette — teal-black, bioluminescent accents
- Each company has a different silhouette/height to differentiate
- Ground: town_floor_01.png tiled throughout

### Objective 2 — Speech bubble on building roof

When character stands on a building roof, a speech bubble rises with
full detail for that company:
- Full role title (Trajan Pro)
- All bullet points / achievements (Perpetua)
- Tech used (Perpetua, muted)

Use Controller_Dialogue_0000_top.png and Controller_Dialogue_0001_bot.png
as top and bottom borders of the bubble. Spec in docs/assets-map.md.

Dismisses when character walks off the roof. No game pause.
Data from lib/data/work.ts via lib/data/index.ts.

### Objective 3 — Speech bubble on consulting + projects

Same mechanic for Wohana, RaiseMatters, and personal project structures.
Data from lib/data/work.ts (consultingEngagements, projects).

---

## Timeline world

### Objective 4 — Timeline world with real data
Real entries from lib/data/timeline.ts. Milestone entries larger and
more prominent. Walking right = further back in time. Multiple rooms.
Platforms use dream_plat_mid0005.png and dream_small_plat0000.png.
Speech bubble on approach surfaces full entry detail.

---

## About Me world — vertical descent

### Objective 5 — About Me world rooms
Vertical world accessed by falling off the central island into the void.
Content from lib/data/about.ts. Each story beat is a room/platform.
Platforms use vine_platform_01.png for organic feel.
Return mechanism at the bottom sends character back to spawn.

---

## Charm system

### Objective 6 — Charm routing
Wire all charms to their destinations:
- Work charm → left world
- Timeline charm → right world
- About charm → vertical descent / about me world
- Books, Movies, Writing, Games → stub worlds for now
Use head_cracked_option.png as player icon in charm menu.

---

## Remaining worlds

### Objective 7 — Books world
Data from lib/data/books.ts. Speech bubble for review detail.

### Objective 8 — Movies world
Data from lib/data/movies.ts.

### Objective 9 — Games world
Data from lib/data/games.ts.

### Objective 10 — Writing world
Data from lib/data/videos.ts and posts.

---

## Mobile (parked — see docs/mobile-ideation.md)
Endless runner. Build after desktop is complete.

---

## Polish

### Objective 11 — Mobile fallback
Detect mobile viewport. Show message pointing to mobile experience.

### Objective 12 — Performance pass
Audit render loop. Memory leaks. 60fps verification. Dev frame monitor.

---

## Notes

- One objective per Claude Code session
- Verify visually before moving to the next objective
- All data from lib/data/index.ts — never hardcode content
- Sprite frame data from lib/sprites/knight-frames.ts — never re-derive
- Asset usage from docs/assets-map.md — never guess placement
- Check utils/ before writing any helper
- Verify latest stable package versions before installing anything new
- Refer to docs/game-design.md for mechanic and aesthetic decisions
- Refer to AGENTS.md for project conventions
