import { Draggable } from "gsap/Draggable";
import gsap from "gsap";

import { useEffect, Suspense, lazy } from "react";
import useThemeStore from "#store/theme";
import { Dock, Home, Navbar, Welcome, LiquidGlassReveal } from "#components";
import {
  Contact,
  Finder,
  Image,
  Terminal,
  Text,
  Trash,
} from "#windows";

// Lazy-loaded: react-pdf + pdf.worker.min.mjs (~1.2 MB) are deferred
// until the user actually opens the Resume window.
const Resume = lazy(() => import("./windows/Resume.jsx"));

// Lazy-loaded: Safari UI is deferred until the user opens the Safari window.
const Safari = lazy(() => import("./windows/Safari/index.jsx"));

gsap.registerPlugin(Draggable);

const App = () => {

   const { theme, setTheme } = useThemeStore();

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
    <main className="select-none">
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
      </LiquidGlassReveal>
    </main>
  );
};

export default App;
