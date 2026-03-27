// Work room — room 0, single room showing all work history.
// Left → right = oldest → most recent (spawn is to the right).
// Data sourced from lib/data/index.ts — never hardcoded.

import {
  workExperience,
  consultingEngagements,
  projects,
  awards,
} from "@/lib/data/index";
import { getImage } from "@/utils/loadAssets";
import type { WorkExperience } from "@/lib/types";
import {
  workToBubble,
  pavilionToBubble,
  type BubbleContent,
} from "./SpeechBubble";

// workExperience is most-recent-first; reverse for left=oldest layout
const COMPANIES = [...workExperience].reverse();
// [Infosys, PwC, TechMahindra, Merkle]

// Logo sprite paths by company id
const COMPANY_LOGO: Record<string, string> = {
  "merkle-dentsu": "/sprites/work/merkle.webp",
  "tech-mahindra-microsoft": "/sprites/work/Tech_Mahindra.png",
  pwc: "/sprites/work/pwc.png",
  infosys: "/sprites/work/Infosys.webp",
};

// Layout — left to right: Infosys · PwC · [Projects] · TechMahindra · Merkle
const COMPANY_X = [0.14, 0.31, 0.69, 0.86]; // fractions of canvasW
const PROJECTS_X = 0.5; // hanging pavilion

// Island geometry — each company sits on a floating stone island
// NOTE: xFrac values and ISLAND_OFFSET must stay in sync with Bricks.tsx room-0 entries.
const ISLAND_OFFSET = 130; // island top is this many px above groundY
const ISLAND_W_DEF = 220;
const ISLAND_W_CUR = 260; // wider island for current role

// Logo box geometry — white box sitting on the island
const BOX_H_DEF = 110;
const BOX_H_CUR = 130;

// ─── Island platform ──────────────────────────────────────────────────────────

function drawIsland(
  ctx: CanvasRenderingContext2D,
  cx: number,
  groundY: number,
  isCurrent: boolean,
): void {
  const iW = isCurrent ? ISLAND_W_CUR : ISLAND_W_DEF;
  const islandTopY = groundY - ISLAND_OFFSET;
  const iX = cx - iW / 2;

  // Ambient glow beneath island
  const glowR = iW * 0.85;
  const glowCY = islandTopY + 12;
  const glow = ctx.createRadialGradient(cx, glowCY, 0, cx, glowCY, glowR);
  glow.addColorStop(
    0,
    isCurrent ? "rgba(210,165,55,0.13)" : "rgba(55,165,115,0.08)",
  );
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(cx - glowR, glowCY - glowR, glowR * 2, glowR * 2);

  // Platform sprite — same as spawn island (wp_plat_float_01.png)
  const platImg = getImage("/sprites/wp_plat_float_01.png");
  if (platImg && platImg.naturalWidth > 0) {
    const vW = iW;
    const vH = Math.round((platImg.naturalHeight * vW) / platImg.naturalWidth);
    ctx.drawImage(platImg, iX, islandTopY, vW, vH);

    // Dark tapered underbelly below the sprite
    const bellyTop = islandTopY + vH;
    const bellyH = 28;
    ctx.fillStyle = "#0c1910";
    ctx.beginPath();
    ctx.moveTo(iX + 8, bellyTop);
    ctx.lineTo(iX + iW - 8, bellyTop);
    ctx.lineTo(iX + iW - 18, bellyTop + bellyH);
    ctx.lineTo(iX + 18, bellyTop + bellyH);
    ctx.closePath();
    ctx.fill();
  } else {
    // Fallback — colour-only slab matching Bricks.tsx fallback
    ctx.fillStyle = isCurrent ? "#3a2e18" : "#2e1e10";
    ctx.fillRect(iX, islandTopY, iW, 20);
    ctx.fillStyle = isCurrent ? "rgba(210,165,55,0.7)" : "rgba(80,200,150,0.4)";
    ctx.fillRect(iX, islandTopY, iW, 2);
    // Underbelly
    ctx.fillStyle = "#0c1910";
    ctx.beginPath();
    ctx.moveTo(iX + 8, islandTopY + 20);
    ctx.lineTo(iX + iW - 8, islandTopY + 20);
    ctx.lineTo(iX + iW - 18, islandTopY + 48);
    ctx.lineTo(iX + 18, islandTopY + 48);
    ctx.closePath();
    ctx.fill();
  }
}

// ─── Logo box ─────────────────────────────────────────────────────────────────

function drawLogoBox(
  ctx: CanvasRenderingContext2D,
  company: WorkExperience,
  cx: number,
  groundY: number,
): void {
  const isCurrent = !!company.current;
  const iW = isCurrent ? ISLAND_W_CUR : ISLAND_W_DEF;
  const boxW = iW - 16;
  const boxH = isCurrent ? BOX_H_CUR : BOX_H_DEF;
  const islandTopY = groundY - ISLAND_OFFSET;
  const boxY = islandTopY - boxH;
  const boxX = cx - boxW / 2;

  // White box
  ctx.fillStyle = "rgba(250,250,246,0.97)";
  ctx.beginPath();
  ctx.roundRect(boxX, boxY, boxW, boxH, 5);
  ctx.fill();

  // Border — amber for current, subtle for others
  ctx.strokeStyle = isCurrent
    ? "rgba(200,155,45,0.90)"
    : "rgba(130,155,125,0.40)";
  ctx.lineWidth = isCurrent ? 2.5 : 1;
  ctx.stroke();

  // Pulsing amber orb above Merkle box — replaces chimney smoke
  if (isCurrent) {
    const t = Date.now();
    const pulse = 0.7 + 0.3 * Math.sin(t / 600);
    const floatY = boxY - 18 - Math.sin(t / 700) * 5;
    const orbR = 6;

    // Outer glow
    const orbGlow = ctx.createRadialGradient(
      cx,
      floatY,
      0,
      cx,
      floatY,
      orbR * 5,
    );
    orbGlow.addColorStop(0, `rgba(240,185,65,${(pulse * 0.55).toFixed(3)})`);
    orbGlow.addColorStop(0.5, `rgba(220,155,40,${(pulse * 0.22).toFixed(3)})`);
    orbGlow.addColorStop(1, "rgba(200,130,30,0)");
    ctx.fillStyle = orbGlow;
    ctx.beginPath();
    ctx.arc(cx, floatY, orbR * 5, 0, Math.PI * 2);
    ctx.fill();

    // Bright core
    ctx.fillStyle = `rgba(255,220,110,${pulse.toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(cx, floatY, orbR, 0, Math.PI * 2);
    ctx.fill();

    // orb only — no text label
  }

  // Company logo — scaled to fit inside the box
  const logoSrc = COMPANY_LOGO[company.id];
  const logoImg = logoSrc ? getImage(logoSrc) : null;
  if (logoImg && logoImg.naturalWidth > 0) {
    const maxH = boxH - 22;
    const maxW = boxW - 16;
    let logoH = maxH;
    let logoW = Math.round(
      (logoImg.naturalWidth * logoH) / logoImg.naturalHeight,
    );
    if (logoW > maxW) {
      logoW = maxW;
      logoH = Math.round(
        (logoImg.naturalHeight * logoW) / logoImg.naturalWidth,
      );
    }
    ctx.drawImage(logoImg, cx - logoW / 2, boxY + 8, logoW, logoH);
  }

  // Company name — bottom of box in Trajan Pro
  ctx.fillStyle = isCurrent ? "rgba(170,120,35,0.95)" : "rgba(50,70,60,0.85)";
  ctx.font = `700 ${isCurrent ? 14 : 13}px 'Trajan Pro', serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(company.company, cx, boxY + boxH - 8);

  // Period label — floats just above the white box, clear of the island
  ctx.fillStyle = "rgba(160,200,175,0.85)";
  ctx.font = `400 12px 'Perpetua', serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(company.period, cx, boxY - 10);
}

// ─── Hanging pavilion (elev_lift.png + single centre rope) ────────────────────

function drawHangingProjects(
  ctx: CanvasRenderingContext2D,
  cx: number,
  groundY: number,
  canvasWidth: number,
): void {
  const img = getImage("/sprites/work/elev_lift.png");
  const targetH = Math.round(canvasWidth * 0.18);
  let drawW = targetH;
  let drawH = targetH;

  if (img && img.naturalWidth > 0) {
    drawW = Math.round((img.naturalWidth * targetH) / img.naturalHeight);
    drawH = targetH;
  }

  const drawX = cx - drawW / 2;
  const drawY = groundY - drawH; // bottom of sprite rests at groundY

  // Single centre rope — from ceiling anchor to sprite top
  const anchorY = 58;
  const midY = (anchorY + drawY) / 2;
  ctx.strokeStyle = "rgba(150,115,68,0.80)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, anchorY);
  ctx.quadraticCurveTo(cx + 8, midY, cx, drawY);
  ctx.stroke();

  // Nail at ceiling anchor
  ctx.fillStyle = "rgba(120,95,55,0.75)";
  ctx.beginPath();
  ctx.arc(cx, anchorY, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Ambient teal glow around the pavilion
  const glowR = Math.max(drawW, 80);
  const glowCY = groundY - drawH * 0.5;
  const glow = ctx.createRadialGradient(cx, glowCY, 0, cx, glowCY, glowR);
  glow.addColorStop(0, "rgba(30,180,140,0.10)");
  glow.addColorStop(1, "rgba(30,180,140,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, glowCY, glowR, 0, Math.PI * 2);
  ctx.fill();

  // elev_lift sprite
  if (img && img.naturalWidth > 0) {
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  } else {
    // Fallback: simple dome
    const dW = 90,
      dH = 110;
    const dX = cx - dW / 2,
      dY = groundY - dH;
    ctx.fillStyle = "#12242a";
    ctx.fillRect(dX, dY + 20, dW, dH - 20);
    ctx.fillStyle = "#1a3840";
    ctx.beginPath();
    ctx.arc(cx, dY + 20, dW / 2, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = "#2abca0";
    ctx.fillRect(dX - 2, dY + 20, dW + 4, 3);
  }

  // Header label above the sprite
  ctx.fillStyle = "rgba(100,215,175,0.95)";
  ctx.font = `700 13px 'Trajan Pro', serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("Projects", cx, drawY - 28);

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}

// ─── Trigger zones ────────────────────────────────────────────────────────────

export interface WorkTrigger {
  id: string;
  worldX: number;
  roofY: number;
  radius: number;
  content: BubbleContent;
}

export function getWorkTriggers(
  canvasW: number,
  groundY: number,
): WorkTrigger[] {
  const islandTopY = groundY - ISLAND_OFFSET;

  const triggers: WorkTrigger[] = COMPANIES.map((company, i) => {
    const content = workToBubble(company)
    const companyAwards = awards.filter(a => a.issuer === company.company)
    if (companyAwards.length > 0) {
      content.bullets.push('---')
      content.bullets.push(...companyAwards.map(a => `Award: ${a.name}`))
    }
    return {
      id:      company.id,
      worldX:  canvasW * COMPANY_X[i],
      roofY:   islandTopY - (company.current ? BOX_H_CUR : BOX_H_DEF),
      radius:  80,
      content,
    }
  });

  const pavilionH = Math.round(canvasW * 0.18);
  triggers.push({
    id: "pavilion",
    worldX: canvasW * PROJECTS_X,
    roofY: groundY - pavilionH,
    radius: Math.round(canvasW * 0.06),
    content: pavilionToBubble(projects, consultingEngagements),
  });

  return triggers;
}

// ─── Public draw function ─────────────────────────────────────────────────────

export function drawWorkRoom(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  groundY: number,
): void {
  // Hanging pavilion — centred between PwC and TechMahindra
  drawHangingProjects(ctx, canvasWidth * PROJECTS_X, groundY, canvasWidth);

  // Islands + logo boxes for each company (oldest → newest, left → right)
  COMPANIES.forEach((company, i) => {
    const cx = canvasWidth * COMPANY_X[i];
    drawIsland(ctx, cx, groundY, !!company.current);
    drawLogoBox(ctx, company, cx, groundY);
  });
}

// ─── Skill bar — screen-space, upper area, fades when dialogue opens ──────────

const SKILL_SRCS = [
  "/sprites/skills/JavaScript.png",
  "/sprites/skills/Typescript.png",
  "/sprites/skills/React.png",
  "/sprites/skills/Next.png",
  "/sprites/skills/nodejs.jpg",
  "/sprites/skills/contentful.png",
  "/sprites/skills/cloudinary.png",
];

export function drawSkillBar(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  bubbleProgress: number,
): void {
  const alpha = Math.max(0, 1 - bubbleProgress * 12);
  if (alpha <= 0.01) return;

  const iconH = Math.round(canvasH * 0.1);
  const margin = canvasW * 0.22;
  const span = canvasW - margin * 2;
  const step = span / (SKILL_SRCS.length - 1);
  const baseY = 80 + canvasH * 0.2; // centred in upper dialogue area

  ctx.save();
  ctx.globalAlpha = alpha;

  SKILL_SRCS.forEach((src, i) => {
    const img = getImage(src);
    if (!img || img.naturalWidth === 0) return;

    const bob = Math.sin(Date.now() / 650 + i * 0.85) * 9;
    const posX = margin + i * step;
    const posY = baseY + bob;
    const imgW = Math.round((img.naturalWidth * iconH) / img.naturalHeight);

    // Subtle radial glow behind icon
    const grd = ctx.createRadialGradient(
      posX,
      posY,
      0,
      posX,
      posY,
      imgW * 0.65,
    );
    grd.addColorStop(0, "rgba(60,220,170,0.13)");
    grd.addColorStop(1, "rgba(60,220,170,0)");
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(posX, posY, imgW * 0.65, 0, Math.PI * 2);
    ctx.fill();

    ctx.drawImage(img, posX - imgW / 2, posY - iconH / 2, imgW, iconH);
  });

  ctx.restore();
}
