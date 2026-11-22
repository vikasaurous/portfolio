import useWindowStore from "#store/window";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

// ─── Resize directions ────────────────────────────────────────────────────────
const RESIZE_DIRS = ["n", "s", "e", "w", "nw", "ne", "sw", "se"];
const DIR_CURSOR = {
  n: "ns-resize", s: "ns-resize",
  e: "ew-resize", w: "ew-resize",
  nw: "nwse-resize", se: "nwse-resize",
  ne: "nesw-resize", sw: "nesw-resize",
};
const MIN_W = 320;
const MIN_H = 180;

// ─── HOC ──────────────────────────────────────────────────────────────────────
const WindowWrapper = (Component, windowKey) => {
  const Wrapped = (props) => {
    const { focusWindow, windows } = useWindowStore();
    const { isOpen, zIndex, originRect, isMaximized } = windows[windowKey];

    const ref          = useRef(null);
    const zIndexRef    = useRef(zIndex);
    const lastPosRef   = useRef({ x: 0, y: 0 });
    const draggableRef = useRef(null);
    const restoreRef   = useRef(null);
    const badgeRef     = useRef(null);
    const badgeTimer   = useRef(null);

    if (isOpen) zIndexRef.current = zIndex;

    // ── Initial display hide ─────────────────────────────────────────────────
    useLayoutEffect(() => {
      const el = ref.current;
      if (!el) return;
      if (!isOpen) el.style.display = "none";
    // Run once at mount only — intentionally hides window before first paint if closed
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);    // ── Open / Close animation ───────────────────────────────────────────────
    useGSAP(() => {
      const el = ref.current;
      if (!el) return;

      if (isOpen) {
        el.style.display = "flex";
        el.style.willChange = "transform, opacity";

        if (lastPosRef.current) {
          gsap.set(el, {
            x: lastPosRef.current.x,
            y: lastPosRef.current.y,
            scaleX: 1,
            scaleY: 1,
          });
        }

        const currentX = gsap.getProperty(el, "x") || 0;
        const currentY = gsap.getProperty(el, "y") || 0;

        if (originRect) {
          const destRect = el.getBoundingClientRect();
          const xDiff = originRect.x - destRect.x + (originRect.width / 2 - destRect.width / 2);
          const yDiff = originRect.y - destRect.y + (originRect.height / 2 - destRect.height / 2);
          const scaleX = originRect.width / (destRect.width || 1);
          const scaleY = originRect.height / (destRect.height || 1);

          gsap.fromTo(el,
            { x: currentX + xDiff, y: currentY + yDiff, scaleX, scaleY },
            { x: currentX, y: currentY, scaleX: 1, scaleY: 1,
              duration: 0.45, ease: "expo.out",
              onComplete: () => { el.style.willChange = "auto"; } }
          );
          gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.18, ease: "power1.out" });
        } else {
          gsap.fromTo(el,
            { scale: 0.88, opacity: 0, y: currentY + 24 },
            { scale: 1, opacity: 1, y: currentY, duration: 0.32, ease: "power3.out",
              onComplete: () => { el.style.willChange = "auto"; } }
          );
        }
      } else {
        if (el.style.display === "none") return;
        el.style.willChange = "transform, opacity";

        const currentX = gsap.getProperty(el, "x") || 0;
        const currentY = gsap.getProperty(el, "y") || 0;

        // Save position for next reopen — prefer pre-maximize position
        lastPosRef.current = restoreRef.current
          ? { x: restoreRef.current.x, y: restoreRef.current.y }
          : { x: currentX, y: currentY };

        if (originRect) {
          const currentRect = el.getBoundingClientRect();
          const xDiff = originRect.x - currentRect.x + (originRect.width / 2 - currentRect.width / 2);
          const yDiff = originRect.y - currentRect.y + (originRect.height / 2 - currentRect.height / 2);
          const scaleX = originRect.width / (currentRect.width || 1);
          const scaleY = originRect.height / (currentRect.height || 1);

          gsap.to(el, {
            x: currentX + xDiff, y: currentY + yDiff, scaleX, scaleY,
            transformOrigin: "center center",
            duration: 0.38, ease: "expo.in",
            onComplete: () => {
              el.style.display = "none";
              el.style.willChange = "auto";
              if (restoreRef.current) {
                gsap.set(el, { clearProps: "width,height,top,left,borderRadius" });
                restoreRef.current = null;
              }
            },
          });
          gsap.to(el, { opacity: 0, duration: 0.14, delay: 0.22, ease: "power1.in" });
        } else {
          gsap.to(el, {
            scale: 0.88, y: currentY + 24, opacity: 0,
            duration: 0.2, ease: "power3.in",
            onComplete: () => { el.style.display = "none"; },
          });
        }
      }
    }, [isOpen]);

    // ── Maximize / Restore ───────────────────────────────────────────────────
    useGSAP(() => {
      const el = ref.current;
      if (!el) return;

      if (isMaximized) {
        if (draggableRef.current) draggableRef.current.disable();

        const currentX = gsap.getProperty(el, "x");
        const currentY = gsap.getProperty(el, "y");
        const rect = el.getBoundingClientRect();

        if (!restoreRef.current) {
          restoreRef.current = {
            x: currentX, y: currentY,
            width: rect.width, height: rect.height,
            visualX: rect.x, visualY: rect.y,
          };
        }

        gsap.to(el, {
          x: 0, y: 0,
          width: "100vw", height: "100vh",
          top: 0, left: 0, borderRadius: 0,
          duration: 0.3, ease: "power2.inOut",
        });
      } else {
        if (draggableRef.current) draggableRef.current.enable();

        if (restoreRef.current) {
          const { visualX, visualY, width, height, x, y } = restoreRef.current;

          gsap.to(el, {
            x: visualX, y: visualY, width, height,
            borderRadius: "10px",
            duration: 0.3, ease: "power2.inOut",
            onComplete: () => {
              gsap.set(el, { clearProps: "width,height,top,left,borderRadius" });
              gsap.set(el, { x, y });
              restoreRef.current = null;
            },
          });
        }
      }
    }, [isMaximized]);

    // ── GSAP Draggable — only drag via window header ─────────────────────────
    useGSAP(() => {
      const el = ref.current;
      if (!el) return;

      const [instance] = Draggable.create(el, {
        trigger: el,  // allow press anywhere but check in onPress
        onPress(e) {
          // Block drags that start on a resize handle
          if (e.target?.closest?.(".ww-resize")) {
            this.endDrag(e);
            return;
          }
          focusWindow(windowKey);
        },
        onDrag() {
          lastPosRef.current = {
            x: gsap.getProperty(el, "x") || 0,
            y: gsap.getProperty(el, "y") || 0,
          };
        },
      });

      draggableRef.current = instance;
      return () => instance.kill();
    }, []);

    // ── Resize logic ─────────────────────────────────────────────────────────
    const showBadge = useCallback((text) => {
      if (!badgeRef.current) return;
      clearTimeout(badgeTimer.current);
      badgeRef.current.textContent = text;
      badgeRef.current.style.opacity = "1";
      badgeRef.current.style.transform = "translateY(0) scale(1)";
    }, []);

    const hideBadge = useCallback((delay = 650) => {
      badgeTimer.current = setTimeout(() => {
        if (!badgeRef.current) return;
        badgeRef.current.style.opacity = "0";
        badgeRef.current.style.transform = "translateY(4px) scale(0.95)";
      }, delay);
    }, []);

    const handleResizePointerDown = useCallback((e, dir) => {
      if (isMaximized) return;
      e.preventDefault();
      e.stopPropagation();

      const el = ref.current;
      if (!el) return;

      focusWindow(windowKey);
      if (draggableRef.current) draggableRef.current.disable();

      const rect       = el.getBoundingClientRect();
      const startPX    = e.clientX;
      const startPY    = e.clientY;
      const startW     = rect.width;
      const startH     = rect.height;
      const startLeft  = rect.left;
      const startTop   = rect.top;
      const fixedRight  = rect.right;
      const fixedBottom = rect.bottom;
      const startX     = Number(gsap.getProperty(el, "x")) || 0;
      const startY     = Number(gsap.getProperty(el, "y")) || 0;

      showBadge(`${Math.round(startW)} × ${Math.round(startH)} px`);

      const prevCursor   = document.body.style.cursor;
      const prevSelect   = document.body.style.userSelect;
      document.body.style.cursor     = DIR_CURSOR[dir];
      document.body.style.userSelect = "none";

      // Disable iframes during resize to avoid pointer capture issues
      const iframes = document.querySelectorAll("iframe");
      iframes.forEach((f) => { f.style.pointerEvents = "none"; });

      let liveW = startW;
      let liveH = startH;

      const navEl = document.querySelector("nav");
      const topBound  = navEl ? navEl.getBoundingClientRect().bottom : 0;
      const rightBound = window.innerWidth;
      const botBound  = window.innerHeight;

      const onMove = (me) => {
        const dx = me.clientX - startPX;
        const dy = me.clientY - startPY;

        let newW = startW, newH = startH, newX = startX, newY = startY;

        // Horizontal
        if (dir.includes("e")) {
          newW = Math.max(MIN_W, Math.min(startW + dx, rightBound - startLeft));
        } else if (dir.includes("w")) {
          const clampedLeft = Math.max(0, Math.min(startLeft + dx, fixedRight - MIN_W));
          newW = fixedRight - clampedLeft;
          newX = startX + (clampedLeft - startLeft);
        }

        // Vertical
        if (dir.includes("s")) {
          newH = Math.max(MIN_H, Math.min(startH + dy, botBound - startTop));
        } else if (dir.includes("n")) {
          const clampedTop = Math.max(topBound, Math.min(startTop + dy, fixedBottom - MIN_H));
          newH = fixedBottom - clampedTop;
          newY = startY + (clampedTop - startTop);
        }

        liveW = Math.round(newW);
        liveH = Math.round(newH);

        el.style.width  = `${liveW}px`;
        el.style.height = `${liveH}px`;

        if (dir.includes("w") || dir.includes("n")) {
          gsap.set(el, { x: newX, y: newY });
        }

        showBadge(`${liveW} × ${liveH} px`);
      };

      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);

        document.body.style.cursor     = prevCursor;
        document.body.style.userSelect = prevSelect;
        iframes.forEach((f) => { f.style.pointerEvents = ""; });

        lastPosRef.current = {
          x: Number(gsap.getProperty(el, "x")) || 0,
          y: Number(gsap.getProperty(el, "y")) || 0,
        };

        if (draggableRef.current) {
          draggableRef.current.enable();
          draggableRef.current.update();
        }

        hideBadge(700);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup",   onUp);
      window.addEventListener("pointercancel", onUp);
    }, [isMaximized, focusWindow, showBadge, hideBadge]);

    useEffect(() => () => clearTimeout(badgeTimer.current), []);

    return (
      <section
        id={windowKey}
        ref={ref}
        style={{ zIndex: isOpen ? zIndex : zIndexRef.current }}
        className="ww-window absolute flex flex-col"
      >
        <Component {...props} isMaximized={isMaximized} />

        {/* Resize handles — rendered outside Component so they sit on top */}
        {!isMaximized && RESIZE_DIRS.map((dir) => (
          <div
            key={dir}
            className={`ww-resize ww-resize-${dir}`}
            onPointerDown={(e) => handleResizePointerDown(e, dir)}
            aria-hidden="true"
          />
        ))}

        {/* Live dimension badge */}
        <div
          ref={badgeRef}
          className="ww-dim-badge"
          style={{ opacity: 0, transform: "translateY(4px) scale(0.95)" }}
          aria-live="polite"
          aria-label="Window dimensions"
        />
      </section>
    );
  };

  Wrapped.displayName = `WindowWrapper(${Component.displayName || Component.name || "Component"})`;
  return Wrapped;
};

export default WindowWrapper;
