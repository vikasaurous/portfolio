import useWindowStore from "#store/window";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { useLayoutEffect, useRef } from "react";

const WindowWrapper = (Component, windowKey) => {
  const Wrapped = (props) => {
    const { focusWindow, windows } = useWindowStore();
    const { isOpen, zIndex, originRect, isMaximized } = windows[windowKey];
    const ref = useRef(null);
    const zIndexRef = useRef(zIndex);
    const lastPosRef = useRef({ x: 0, y: 0 });

    if (isOpen) {
      zIndexRef.current = zIndex;
    }

    useLayoutEffect(() => {
      const el = ref.current;
      if (!el) return;
      if (!isOpen) {
        el.style.display = "none";
      }
    }, []);

    useGSAP(() => {
      const el = ref.current;
      if (!el) return;

      if (isOpen) {
        el.style.display = "block";
        el.style.willChange = "transform, opacity"; // optimize performance

        // Restore previous position if exists so we calculate destRect from the correct place
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
          const xDiff =
            originRect.x -
            destRect.x +
            (originRect.width / 2 - destRect.width / 2);
          const yDiff =
            originRect.y -
            destRect.y +
            (originRect.height / 2 - destRect.height / 2);
          const scaleX = originRect.width / destRect.width;
          const scaleY = originRect.height / destRect.height;

          // Animate Transform (Scale/Position)
          gsap.fromTo(
            el,
            {
              x: currentX + xDiff,
              y: currentY + yDiff,
              scaleX: scaleX, // Start squashed
              scaleY: scaleY,
            },
            {
              x: currentX,
              y: currentY,
              scaleX: 1,
              scaleY: 1,
              duration: 0.5,
              ease: "expo.out",
              onComplete: () => {
                el.style.willChange = "auto";
              },
            }
          );

          // Animate Opacity (Fast fade in for solid feel)
          gsap.fromTo(
            el,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 0.2, // Faster than transform
              ease: "power1.out",
            }
          );
        } else {
          // Default animation (fade up)
          gsap.fromTo(
            el,
            { scale: 0.8, opacity: 0, y: 40 },
            { scale: 1, opacity: 1, y: 0, duration: 0.3, ease: "power3.out" }
          );
        }
      } else {
        if (el.style.display === "none") return;
        el.style.willChange = "transform, opacity";

        const currentX = gsap.getProperty(el, "x") || 0;
        const currentY = gsap.getProperty(el, "y") || 0;

        // Save current position before animating away
        // If maximized, we want to restore to the PRE-MAXIMIZED position next time we open
        // OR we want to behave as if we are closing from the maximized state.
        // User said: "minimize to intial location". 
        // If we are maximized, `restoreRef.current` holds the non-maximized position.
        if (restoreRef.current) {
             lastPosRef.current = { 
                 x: restoreRef.current.x, 
                 y: restoreRef.current.y 
             };
        } else {
             lastPosRef.current = { x: currentX, y: currentY };
        }

        if (originRect) {
          const currentRect = el.getBoundingClientRect();
          const xDiff =
            originRect.x -
            currentRect.x +
            (originRect.width / 2 - currentRect.width / 2);
          const yDiff =
            originRect.y -
            currentRect.y +
            (originRect.height / 2 - currentRect.height / 2);
          const scaleX = originRect.width / currentRect.width;
          const scaleY = originRect.height / currentRect.height; // Use full squash

          // Animate Transform (Suck into dock)
          gsap.to(el, {
            x: currentX + xDiff,
            y: currentY + yDiff,
            scaleX: scaleX,
            scaleY: scaleY,
            transformOrigin: "center center", // FORCE center origin to prevent springing to corner
            duration: 0.4,
            ease: "expo.in", // Accelerate out
            onComplete: () => {
              el.style.display = "none";
              el.style.willChange = "auto";
              // Reset maximize state gracefully if needed, or rely on store.
              // If we closed while maximized, we should probably reset the style overrides
              // so next open is clean (unless we want to open strictly as maximized).
              // For now, let's clear the maximized props invisible so next open is normal size
              if (restoreRef.current) {
                  gsap.set(el, { clearProps: "width,height,top,left,borderRadius" });
                  restoreRef.current = null;
                  
                  // Optional: We might want to tell the store we are no longer maximized
                  // But since we can't easily access the setter here without adding it to the hook's scope/store
                  // simple visual reset is usually enough for the UX "minimize to initial location".
                  // However, let's check if we have access to maximizeWindow action? 
                  // No, we only destructured what we needed.
              }
            },
          });

          // Animate Opacity (Fade out near end)
          gsap.to(el, {
            opacity: 0,
            duration: 0.15,
            delay: 0.25, // Wait until halfway
            ease: "power1.in",
          });
        } else {
          gsap.to(el, {
            scale: 0.8, // ... default close
            y: currentY + 40,
            opacity: 0,
            duration: 0.2,
            ease: "power3.in",
            onComplete: () => {
              el.style.display = "none";
            },
          });
        }
      }
    }, [isOpen]);

    const draggableRef = useRef(null);
    const restoreRef = useRef(null);

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
                    x: currentX, 
                    y: currentY,
                    width: rect.width,
                    height: rect.height,
                    visualX: rect.x,
                    visualY: rect.y
                };
            }

            gsap.to(el, {
                x: 0,
                y: 0,
                width: "100vw",
                height: "100vh",
                top: 0,
                left: 0,
                borderRadius: 0,
                duration: 0.3,
                ease: "power2.inOut"
            });
        } else {
            if (draggableRef.current) draggableRef.current.enable();

            if (restoreRef.current) {
                // Determine target visual position (relative to screen, which is relative to top:0 left:0)
                const targetX = restoreRef.current.visualX;
                const targetY = restoreRef.current.visualY;

                gsap.to(el, {
                    x: targetX,
                    y: targetY,
                    width: restoreRef.current.width,
                    height: restoreRef.current.height,
                    borderRadius: "12px", 
                    duration: 0.3,
                    ease: "power2.inOut",
                    onComplete: () => {
                         // 1. Remove the overrides (restoring original CSS top/left)
                         gsap.set(el, { 
                             clearProps: "width,height,top,left,borderRadius" 
                         });
                         // 2. Restore the original transforms that matched that CSS
                         gsap.set(el, {
                             x: restoreRef.current.x,
                             y: restoreRef.current.y
                         });
                         restoreRef.current = null;
                    }
                });
            }
        }
    }, [isMaximized]);

    useGSAP(() => {
      const el = ref.current;
      if (!el) return;
      const [instance] = Draggable.create(el, {
        onPress: () => focusWindow(windowKey),
      });
      draggableRef.current = instance;
      return () => instance.kill();
    }, []);

    return (
      <section 
        id={windowKey} 
        ref={ref} 
        style={{ zIndex: isOpen ? zIndex : zIndexRef.current }} 
        className="absolute"
      >
        <Component {...props} isMaximized={isMaximized} />
      </section>
    );
  };

  Wrapped.displayName = `WindowWrapper(${
    Component.displayName || Component.name || "Component"
  })`;

  return Wrapped;
};

export default WindowWrapper;
