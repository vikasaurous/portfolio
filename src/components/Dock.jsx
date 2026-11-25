import { Tooltip } from "react-tooltip";
import { dockApps } from "#constants";
import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import useWindowStore from "#store/window";
import { prefetchWindow } from "#windows/loaders.js";

// ─── Dock Component ───────────────────────────────────────────────────────────

const DockActiveDot = ({ id }) => {
  const isOpen = useWindowStore((s) => Boolean(s.windows[id]?.isOpen));
  return (
    <span
      className="dock-active-dot"
      style={{ opacity: isOpen ? 1 : 0 }}
      aria-hidden="true"
    />
  );
};

const Dock = () => {
  const openWindow = useWindowStore((s) => s.openWindow);
  const closeWindow = useWindowStore((s) => s.closeWindow);
  const dockRef = useRef(null);

  // ── Cached GSAP magnification (restores scale + lift with zero per-frame reads) ─
  useGSAP(() => {
    const dock = dockRef.current;
    if (!dock) return;

    const icons = Array.from(dock.querySelectorAll(".dock-icon"));
    let dockLeft = 0;
    let iconCenters = [];

    // Measure parent wrapper (never scaled by GSAP) instead of icons themselves
    const measure = () => {
      dockLeft = dock.getBoundingClientRect().left;
      iconCenters = icons.map((icon) => {
        const wrapper = icon.parentElement;
        const { left, width } = wrapper.getBoundingClientRect();
        return left - dockLeft + width / 2;
      });
    };

    measure();

    const handleMouseMove = (e) => {
      if (iconCenters.length === 0) measure();
      const mouseX = e.clientX - dockLeft;

      for (let i = 0; i < icons.length; i++) {
        const distance = Math.abs(mouseX - iconCenters[i]);
        const intensity = Math.exp(-(distance ** 2.5) / 20000);

        gsap.to(icons[i], {
          scale: 1 + 0.25 * intensity,
          y: -15 * intensity,
          duration: 0.2,
          ease: "power1.out",
          overwrite: "auto",
        });
      }
    };

    const resetIcons = () => {
      for (let i = 0; i < icons.length; i++) {
        gsap.to(icons[i], {
          scale: 1,
          y: 0,
          duration: 0.3,
          ease: "power1.out",
          overwrite: "auto",
        });
      }
    };

    dock.addEventListener("mouseenter", measure);
    dock.addEventListener("mousemove", handleMouseMove);
    dock.addEventListener("mouseleave", resetIcons);
    window.addEventListener("resize", measure);

    return () => {
      dock.removeEventListener("mouseenter", measure);
      dock.removeEventListener("mousemove", handleMouseMove);
      dock.removeEventListener("mouseleave", resetIcons);
      window.removeEventListener("resize", measure);
      gsap.killTweensOf(icons);
    };
  }, []);

  // ── toggleApp — reads current window state on demand ──────────────────────
  const toggleApp = (app, e) => {
    if (!app.canOpen) return;

    const windowState = useWindowStore.getState().windows[app.id];

    if (!windowState) {
      console.error(`Window not found for app: ${app.id}`);
      return;
    }

    if (windowState.isOpen) {
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
      <div ref={dockRef} className="dock-container">
        {dockApps.map(({ id, name, icon, canOpen }) => (
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
                onMouseEnter={() => prefetchWindow(id)}
                onFocus={() => prefetchWindow(id)}
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
                Isolated subscription so z-index/focus updates never re-render Dock.
              */}
              <DockActiveDot id={id} />
            </div>
        ))}

        <Tooltip id="dock-tooltip" place="top" className="tooltip" />
      </div>
    </section>
  );
};

export default Dock;
