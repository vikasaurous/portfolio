import dayjs from "dayjs";
import { navIcons, navLinks, locations } from "#constants";
import { useEffect, useState, useRef } from "react";
import useWindowStore from "#store/window";
import useThemeStore from "#store/theme"; // ADD THIS
import Spotlight from "./Spotlight";
import { Sun, Moon, Laptop } from "lucide-react";

const Navbar = () => {
  const { openWindow, closeWindow, windows } = useWindowStore();
  const { theme, setTheme } = useThemeStore(); // ADD THIS

  const [currentTime, setCurrentTime] = useState(dayjs());
  const [isWifiOpen, setIsWifiOpen] = useState(false);
  const [isControlCenterOpen, setIsControlCenterOpen] = useState(false);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const wifiRef = useRef(null);
  const controlCenterRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wifiRef.current && !wifiRef.current.contains(event.target)) {
        setIsWifiOpen(false);
      }
      if (
        controlCenterRef.current &&
        !controlCenterRef.current.contains(event.target)
      ) {
        setIsControlCenterOpen(false);
      }
    };

    if (isWifiOpen || isControlCenterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isWifiOpen, isControlCenterOpen]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formattedTime = currentTime.format("ddd MMM D h:mm:ss A");

  // ADD THIS FUNCTION
  const handleThemeChange = (newTheme) => {
    console.log("Theme button clicked:", newTheme);
    setTheme(newTheme);
    setIsControlCenterOpen(false);
  };

  return (
    <nav>
      <div>
        <img src="/images/logo.svg" alt="apple logo" className="dark:invert" />
        <p className="font-bold">Vikas's Portfolio</p>

        <ul>
          {navLinks.map(({ id, name, type }) => (
            <li key={id} onClick={() => openWindow(type)}>
              <p>{name}</p>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <ul>
          {navIcons.map(({ id, img, name }) => {
            const isWifi = id === 1;
            const isControlCenter = id === 4;
            const showTooltip = (!isWifi || !isWifiOpen) && (!isControlCenter || !isControlCenterOpen);

            return (
              <li
                key={id}
                ref={isWifi ? wifiRef : isControlCenter ? controlCenterRef : null}
                className={`relative group`}
                onClick={() => {
                  if (id === 2) {
                    setIsSpotlightOpen(true);
                  }
                  if (id === 3) {
                    const aboutFile = locations.about.children.find(
                      (child) => child.name === "about-me.txt"
                    );
                    if (aboutFile) {
                      if (
                        windows.txtfile.isOpen &&
                        windows.txtfile.data?.name === "about-me.txt"
                      ) {
                        closeWindow("txtfile");
                      } else {
                        openWindow("txtfile", aboutFile);
                      }
                    }
                  }
                  if (isWifi) {
                    setIsWifiOpen(!isWifiOpen);
                  }
                  if (isControlCenter) {
                    setIsControlCenterOpen(!isControlCenterOpen);
                  }
                }}
              >
                <img
                  src={img}
                  className="icon-hover cursor-pointer dark:invert"
                  alt={`icon-${id}`}
                />

                {showTooltip && (
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-black/80 backdrop-blur text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {name}
                  </div>
                )}

                {isWifi && (
                  <>
                    <div className="absolute top-0 right-0 size-2 bg-green-500 rounded-full border-2 border-white/50 animate-pulse" />

                    {isWifiOpen && (
                      <div
                        className="absolute top-9 -right-10 w-52 bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl shadow-2xl rounded-xl p-4 border border-white/20 dark:border-gray-700/20 z-[99999] animate-in fade-in zoom-in-95 duration-200 cursor-default"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div
                          className="absolute -top-2 right-10 w-0 h-0
                        border-l-[8px] border-l-transparent
                        border-r-[8px] border-r-transparent
                        border-b-[8px] border-b-white/70 dark:border-b-gray-800/70
                        drop-shadow-sm"
                        />
                        <ul className="flex flex-col -space-y-3 text-left items-start">
                          {[
                            "Available (mostly)",
                            "Currently learning & building",
                            "Open to work",
                          ].map((item) => (
                            <li
                              key={item}
                              className="text-xs text-gray-600 dark:text-gray-300 font-medium flex items-center gap-2"
                            >
                              <span className="size-1.5 rounded-full bg-green-500 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}

                {/* UPDATED CONTROL CENTER */}
                {isControlCenter && isControlCenterOpen && (
                  <div className="absolute top-9 -right-6 w-28 bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl shadow-2xl rounded-xl p-1.5 border border-white/20 dark:border-gray-700/20 z-[99999] animate-in fade-in zoom-in-95 duration-200 cursor-default">
                    <div
                      className="absolute -top-2 right-6 w-0 h-0
                      border-l-[8px] border-l-transparent
                      border-r-[8px] border-r-transparent
                      border-b-[8px] border-b-white/80 dark:border-b-gray-800/80
                      drop-shadow-sm"
                    />
                    <div className="flex w-full flex-col gap-0.5">
                      <div 
                        className={`flex w-full items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                          theme === 'light' 
                            ? 'bg-blue-500 text-white' 
                            : 'hover:bg-black/5 dark:hover:bg-white/5 text-black dark:text-white'
                        }`}
                        onClick={() => handleThemeChange('light')}
                      >
                        <Sun className="size-3.5" />
                        <span className="text-xs font-medium">Light</span>
                      </div>
                      <div 
                        className={`flex w-full items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                          theme === 'dark' 
                            ? 'bg-blue-500 text-white' 
                            : 'hover:bg-black/5 dark:hover:bg-white/5 text-black dark:text-white'
                        }`}
                        onClick={() => handleThemeChange('dark')}
                      >
                        <Moon className="size-3.5" />
                        <span className="text-xs font-medium">Dark</span>
                      </div>
                      <div 
                        className={`flex w-full items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                          theme === 'system' 
                            ? 'bg-blue-500 text-white' 
                            : 'hover:bg-black/5 dark:hover:bg-white/5 text-black dark:text-white'
                        }`}
                        onClick={() => handleThemeChange('system')}
                      >
                        <Laptop className="size-3.5" />
                        <span className="text-xs font-medium">System</span>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        <time className="tabular-nums">{formattedTime}</time>
      </div>

      <Spotlight
        isOpen={isSpotlightOpen}
        onClose={() => setIsSpotlightOpen(false)}
      />
    </nav>
  );
};

export default Navbar;