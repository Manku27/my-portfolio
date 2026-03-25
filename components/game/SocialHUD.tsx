// Social HUD — fixed screen-space element, top-left corner.
// Draws hud_health_frame.png with 7 social icon circles along its arm,
// followed by a resume download button with amber/gold styling.
// No world camera offset — always pinned to canvas screen space.

import { profile } from "@/lib/data/index";
import { getImage } from "@/utils/loadAssets";

const HUD_H = 90; // frame sprite draw height in px
const PAD = 10; // top-left inset from canvas edge
const R = 22; // base icon circle radius in px
const ICON_STEP = 52; // px between circle centres — fixed, not tied to frame width
const ARM_START_X = PAD + HUD_H * 1.22; // ≈120px from left
const RESUME_GAP = 18; // extra px gap before resume button separates it visually

// Per-icon image scale — only affects the image drawn inside the circle.
// Circle size, border, and hit area are always R for every icon.
// Order: LinkedIn, GitHub, Gmail, YouTube, Medium, WhatsApp, Discord
const IMG_SCALES: readonly number[] = [1.18, 1.0, 0.55, 1.0, 1.0, 1.0, 1.35];

// Icon paths — same order as profile.socials
const ICON_SRCS: readonly string[] = [
  "/sprites/social_linkedin.webp",
  "/sprites/social_github.png",
  "/sprites/social_gmail.webp",
  "/sprites/social_youtube.png",
  "/sprites/social_medium.webp",
  "/sprites/social_whatsapp.png",
  "/sprites/social_discord.webp",
];

// Resume button is index SOCIAL_COUNT in hit-test results
export const SOCIAL_COUNT = ICON_SRCS.length; // 7 — resume hit returns this index

interface HudLayout {
  frameX: number;
  frameY: number;
  frameW: number;
  frameH: number;
  icons: Array<{ cx: number; cy: number }>;
  resumeCx: number;
  resumeCy: number;
}

// Recomputed each call — cheap Map lookup + arithmetic, safe inside render loop.
function getLayout(): HudLayout {
  const frameImg = getImage("/sprites/hud_health_frame.png");
  const frameH = HUD_H;
  const frameW =
    frameImg && frameImg.naturalWidth > 0
      ? Math.round((frameImg.naturalWidth * frameH) / frameImg.naturalHeight)
      : HUD_H * 2;

  const frameX = PAD;
  const frameY = PAD;
  const cy = frameY + frameH * 0.5;

  const icons = ICON_SRCS.map((_, i) => ({
    cx: ARM_START_X + i * ICON_STEP,
    cy,
  }));

  // Resume button: one step past the last social icon, plus the visual gap
  const resumeCx =
    ARM_START_X + ICON_SRCS.length * ICON_STEP + RESUME_GAP;
  const resumeCy = cy;

  return { frameX, frameY, frameW, frameH, icons, resumeCx, resumeCy };
}

// ── Draw — canvas document/scroll icon ────────────────────────────────────────
function drawDocumentIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  hovered: boolean,
): void {
  const w = R * 0.72;        // doc width
  const h = R * 0.90;        // doc height
  const fold = w * 0.30;     // folded corner size
  const x = cx - w / 2;
  const y = cy - h / 2;

  // Body — white with slight transparency
  ctx.fillStyle = hovered ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.80)";
  ctx.beginPath();
  ctx.moveTo(x, y + h);               // bottom-left
  ctx.lineTo(x, y);                   // top-left
  ctx.lineTo(x + w - fold, y);        // top edge to fold start
  ctx.lineTo(x + w, y + fold);        // diagonal fold
  ctx.lineTo(x + w, y + h);           // bottom-right
  ctx.closePath();
  ctx.fill();

  // Fold triangle — slightly darker to show depth
  ctx.fillStyle = hovered ? "rgba(200,200,200,0.90)" : "rgba(180,180,180,0.75)";
  ctx.beginPath();
  ctx.moveTo(x + w - fold, y);
  ctx.lineTo(x + w - fold, y + fold);
  ctx.lineTo(x + w, y + fold);
  ctx.closePath();
  ctx.fill();

  // Two text lines — amber tint to hint at content
  ctx.fillStyle = "rgba(160,130,50,0.70)";
  const lineH = h * 0.13;
  const lineW = w * 0.55;
  const lineX = x + w * 0.14;
  ctx.fillRect(lineX, y + h * 0.44, lineW, lineH);
  ctx.fillRect(lineX, y + h * 0.62, lineW * 0.75, lineH);
}

// ── Public: hit test ───────────────────────────────────────────────────────────
// Returns 0-6 for social icons, SOCIAL_COUNT (7) for resume button, -1 for miss.

export function getSocialHudHit(mouseX: number, mouseY: number): number {
  const { icons, resumeCx, resumeCy } = getLayout();
  for (let i = 0; i < icons.length; i++) {
    if (Math.hypot(mouseX - icons[i].cx, mouseY - icons[i].cy) <= R + 4)
      return i;
  }
  if (Math.hypot(mouseX - resumeCx, mouseY - resumeCy) <= R + 4)
    return SOCIAL_COUNT;
  return -1;
}

// ── Public: URL for a social icon (not resume) ─────────────────────────────────

export function getSocialUrl(index: number): string {
  return profile.socials[index]?.url ?? "";
}

// ── Public: draw ──────────────────────────────────────────────────────────────

export function drawSocialHUD(
  ctx: CanvasRenderingContext2D,
  mouseX: number,
  mouseY: number,
): void {
  const { frameX, frameY, frameW, frameH, icons, resumeCx, resumeCy } =
    getLayout();

  // HUD frame sprite
  const frameImg = getImage("/sprites/hud_health_frame.png");
  if (frameImg && frameImg.naturalWidth > 0) {
    ctx.drawImage(frameImg, frameX, frameY, frameW, frameH);
  }

  // ── Social icon circles ───────────────────────────────────────────────────
  for (let i = 0; i < icons.length; i++) {
    const { cx, cy } = icons[i];
    const hovered = Math.hypot(mouseX - cx, mouseY - cy) <= R + 4;
    const iconImg = getImage(ICON_SRCS[i]);

    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = hovered
      ? "rgba(16, 38, 32, 0.92)"
      : "rgba(8, 20, 18, 0.82)";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.strokeStyle = hovered
      ? "rgba(120, 240, 200, 0.90)"
      : "rgba(80, 200, 160, 0.55)";
    ctx.lineWidth = 2;
    ctx.stroke();

    if (iconImg && iconImg.naturalWidth > 0) {
      const imgScale = IMG_SCALES[i] ?? 1.0;
      const iconSize = R * 2 * 0.82 * imgScale;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R - 1, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(
        iconImg,
        cx - iconSize / 2,
        cy - iconSize / 2,
        iconSize,
        iconSize,
      );
      ctx.restore();
    }
  }

  // ── Resume download button ────────────────────────────────────────────────
  const resumeHovered =
    Math.hypot(mouseX - resumeCx, mouseY - resumeCy) <= R + 4;

  // Circle background
  ctx.beginPath();
  ctx.arc(resumeCx, resumeCy, R, 0, Math.PI * 2);
  ctx.fillStyle = resumeHovered
    ? "rgba(20, 18, 8, 0.95)"
    : "rgba(8, 20, 18, 0.82)";
  ctx.fill();

  // Amber/gold border — distinguishes resume from social icons
  ctx.beginPath();
  ctx.arc(resumeCx, resumeCy, R, 0, Math.PI * 2);
  ctx.strokeStyle = resumeHovered
    ? "rgba(240, 210, 100, 0.95)"
    : "rgba(180, 160, 80, 0.70)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Document icon drawn in canvas
  drawDocumentIcon(ctx, resumeCx, resumeCy, resumeHovered);
}
