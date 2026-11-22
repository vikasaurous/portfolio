import useWindowStore from "#store/window";
import { useState } from "react";

const WindowControl = ({ target }) => {
  const { closeWindow, minimizeWindow, maximizeWindow } = useWindowStore();
  const [hovered, setHovered] = useState(false);

  const base =
    "w-3 h-3 rounded-full flex items-center justify-center cursor-pointer select-none flex-shrink-0 transition-all duration-100";

  return (
    <div
      className="flex gap-[7px] items-center pl-1"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* CLOSE — red */}
      <div
        onClick={() => closeWindow(target)}
        title="Close"
        className={`${base}`}
        style={{
          background: hovered
            ? "radial-gradient(circle at 50% 35%, #ff8080 0%, #ff5f57 40%, #e0443e 100%)"
            : "radial-gradient(circle at 50% 35%, #ff8f8b 0%, #ff6058 40%, #e74b41 100%)",
          boxShadow: "inset 0 0.5px 0 rgba(255,255,255,0.4), inset 0 -0.5px 0 rgba(0,0,0,0.25), 0 0 0 0.5px rgba(0,0,0,0.18)",
        }}
      >
        {hovered && (
          <svg viewBox="0 0 10 10" width="6" height="6" aria-hidden="true">
            <line x1="2.5" y1="2.5" x2="7.5" y2="7.5" stroke="rgba(100,0,0,0.65)" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="7.5" y1="2.5" x2="2.5" y2="7.5" stroke="rgba(100,0,0,0.65)" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        )}
      </div>

      {/* MINIMIZE — yellow */}
      <div
        onClick={() => minimizeWindow(target)}
        title="Minimize"
        className={`${base}`}
        style={{
          background: hovered
            ? "radial-gradient(circle at 50% 35%, #ffd060 0%, #ffbd2e 40%, #d9a010 100%)"
            : "radial-gradient(circle at 50% 35%, #ffd870 0%, #ffc130 40%, #e0a918 100%)",
          boxShadow: "inset 0 0.5px 0 rgba(255,255,255,0.4), inset 0 -0.5px 0 rgba(0,0,0,0.2), 0 0 0 0.5px rgba(0,0,0,0.18)",
        }}
      >
        {hovered && (
          <svg viewBox="0 0 10 10" width="6" height="6" aria-hidden="true">
            <line x1="2.5" y1="5" x2="7.5" y2="5" stroke="rgba(80,50,0,0.65)" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        )}
      </div>

      {/* MAXIMIZE — green */}
      <div
        onClick={() => maximizeWindow(target)}
        title="Maximize"
        className={`${base}`}
        style={{
          background: hovered
            ? "radial-gradient(circle at 50% 35%, #58d858 0%, #28c840 40%, #18a830 100%)"
            : "radial-gradient(circle at 50% 35%, #68e068 0%, #34d050 40%, #1eb840 100%)",
          boxShadow: "inset 0 0.5px 0 rgba(255,255,255,0.4), inset 0 -0.5px 0 rgba(0,0,0,0.2), 0 0 0 0.5px rgba(0,0,0,0.18)",
        }}
      >
        {hovered && (
          <svg viewBox="0 0 10 10" width="6" height="6" aria-hidden="true">
            <path d="M6 2 L8 2 L8 4" stroke="rgba(0,60,10,0.65)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M4 8 L2 8 L2 6" stroke="rgba(0,60,10,0.65)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <line x1="7.5" y1="2.5" x2="2.5" y2="7.5" stroke="rgba(0,60,10,0.65)" strokeWidth="1.1" strokeLinecap="round" />
          </svg>
        )}
      </div>
    </div>
  );
};

export default WindowControl;
