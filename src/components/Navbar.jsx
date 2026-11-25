import dayjs from "dayjs";
import { navIcons, navLinks, locations } from "#constants";
import { useEffect, useState, useRef } from "react";
import useWindowStore from "#store/window";
import useThemeStore from "#store/theme"; // ADD THIS
import Spotlight from "./Spotlight";
import { Sun, Moon, Laptop, Image } from "lucide-react";
import useWallpaperStore from "#store/wallpaper";
import { prefetchWindow } from "#windows/loaders.js";
import { CONTROL_CENTER_CLICK_EVENT } from "./CustomizeHint"; // adjust path

const NavbarClock = () => {
  const [currentTime, setCurrentTime] = useState(() => dayjs());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return <time className="tabular-nums">{currentTime.format("ddd MMM D h:mm:ss A")}</time>;
};

const Navbar = () => {
  const openWindow = useWindowStore((s) => s.openWindow);
  const closeWindow = useWindowStore((s) => s.closeWindow);
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const openWallpaperPicker = useWallpaperStore((s) => s.openPicker);

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

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsWifiOpen(false);
        setIsControlCenterOpen(false);
      }
    };

    if (isWifiOpen || isControlCenterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isWifiOpen, isControlCenterOpen]);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    setIsControlCenterOpen(false);
  };

  return (
    <nav>
      <div>
        <img src="./images/logo.svg" alt="apple logo" className="dark:invert" />
        <p className="font-bold">Vikas's Portfolio</p>

        <ul>
          {navLinks.map(({ id, name, type }) => (
            <li key={id} onMouseEnter={() => prefetchWindow(type)}>
              <button
                type="button"
                onClick={() => openWindow(type)}
                className="lg-nav-item bg-transparent border-0 cursor-pointer flex items-center"
              >
                <p>{name}</p>
              </button>
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
                className="relative group"
                onMouseEnter={() => {
                  if (id === 3) prefetchWindow("txtfile");
                }}
              >
                <button
                  type="button"
                  aria-label={name}
                  aria-expanded={isWifi ? isWifiOpen : isControlCenter ? isControlCenterOpen : undefined}
                  aria-haspopup={isWifi || isControlCenter ? "true" : undefined}
                  className="lg-nav-item bg-transparent border-0 cursor-pointer flex items-center"
                  onClick={() => {
                    if (id === 2) {
                      setIsSpotlightOpen(true);
                    }
                    if (id === 3) {
                      const aboutFile = locations.about.children.find(
                        (child) => child.name === "about-me.txt"
                      );
                      if (aboutFile) {
                        const txtWindow = useWindowStore.getState().windows.txtfile;
                        if (
                          txtWindow?.isOpen &&
                          txtWindow.data?.name === "about-me.txt"
                        ) {
                          closeWindow("txtfile");
                        } else {
                          openWindow("txtfile", aboutFile);
                        }
                      }
                    }
                    if (isWifi) {
                      setIsWifiOpen((prev) => !prev);
                    }
                    if (isControlCenter) {
                      setIsControlCenterOpen((prev) => !prev);
                      window.dispatchEvent(new Event(CONTROL_CENTER_CLICK_EVENT));
                    }
                  }}
                >
                  <img
                    src={img}
                    className="dark:invert"
                    alt=""
                    aria-hidden="true"
                  />
                </button>

                {showTooltip && (
                  <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 px-3 py-1 bg-white/85 dark:bg-[#222530]/90 backdrop-blur-xl text-gray-900 dark:text-gray-100 border border-white/50 dark:border-white/15 shadow-lg text-xs font-medium rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {name}
                  </div>
                )}

                {isWifi && (
                  <>
                    <div className="absolute top-1 right-1.5 size-2 bg-green-500 rounded-full border border-white/60 animate-pulse pointer-events-none" />

                    {isWifiOpen && (
                      <div className="lg-popover absolute top-10 -right-10 w-56 p-4 z-[99999] cursor-default">
                        <ul className="flex flex-col gap-2 text-left items-start">
                          {[
                            "Available (mostly)",
                            "Currently learning & building",
                            "Open to work",
                          ].map((item) => (
                            <li
                              key={item}
                              className="text-xs text-gray-700 dark:text-gray-200 font-medium flex items-center gap-2"
                            >
                              <span className="size-1.5 rounded-full bg-green-500 shrink-0 shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}

                {/* Tahoe Liquid Glass Control Center */}
                {isControlCenter && isControlCenterOpen && (
                  <div className="lg-popover absolute top-10 -right-4 w-36 p-2 z-[99999] cursor-default">
                    <div className="flex w-full flex-col gap-1">
                      {[
                        { value: "light", label: "Light", icon: Sun },
                        { value: "dark", label: "Dark", icon: Moon },
                        { value: "system", label: "System", icon: Laptop },
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => handleThemeChange(item.value)}
                            aria-pressed={theme === item.value}
                            className={`flex w-full items-center gap-2 px-2.5 py-1.5 rounded-full cursor-pointer transition-all border-0 text-left ${
                              theme === item.value
                                ? "bg-[#0a84ff] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_8px_rgba(10,132,255,0.35)]"
                                : "bg-transparent hover:bg-black/6 dark:hover:bg-white/10 text-gray-900 dark:text-gray-100"
                            }`}
                          >
                            <Icon className="size-3.5" aria-hidden="true" />
                            <span className="text-xs font-medium">{item.label}</span>
                          </button>
                        );
                      })}

                      <div className="my-0.5 h-px bg-black/8 dark:bg-white/10" />

                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-full cursor-pointer transition-colors bg-transparent border-0 hover:bg-black/6 dark:hover:bg-white/10 text-gray-900 dark:text-gray-100 text-left"
                        onClick={() => {
                          setIsControlCenterOpen(false);
                          openWallpaperPicker();
                        }}
                      >
                        <Image className="size-3.5" aria-hidden="true" />
                        <span className="text-xs font-medium">Wallpaper</span>
                      </button>

                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        <NavbarClock />
      </div>

      <Spotlight
        isOpen={isSpotlightOpen}
        onClose={() => setIsSpotlightOpen(false)}
      />
    </nav>
  );
};

export default Navbar;