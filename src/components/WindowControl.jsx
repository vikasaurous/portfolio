import useWindowStore from "#store/window";
import { useState } from "react";

const WindowControl = ({ target }) => {
  const { closeWindow, minimizeWindow, maximizeWindow } = useWindowStore();
  const [hovered, setHovered] = useState(false);

  const baseClasses =
    "w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.5),inset_0_-1px_0_rgba(0,0,0,0.15),0_0_0_0.5px_rgba(0,0,0,0.25)] transition-all duration-150";

  return (
    <div
      className="flex gap-2 px-3 py-2"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* CLOSE */}
      <div
        onClick={() => closeWindow(target)}
        className={`${baseClasses} bg-linear-to-b from-[#ff6b66] via-[#ff5f57] to-[#e0443e] cursor-pointer`}
      >
        {hovered && (
          <svg viewBox="0 0 12 12" className="w-3 h-3">
            <line
              x1="4"
              y1="4"
              x2="8"
              y2="8"
              stroke="#5a0000"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            <line
              x1="8"
              y1="4"
              x2="4"
              y2="8"
              stroke="#5a0000"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>

      {/* MINIMIZE */}
      <div
        onClick={() => minimizeWindow(target)}
        className={`${baseClasses} bg-linear-to-b from-[#feca57] via-[#ffbd2e] to-[#d9a126] cursor-pointer`}
      >
        {hovered && (
          <svg viewBox="0 0 12 12" className="w-3 h-3">
            <line
              x1="4"
              y1="6"
              x2="8"
              y2="6"
              stroke="#6b4300"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>

      {/* MAXIMIZE */}
      <div
        onClick={() => maximizeWindow(target)}
        className={`${baseClasses} bg-linear-to-b from-[#38d25f] via-[#28c840] to-[#1ea832] cursor-pointer`}
      >
        {hovered && (
          <svg viewBox="0 0 12 12" className="w-3 h-3">
            <path d="M6.5 3 L9 3 L9 5.5 Z" fill="#0b5e1a" />
            <path d="M5.5 9 L3 9 L3 6.5 Z" fill="#0b5e1a" />
          </svg>
        )}
      </div>
    </div>
  );
};

export default WindowControl;