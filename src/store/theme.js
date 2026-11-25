import { create } from "zustand";
import { persist } from "zustand/middleware";

const useThemeStore = create(
  persist(
    (set) => ({
      theme: "system", // Default to system

      setTheme: (newTheme) => {
        set({ theme: newTheme });
      },
    }),
    {
      name: "macos-theme-storage",
    }
  )
);

export default useThemeStore;