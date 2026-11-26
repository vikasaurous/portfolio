import { create } from "zustand";
import { persist } from "zustand/middleware";

const useWidgetStore = create(
  persist(
    (set) => ({
      showWidgets: true,
      position: null,
      recruiterPosition: null,

      toggleWidgets: () =>
        set((state) => ({ showWidgets: !state.showWidgets })),

      setShowWidgets: (visible) => set({ showWidgets: Boolean(visible) }),

      setWidgetPosition: (pos) => set({ position: pos }),

      setRecruiterPosition: (pos) => set({ recruiterPosition: pos }),

      resetWidgetPosition: () => set({ position: null, recruiterPosition: null }),
    }),
    {
      name: "macos-activity-widget-storage-v2",
    },
  ),
);

export default useWidgetStore;
