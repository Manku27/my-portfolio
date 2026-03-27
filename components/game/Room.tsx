// Room rendering — two-phase draw so parallax layers sit between bg and environment.
import { drawTimelineRoom } from "./TimelineRoom";
import { drawWorkRoom } from "./WorkRoom";
import { profile } from "@/lib/data/index";
import { getImage } from "@/utils/loadAssets";
import { ISLAND_Y } from "./Bricks";
// roomIndex: 0 = work (left), 1 = spawn (centre), 2 = timeline (right)

const ROOM_TINTS = ["#070a06", "#050a0a", "#050d0a", "#05080e"];

const LAMP_STEM_H = 90; // fallback code-draw only
const LAMP_BULB_R = 10; // fallback code-draw only
const LAMP_SPRITE_H = 200; // station_pole.png draw height

// Lamp is always this many px left of bench centre — keeps them locked together
// regardless of canvas width.
const BENCH_CENTRE_FAC = 0.5;
const LAMP_BENCH_OFFSET = 115; // px

export function getLampX(canvasW: number): number {
  return canvasW * BENCH_CENTRE_FAC - LAMP_BENCH_OFFSET;
}

export function lampBulbY(groundY: number, canvasW = 1280): number {
  return groundY - Math.round(LAMP_SPRITE_H * spawnScale(canvasW)) + 15;
}

// ─── Spawn room asset bundle ───────────────────────────────────────────────────
export interface SpawnAssets {
  groundImg: HTMLImageElement | null;
  poleImg: HTMLImageElement | null;
  sign1Img: HTMLImageElement | null;
  sign2Img: HTMLImageElement | null;
  benchImg: HTMLImageElement | null;
}

// ─── UI scale ─────────────────────────────────────────────────────────────────
// Scales spawn-room assets proportionally on larger screens.
// 1.0× at 1200px, 1.4× at 1680px, capped at 1.4×.

export function spawnScale(canvasW: number): number {
  return Math.min(1.4, Math.max(1.0, canvasW / 1200));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function radialGlow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
  alpha: number,
): void {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color.replace(")", `,${alpha})`).replace("rgb", "rgba"));
  g.addColorStop(1, color.replace(")", ",0)").replace("rgb", "rgba"));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

// ─── Lamp post ────────────────────────────────────────────────────────────────

function drawLampPost(
  ctx: CanvasRenderingContext2D,
  x: number,
  groundY: number,
  glowScale: number,
  poleImg: HTMLImageElement | null = null,
  uiScale = 1,
): void {
  const drawH = Math.round(LAMP_SPRITE_H * uiScale);
  const bulbY = groundY - drawH + 15;

  if (poleImg) {
    const drawW =
      Math.round(
        (poleImg.naturalWidth * drawH) / (poleImg.naturalHeight || 1),
      ) || 44;
    ctx.drawImage(poleImg, x - drawW / 2, groundY - drawH, drawW, drawH);
  } else {
    // Fallback: code-drawn stem
    const stemY = groundY - LAMP_STEM_H;
    ctx.fillStyle = "#2a4a4a";
    ctx.fillRect(x - 3, stemY, 6, LAMP_STEM_H);
    // Fallback bulb core
    const brightness = Math.round(160 + glowScale * 95);
    ctx.fillStyle = `rgb(${brightness},255,${brightness + 20})`;
    ctx.beginPath();
    ctx.arc(x, bulbY, LAMP_BULB_R, 0, Math.PI * 2);
    ctx.fill();
  }

  // Filament — always-on bright core
  const filR = LAMP_BULB_R * 4;
  const filG = ctx.createRadialGradient(x, bulbY, 0, x, bulbY, filR);
  filG.addColorStop(0, "rgba(220,255,235,0.95)");
  filG.addColorStop(0.3, "rgba(160,255,215,0.60)");
  filG.addColorStop(0.7, "rgba(100,240,195,0.22)");
  filG.addColorStop(1, "rgba(80,220,180,0)");
  ctx.fillStyle = filG;
  ctx.beginPath();
  ctx.arc(x, bulbY, filR, 0, Math.PI * 2);
  ctx.fill();

  // Outer halo — always somewhat visible, expands on hover
  const glowR = LAMP_BULB_R * 8 + glowScale * LAMP_BULB_R * 6;
  const glowAlpha = 0.32 + glowScale * 0.28;
  const glow = ctx.createRadialGradient(x, bulbY, 0, x, bulbY, glowR);
  glow.addColorStop(0, `rgba(140,255,210,${glowAlpha})`);
  glow.addColorStop(0.5, `rgba(80,220,180,${glowAlpha * 0.4})`);
  glow.addColorStop(1, "rgba(60,200,160,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, bulbY, glowR, 0, Math.PI * 2);
  ctx.fill();
}

// ─── Ground tiling helper ─────────────────────────────────────────────────────

function drawGroundSection(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null,
  x: number,
  w: number,
  groundY: number,
  canvasH: number,
): void {
  if (!img) {
    ctx.fillStyle = "#152e2e";
    ctx.fillRect(x, groundY, w, canvasH - groundY);
    return;
  }
  const tileH = 50;
  const tileW =
    Math.round((img.naturalWidth * tileH) / (img.naturalHeight || 1)) || 128;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, groundY, w, canvasH - groundY);
  ctx.clip();
  let tx = x;
  while (tx < x + w) {
    const dw = Math.min(tileW, x + w - tx);
    const sw = img.naturalWidth
      ? Math.round((dw * img.naturalWidth) / tileW)
      : dw;
    const sh = img.naturalHeight || tileH;
    ctx.drawImage(img, 0, 0, sw, sh, tx, groundY, dw, tileH);
    tx += tileW;
  }
  ctx.restore();
}

// ─── Bench helper ─────────────────────────────────────────────────────────────

function drawBench(
  ctx: CanvasRenderingContext2D,
  x: number,
  groundY: number,
  img: HTMLImageElement | null,
  uiScale = 1,
): void {
  if (!img) return;
  const drawH = Math.round(72 * uiScale);
  const drawW =
    Math.round((img.naturalWidth * drawH) / (img.naturalHeight || 1)) || 80;
  ctx.drawImage(img, x - drawW / 2, groundY - drawH, drawW, drawH);
}

// ─── Spawn room atmosphere ────────────────────────────────────────────────────

function drawSpawnAtmosphere(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
): void {
  // Far ambient light blobs — drawn before parallax layers so they sit deep
  // Upper-left teal cluster
  radialGlow(ctx, w * 0.08, h * 0.22, w * 0.18, "rgb(40,160,120)", 0.1);
  // Upper-right cold white wisp
  radialGlow(ctx, w * 0.75, h * 0.18, w * 0.14, "rgb(180,240,230)", 0.07);
  // Mid-right faint amber accent
  radialGlow(ctx, w * 0.88, h * 0.42, w * 0.1, "rgb(200,160,60)", 0.06);
}

function drawSpawnGroundGlow(
  ctx: CanvasRenderingContext2D,
  w: number,
  groundY: number,
): void {
  // Bioluminescent band — left section only (0 to w*0.28)
  const leftW = w * 0.28;
  const rightX = w * 0.72;
  const bandL = ctx.createLinearGradient(0, groundY - 18, 0, groundY + 4);
  bandL.addColorStop(0, "rgba(60,200,150,0)");
  bandL.addColorStop(0.6, "rgba(60,200,150,0.08)");
  bandL.addColorStop(1, "rgba(60,200,150,0.18)");
  ctx.fillStyle = bandL;
  ctx.fillRect(0, groundY - 18, leftW, 22);

  // Bioluminescent band — right section only (w*0.72 to w)
  const bandR = ctx.createLinearGradient(0, groundY - 18, 0, groundY + 4);
  bandR.addColorStop(0, "rgba(60,200,150,0)");
  bandR.addColorStop(0.6, "rgba(60,200,150,0.08)");
  bandR.addColorStop(1, "rgba(60,200,150,0.18)");
  ctx.fillStyle = bandR;
  ctx.fillRect(rightX, groundY - 18, w - rightX, 22);

  // Ground-level moss glow — one per side section
  radialGlow(ctx, w * 0.14, groundY, w * 0.1, "rgb(40,180,120)", 0.07);
  radialGlow(ctx, w * 0.86, groundY, w * 0.08, "rgb(40,180,120)", 0.06);
}

function drawVignette(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
): void {
  // Top-to-bottom subtle darkening at top
  const top = ctx.createLinearGradient(0, 0, 0, h * 0.35);
  top.addColorStop(0, "rgba(0,0,0,0.45)");
  top.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = top;
  ctx.fillRect(0, 0, w, h * 0.35);

  // Left and right edge darkening
  const left = ctx.createLinearGradient(0, 0, w * 0.12, 0);
  left.addColorStop(0, "rgba(0,0,0,0.35)");
  left.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = left;
  ctx.fillRect(0, 0, w * 0.12, h);

  const right = ctx.createLinearGradient(w, 0, w * 0.88, 0);
  right.addColorStop(0, "rgba(0,0,0,0.35)");
  right.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = right;
  ctx.fillRect(w * 0.88, 0, w * 0.12, h);
}

// ─── Name platform layout ─────────────────────────────────────────────────────
// Uses measureText (reliable after FontFace preload in GameCanvas).
// Single line when the full name fits at a readable size; two lines only as a
// fallback for narrow viewports. Caller passes layout to both draw and collision.

const NAME_CENTRE_Y_FAC = 0.25; // centreY = canvasH * this
const SINGLE_TARGET_FAC = 0.84; // full name spans this fraction of canvas on single line
const MIN_SINGLE_FONT = 40; // px — below this single line is unreadably small, use two lines
const TWO_LINE_TARGET_FAC = 0.84; // last word spans this fraction on each two-line row

export interface NameLayout {
  twoLine: boolean;
  fontSize: number;
  platformY: number; // canvas Y of top of text bounding box (collision top)
  platformW: number; // width of widest line (platform collision width)
  platformX: number; // canvas X of left edge (centred)
}

export function getNameLayout(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
): NameLayout {
  const centreY = canvasH * NAME_CENTRE_Y_FAC;
  const [, last] = profile.name.split(" ");

  // Measure at 100px reference — fonts are preloaded so this is reliable
  ctx.save();
  ctx.font = `700 100px 'Trajan Pro', serif`;
  const fullW = ctx.measureText(profile.name).width;
  const lastW = ctx.measureText(last).width;
  ctx.restore();

  // Guard: font not yet rasterised returns near-zero widths
  if (fullW < 10 || lastW < 10) {
    const fallbackFs = Math.floor(canvasW * 0.08);
    const fallbackW = canvasW * 0.74;
    const fallbackX = (canvasW - fallbackW) / 2;
    const lineH = fallbackFs * 1.15;
    return {
      twoLine: true,
      fontSize: fallbackFs,
      platformY: centreY - lineH / 2 - fallbackFs / 2,
      platformW: fallbackW,
      platformX: fallbackX,
    };
  }

  // Single-line: scale so full name = SINGLE_TARGET_FAC of canvas width
  const singleFontSize = Math.floor(
    (canvasW * SINGLE_TARGET_FAC * 100) / fullW,
  );

  if (singleFontSize >= MIN_SINGLE_FONT) {
    const platformW = (fullW * singleFontSize) / 100;
    const platformX = (canvasW - platformW) / 2;
    const platformY = centreY - singleFontSize / 2;
    return {
      twoLine: false,
      fontSize: singleFontSize,
      platformY,
      platformW,
      platformX,
    };
  }

  // Two-line fallback: scale so last word (longer) = TWO_LINE_TARGET_FAC of canvas
  const twoFontSize = Math.floor((canvasW * TWO_LINE_TARGET_FAC * 100) / lastW);
  const lineH = twoFontSize * 1.15;
  const platformW = (lastW * twoFontSize) / 100;
  const platformX = (canvasW - platformW) / 2;
  const platformY = centreY - lineH / 2 - twoFontSize / 2;
  return {
    twoLine: true,
    fontSize: twoFontSize,
    platformY,
    platformW,
    platformX,
  };
}

function drawNamePlatform(
  ctx: CanvasRenderingContext2D,
  layout: NameLayout,
  canvasW: number,
  canvasH: number,
  glow = 0,
): void {
  const { twoLine, fontSize, platformW, platformX } = layout;
  const centreY = canvasH * NAME_CENTRE_Y_FAC;
  const centreX = platformX + platformW / 2;
  const [first, last] = profile.name.split(" ");

  // Atmospheric glow when character stands on the name
  if (glow > 0.01) {
    const glowR = canvasW * 0.44;
    const g = ctx.createRadialGradient(
      canvasW / 2,
      centreY,
      0,
      canvasW / 2,
      centreY,
      glowR,
    );
    g.addColorStop(0, `rgba(200,255,245,${glow * 0.22})`);
    g.addColorStop(0.5, `rgba(140,230,220,${glow * 0.1})`);
    g.addColorStop(1, "rgba(100,200,200,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(canvasW / 2, centreY, glowR, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.font = `700 ${fontSize}px 'Trajan Pro', serif`;
  ctx.fillStyle = `rgba(210,242,236,${0.75 + glow * 0.18})`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Compute top of name block (used for top decoration placement)
  let nameTop: number;
  let tagY: number;
  if (twoLine) {
    const lineH = fontSize * 1.15;
    nameTop = centreY - lineH / 2 - fontSize / 2;
    ctx.fillText(first, canvasW / 2, centreY - lineH / 2);
    ctx.fillText(last, canvasW / 2, centreY + lineH / 2);
    tagY = centreY + lineH / 2 + fontSize * 0.75;
  } else {
    nameTop = centreY - fontSize / 2;
    ctx.fillText(profile.name, canvasW / 2, centreY);
    tagY = centreY + fontSize * 0.75;
  }

  // Tagline — Perpetua, muted, below name block
  const tagFontSize = Math.max(16, Math.floor(fontSize * 0.28));
  ctx.font = `400 ${tagFontSize}px 'Perpetua', serif`;
  ctx.fillStyle = "rgba(180,220,210,0.65)";
  ctx.fillText(profile.tagline, canvasW / 2, tagY);

  // Bottom of tagline (textBaseline='middle' so add half the font size)
  const tagBottom = tagY + tagFontSize / 2;

  ctx.textAlign = "left";

  // ── Dialogue decorations ──────────────────────────────────────────────────
  const topImg = getImage("/sprites/Controller_Dialogue_0000_top.png");
  const botImg = getImage("/sprites/Controller_Dialogue_0001_bot.png");

  if (topImg && topImg.naturalWidth > 0) {
    const dW = topImg.naturalWidth;
    const dH = topImg.naturalHeight;
    // Bottom edge 8px above top of name text
    const dX = centreX - dW / 2;
    const dY = nameTop - 8 - dH;
    ctx.drawImage(topImg, dX, dY, dW, dH);
  }

  if (botImg && botImg.naturalWidth > 0) {
    const dW = botImg.naturalWidth;
    const dH = botImg.naturalHeight;
    // Top edge 8px below bottom of tagline
    const dX = centreX - dW / 2;
    const dY = tagBottom + 8;
    ctx.drawImage(botImg, dX, dY, dW, dH);
  }
}

// ─── Spawn room signposts ─────────────────────────────────────────────────────

function drawSignpost(
  ctx: CanvasRenderingContext2D,
  stakeX: number,
  groundY: number,
  stakeH: number,
  topLine: string,
  bottomLine: string,
  direction: "left" | "right",
  fontSize: number,
): void {
  const lineH = fontSize * 1.55;
  const padX = fontSize * 1.1;
  const padY = fontSize * 0.55;
  const boardH = lineH * 2 + padY * 2;
  const boardW = Math.max(fontSize * 10, fontSize * 12);
  const tip = 11;
  const boardY = groundY - stakeH - boardH;
  const boardX = direction === "left" ? stakeX - boardW + 22 : stakeX - 22;

  // Stake — gradient for slight dimension
  const sg = ctx.createLinearGradient(stakeX - 4, 0, stakeX + 4, 0);
  sg.addColorStop(0, "#182818");
  sg.addColorStop(0.5, "#2a4428");
  sg.addColorStop(1, "#182818");
  ctx.fillStyle = sg;
  ctx.fillRect(stakeX - 4, groundY - stakeH, 8, stakeH);

  // Board glow halo — drawn first, slightly larger
  ctx.shadowColor = "rgba(50,190,130,0.30)";
  ctx.shadowBlur = 14;
  ctx.fillStyle = "#0d1e0d";
  ctx.fillRect(boardX, boardY, boardW, boardH);
  ctx.shadowBlur = 0;

  // Board border
  ctx.strokeStyle = "rgba(60,160,100,0.60)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(boardX, boardY, boardW, boardH);

  // Arrow tip — filled same as board, stroked same as border
  ctx.fillStyle = "#0d1e0d";
  ctx.strokeStyle = "rgba(60,160,100,0.60)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  if (direction === "left") {
    ctx.moveTo(boardX - tip, boardY + boardH / 2);
    ctx.lineTo(boardX + 1, boardY + 1);
    ctx.lineTo(boardX + 1, boardY + boardH - 1);
  } else {
    ctx.moveTo(boardX + boardW + tip, boardY + boardH / 2);
    ctx.lineTo(boardX + boardW - 1, boardY + 1);
    ctx.lineTo(boardX + boardW - 1, boardY + boardH - 1);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  const cx = boardX + boardW / 2;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Top line — Trajan Pro, brighter
  ctx.font = `700 ${fontSize}px 'Trajan Pro', serif`;
  ctx.fillStyle = "rgba(190,240,215,0.92)";
  ctx.fillText(topLine, cx, boardY + padY + lineH * 0.5);

  // Bottom line — Perpetua, muted
  ctx.font = `400 ${Math.round(fontSize * 0.88)}px 'Perpetua', serif`;
  ctx.fillStyle = "rgba(110,185,150,0.78)";
  ctx.fillText(bottomLine, cx, boardY + padY + lineH * 1.5);

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}

function drawSpawnSignposts(
  ctx: CanvasRenderingContext2D,
  w: number,
  groundY: number,
  sign1Img: HTMLImageElement | null = null,
  sign2Img: HTMLImageElement | null = null,
): void {
  const fs = Math.max(16, Math.floor(w * 0.02));
  const spriteH = Math.round(175 * spawnScale(w));

  function drawSignSprite(
    img: HTMLImageElement,
    cx: number,
    titleLines: string[],
    bottomLine: string,
  ): void {
    const drawW =
      Math.round((img.naturalWidth * spriteH) / (img.naturalHeight || 1)) || 52;
    ctx.drawImage(img, cx - drawW / 2, groundY - spriteH, drawW, spriteH);

    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    // Bottom line — Perpetua, muted (direction arrow)
    const gap = Math.round(fs * 0.5);
    const botLineY = groundY - spriteH - gap;
    ctx.font = `400 ${Math.round(fs * 0.88)}px 'Perpetua', serif`;
    ctx.fillStyle = "rgba(120,195,160,0.82)";
    ctx.shadowColor = "rgba(50,180,130,0.35)";
    ctx.shadowBlur = 5;
    ctx.fillText(bottomLine, cx, botLineY);

    // Title lines — Trajan Pro, stacked upward from the bottom line
    const titleFs = Math.round(fs * 0.85);
    const titleGap = Math.round(titleFs * 1.25);
    const baseY = botLineY - Math.round(fs * 1.1); // gap between arrow and bottom title line
    ctx.font = `700 ${titleFs}px 'Trajan Pro', serif`;
    ctx.fillStyle = "rgba(190,240,215,0.95)";
    ctx.shadowColor = "rgba(50,200,140,0.50)";
    ctx.shadowBlur = 8;
    for (let i = 0; i < titleLines.length; i++) {
      // i=0 is top line, i=len-1 is bottom-most title line
      const y = baseY - (titleLines.length - 1 - i) * titleGap;
      ctx.fillText(titleLines[i], cx, y);
    }

    ctx.shadowBlur = 0;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
  }

  if (sign1Img) {
    drawSignSprite(sign1Img, w * 0.14, profile.title.split(" "), "← The Work");
  } else {
    drawSignpost(
      ctx,
      w * 0.14,
      groundY,
      90,
      profile.title,
      "← The Work",
      "left",
      fs,
    );
  }

  if (sign2Img) {
    drawSignSprite(
      sign2Img,
      w * 0.86,
      ["The Diary"],
      "What have I been up to? →",
    );
  } else {
    drawSignpost(
      ctx,
      w * 0.86,
      groundY,
      90,
      "The Diary",
      "What have I been up to? →",
      "right",
      fs,
    );
  }
}

// ─── Phase 1: background fill ─────────────────────────────────────────────────
// Called before parallax layers.

export function drawRoomBackground(
  ctx: CanvasRenderingContext2D,
  roomIndex: number,
  canvasWidth: number,
  canvasHeight: number,
): void {
  ctx.fillStyle = ROOM_TINTS[roomIndex] ?? "#050a0a";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  if (roomIndex === 1) {
    drawSpawnAtmosphere(ctx, canvasWidth, canvasHeight);
  }
}

// ─── Phase 2: ground + props ───────────────────────────────────────────────────
// Called after parallax background layers.

export function drawRoomEnvironment(
  ctx: CanvasRenderingContext2D,
  roomIndex: number,
  canvasWidth: number,
  canvasHeight: number,
  groundY: number,
  lampGlow = 0,
  nameGlow = 0,
  nameLayout?: NameLayout,
  spawnAssets?: SpawnAssets,
): void {
  // Ground plane — left section (0..w*0.28) and right section (w*0.72..end)
  if (roomIndex === 1) {
    const rightX = canvasWidth * 0.72;
    drawGroundSection(
      ctx,
      spawnAssets?.groundImg ?? null,
      0,
      canvasWidth * 0.28,
      groundY,
      canvasHeight,
    );
    drawGroundSection(
      ctx,
      spawnAssets?.groundImg ?? null,
      rightX,
      canvasWidth - rightX,
      groundY,
      canvasHeight,
    );
  } else {
    ctx.fillStyle = "#152e2e";
    ctx.fillRect(0, groundY, canvasWidth, canvasHeight - groundY);
  }

  if (roomIndex === 1) {
    drawSpawnGroundGlow(ctx, canvasWidth, groundY);

    // Central lamp — sits on top of the elevated island (groundY - ISLAND_Y)
    const islandY = groundY - ISLAND_Y;
    drawLampPost(
      ctx,
      getLampX(canvasWidth),
      islandY,
      lampGlow,
      spawnAssets?.poleImg ?? null,
      spawnScale(canvasWidth),
    );

    drawVignette(ctx, canvasWidth, canvasHeight);
    drawSpawnSignposts(
      ctx,
      canvasWidth,
      groundY,
      spawnAssets?.sign1Img ?? null,
      spawnAssets?.sign2Img ?? null,
    );

    // Void label — single line centred in the gap
    const labelFs = Math.max(14, Math.floor(canvasWidth * 0.018));
    ctx.font = `400 ${labelFs}px 'Perpetua', serif`;
    ctx.fillStyle = "rgba(120,190,165,0.65)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(60,200,140,0.55)";
    ctx.shadowBlur = 7;
    ctx.fillText(
      "↓  Fall to know more about Mayank's life",
      canvasWidth / 2,
      groundY - 80,
    );
    ctx.shadowBlur = 0;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";

    const layout = nameLayout ?? getNameLayout(ctx, canvasWidth, canvasHeight);
    drawNamePlatform(ctx, layout, canvasWidth, canvasHeight, nameGlow);
  } else {
    // Basic ground edge for other rooms
    ctx.fillStyle = "rgba(80,200,160,0.10)";
    ctx.fillRect(0, groundY, canvasWidth, 2);
  }

  // Work room — room 0
  if (roomIndex === 0) {
    drawWorkRoom(ctx, canvasWidth, groundY);
  }

  // Timeline rooms — 2 and 3
  if (roomIndex === 2 || roomIndex === 3) {
    drawTimelineRoom(ctx, roomIndex, canvasWidth, groundY);
  }
}

// ─── Spawn bench — drawn after foreground grass so it sits in front ────────────

export function drawSpawnBench(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  groundY: number,
  benchImg: HTMLImageElement | null,
): void {
  drawBench(ctx, canvasWidth * 0.5, groundY, benchImg, spawnScale(canvasWidth));
}
