import useWindowStore from "#store/window";
import { useState } from "react";

const WindowControl = ({ target }) => {
  const closeWindow = useWindowStore((s) => s.closeWindow);
  const minimizeWindow = useWindowStore((s) => s.minimizeWindow);
  const maximizeWindow = useWindowStore((s) => s.maximizeWindow);
  const [hovered, setHovered] = useState(false);

  const base =
    "ww-tl-dot w-3 h-3 rounded-full border-0 p-0 flex items-center justify-center cursor-pointer select-none flex-shrink-0 transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500";

  return (
    <div
      className="ww-traffic-lights flex gap-[7px] items-center pl-1"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* CLOSE — red */}
      <button
        type="button"
        onClick={() => closeWindow(target)}
        title="Close"
        aria-label={`Close ${target} window`}
        className={`${base} ww-tl-close`}
      >
        {hovered && (
          <svg viewBox="0 0 10 10" width="6" height="6" aria-hidden="true">
            <line x1="2.5" y1="2.5" x2="7.5" y2="7.5" stroke="rgba(100,0,0,0.65)" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="7.5" y1="2.5" x2="2.5" y2="7.5" stroke="rgba(100,0,0,0.65)" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {/* MINIMIZE — yellow */}
      <button
        type="button"
        onClick={() => minimizeWindow(target)}
        title="Minimize"
        aria-label={`Minimize ${target} window`}
        className={`${base} ww-tl-min`}
      >
        {hovered && (
          <svg viewBox="0 0 10 10" width="6" height="6" aria-hidden="true">
            <line x1="2.5" y1="5" x2="7.5" y2="5" stroke="rgba(80,50,0,0.65)" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {/* MAXIMIZE — green */}
      <button
        type="button"
        onClick={() => maximizeWindow(target)}
        title="Maximize"
        aria-label={`Maximize ${target} window`}
        className={`${base} ww-tl-max`}
      >
        {hovered && (
          <svg viewBox="0 0 10 10" width="6" height="6" aria-hidden="true">
            <path d="M6 2 L8 2 L8 4" stroke="rgba(0,60,10,0.65)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M4 8 L2 8 L2 6" stroke="rgba(0,60,10,0.65)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <line x1="7.5" y1="2.5" x2="2.5" y2="7.5" stroke="rgba(0,60,10,0.65)" strokeWidth="1.1" strokeLinecap="round" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default WindowControl;
