import useWindowStore from "#store/window";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { useLayoutEffect, useRef } from "react";

const WindowWrapper = (Component, windowKey) => {
  const Wrapped = (props) => {
    const { focusWindow, windows } = useWindowStore();
    const { isOpen, zIndex, originRect } = windows[windowKey];
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
        lastPosRef.current = { x: currentX, y: currentY };

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
            duration: 0.4,
            ease: "expo.in", // Accelerate out
            onComplete: () => {
              el.style.display = "none";
              el.style.willChange = "auto";
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
            scale: 0.8,
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

    useGSAP(() => {
      const el = ref.current;
      if (!el) return;
      const [instance] = Draggable.create(el, {
        onPress: () => focusWindow(windowKey),
      });
      return () => instance.kill();
    }, []);

    return (
      <section 
        id={windowKey} 
        ref={ref} 
        style={{ zIndex: isOpen ? zIndex : zIndexRef.current }} 
        className="absolute"
      >
        <Component {...props} />
      </section>
    );
  };

  Wrapped.displayName = `WindowWrapper(${
    Component.displayName || Component.name || "Component"
  })`;

  return Wrapped;
};

export default WindowWrapper;
