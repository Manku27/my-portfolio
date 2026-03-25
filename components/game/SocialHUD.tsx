// Social HUD — fixed screen-space element, top-left corner.
// Draws hud_health_frame.png with 7 social icon circles along its arm.
// No world camera offset — always pinned to canvas screen space.

import { profile } from "@/lib/data/index";
import { getImage } from "@/utils/loadAssets";

const HUD_H = 90; // frame sprite draw height in px
const PAD = 10; // top-left inset from canvas edge
const R = 22; // base icon circle radius in px
const ICON_STEP = 52; // px between circle centres — fixed, not tied to frame width
// First icon centre is placed just after the circular "head" of the frame
const ARM_START_X = PAD + HUD_H * 1.22; // ≈120px from left

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

interface HudLayout {
  frameX: number;
  frameY: number;
  frameW: number;
  frameH: number;
  icons: Array<{ cx: number; cy: number }>;
}

// Recomputed each call — cheap Map lookup + arithmetic, safe inside render loop.
function getLayout(): HudLayout {
  const frameImg = getImage("/sprites/hud_health_frame.png");
  const frameH = HUD_H;
  // Frame drawn at its natural aspect ratio — no stretching
  const frameW =
    frameImg && frameImg.naturalWidth > 0
      ? Math.round((frameImg.naturalWidth * frameH) / frameImg.naturalHeight)
      : HUD_H * 2; // rough fallback before image loads

  const frameX = PAD;
  const frameY = PAD;
  const cy = frameY + frameH * 0.5; // vertically centred in frame

  const icons = ICON_SRCS.map((_, i) => ({
    cx: ARM_START_X + i * ICON_STEP,
    cy,
  }));

  return { frameX, frameY, frameW, frameH, icons };
}

// ── Public: hit test ───────────────────────────────────────────────────────────
// Returns icon index (0-6) if mouse is within hit radius, else -1.

export function getSocialHudHit(mouseX: number, mouseY: number): number {
  const { icons } = getLayout();
  for (let i = 0; i < icons.length; i++) {
    if (Math.hypot(mouseX - icons[i].cx, mouseY - icons[i].cy) <= R + 4)
      return i;
  }
  return -1;
}

// ── Public: URL for a hit icon ─────────────────────────────────────────────────

export function getSocialUrl(index: number): string {
  return profile.socials[index]?.url ?? "";
}

// ── Public: draw ──────────────────────────────────────────────────────────────

export function drawSocialHUD(
  ctx: CanvasRenderingContext2D,
  mouseX: number,
  mouseY: number,
): void {
  const { frameX, frameY, frameW, frameH, icons } = getLayout();

  // HUD frame sprite — stretched to cover icon row if needed
  const frameImg = getImage("/sprites/hud_health_frame.png");
  if (frameImg && frameImg.naturalWidth > 0) {
    ctx.drawImage(frameImg, frameX, frameY, frameW, frameH);
  }

  // Icon circles along the arm
  for (let i = 0; i < icons.length; i++) {
    const { cx, cy } = icons[i];
    const hovered = Math.hypot(mouseX - cx, mouseY - cy) <= R + 4;
    const iconImg = getImage(ICON_SRCS[i]);

    // Dark circle background — always R, same for every icon
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = hovered
      ? "rgba(16, 38, 32, 0.92)"
      : "rgba(8, 20, 18, 0.82)";
    ctx.fill();

    // Border ring — always R
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.strokeStyle = hovered
      ? "rgba(120, 240, 200, 0.90)"
      : "rgba(80, 200, 160, 0.55)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Icon — image size scaled per-icon, circle clip always R
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
}
