import { create } from "zustand";

// Session-only icon layout memory for Finder.
// Keyed by `${locationId}:${itemId}` because item ids repeat between folders.
const useFinderStore = create((set) => ({
  positions: {},

  // Seeds positions measured from the initial CSS classes. Existing
  // positions are never overwritten, so drag results survive folder switches.
  initializePositions: (entries) =>
    set((state) => {
      const next = { ...state.positions };
      let changed = false;

      for (const [key, position] of entries) {
        if (next[key]) continue;
        next[key] = position;
        changed = true;
      }

      return changed ? { positions: next } : state;
    }),

  setPosition: (key, position) =>
    set((state) => ({
      positions: { ...state.positions, [key]: position },
    })),

  resetPositions: () => set({ positions: {} }),
}));

export default useFinderStore;
