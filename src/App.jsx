import { Draggable } from "gsap/Draggable";
import gsap from "gsap";

import { useEffect, useState, Suspense } from "react";
import  GeetaVerse  from "./components/GeetaVerse";

import CustomizeHint from "./components/CustomizeHint";
import useThemeStore from "#store/theme";
import useWindowStore from "#store/window";
import { Dock, Home, Navbar, Welcome, LiquidGlassReveal, ChangeBackground } from "#components";
import Trash from "#windows/Trash.jsx";
import { LazyWindows, windowLoaders } from "#windows/loaders.js";
import useWallpaperStore, { WALLPAPERS } from "#store/wallpaper";

const WINDOW_KEYS = Object.keys(windowLoaders);

const LazyWindow = ({ windowKey }) => {
  const isOpen = useWindowStore((s) => Boolean(s.windows[windowKey]?.isOpen));
  const [hasOpened, setHasOpened] = useState(isOpen);

  if (isOpen && !hasOpened) {
    setHasOpened(true);
  }

  if (!hasOpened) return null;

  const Component = LazyWindows[windowKey];
  return (
    <Suspense fallback={null}>
      <Component />
    </Suspense>
  );
};

gsap.registerPlugin(Draggable);

const App = () => {

  const theme = useThemeStore((s) => s.theme);
  const activeWallpaperId = useWallpaperStore((s) => s.activeWallpaperId);
  const customWallpaperUrl = useWallpaperStore((s) => s.customWallpaperUrl);

  // Apply wallpaper to body — preset takes precedence, then custom upload.
  // When neither is set, clear inline styles so index.css defaults take over.
  useEffect(() => {
    // Custom upload (blob URL) wins if present
    if (customWallpaperUrl) {
      document.body.style.backgroundImage = `url('${customWallpaperUrl}')`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
      document.body.style.backgroundRepeat = "no-repeat";
      document.body.style.backgroundAttachment = "fixed";
      return;
    }
    // Preset selection
    const wallpaper = WALLPAPERS.find((w) => w.id === activeWallpaperId);
    if (wallpaper) {
      document.body.style.backgroundImage = `url('${wallpaper.full}')`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
      document.body.style.backgroundRepeat = "no-repeat";
      document.body.style.backgroundAttachment = "fixed";
    } else {
      // Reset to CSS default (index.css handles light/dark via html class)
      document.body.style.backgroundImage = "";
      document.body.style.backgroundSize = "";
      document.body.style.backgroundPosition = "";
      document.body.style.backgroundRepeat = "";
      document.body.style.backgroundAttachment = "";
    }
  }, [activeWallpaperId, customWallpaperUrl]);

  // Initialize theme ONCE on mount
  // Theme Handling Effect
  useEffect(() => {
    const root = document.documentElement;
    
    const applyTheme = (targetTheme) => {
      // Clean up previous classes
      root.classList.remove('light', 'dark');
      
      if (targetTheme === 'system') {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        console.log("🌓 System detected:", systemTheme);
        root.classList.add(systemTheme);
      } else {
        console.log("✅ Applied manual:", targetTheme);
        root.classList.add(targetTheme);
      }
    };

    // 1. Apply immediately on change
    applyTheme(theme);

    // 2. Setup listener ONLY for system mode
    if (theme === "system") {
      console.log("Listening for system changes...");
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      
      const handleSystemChange = (e) => {
        console.log("🔔 OS Theme Changed:", e.matches ? "dark" : "light");
        root.classList.remove('light', 'dark');
        root.classList.add(e.matches ? "dark" : "light");
      };
      
      mediaQuery.addEventListener("change", handleSystemChange);
      return () => mediaQuery.removeEventListener("change", handleSystemChange);
    }
  }, [theme]);


  useEffect(() => {
    // Only suppress native ghost-image dragging so GSAP Draggable handles icons cleanly
    const handleDragStart = (e) => {
      if (e.target?.tagName === "IMG") e.preventDefault();
    };

    document.addEventListener("dragstart", handleDragStart);
    return () => document.removeEventListener("dragstart", handleDragStart);
  }, []);

  return (
    <>
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0.22) 100%)",
        }}
      />

      <main className="select-none" style={{ position: "relative", zIndex: 1 }}>
      <LiquidGlassReveal>
        {/* Navigation */}
        <Navbar />

        {/* Hero */}
        <Welcome />

        {/* Main Content */}
        <Home />

        {/* Apps/Windows — lazy-loaded on first open, kept mounted afterward */}
        {WINDOW_KEYS.map((key) => (
          <LazyWindow key={key} windowKey={key} />
        ))}
        <Trash />

        {/* Fixed UI */}
        <Dock />
        <GeetaVerse />

        {/* One-time hint pointing at the wallpaper picker in Control Center */}
        <CustomizeHint />

        {/* Wallpaper picker sheet — lives outside the scroll tree, always on top */}
        <ChangeBackground />
      </LiquidGlassReveal>
      </main>
    </>
  );
};

export default App;