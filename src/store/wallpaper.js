import { create } from "zustand";
import { persist } from "zustand/middleware";

// Wallpaper options bundled with the project.
// `preview` is the thumbnail shown in the picker grid (PNG, fast to load).
// `full` is the actual wallpaper applied to the desktop (avif for quality).
export const WALLPAPERS = [
  {
    id: "default-light",
    label: "Sonoma Light",
    preview: "/portfolio/images/wallpaper.png",
    full: "/portfolio/images/wallpaper.avif",
    theme: "light",
  },
  {
    id: "default-dark",
    label: "Sonoma Dark",
    preview: "/portfolio/images/wallpaper-dark.png",
    full: "/portfolio/images/wallpaper-dark.avif",
    theme: "dark",
  },
  {
    id: "aurora",
    label: "Aurora",
    preview: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400&q=70",
    full: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&q=90",
    theme: "dark",
  },
  {
    id: "forest",
    label: "Forest Mist",
    preview: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=70",
    full: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=90",
    theme: "light",
  },
  {
    id: "desert",
    label: "Desert Sand",
    preview: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400&q=70",
    full: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1920&q=90",
    theme: "light",
  },
  {
    id: "galaxy",
    label: "Galaxy",
    preview: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=400&q=70",
    full: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=1920&q=90",
    theme: "dark",
  },
  {
    id: "mountain",
    label: "Mountain Peak",
    preview: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=70",
    full: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=90",
    theme: "light",
  },
];

const useWallpaperStore = create(
  persist(
    (set) => ({
      // Active preset wallpaper ID — null = use CSS default (no override)
      activeWallpaperId: null,

      // Active uploaded wallpaper object URL — NOT persisted.
      // Blob URLs only live for the current page session.
      customWallpaperUrl: null,

      // Picker open state — NOT persisted.
      isPickerOpen: false,

      // Apply a preset by ID — clears any custom upload
      setWallpaper: (id) => set({ activeWallpaperId: id, customWallpaperUrl: null }),

      // Apply an uploaded blob URL — clears any preset selection
      setCustomWallpaper: (objectUrl) =>
        set({ customWallpaperUrl: objectUrl, activeWallpaperId: null }),

      resetWallpaper: () => set({ activeWallpaperId: null, customWallpaperUrl: null }),
      openPicker: () => set({ isPickerOpen: true }),
      closePicker: () => set({ isPickerOpen: false }),
      togglePicker: () => set((s) => ({ isPickerOpen: !s.isPickerOpen })),
    }),
    {
      name: "macos-wallpaper-storage",
      // Only persist the preset selection — blob URLs are session-only
      partialize: (state) => ({ activeWallpaperId: state.activeWallpaperId }),
    }
  )
);

export default useWallpaperStore;
