import dayjs from "dayjs";
import { navIcons, navLinks, locations } from "#constants";
import { useEffect, useState, useRef } from "react";
import useWindowStore from "#store/window";
import useThemeStore from "#store/theme";
import Spotlight from "./Spotlight";
import { Sun, Moon, Laptop, Image, LayoutGrid } from "lucide-react";
import useWallpaperStore from "#store/wallpaper";
import useWidgetStore from "#store/widgets";
import { prefetchWindow } from "#windows/loaders.js";
import { CONTROL_CENTER_CLICK_EVENT } from "./CustomizeHint";

const BrandMark = ({ className = "w-[19px] h-[17px]" }) => (
  <svg
    viewBox="2 3.5 20 17.5"
    fill="none"
    aria-hidden="true"
    className={className}
  >
    <path
      d="M21.3 6.4C21.3 4.7 19.7 3.8 17.5 4C15.3 4.2 13.9 5.6 13.3 8.2C12.6 11.2 11.3 12.6 8.7 13.2C6.2 13.8 4.3 13.2 3.1 12C2.5 11.5 2.1 12.4 3 13.8C4.4 15.9 6.3 17 7.1 18.8C7.5 19.9 8.3 20.3 9.2 20.2C9.9 20.1 10.2 19.4 10.4 18.4C10.7 17.3 12.6 17.3 12.9 18.4C13.1 19.4 13.5 20.1 14.3 20.2C15.3 20.3 16.1 19.6 16.2 18.4C16.4 15.2 15.8 12.2 16.3 9.8C16.7 8.2 17.7 7.9 19.3 8C20.5 8 21.3 7.4 21.3 6.4Z"
      fill="currentColor"
    />
  </svg>
);

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
  const showWidgets = useWidgetStore((s) => s.showWidgets);
  const toggleWidgets = useWidgetStore((s) => s.toggleWidgets);

  const [isBrandMenuOpen, setIsBrandMenuOpen] = useState(false);
  const [isWifiOpen, setIsWifiOpen] = useState(false);
  const [isControlCenterOpen, setIsControlCenterOpen] = useState(false);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const brandRef = useRef(null);
  const wifiRef = useRef(null);
  const controlCenterRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (brandRef.current && !brandRef.current.contains(event.target)) {
        setIsBrandMenuOpen(false);
      }
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
        setIsBrandMenuOpen(false);
        setIsWifiOpen(false);
        setIsControlCenterOpen(false);
      }
    };

    if (isBrandMenuOpen || isWifiOpen || isControlCenterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isBrandMenuOpen, isWifiOpen, isControlCenterOpen]);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    setIsControlCenterOpen(false);
  };

  const openAboutMe = ({ toggle = false } = {}) => {
    const aboutFile = locations.about.children.find(
      (child) => child.name === "about-me.txt"
    );
    if (!aboutFile) return;

    const txtWindow = useWindowStore.getState().windows.txtfile;
    if (toggle && txtWindow?.isOpen && txtWindow.data?.name === "about-me.txt") {
      closeWindow("txtfile");
    } else {
      openWindow("txtfile", aboutFile);
    }
  };

  return (
    <nav>
      <div>
        <span ref={brandRef} className="relative inline-flex items-center -ml-1.5 -mr-1">
          <button
            type="button"
            aria-label="About Vikas Yadav"
            aria-expanded={isBrandMenuOpen}
            aria-haspopup="dialog"
            onMouseEnter={() => prefetchWindow("txtfile")}
            onClick={() => {
              setIsBrandMenuOpen((prev) => !prev);
              setIsWifiOpen(false);
              setIsControlCenterOpen(false);
            }}
            className="lg-nav-item !px-2 !py-1 bg-transparent border-0 cursor-pointer inline-flex items-center justify-center text-black/90 dark:text-white/95"
          >
            <BrandMark className="w-[18px] h-[16px]" />
          </button>

          {isBrandMenuOpen && (
            <div
              role="dialog"
              aria-label="About Vikas Yadav"
              className="lg-popover absolute top-10 left-0 w-[264px] p-4 z-[99999] cursor-default !flex-col !items-center !gap-0 text-center"
            >
              <div className="size-10 rounded-2xl bg-black/[0.05] dark:bg-white/[0.1] border border-black/[0.08] dark:border-white/[0.14] flex items-center justify-center mb-2.5 shadow-inner">
                <BrandMark className="w-[22px] h-[19px] text-gray-900 dark:text-white" />
              </div>

              <span className="text-[14px] font-bold tracking-tight text-gray-900 dark:text-white">
                Vikas Yadav
              </span>
              <span className="text-[11.5px] font-medium text-gray-600 dark:text-gray-300 mt-0.5">
                Software Developer · Full-Stack
              </span>

              <hr className="my-3 h-px w-full border-0 bg-black/10 dark:bg-white/12" />

              <dl className="w-full flex flex-col gap-2 mb-3.5 px-0.5 text-[11.5px]">
                {[
                  ["Focus", "React, Next.js & Node"],
                  ["Handle", "@vikasaurous"],
                  ["Location", "Mumbai, India"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex w-full items-center justify-between !gap-3"
                  >
                    <dt className="text-gray-600 dark:text-gray-300 font-medium text-left">
                      {label}
                    </dt>
                    <dd className="text-gray-950 dark:text-white font-semibold text-right">
                      {value}
                    </dd>
                  </div>
                ))}

                <div className="flex w-full items-center justify-between !gap-3">
                  <dt className="text-gray-600 dark:text-gray-300 font-medium text-left">
                    Status
                  </dt>
                  <dd className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-semibold text-right">
                    <span className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.75)]" />
                    Open to Work
                  </dd>
                </div>
              </dl>

              <button
                type="button"
                onClick={() => {
                  setIsBrandMenuOpen(false);
                  openAboutMe();
                }}
                className="lg-pill px-4 py-1.5 text-[11.5px] font-medium cursor-pointer"
              >
                About Me…
              </button>
            </div>
          )}
        </span>

        <p className="font-bold leading-none">Vikas's Portfolio</p>

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
                      openAboutMe({ toggle: true });
                    }
                    if (isWifi) {
                      setIsWifiOpen((prev) => !prev);
                      setIsBrandMenuOpen(false);
                      setIsControlCenterOpen(false);
                    }
                    if (isControlCenter) {
                      setIsControlCenterOpen((prev) => !prev);
                      setIsBrandMenuOpen(false);
                      setIsWifiOpen(false);
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
                  <div className="lg-popover absolute top-10 -right-4 w-40 p-2 z-[99999] cursor-default">
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

                      <hr className="my-0.5 h-px w-full border-0 bg-black/8 dark:bg-white/10" />

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

                      <button
                        type="button"
                        aria-pressed={showWidgets}
                        className={`flex w-full items-center justify-between gap-2 px-2.5 py-1.5 rounded-full cursor-pointer transition-all border-0 text-left ${
                          showWidgets
                            ? "bg-black/8 dark:bg-white/14 text-gray-900 dark:text-white"
                            : "bg-transparent hover:bg-black/6 dark:hover:bg-white/10 text-gray-900 dark:text-gray-100"
                        }`}
                        onClick={toggleWidgets}
                      >
                        <span className="flex items-center gap-2">
                          <LayoutGrid className="size-3.5" aria-hidden="true" />
                          <span className="text-xs font-medium">Widgets</span>
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                            showWidgets
                              ? "bg-[#0a84ff] text-white"
                              : "bg-black/10 dark:bg-white/12 text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {showWidgets ? "On" : "Off"}
                        </span>
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