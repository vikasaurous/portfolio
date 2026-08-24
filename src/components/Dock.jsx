import { Tooltip } from "react-tooltip";
import { dockApps } from "#constants";
import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import useWindowStore from "#store/window";

// ─── SVG glass distortion filter ─────────────────────────────────────────────
//
// Isolated entirely inside this component — the filter ID is scoped so it can
// NEVER bleed outside the Dock area.
//
// Design intent: extremely subtle optical distortion that reads as "thick glass"
// rather than a glitch/warp effect. Tuning notes:
//
//   feTurbulence baseFrequency — lower = coarser waves (0.008–0.015 range)
//   feDisplacementMap scale   — higher = more distortion (keep ≤ 4 for subtlety)
//   feGaussianBlur std dev    — smooths the turbulence noise
//
// If this causes any visual artifacts or GPU pressure on target hardware,
// remove the filter="url(#dock-glass-filter)" from .dock-container-inner
// and the glass still looks great via CSS alone.

const DOCK_FILTER_ID = "dock-glass-distortion-v1";

const DockGlassFilter = () => (
  <svg
    aria-hidden="true"
    style={{ position: "absolute", width: 0, height: 0, overflow: "hidden", pointerEvents: "none" }}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <filter
        id={DOCK_FILTER_ID}
        x="-5%"
        y="-5%"
        width="110%"
        height="110%"
        colorInterpolationFilters="sRGB"
      >
        {/* Base noise — very low frequency for subtle wave */}
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.009 0.006"
          numOctaves="3"
          seed="42"
          result="noise"
        />
        {/* Smooth the noise to avoid high-frequency grain */}
        <feGaussianBlur in="noise" stdDeviation="0.8" result="smoothNoise" />
        {/*
          Displacement — scale kept very low (≤ 3px effective).
          xChannelSelector R, yChannelSelector G mimics the reference component.
        */}
        <feDisplacementMap
          in="SourceGraphic"
          in2="smoothNoise"
          scale="3"
          xChannelSelector="R"
          yChannelSelector="G"
          result="displaced"
        />
        {/*
          Specular lighting pass — adds the "wet glass" highlight.
          surfaceScale and specularConstant are deliberately low.
        */}
        <feSpecularLighting
          in="smoothNoise"
          surfaceScale="1.5"
          specularConstant="0.4"
          specularExponent="12"
          lightingColor="rgba(255,255,255,0.5)"
          result="specLight"
        >
          <fePointLight x="50%" y="-20%" z="200" />
        </feSpecularLighting>
        {/* Blend specular highlight over displaced content */}
        <feComposite
          in="specLight"
          in2="displaced"
          operator="arithmetic"
          k1="0" k2="1" k3="1" k4="0"
          result="final"
        />
      </filter>
    </defs>
  </svg>
);

// ─── Dock Component ───────────────────────────────────────────────────────────

const Dock = () => {
  const { openWindow, closeWindow, windows } = useWindowStore();
  const dockRef = useRef(null);

  // ── Existing GSAP magnification — UNCHANGED ──────────────────────────────
  useGSAP(() => {
    const dock = dockRef.current;
    if (!dock) return;

    const icons = dock.querySelectorAll(".dock-icon");

    const animateIcons = (mouseX) => {
      const { left } = dock.getBoundingClientRect();

      icons.forEach((icon) => {
        const { left: iconLeft, width } = icon.getBoundingClientRect();
        const center = iconLeft - left + width / 2;
        const distance = Math.abs(mouseX - center);

        const intensity = Math.exp(-(distance ** 2.5) / 20000);

        gsap.to(icon, {
          scale: 1 + 0.25 * intensity,
          y: -15 * intensity,
          duration: 0.2,
          ease: "power1.out",
        });
      });
    };

    const HandleMouseMove = (e) => {
      const { left } = dock.getBoundingClientRect();
      animateIcons(e.clientX - left);
    };

    const resetIcons = () =>
      icons.forEach((icon) =>
        gsap.to(icon, {
          scale: 1,
          y: 0,
          duration: 0.3,
          ease: "power1.out",
        })
      );

    dock.addEventListener("mousemove", HandleMouseMove);
    dock.addEventListener("mouseleave", resetIcons);

    return () => {
      dock.removeEventListener("mousemove", HandleMouseMove);
      dock.removeEventListener("mouseleave", resetIcons);
    };
  }, []);

  // ── Existing toggleApp — UNCHANGED ────────────────────────────────────────
  const toggleApp = (app, e) => {
    if (!app.canOpen) return;

    const window = windows[app.id];

    if (!window) {
      console.error(`Window not found for app: ${app.id}`);
      return;
    }

    if (window.isOpen) {
      closeWindow(app.id);
    } else {
      const button = e?.currentTarget;
      const rect = button?.getBoundingClientRect();
      const originRect = rect
        ? {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
          }
        : null;

      openWindow(app.id, null, originRect);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <section id="dock" style={{ zIndex: 9999 }}>
      {/*
        SVG distortion filter — injected once, positioned out-of-flow.
        Scoped to DOCK_FILTER_ID so it cannot affect any other element.
        Remove filter="url(#...)" from dock-container-inner below to disable.
      */}
      <DockGlassFilter />

      <div ref={dockRef} className="dock-container">
        {dockApps.map(({ id, name, icon, canOpen }) => {
          const isOpen = windows[id]?.isOpen ?? false;

          return (
            /*
              Wrapper: relative flex-col keeps the active dot below the icon
              without disrupting the GSAP scale/y origin.
            */
            <div
              key={id}
              className="relative flex flex-col items-center justify-end"
            >
              <button
                type="button"
                className="dock-icon"
                aria-label={name}
                data-tooltip-id="dock-tooltip"
                data-tooltip-content={name}
                data-tooltip-delay-show={150}
                disabled={!canOpen}
                onClick={(e) => toggleApp({ id, canOpen }, e)}
              >
                <img
                  src={`images/${icon}`}
                  alt={name}
                  loading="lazy"
                  className={canOpen ? " " : "opacity-60"}
                />
              </button>

              {/*
                Active-app indicator dot.
                Rendered only when the app window is open.
                CSS class .dock-active-dot handles all styling.
                transition: opacity so it fades in/out smoothly.
              */}
              <span
                className="dock-active-dot"
                style={{ opacity: isOpen ? 1 : 0 }}
                aria-hidden="true"
              />
            </div>
          );
        })}

        <Tooltip id="dock-tooltip" place="top" className="tooltip" />
      </div>
    </section>
  );
};

export default Dock;
