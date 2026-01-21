import { create } from "zustand";
import { persist } from "zustand/middleware";

// Helper function to get system preference
const getSystemTheme = () => {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: "system", // Default to system
      
      setTheme: (newTheme) => {
        console.log("🎨 Setting theme to:", newTheme);
        set({ theme: newTheme });
      },
      
      getActiveTheme: () => {
        const { theme } = get();
        if (theme === "system") {
          return getSystemTheme();
        }
        return theme;
      },
    }),
    {
      name: "macos-theme-storage", // New key to reset user preference to default
    }
  )
);

export default useThemeStore;