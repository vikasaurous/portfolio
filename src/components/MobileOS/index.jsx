import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import {
  Sun,
  Moon,
  Laptop,
  Image as ImageIcon,
  LayoutGrid,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { dockApps, locations } from "#constants";
import useWindowStore from "#store/window";
import useLocationStore from "#store/location";
import useThemeStore from "#store/theme";
import useWallpaperStore from "#store/wallpaper";
import useWidgetStore from "#store/widgets";
import { prefetchWindow } from "#windows/loaders.js";
import Spotlight from "../Spotlight";
import MobileGitHubWidget from "./MobileGitHubWidget";
import MobileWindowSheet from "./MobileWindowSheet";

const AVAILABILITY_ITEMS = [
  "Available (mostly)",
  "Currently learning & building",
  "Open to work",
];

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Laptop },
];

const resolveDockIcon = (icon) => {
  if (!icon) return "";
  return icon.includes("/") ? icon : `images/${icon}`;
};

const MobileOS = () => {
  const openWindow = useWindowStore((s) => s.openWindow);
  const setActiveLocation = useLocationStore((s) => s.setActiveLocation);
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const openWallpaperPicker = useWallpaperStore((s) => s.openPicker);
  const showWidgets = useWidgetStore((s) => s.showWidgets);
  const toggleWidgets = useWidgetStore((s) => s.toggleWidgets);

  const [clock, setClock] = useState(() => dayjs().format("h:mm"));
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [isControlCenterOpen, setIsControlCenterOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  const controlCenterRef = useRef(null);
  const statusRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setClock(dayjs().format("h:mm"));
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isControlCenterOpen && !isStatusOpen) return;

    const handleOutside = (e) => {
      if (controlCenterRef.current && !controlCenterRef.current.contains(e.target)) {
        setIsControlCenterOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(e.target)) {
        setIsStatusOpen(false);
      }
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setIsControlCenterOpen(false);
        setIsStatusOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isControlCenterOpen, isStatusOpen]);

  const aboutFile =
    locations.about?.children?.find((c) => c.name === "about-me.txt") ??
    locations.about?.children?.[0];
  const resumeFile = locations.resume?.children?.[0];
  const trashDockIcon = dockApps.find((d) => d.id === "trash")?.icon;

  const homeApps = [
    {
      id: "resume",
      label: "Resume",
      icon: resumeFile?.icon || locations.resume?.icon,
      iconClass: "size-[62px]",
      prefetchKey: "resume",
      onOpen: () => openWindow("resume"),
    },
    {
      id: "work",
      label: "Work",
      icon: "images/folder.png",
      iconClass: "size-[60px]",
      prefetchKey: "finder",
      onOpen: () => {
        setActiveLocation(locations.work);
        openWindow("finder");
      },
    },
    {
      id: "about",
      label: "About Me",
      icon: aboutFile?.icon || locations.about?.icon,
      iconClass: "size-[56px]",
      prefetchKey: "txtfile",
      onOpen: () => {
        if (aboutFile) {
          openWindow("txtfile", aboutFile);
        } else {
          setActiveLocation(locations.about);
          openWindow("finder");
        }
      },
    },
    {
      id: "trash",
      label: "Archive",
      icon: resolveDockIcon(trashDockIcon) || locations.trash?.icon,
      iconClass: "size-[60px]",
      prefetchKey: "finder",
      onOpen: () => {
        setActiveLocation(locations.trash);
        openWindow("finder");
      },
    },
  ];

  const iosDockApps = dockApps
    .filter((app) => ["finder", "safari", "contact", "terminal"].includes(app.id))
    .map((app) => ({ ...app, icon: resolveDockIcon(app.icon) }));

  const handleDockTap = (id) => {
    if (id === "finder") {
      setActiveLocation(locations.work);
      openWindow("finder");
      return;
    }
    openWindow(id);
  };

  return (
    <div className="ios-shell">
      {/* ── iOS 26 Status Bar ── */}
      <header className="ios-status-bar">
        <div className="flex items-center gap-2">
          <time className="text-[14px] font-semibold tabular-nums tracking-tight">
            {clock}
          </time>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Online availability pill */}
          <div ref={statusRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setIsStatusOpen((prev) => !prev);
                setIsControlCenterOpen(false);
              }}
              aria-expanded={isStatusOpen}
              aria-label="Availability status"
              className="ios-status-btn"
            >
              <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.85)]" />
              <span>Available</span>
            </button>

            {isStatusOpen && (
              <div className="lg-popover absolute right-0 top-10 w-56 p-3.5 z-[9990] cursor-default">
                <ul className="flex flex-col gap-2 text-left">
                  {AVAILABILITY_ITEMS.map((item) => (
                    <li
                      key={item}
                      className="text-xs text-[var(--lg-text-primary)] font-medium flex items-center gap-2"
                    >
                      <span className="size-1.5 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Quick Search trigger */}
          <button
            type="button"
            onClick={() => setIsSpotlightOpen(true)}
            aria-label="Open Spotlight Search"
            className="lg-icon-btn ios-top-icon-btn"
          >
            <Search className="size-3.5" />
          </button>

          {/* Compact Control Center toggle */}
          <div ref={controlCenterRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setIsControlCenterOpen((prev) => !prev);
                setIsStatusOpen(false);
              }}
              aria-expanded={isControlCenterOpen}
              aria-haspopup="true"
              aria-label="Control Center"
              className="lg-icon-btn ios-top-icon-btn"
            >
              <SlidersHorizontal className="size-3.5" />
            </button>

            {isControlCenterOpen && (
              <div className="lg-popover absolute right-0 top-10 w-48 p-2.5 z-[9990] cursor-default">
                <div className="flex flex-col gap-1">
                  <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--lg-text-muted)]">
                    Appearance
                  </p>
                  {THEME_OPTIONS.map((item) => {
                    const Icon = item.icon;
                    const isSelected = theme === item.value;
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => {
                          setTheme(item.value);
                          setIsControlCenterOpen(false);
                        }}
                        className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-colors w-full text-left border-0 cursor-pointer ${
                          isSelected
                            ? "bg-blue-500 text-white"
                            : "bg-transparent text-[var(--lg-text-primary)] hover:bg-black/5 dark:hover:bg-white/10"
                        }`}
                      >
                        <Icon className="size-3.5 shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}

                  <div className="h-px bg-black/10 dark:bg-white/10 my-1" />

                  <button
                    type="button"
                    onClick={() => {
                      openWallpaperPicker();
                      setIsControlCenterOpen(false);
                    }}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium w-full text-left text-[var(--lg-text-primary)] bg-transparent border-0 cursor-pointer hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    <ImageIcon className="size-3.5 shrink-0" />
                    <span>Wallpaper</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleWidgets()}
                    className="flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium w-full text-left text-[var(--lg-text-primary)] bg-transparent border-0 cursor-pointer hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    <span className="flex items-center gap-2.5">
                      <LayoutGrid className="size-3.5 shrink-0" />
                      <span>Widgets</span>
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                        showWidgets
                          ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300"
                          : "bg-black/10 dark:bg-white/10 text-[var(--lg-text-muted)]"
                      }`}
                    >
                      {showWidgets ? "On" : "Off"}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── iOS 26 Home Screen Canvas ── */}
      <div className="ios-home-scroll">
        {/* Hero Greeting */}
        <section className="ios-hero" aria-label="Introduction">
          <p className="ios-hero-eyebrow">Hey, I&apos;m Vikas</p>
          <h1 className="ios-hero-title">portfolio</h1>
        </section>

        {/* Interactive 12-Week GitHub Commit Matrix */}
        <MobileGitHubWidget />

        {/* SpringBoard App Grid (4 columns) */}
        <section aria-label="Apps" className="w-full">
          <ul className="grid grid-cols-4 gap-x-3 gap-y-4">
            {homeApps.map((app) => (
              <li key={app.id} className="flex justify-center">
                <button
                  type="button"
                  onTouchStart={() => prefetchWindow(app.prefetchKey)}
                  onFocus={() => prefetchWindow(app.prefetchKey)}
                  onClick={app.onOpen}
                  className="ios-app-btn"
                >
                  <span className="ios-app-tile">
                    <img
                      src={app.icon}
                      alt=""
                      aria-hidden="true"
                      className={`${app.iconClass} object-contain`}
                    />
                  </span>
                  <span className="ios-app-label">{app.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* ── Bottom Search Pill + Liquid Glass iOS Dock ── */}
      <footer className="ios-bottom-chrome">
        <button
          type="button"
          onClick={() => setIsSpotlightOpen(true)}
          className="ios-search-pill"
          aria-label="Search portfolio projects and skills"
        >
          <Search className="size-3.5 opacity-80" />
          <span>Search</span>
        </button>

        <nav className="ios-dock" aria-label="App dock">
          {iosDockApps.map((app) => (
            <button
              key={app.id}
              type="button"
              onTouchStart={() => prefetchWindow(app.prefetchKey ?? app.id)}
              onFocus={() => prefetchWindow(app.prefetchKey ?? app.id)}
              onClick={() => handleDockTap(app.id)}
              aria-label={app.name}
              className="ios-dock-icon-btn"
            >
              <img
                src={app.icon}
                alt=""
                aria-hidden="true"
                className="size-[70px] object-contain"
              />
            </button>
          ))}
        </nav>
      </footer>

      {/* Active App Slide-Up Sheet */}
      <MobileWindowSheet />

      {/* iOS Spotlight Overlay */}
      <Spotlight
        isOpen={isSpotlightOpen}
        onClose={() => setIsSpotlightOpen(false)}
      />
    </div>
  );
};

export default MobileOS;
