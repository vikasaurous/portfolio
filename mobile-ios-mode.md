# Mobile iOS 26 Mode

## Goal
Replace the mobile warning screen below `768px` with an authentic **iOS 26 Liquid Glass Home Screen** (status bar, interactive 12-week GitHub Commit Matrix widget, 4-column SpringBoard grid, Search pill, Glass Dock) and full-screen iOS slide-up app sheets across every portfolio app (`Finder`, `Safari`, `Terminal`, `Resume`, `Contact`, `Text`, `Image`, `Spotlight`, `Control Center`, `ChangeBackground`).

## Tasks
- [x] Add `src/hooks/useIsMobile.js` (`max-width: 767px` matchMedia listener via `useSyncExternalStore`) and lazy-route `<MobileOS />` vs Desktop UI cleanly in `src/App.jsx` -> Verified: `vite build` splits `MobileOS` into an async chunk (`dist/assets/MobileOS-Cp1dGspL.js`) leaving desktop JS separate.
- [x] Make shared window bodies responsive inside mobile sheets: export unwrapped/flexible inner views (`TerminalBody` with quick-command chips, `ContactBody`, `ResumeBody` with `ResizeObserver` PDF width fit, `TextBody` mobile vertical stack, `ImageBody`, `SafariBrowser` with `hideWindowControls` & responsive `StartPage`, `ChangeBackground` 2-col mobile grid, `Spotlight` mobile padding).
- [x] Build `src/components/MobileOS/`:
  - Status bar + compact iOS **Control Center** popover (`Light`/`Dark`/`System` theme, Wallpaper picker, Widgets On/Off) & availability status pill in `index.jsx`
  - `MobileGitHubWidget` (interactive 12-week matrix where tapping dots inspects daily commits)
  - `MobileFinderView` (iOS Files explorer with location pills, subfolder breadcrumb back, and file opening)
  - `MobileWindowSheet` (z-ordered full-screen Liquid Glass slide-up sheet stack with top header & bottom Home indicator pill)
  - `MobileOS` Home Screen + Search pill (`Spotlight`) + 4-app iOS Liquid Glass Dock (desktop-only `GeetaVerse` so bottom dock stays unobstructed on phones)
- [x] Add crisp iOS 26 Liquid Glass styles (`.ios-*` rules and shared `:is(...)` app body/terminal selectors) in `src/index.css`.
- [x] Run `npm run lint` and `npm run build` -> Verified: exited 0 cleanly after final edit.

## Done When
- [x] Code, responsive components, lazy split, lint, and production Vite bundle complete for `< 768px` iOS 26 mode; ready for live viewport/device QA preview.
