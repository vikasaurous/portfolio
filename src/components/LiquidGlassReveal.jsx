import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";

// ─── Constants ────────────────────────────────────────────────────────────────

const SESSION_KEY = "lgr_played";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

// Easings — unhurried, confident, organic
const EASE_GLASS   = "power3.inOut";
const EASE_ELEMENT = "power2.out";

/**
 * Animation schedule — all times are absolute seconds from GSAP timeline start.
 *
 * Design principle: restraint. Every number here was chosen because removing
 * it would make the experience feel abrupt, not because it looks impressive.
 *
 * t=0.0  Blur begins reducing (glass gradually clears)
 * t=0.0  Desktop scale begins (1.015 → 1.00, barely perceptible)
 * t=1.1  Overlay fades its final opacity to zero
 * t=0.9  Navbar fades in — appears while glass is still slightly present
 * t=1.05 Dock fades in
 * t=1.2  Icons stagger in
 */
const T = {
  BLUR_DUR:      1.35,  // glass clear — unhurried but not slow
  SCALE_DUR:     1.6,   // desktop settle — so slow it reads as stillness
  FADE_START:    1.1,   // when overlay element itself starts fading
  FADE_DUR:      0.45,  // final opacity sweep
  NAVBAR_DELAY:  0.9,   // navbar appears while glass is still slightly present
  DOCK_DELAY:    1.05,  // dock follows
  ICONS_DELAY:   1.2,   // icons follow
  ICONS_STAGGER: 0.04,  // 40ms per icon — barely noticeable stagger
  WINDOWS_DELAY: 1.1,   // open windows appear with dock
};

// ─── Utilities ────────────────────────────────────────────────────────────────

const hasPlayedThisSession = () => sessionStorage.getItem(SESSION_KEY) === "true";
const markPlayed           = () => sessionStorage.setItem(SESSION_KEY, "true");
const prefersReducedMotion = () => window.matchMedia(REDUCED_MOTION_QUERY).matches;
const isDark               = () => document.documentElement.classList.contains("dark");

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * LiquidGlassReveal
 *
 * The glass overlay (#lgr-pre-overlay) was injected synchronously by index.html
 * before the first paint — this component only animates it away.
 *
 * What was deliberately removed:
 *   - Ambient light sweep: theatrical, distracting, not present in real glass
 *   - Large y-translations on UI elements: visible motion feels designed;
 *     Apple UI elements appear, they don't slide into place
 *   - 1.02 scale: reduced to 1.015 so the "settling" is felt, not seen
 */
const LiquidGlassReveal = ({ children }) => {
  const contentRef  = useRef(null);
  const hasAnimated = useRef(false);

  // ── UI element reveals ────────────────────────────────────────────────────
  const revealUIElements = useCallback((reduced = false) => {
    const dur = reduced ? 0.2 : 0.45;

    const navbar  = document.querySelector("nav");
    const dock    = document.querySelector("#dock");
    const icons   = document.querySelectorAll("#home .folder, #home li");
    const windows = document.querySelectorAll("[data-window]");

    // Opacity-led reveals with minimal translation.
    // The y values are small enough that they read as "appearing" not "moving."
    if (!reduced) {
      if (navbar)       gsap.set(navbar, { opacity: 0, y: -4 });
      if (dock)         gsap.set(dock,   { opacity: 0, y:  8 });
      if (icons.length) gsap.set(icons,  { opacity: 0, y:  4 });
    }

    if (navbar) {
      gsap.to(navbar, {
        opacity: 1, y: 0,
        duration: dur,
        ease: EASE_ELEMENT,
        delay: reduced ? 0 : T.NAVBAR_DELAY,
        clearProps: "all",
      });
    }

    if (dock) {
      gsap.to(dock, {
        opacity: 1, y: 0,
        duration: dur,
        ease: EASE_ELEMENT,
        delay: reduced ? 0 : T.DOCK_DELAY,
        clearProps: "all",
      });
    }

    if (icons.length) {
      gsap.to(icons, {
        opacity: 1, y: 0,
        duration: dur,
        ease: EASE_ELEMENT,
        delay: reduced ? 0 : T.ICONS_DELAY,
        stagger: reduced ? 0 : T.ICONS_STAGGER,
        clearProps: "all",
      });
    }

    // Open windows: opacity only — no translation, no scale
    if (windows.length) {
      gsap.fromTo(windows,
        { opacity: 0 },
        {
          opacity: 1,
          duration: reduced ? 0.2 : 0.4,
          ease: EASE_ELEMENT,
          delay: reduced ? 0 : T.WINDOWS_DELAY,
          clearProps: "opacity",
        }
      );
    }
  }, []);

  // ── Main sequence ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const overlay = document.getElementById("lgr-pre-overlay");
    if (!overlay) return; // session already played — overlay was never injected

    markPlayed();

    const content = contentRef.current;
    const dark    = isDark();
    const reduced = prefersReducedMotion();

    // ── Reduced-motion: single opacity fade ──────────────────────────────────
    if (reduced) {
      gsap.to(overlay, {
        opacity: 0,
        duration: 0.35,
        ease: "power1.out",
        onComplete: () => overlay.remove(),
      });
      revealUIElements(true);
      return;
    }

    // ── Full sequence ─────────────────────────────────────────────────────────

    // Pre-hide UI elements so they reveal naturally as glass clears
    const navbar = document.querySelector("nav");
    const dock   = document.querySelector("#dock");
    const icons  = document.querySelectorAll("#home .folder, #home li");
    if (navbar)       gsap.set(navbar, { opacity: 0 });
    if (dock)         gsap.set(dock,   { opacity: 0 });
    if (icons.length) gsap.set(icons,  { opacity: 0 });

    // Glass proxy — GSAP tweens this plain object, onUpdate writes to the DOM.
    // Direct setProperty avoids CSS custom property parsing inconsistencies.
    const glass = {
      blur:      40,
      brightness: 0.88,
      bgOpacity: dark ? 0.22 : 0.15,
    };

    const applyGlass = () => {
      const bf = `blur(${glass.blur.toFixed(1)}px) brightness(${glass.brightness.toFixed(3)})`;
      overlay.style.backdropFilter       = bf;
      overlay.style.webkitBackdropFilter = bf;
      overlay.style.backgroundColor = dark
        ? `rgba(8,8,14,${glass.bgOpacity.toFixed(3)})`
        : `rgba(248,250,255,${glass.bgOpacity.toFixed(3)})`;
    };

    applyGlass(); // sync proxy → element before animation begins

    const tl = gsap.timeline({ onComplete: () => overlay.remove() });

    // Glass clears: blur 40px → 0, brightness 0.88 → 1, tint fades out
    tl.to(glass, {
      blur:       0,
      brightness: 1,
      bgOpacity:  0,
      duration:   T.BLUR_DUR,
      ease:       EASE_GLASS,
      onUpdate:   applyGlass,
    }, 0);

    // Overlay element itself fades to opacity 0 at the end
    tl.to(overlay, {
      opacity:  0,
      duration: T.FADE_DUR,
      ease:     "power2.inOut",
    }, T.FADE_START);

    // Desktop scale — 1.015 → 1.00.
    // Duration longer than blur so the motion ends after the glass is gone,
    // ensuring it never reads as a zoom — only as the desktop settling.
    if (content) {
      tl.fromTo(content,
        { scale: 1.015, transformOrigin: "center center" },
        { scale: 1, duration: T.SCALE_DUR, ease: EASE_GLASS, clearProps: "transform,scale" },
        0
      );
    }

    // UI elements appear as glass clears
    revealUIElements(false);
  }, [revealUIElements]);

  return (
    <div ref={contentRef} className="lgr-content">
      {children}
    </div>
  );
};

export default LiquidGlassReveal;
