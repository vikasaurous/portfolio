import React, { useState, useEffect } from "react";

const STORAGE_KEY = "portfolio_customize_hint_dismissed";
export const CONTROL_CENTER_CLICK_EVENT = "control-center-clicked";

const CustomizeHint = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY);
      if (!dismissed) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  // Hide + remember once Control Center is opened
  useEffect(() => {
    const hideHint = () => {
      setVisible(false);

      try {
        localStorage.setItem(STORAGE_KEY, "true");
      } catch {
        // Ignore storage errors
      }
    };

    window.addEventListener(CONTROL_CENTER_CLICK_EVENT, hideHint);

    return () => {
      window.removeEventListener(CONTROL_CENTER_CLICK_EVENT, hideHint);
    };
  }, []);

  // Ctrl+R / Cmd+R re-summons the hint instead of refreshing
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isRefreshCombo =
        (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "r";

      if (isRefreshCombo) {
        e.preventDefault();

        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          // Ignore storage errors
        }

        setVisible(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: "130px",
        right: "165px",
        zIndex: 10000,
        userSelect: "none",
        pointerEvents: "none",
        animation: "customizeHintFadeIn 0.6s ease",
      }}
    >
      {/* Text */}
      <p
        style={{
          fontFamily: "'Caveat', cursive",
          fontSize: "27px",
          fontWeight: 700,
          color: "rgba(255, 255, 255, 0.76)",
          textShadow: "0 1px 4px rgba(0, 0, 0, 0.45)",
          margin: 0,
          transform: "rotate(-6deg)",
          whiteSpace: "nowrap",
        }}
      >
        customize background
      </p>

      {/* Subtle curved arrow pointing toward Control Center */}
      <svg
        width="90"
        height="90"
        viewBox="0 0 90 95"
        style={{
          position: "absolute",
          right: "18px",
          bottom: "42px",
          overflow: "visible",
        }}
      >
        {/* Curved stroke */}
        <path
          d="
            M12 82
            C18 62, 35 58, 49 47
            C62 37, 68 24, 70 10
          "
          fill="none"
          stroke="rgba(255, 255, 255, 0.72)"
          strokeWidth="1.8"
          strokeLinecap="round"
          style={{
            filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.35))",
          }}
        />

        {/* Minimal hand-drawn arrowhead */}
        <path
          d="M70 10 L63.5 17 M70 10 L71 19"
          fill="none"
          stroke="rgba(255, 255, 255, 0.72)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.35))",
          }}
        />
      </svg>
    </div>
  );
};

export default CustomizeHint;
