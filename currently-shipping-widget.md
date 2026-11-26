# Currently Shipping Desktop & Mobile Widget

## Goal
Fill the right-rail space above the 12-week GitHub Commit Matrix with a matching `304px` Tahoe Liquid Glass **"Currently Shipping"** widget (live pushed repo, primary language, latest commit message/SHA, relative timestamp, and direct GitHub links), mirrored compactly in Mobile iOS Mode.

## Tasks
- [x] Extend `src/utils/githubPulse.js` (`v3` cache) to capture active non-fork repo details (`name`, `url`, `language`, `pushedAt`), fetch latest commit (`message`, `sha`, `url`, `date`), and export `formatRelativeTime` + `getLanguageColor`.
- [x] Extract shared `src/hooks/useGitHubPulse.js` so Desktop and Mobile cards share one fetch/refresh lifecycle without duplication.
- [x] Update `src/components/DesktopWidgets/index.jsx` + `src/index.css` into a stacked `304px` right-rail column (`Currently Shipping` card above `12-Week Activity`, unified drag + `lg-widget-receded`).
- [x] Update `src/components/MobileOS/MobileGitHubWidget.jsx` & `src/components/MobileOS/index.jsx` (add compact `MobileShippingCard` reusing shared pulse state).
- [x] Run `npm run lint` and `npm run build` -> verified exit 0 cleanly (`dist/assets/index-8aHamxRY.css`, `dist/assets/MobileOS-OG7DDQHW.js`).
