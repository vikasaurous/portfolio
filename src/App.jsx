import { Draggable } from "gsap/Draggable";
import gsap from "gsap";

import { useEffect, Suspense, lazy } from "react";
import  GeetaVerse  from "./components/GeetaVerse";

import CustomizeHint from "./components/CustomizeHint";
import useThemeStore from "#store/theme";
import { Dock, Home, Navbar, Welcome, LiquidGlassReveal, ChangeBackground } from "#components";
import {
  Contact,
  Finder,
  Image,
  Terminal,
  Text,
  Trash,
} from "#windows";
import useWallpaperStore, { WALLPAPERS } from "#store/wallpaper";

// Lazy-loaded: react-pdf + pdf.worker.min.mjs (~1.2 MB) are deferred
// until the user actually opens the Resume window.
const Resume = lazy(() => import("./windows/Resume.jsx"));

// Lazy-loaded: Safari UI is deferred until the user opens the Safari window.
const Safari = lazy(() => import("./windows/Safari/index.jsx"));

gsap.registerPlugin(Draggable);

const App = () => {

   const { theme, setTheme } = useThemeStore();
  const { activeWallpaperId, customWallpaperUrl } = useWallpaperStore();

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
    const handleContextMenu = (e) => e.preventDefault();
    const handleDragStart = (e) => e.preventDefault();

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);
    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
    };
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

        {/* Apps/Windows */}
        <Terminal />
        <Suspense fallback={null}>
          <Resume />
        </Suspense>
        <Suspense fallback={null}>
          <Safari />
        </Suspense>
        <Finder />
        <Text />
        <Image />
        <Contact />
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