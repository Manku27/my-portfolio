// Ambient background music — triggered on first keypress, fades in over 2s.
// Browser autoplay policy requires a user gesture before audio can play.

const TRACK_SRC = "/audio/HKnight-Greenpath.mp3";
const TARGET_VOLUME = 0.35;
const FADE_DURATION_MS = 2000;

export function initAudio(): () => void {
  const audio = new Audio(TRACK_SRC);
  audio.loop = true;
  audio.volume = 0;
  audio.preload = "auto"; // buffer immediately so play() fires without network delay

  let started = false;
  let rafId = 0;

  function fadeIn() {
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / FADE_DURATION_MS, 1);
      audio.volume = TARGET_VOLUME * progress;
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    }

    rafId = requestAnimationFrame(tick);
  }

  function onFirstKey() {
    if (started) return;
    started = true;
    window.removeEventListener("keydown", onFirstKey);
    audio.play().then(fadeIn).catch(() => {
      // Play rejected (e.g. tab not focused) — silently ignore
    });
  }

  window.addEventListener("keydown", onFirstKey);

  return () => {
    window.removeEventListener("keydown", onFirstKey);
    cancelAnimationFrame(rafId);
    audio.pause();
    audio.src = "";
  };
}
