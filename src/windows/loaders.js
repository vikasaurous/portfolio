import { lazy } from "react";

export const windowLoaders = {
  finder: () => import("#windows/Finder.jsx"),
  safari: () => import("#windows/Safari/index.jsx"),
  contact: () => import("#windows/Contact.jsx"),
  terminal: () => import("#windows/Terminal/Terminal.jsx"),
  resume: () => import("#windows/Resume.jsx"),
  txtfile: () => import("#windows/Text.jsx"),
  imgfile: () => import("#windows/Image.jsx"),
};

export const LazyWindows = Object.fromEntries(
  Object.entries(windowLoaders).map(([key, loader]) => [key, lazy(loader)]),
);

const prefetched = new Set();

export function prefetchWindow(windowKey) {
  const target = windowKey === "trash" ? "finder" : windowKey;
  const loader = windowLoaders[target];
  if (!loader || prefetched.has(target)) return;
  prefetched.add(target);
  loader().catch(() => prefetched.delete(target));
}
