// Charm inventory overlay — Hollow Knight-style navigation screen.
// Drawn directly on the game canvas (not DOM). Press Tab to open/close.

const CHARMS: Array<{ id: string; label: string; color: string }> = [
  { id: 'work',     label: 'Work',     color: '#c89030' },
  { id: 'timeline', label: 'Timeline', color: '#30c8a0' },
  { id: 'books',    label: 'Books',    color: '#9060e0' },
  { id: 'movies',   label: 'Movies',   color: '#e06030' },
  { id: 'writing',  label: 'Writing',  color: '#40b8df' },
  { id: 'games',    label: 'Games',    color: '#50d080' },
]

export const CHARM_COUNT = CHARMS.length

// Grid layout helpers — shared with GameCanvas for hit-testing
function charmCenter(i: number, W: number, H: number): { ox: number; oy: number } {
  const rows  = Math.ceil(CHARMS.length / COLS)
  const gridX = W / 2 - ((COLS - 1) * SLOT_STEP) / 2
  const gridY = H / 2 - ((rows  - 1) * SLOT_STEP) / 2
  return {
    ox: gridX + (i % COLS) * SLOT_STEP,
    oy: gridY + Math.floor(i / COLS) * SLOT_STEP,
  }
}

/** Returns charm index under (x,y), or -1 if none. */
export function getCharmAtPoint(x: number, y: number, W: number, H: number): number {
  for (let i = 0; i < CHARMS.length; i++) {
    const { ox, oy } = charmCenter(i, W, H)
    if (Math.hypot(x - ox, y - oy) <= SLOT_R + 7) return i
  }
  return -1
}

/** Returns the URL hash id for a charm index. */
export function getCharmId(i: number): string {
  return CHARMS[i]?.id ?? ''
}

const COLS     = 3
const SLOT_R   = 34   // orb radius px
const SLOT_STEP = 100 // center-to-center distance

// Hex → rgba with alpha
function hexA(hex: string, a: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${a})`
}

export function drawCharmMenu(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  progress: number,      // 0 = fully closed, 1 = fully open
  selectedIndex: number,
): void {
  if (progress <= 0) return
  ctx.save()
  ctx.globalAlpha = progress

  // ── Dark overlay ──────────────────────────────────────────────────────────
  ctx.fillStyle = 'rgba(2,8,8,0.90)'
  ctx.fillRect(0, 0, W, H)

  // ── Panel ─────────────────────────────────────────────────────────────────
  const rows      = Math.ceil(CHARMS.length / COLS)
  const gridW     = (COLS - 1) * SLOT_STEP
  const gridH     = (rows - 1) * SLOT_STEP
  const gridX     = W / 2 - gridW / 2    // leftmost orb centre x
  const gridY     = H / 2 - gridH / 2    // topmost orb centre y

  const panelPad  = 48
  const titleH    = 52
  const hintH     = 32
  const panelX    = gridX - SLOT_R - panelPad
  const panelY    = gridY - SLOT_R - titleH
  const panelW    = gridW + SLOT_R * 2 + panelPad * 2
  const panelH    = gridH + SLOT_R * 2 + titleH + hintH + 20

  // Faint panel background
  ctx.fillStyle = 'rgba(4,14,12,0.70)'
  ctx.beginPath()
  ctx.roundRect(panelX, panelY, panelW, panelH, 4)
  ctx.fill()

  // Panel border — thin teal line
  ctx.strokeStyle = 'rgba(48,180,140,0.18)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.roundRect(panelX, panelY, panelW, panelH, 4)
  ctx.stroke()

  // Corner accent marks
  const mk = 12
  ctx.strokeStyle = 'rgba(48,180,140,0.45)'
  ctx.lineWidth = 1.5
  for (const [cx2, cy2, dx, dy] of [
    [panelX, panelY, 1, 1],
    [panelX + panelW, panelY, -1, 1],
    [panelX, panelY + panelH, 1, -1],
    [panelX + panelW, panelY + panelH, -1, -1],
  ] as [number, number, number, number][]) {
    ctx.beginPath()
    ctx.moveTo(cx2 + dx * mk, cy2)
    ctx.lineTo(cx2, cy2)
    ctx.lineTo(cx2, cy2 + dy * mk)
    ctx.stroke()
  }

  // ── Title ─────────────────────────────────────────────────────────────────
  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(190,240,220,0.90)'
  ctx.font = '500 15px Georgia, serif'
  ctx.fillText('C H A R M S', W / 2, panelY + 28)

  // Thin decorative rule under title
  ctx.strokeStyle = 'rgba(48,180,140,0.22)'
  ctx.lineWidth   = 1
  ctx.beginPath()
  ctx.moveTo(panelX + 20, panelY + 36)
  ctx.lineTo(panelX + panelW - 20, panelY + 36)
  ctx.stroke()

  // ── Charm orbs ────────────────────────────────────────────────────────────
  for (let i = 0; i < CHARMS.length; i++) {
    const charm       = CHARMS[i]
    const { ox, oy }  = charmCenter(i, W, H)
    const active      = i === selectedIndex

    // Outer glow when selected
    if (active) {
      const glow = ctx.createRadialGradient(ox, oy, SLOT_R * 0.4, ox, oy, SLOT_R * 2.2)
      glow.addColorStop(0, hexA(charm.color, 0.30))
      glow.addColorStop(1, hexA(charm.color, 0))
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(ox, oy, SLOT_R * 2.2, 0, Math.PI * 2)
      ctx.fill()
    }

    // Slot ring
    ctx.strokeStyle = active ? hexA(charm.color, 0.80) : 'rgba(50,90,75,0.55)'
    ctx.lineWidth   = active ? 2 : 1
    ctx.beginPath()
    ctx.arc(ox, oy, SLOT_R + 7, 0, Math.PI * 2)
    ctx.stroke()

    // Orb body — radial gradient from colour to dark
    const orb = ctx.createRadialGradient(
      ox - SLOT_R * 0.28, oy - SLOT_R * 0.28, 0,
      ox, oy, SLOT_R,
    )
    orb.addColorStop(0, hexA(charm.color, active ? 1.0 : 0.75))
    orb.addColorStop(0.55, hexA(charm.color, active ? 0.65 : 0.45))
    orb.addColorStop(1, 'rgba(8,20,16,0.95)')
    ctx.fillStyle = orb
    ctx.beginPath()
    ctx.arc(ox, oy, SLOT_R, 0, Math.PI * 2)
    ctx.fill()

    // Specular highlight — small bright spot
    const spec = ctx.createRadialGradient(
      ox - SLOT_R * 0.30, oy - SLOT_R * 0.30, 0,
      ox - SLOT_R * 0.30, oy - SLOT_R * 0.30, SLOT_R * 0.38,
    )
    spec.addColorStop(0, 'rgba(255,255,255,0.22)')
    spec.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = spec
    ctx.beginPath()
    ctx.arc(ox, oy, SLOT_R, 0, Math.PI * 2)
    ctx.fill()

    // Label
    ctx.textAlign    = 'center'
    ctx.fillStyle    = active ? 'rgba(220,255,240,0.95)' : 'rgba(100,160,130,0.65)'
    ctx.font         = `${active ? '600' : '400'} 12px Georgia, serif`
    ctx.fillText(charm.label, ox, oy + SLOT_R + 18)
  }

  // ── Navigation hint ───────────────────────────────────────────────────────
  ctx.textAlign  = 'center'
  ctx.fillStyle  = 'rgba(60,120,95,0.45)'
  ctx.font       = '11px Georgia, serif'
  ctx.fillText('← → ↑ ↓  navigate    Tab / Esc  close', W / 2, panelY + panelH - 10)

  ctx.restore()
}
