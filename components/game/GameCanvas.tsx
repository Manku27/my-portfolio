"use client";
import { useEffect, useRef } from "react";
import { drawCharacter, CHARACTER_W, CHARACTER_H } from "./Character";
import {
  KNIGHT_SPRITE_PATH,
  ANIM_CONFIG,
  type AnimationState,
  type SpriteFrame,
} from "@/lib/sprites/knight-frames";
import {
  drawRoomBackground,
  drawRoomEnvironment,
  drawSpawnBench,
  getNameLayout,
  getLampX,
  lampBulbY,
  type SpawnAssets,
} from "./Room";
import {
  drawAboutSection,
  getAboutPlatforms,
  ABOUT_SECTION_COUNT,
  RETURN_SECTION,
} from "./AboutRoom";
import { getWorkTriggers, drawSkillBar, type WorkTrigger } from "./WorkRoom";
import { getTimelineTriggers, type TimelineTrigger } from "./TimelineRoom";
import {
  drawSpeechBubble,
  getLastBubbleBtnRects,
  type BubbleContent,
} from "./SpeechBubble";
import {
  drawParallaxBackground,
  drawParallaxForeground,
  type GrassImages,
} from "./ParallaxLayer";
import { lerp } from "@/utils/lerp";
import { loadImage } from "@/utils/loadAssets";
import { initAudio } from "@/utils/audio";
import { createParticles, drawParticles } from "./Particles";
import {
  initBricks,
  updateBricks,
  checkBrickCollisions,
  drawBricks,
  getIslandY,
} from "./Bricks";
import {
  drawCharmMenu,
  CHARM_COUNT,
  getCharmAtPoint,
  getCharmId,
} from "./CharmMenu";
import {
  drawSocialHUD,
  getSocialHudHit,
  getSocialUrl,
  SOCIAL_COUNT,
} from "./SocialHUD";

const SPEED = 340; // px/s horizontal
const GRAVITY = 1800; // px/s²
const JUMP_VEL = 920; // px/s upward
// Ground sits at 88% of canvas height — scales with screen size
const GROUND_Y_FAC = 0.88;
const ROOM_COUNT = 4; // 0=work, 1=spawn, 2=timeline, 3=timeline (older)
const SPAWN_ROOM = 1;

const LAMP_HOVER_RADIUS = 70; // px — distance at which lamp starts glowing

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth || 1280;
      canvas.height = window.innerHeight || 720;
    };
    resize();
    window.addEventListener("resize", resize);

    // Mouse state
    let mouseX = -9999;
    let mouseY = -9999;
    let hudHovered = -1; // index of hovered social icon, -1 = none

    const hitRect = (
      r: { x: number; y: number; w: number; h: number },
      x: number,
      y: number,
    ) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;

    const onMouseMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouseX = (e.clientX - r.left) * (canvas.width / (r.width || 1));
      mouseY = (e.clientY - r.top) * (canvas.height / (r.height || 1));
      if (charmOpen) {
        const hit = getCharmAtPoint(
          mouseX,
          mouseY,
          canvas.width,
          canvas.height,
        );
        if (hit !== -1) charmSelected = hit;
      }
      hudHovered = getSocialHudHit(mouseX, mouseY);
      const btnsHover = getLastBubbleBtnRects();
      const overBtn = btnsHover
        ? hitRect(btnsHover.up, mouseX, mouseY) ||
          hitRect(btnsHover.down, mouseX, mouseY)
        : false;
      canvas.style.cursor =
        hudHovered !== -1 || overBtn ? "pointer" : "default";
    };

    const canvasCoords = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      const scaleX = canvas.width / (r.width || 1);
      const scaleY = canvas.height / (r.height || 1);
      return {
        cx: (e.clientX - r.left) * scaleX,
        cy: (e.clientY - r.top) * scaleY,
      };
    };

    const onMouseClick = (e: MouseEvent) => {
      // Dialogue pagination buttons — check before anything else
      if (bubbleProgress > 0.5) {
        const btns = getLastBubbleBtnRects();
        if (btns) {
          const { cx, cy } = canvasCoords(e);
          if (hitRect(btns.up, cx, cy)) {
            bubblePage = Math.max(0, bubblePage - 1);
            return;
          }
          if (hitRect(btns.down, cx, cy)) {
            bubblePage += 1;
            return;
          }
        }
      }

      // Social HUD icon click — always active, takes priority
      const hudHit = getSocialHudHit(e.clientX, e.clientY);
      if (hudHit !== -1) {
        if (hudHit === SOCIAL_COUNT) {
          // Resume download
          const a = document.createElement("a");
          a.href = "/resume.pdf";
          a.download = "Mayank_Jhunjhunwala_Resume.pdf";
          a.click();
        } else {
          const url = getSocialUrl(hudHit);
          if (url) window.open(url, "_blank", "noopener,noreferrer");
        }
        return;
      }
      if (!charmOpen) return;
      const hit = getCharmAtPoint(
        e.clientX,
        e.clientY,
        canvas.width,
        canvas.height,
      );
      if (hit !== -1) {
        charmSelected = hit;
        window.location.hash = getCharmId(hit);
      }
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("click", onMouseClick);

    // Sprite sheet — load once, fall back to white rect until ready
    let spriteSheet: HTMLImageElement | null = null;
    const knightImg = new Image();
    knightImg.onload = () => {
      spriteSheet = knightImg;
    };
    knightImg.src = KNIGHT_SPRITE_PATH;

    // Spawn room assets — loaded in preloadFonts before first frame
    let spawnAssets: SpawnAssets = {
      groundImg: null,
      poleImg: null,
      sign1Img: null,
      sign2Img: null,
      benchImg: null,
    };
    let grassImgs: GrassImages = { a: null, b: null, c: null };
    let platImg: HTMLImageElement | null = null;

    // Animation state
    let animState: AnimationState = "idle";
    let animFrame = 0;
    let animTimer = 0;
    let facingLeft = false;
    let wasGrounded = true;
    let landTimer = 0;
    const LAND_HOLD = 2 / 8; // hold land pose for 2 frames at 8 fps

    // Ambient particles — created once, drifted via time each frame
    const particles = createParticles();

    // Bricks — interactive world objects
    const bricks = initBricks();

    // Lamp glow (0=resting, 1=fully hovered)
    let lampGlow = 0;

    // Name platform glow (0=off, 1=fully lit) — driven by character standing on it
    let nameGlow = 0;

    // Speech bubble state
    let bubbleProgress = 0;
    let bubblePage = 0;
    let activeBubbleId: string | null = null;
    let bubbleContent: BubbleContent | null = null;

    // Vertical world (About Me) state
    let worldMode = "horizontal" as "horizontal" | "vertical";
    let charWorldY = 0; // world-space Y in vertical mode
    let charVX = 0; // world-space X in vertical mode (canvas-local, 0..canvasW)
    let currentSection = 0;

    // Charm menu state
    let charmOpen = false;
    let charmProgress = 0; // 0=closed, 1=fully open (animated)
    let charmSelected = 0; // 0-5

    // Controls hint state
    let hintsVisible = true;
    let hintsOpacity = 0.72;
    let hintsTimer = 0; // seconds since first keypress
    let hintsStarted = false; // true once first keypress registered

    // Keys
    const keys = new Set<string>();
    const onKeyDown = (e: KeyboardEvent) => {
      if (!hintsStarted) hintsStarted = true;
      if (e.code === "Tab") {
        e.preventDefault();
        charmOpen = !charmOpen;
        return;
      }
      if (e.code === "Escape" && charmOpen) {
        charmOpen = false;
        return;
      }
      if (charmOpen) {
        if (e.code === "ArrowLeft")
          charmSelected = Math.max(0, charmSelected - 1);
        if (e.code === "ArrowRight")
          charmSelected = Math.min(CHARM_COUNT - 1, charmSelected + 1);
        if (e.code === "ArrowUp")
          charmSelected = Math.max(0, charmSelected - 3);
        if (e.code === "ArrowDown")
          charmSelected = Math.min(CHARM_COUNT - 1, charmSelected + 3);
        if (e.code === "Enter")
          window.location.hash = getCharmId(charmSelected);
        return; // block all other keys when menu is open
      }

      // Dialogue page navigation
      if (bubbleContent && bubbleProgress > 0.9) {
        if (e.code === "Enter") {
          e.preventDefault();
          bubblePage += 1;
          return;
        }
        if (e.code === "Backspace") {
          e.preventDefault();
          bubblePage = Math.max(0, bubblePage - 1);
          return;
        }
      }

      keys.add(e.code);
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
        // Return from About Me world when standing on the last platform
        if (
          worldMode === "vertical" &&
          currentSection === RETURN_SECTION &&
          isGrounded
        ) {
          worldMode = "horizontal";
          charX =
            SPAWN_ROOM * canvas.width + canvas.width * 0.14 - CHARACTER_W / 2;
          charY = groundY() - CHARACTER_H;
          velY = -JUMP_VEL * 0.45;
          isGrounded = false;
          jumpsLeft = 1;
          return;
        }
        if (jumpsLeft > 0) {
          velY = -JUMP_VEL;
          isGrounded = false;
          jumpsLeft--;
        }
      }
    };
    const onKeyUp = (e: KeyboardEvent) => keys.delete(e.code);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    const groundY = () => Math.round(canvas.height * GROUND_Y_FAC);

    let charX = SPAWN_ROOM * canvas.width + canvas.width / 2 - CHARACTER_W / 2;
    let charY = groundY() - getIslandY(canvas.height) - CHARACTER_H;
    let velY = 0;
    let isGrounded = true;
    let jumpsLeft = 2;
    let currentRoom = SPAWN_ROOM;

    let rafId = 0;
    let lastTimestamp = 0;

    const loop = (timestamp: number) => {
      const delta = Math.min((timestamp - lastTimestamp) / 1000, 0.05);
      lastTimestamp = timestamp;

      // Animate charm menu open/close
      charmProgress = lerp(
        charmProgress,
        charmOpen ? 1 : 0,
        Math.min(1, delta * 10),
      );

      const ground = groundY();
      // Keep spawn island brick collision in sync with canvas height
      bricks[0].yFromGround = getIslandY(canvas.height);

      if (worldMode === "horizontal") {
        // ── Horizontal movement ─────────────────────────────────────────────
        if (!charmOpen) {
          if (keys.has("ArrowLeft") || keys.has("KeyA")) charX -= SPEED * delta;
          if (keys.has("ArrowRight") || keys.has("KeyD"))
            charX += SPEED * delta;
        }
        charX = Math.max(
          0,
          Math.min(ROOM_COUNT * canvas.width - CHARACTER_W, charX),
        );

        // Room snap
        currentRoom = Math.max(
          0,
          Math.min(ROOM_COUNT - 1, Math.floor(charX / canvas.width)),
        );

        // Gravity + position
        velY += GRAVITY * delta;
        charY += velY * delta;

        // Brick collision
        const brickResult = checkBrickCollisions(
          bricks,
          charX,
          charY,
          velY,
          CHARACTER_W,
          CHARACTER_H,
          ground,
          canvas.width,
        );
        velY = brickResult.newVelY;
        charY = brickResult.newCharY;
        if (brickResult.landed) {
          isGrounded = true;
          jumpsLeft = 2;
        }
        updateBricks(bricks, delta);

        // Name platform collision
        const np =
          currentRoom === 1
            ? getNameLayout(ctx, canvas.width, canvas.height)
            : undefined;
        if (np && velY > 0) {
          const npWorldX = SPAWN_ROOM * canvas.width + np.platformX;
          const hOverlap =
            charX + CHARACTER_W > npWorldX && charX < npWorldX + np.platformW;
          if (hOverlap) {
            const feet = charY + CHARACTER_H;
            if (feet >= np.platformY && feet < np.platformY + 20) {
              velY = 0;
              charY = np.platformY - CHARACTER_H;
              isGrounded = true;
              jumpsLeft = 2;
            }
          }
        }

        // Gap detection — void is the middle area (0.28..0.72); ground exists only at edges
        const spawnBase = SPAWN_ROOM * canvas.width;
        const localMidX = charX + CHARACTER_W / 2 - spawnBase;
        const overGap =
          currentRoom === 1 &&
          localMidX > canvas.width * 0.28 &&
          localMidX < canvas.width * 0.72;

        if (!overGap && charY + CHARACTER_H >= ground) {
          charY = ground - CHARACTER_H;
          velY = 0;
          isGrounded = true;
          jumpsLeft = 2;
        } else if (overGap && charY + CHARACTER_H >= ground) {
          // Fell through side gap — enter the About Me vertical world
          worldMode = "vertical";
          charVX = canvas.width / 2 - CHARACTER_W / 2;
          charWorldY = 0;
          currentSection = 0;
          velY = 120;
          isGrounded = false;
          jumpsLeft = 1;
        }

        // Name glow
        let nameGlowTarget = 0;
        if (np && isGrounded && velY === 0) {
          const npWorldX = SPAWN_ROOM * canvas.width + np.platformX;
          const hOverlap =
            charX + CHARACTER_W > npWorldX && charX < npWorldX + np.platformW;
          if (hOverlap && Math.abs(charY + CHARACTER_H - np.platformY) < 6)
            nameGlowTarget = 1;
        }
        nameGlow = lerp(nameGlow, nameGlowTarget, 0.08);

        // Lamp glow
        if (currentRoom === 1) {
          const dist = Math.hypot(
            mouseX - getLampX(canvas.width, canvas.height),
            mouseY - lampBulbY(ground - getIslandY(canvas.height), canvas.width, canvas.height),
          );
          lampGlow = lerp(
            lampGlow,
            Math.max(0, 1 - dist / LAMP_HOVER_RADIUS),
            0.1,
          );
        } else {
          lampGlow = lerp(lampGlow, 0, 0.1);
        }

        // Speech bubble — proximity triggers
        if (currentRoom === 0) {
          const triggers = getWorkTriggers(canvas.width, ground);
          let hit: WorkTrigger | null = null;
          for (const t of triggers) {
            if (Math.abs(charX + CHARACTER_W / 2 - t.worldX) < t.radius) {
              hit = t;
              break;
            }
          }
          if (hit) {
            if (hit.id !== activeBubbleId) {
              bubblePage = 0;
              activeBubbleId = hit.id;
            }
            bubbleContent = hit.content;
            bubbleProgress = Math.min(1, bubbleProgress + delta * 1.8);
          } else {
            bubbleProgress = Math.max(0, bubbleProgress - delta * 2.5);
            if (bubbleProgress <= 0) {
              bubblePage = 0;
              activeBubbleId = null;
              bubbleContent = null;
            }
          }
        } else if (currentRoom >= 2) {
          const triggers = getTimelineTriggers(canvas.width, ground);
          let hit: TimelineTrigger | null = null;
          for (const t of triggers) {
            if (Math.abs(charX + CHARACTER_W / 2 - t.worldX) < t.radius) {
              hit = t;
              break;
            }
          }
          if (hit) {
            if (hit.id !== activeBubbleId) {
              bubblePage = 0;
              activeBubbleId = hit.id;
            }
            bubbleContent = hit.content;
            bubbleProgress = Math.min(1, bubbleProgress + delta * 1.8);
          } else {
            bubbleProgress = Math.max(0, bubbleProgress - delta * 2.5);
            if (bubbleProgress <= 0) {
              bubblePage = 0;
              activeBubbleId = null;
              bubbleContent = null;
            }
          }
        } else {
          bubbleProgress = Math.max(0, bubbleProgress - delta * 2.5);
          if (bubbleProgress <= 0) {
            bubblePage = 0;
            activeBubbleId = null;
            bubbleContent = null;
          }
        }
      } else {
        // ── Vertical world (About Me) ────────────────────────────────────────
        if (!charmOpen) {
          if (keys.has("ArrowLeft") || keys.has("KeyA"))
            charVX -= SPEED * delta;
          if (keys.has("ArrowRight") || keys.has("KeyD"))
            charVX += SPEED * delta;
        }
        charVX = Math.max(0, Math.min(canvas.width - CHARACTER_W, charVX));

        velY += GRAVITY * delta;
        charWorldY += velY * delta;

        // Ceiling — can't go above the top of the world
        if (charWorldY < 0) {
          charWorldY = 0;
          velY = Math.max(0, velY);
        }

        // Section snap
        currentSection = Math.max(
          0,
          Math.min(
            ABOUT_SECTION_COUNT - 1,
            Math.floor(charWorldY / canvas.height),
          ),
        );

        // Platform collision
        const sectionTopY = currentSection * canvas.height;
        const localY = charWorldY - sectionTopY;
        const platforms = getAboutPlatforms(
          currentSection,
          canvas.width,
          canvas.height,
        );
        isGrounded = false;
        for (const plat of platforms) {
          if (velY > 0) {
            const feet = localY + CHARACTER_H;
            if (feet >= plat.y && feet < plat.y + 20) {
              const inX =
                charVX + CHARACTER_W > plat.x && charVX < plat.x + plat.w;
              if (inX) {
                velY = 0;
                charWorldY = sectionTopY + plat.y - CHARACTER_H;
                isGrounded = true;
                jumpsLeft = 2;
              }
            }
          }
        }
      }

      // ── Animation state ────────────────────────────────────────────────
      const movingLeft =
        !charmOpen && (keys.has("ArrowLeft") || keys.has("KeyA"));
      const movingRight =
        !charmOpen && (keys.has("ArrowRight") || keys.has("KeyD"));
      const moving = movingLeft || movingRight;
      if (movingLeft) facingLeft = true;
      if (movingRight) facingLeft = false;

      const justLanded = !wasGrounded && isGrounded;
      wasGrounded = isGrounded;

      if (!isGrounded) {
        if (animState !== "jump") {
          animState = "jump";
          animFrame = 0;
          animTimer = 0;
        }
      } else if (justLanded) {
        animState = "land";
        animFrame = 0;
        animTimer = 0;
        landTimer = LAND_HOLD;
      } else if (animState === "land") {
        landTimer -= delta;
        if (landTimer <= 0) {
          animState = moving ? "walk" : "idle";
          animFrame = 0;
          animTimer = 0;
        }
      } else {
        const target: AnimationState = moving ? "walk" : "idle";
        if (target !== animState) {
          animState = target;
          animFrame = 0;
          animTimer = 0;
        }
      }

      animTimer += delta;
      const animCfg = ANIM_CONFIG[animState];
      const frameDur = 1 / animCfg.fps;
      while (animTimer >= frameDur) {
        animTimer -= frameDur;
        if (animFrame < animCfg.frames.length - 1) {
          animFrame++;
        } else if (animCfg.loop) {
          animFrame = 0;
        }
        // else hold last frame (falling, land pose)
      }
      const currentFrame: SpriteFrame = animCfg.frames[animFrame];

      // time in seconds for particle drift
      const time = timestamp / 1000;

      // ── Draw ──────────────────────────────────────────────────────────────
      if (worldMode === "horizontal") {
        const cameraX = currentRoom * canvas.width;
        const screenX = charX - cameraX;
        drawRoomBackground(ctx, currentRoom, canvas.width, canvas.height);
        drawParallaxBackground(ctx, charX, canvas.width, canvas.height, ground);
        drawRoomEnvironment(
          ctx,
          currentRoom,
          canvas.width,
          canvas.height,
          ground,
          lampGlow,
          nameGlow,
          currentRoom === 1
            ? getNameLayout(ctx, canvas.width, canvas.height)
            : undefined,
          currentRoom === 1 ? spawnAssets : undefined,
        );
        drawBricks(ctx, bricks, cameraX, ground, canvas.width, platImg, canvas.height);
        if (currentRoom === 1)
          drawParticles(ctx, particles, canvas.width, canvas.height, time);
        if (currentRoom === 1) {
          // Clip grass to the two ground sections — no grass over the void
          ctx.save();
          ctx.beginPath();
          ctx.rect(0, 0, canvas.width * 0.28, canvas.height);
          ctx.rect(canvas.width * 0.72, 0, canvas.width * 0.28, canvas.height);
          ctx.clip();
          drawParallaxForeground(ctx, canvas.width, ground, time, grassImgs);
          ctx.restore();
        } else {
          drawParallaxForeground(ctx, canvas.width, ground, time, grassImgs);
        }
        if (currentRoom === 1)
          drawSpawnBench(
            ctx,
            canvas.width,
            canvas.height,
            ground - getIslandY(canvas.height),
            spawnAssets.benchImg,
          );
        drawCharacter(
          ctx,
          screenX,
          charY,
          spriteSheet,
          currentFrame,
          facingLeft,
        );
      } else {
        const sectionTopY = currentSection * canvas.height;
        const vertScreenY = charWorldY - sectionTopY;
        drawAboutSection(ctx, currentSection, canvas.width, canvas.height);
        drawCharacter(
          ctx,
          charVX,
          vertScreenY,
          spriteSheet,
          currentFrame,
          facingLeft,
        );
      }

      // Speech bubble — drawn above world, below charm menu
      if (bubbleContent && bubbleProgress > 0.01) {
        drawSpeechBubble(
          ctx,
          bubbleContent,
          bubbleProgress,
          canvas.width,
          canvas.height,
          bubblePage,
        );
      }

      // Charm menu
      if (charmProgress > 0.01) {
        drawCharmMenu(
          ctx,
          canvas.width,
          canvas.height,
          charmProgress,
          charmSelected,
        );
      }

      // Skill bar — work world only, fades when dialogue opens
      if (currentRoom === 0) {
        drawSkillBar(ctx, canvas.width, canvas.height, bubbleProgress);
      }

      // Social HUD — always on top, fixed screen-space, no world offset
      drawSocialHUD(ctx, mouseX, mouseY, currentRoom);

      // Controls hint — screen-space, fades out 8s after first keypress
      if (hintsVisible) {
        if (hintsStarted) {
          hintsTimer += delta;
          if (hintsTimer >= 8) {
            hintsOpacity = Math.max(0, hintsOpacity - delta / 2);
            if (hintsOpacity <= 0) hintsVisible = false;
          }
        }
        if (hintsVisible) {
          const cx = canvas.width / 2;
          const uiSc = Math.min(1.4, Math.max(0.85, canvas.width / 1400));
          const r2y = canvas.height - Math.round(32 * uiSc);
          const r1y = r2y - Math.round(24 * uiSc);
          ctx.font = `400 15px 'Perpetua', serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "bottom";
          ctx.fillStyle = `rgba(140,200,180,${hintsOpacity})`;
          ctx.fillText(
            "← → to move     ↑ / Space to jump     double jump supported",
            cx,
            r1y,
          );
          ctx.fillText("Tab  to open charm menu", cx, r2y);
          ctx.textAlign = "left";
          ctx.textBaseline = "alphabetic";
        }
      }

      rafId = requestAnimationFrame(loop);
    };

    // Preload all four game fonts via FontFace API before the first frame.
    // CSS @font-face alone doesn't guarantee fonts appear in document.fonts in time.
    const preloadFonts = async () => {
      const fontDefs = [
        { family: "Trajan Pro", url: "/fonts/Trajan-Pro.otf", weight: "400" },
        {
          family: "Trajan Pro",
          url: "/fonts/Trajan-Pro-Bold.otf",
          weight: "700",
        },
        {
          family: "Perpetua",
          url: "/fonts/Perpetua-Regular.woff2",
          weight: "400",
        },
        {
          family: "Perpetua",
          url: "/fonts/Perpetua-Bold.woff2",
          weight: "700",
        },
      ];

      const assetSrcs: Array<[string, (img: HTMLImageElement) => void]> = [
        [
          "/sprites/town_floor_01.png",
          (img) => {
            spawnAssets = { ...spawnAssets, groundImg: img };
          },
        ],
        [
          "/sprites/station_pole.png",
          (img) => {
            spawnAssets = { ...spawnAssets, poleImg: img };
          },
        ],
        [
          "/sprites/sign_post_01.png",
          (img) => {
            spawnAssets = { ...spawnAssets, sign1Img: img };
          },
        ],
        [
          "/sprites/sign_post_02.png",
          (img) => {
            spawnAssets = { ...spawnAssets, sign2Img: img };
          },
        ],
        [
          "/sprites/town_bench.png",
          (img) => {
            spawnAssets = { ...spawnAssets, benchImg: img };
          },
        ],
        [
          "/sprites/grass_01_idle0000.png",
          (img) => {
            grassImgs = { ...grassImgs, a: img };
          },
        ],
        [
          "/sprites/grass_03_idle0015.png",
          (img) => {
            grassImgs = { ...grassImgs, b: img };
          },
        ],
        [
          "/sprites/simple_grass0007.png",
          (img) => {
            grassImgs = { ...grassImgs, c: img };
          },
        ],
        [
          "/sprites/wp_plat_float_01.png",
          (img) => {
            platImg = img;
          },
        ],
        // Dialogue decorations — no local variable needed; getImage() reads the cache
        ["/sprites/Controller_Dialogue_0000_top.png", () => {}],
        ["/sprites/Controller_Dialogue_0001_bot.png", () => {}],
        // Social HUD
        ["/sprites/hud_health_frame.png", () => {}],
        ["/sprites/social_linkedin.webp", () => {}],
        ["/sprites/social_github.png", () => {}],
        ["/sprites/social_gmail.webp", () => {}],
        ["/sprites/social_youtube.png", () => {}],
        ["/sprites/social_medium.webp", () => {}],
        ["/sprites/social_whatsapp.png", () => {}],
        ["/sprites/social_discord.webp", () => {}],
        // Work world logos
        ["/sprites/work/merkle.webp", () => {}],
        ["/sprites/work/Tech_Mahindra.png", () => {}],
        ["/sprites/work/pwc.png", () => {}],
        ["/sprites/work/Infosys.webp", () => {}],
        ["/sprites/work/elev_lift.png", () => {}],
        // Charm menu icons
        ['/sprites/charms/Home_charm.png',      () => {}],
        ['/sprites/charms/Work_charm.png',      () => {}],
        ['/sprites/charms/Timeline__charm.png', () => {}],
        ['/sprites/charms/About_charm.png',     () => {}],
        // Skill bar icons
        ["/sprites/skills/JavaScript.png", () => {}],
        ["/sprites/skills/Typescript.png", () => {}],
        ["/sprites/skills/React.png", () => {}],
        ["/sprites/skills/Next.png", () => {}],
        ["/sprites/skills/nodejs.jpg",        () => {}],
        ["/sprites/skills/contentful.png",    () => {}],
        ["/sprites/skills/cloudinary.png",    () => {}],
      ];

      await Promise.all([
        ...fontDefs.map(async ({ family, url, weight }) => {
          try {
            const face = new FontFace(family, `url(${url})`, {
              weight,
              style: "normal",
            });
            await face.load();
            document.fonts.add(face);
          } catch {
            if (process.env.NODE_ENV === "development") {
              console.warn(
                `[Game] Font failed to load: ${family} weight ${weight} — ${url}`,
              );
            }
          }
        }),
        ...assetSrcs.map(async ([src, setter]) => {
          try {
            setter(await loadImage(src));
          } catch {
            if (process.env.NODE_ENV === "development") {
              console.warn(`[Game] Asset failed to load: ${src}`);
            }
          }
        }),
      ]);
      await document.fonts.ready;
      rafId = requestAnimationFrame(loop);
    };
    // Charm routing — handle hash navigation from charm menu
    const navigateToCharm = (id: string) => {
      charmOpen = false;
      const gnd = groundY();

      if (id === "home") {
        worldMode = "horizontal";
        charX = SPAWN_ROOM * canvas.width + canvas.width / 2 - CHARACTER_W / 2;
        charY = -CHARACTER_H * 3;
        velY = 0;
        isGrounded = false;
        jumpsLeft = 1;
      } else if (id === "work") {
        worldMode = "horizontal";
        charX = 0 * canvas.width + canvas.width * 0.5 - CHARACTER_W / 2;
        charY = -CHARACTER_H * 3;
        velY = 0;
        isGrounded = false;
        jumpsLeft = 1;
      } else if (id === "timeline") {
        worldMode = "horizontal";
        charX = 2 * canvas.width + canvas.width * 0.5 - CHARACTER_W / 2;
        charY = -CHARACTER_H * 3;
        velY = 0;
        isGrounded = false;
        jumpsLeft = 1;
      } else if (id === "about") {
        worldMode = "vertical";
        charVX = canvas.width / 2 - CHARACTER_W / 2;
        charWorldY = 0;
        currentSection = 0;
        velY = 120;
        isGrounded = false;
        jumpsLeft = 1;
      }
      // books, movies, writing, games — worlds not yet built, no-op for now
    };

    const onHashChange = () => {
      const id = window.location.hash.slice(1);
      if (id) navigateToCharm(id);
    };
    window.addEventListener("hashchange", onHashChange);

    // Navigate on initial hash if present (e.g. direct link)
    if (window.location.hash) navigateToCharm(window.location.hash.slice(1));

    preloadFonts();

    const cleanupAudio = initAudio();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("click", onMouseClick);
      window.removeEventListener("hashchange", onHashChange);
      cleanupAudio();
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full" />;
}
