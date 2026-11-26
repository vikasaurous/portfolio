# Recruiter Quick Card (Desktop & Mobile)

## Goal
Add a subtle Liquid Glass **Recruiter Quick Card** (`Vikas Yadav`, `Software Developer`, `Open to SDE / Internships`, `Copy Email`, `Resume` preview + PDF download) balanced at bottom-left on Desktop and tucked as a slim 1-row quick bar below the 4 Home icons on Mobile.

## Tasks
- [x] Extend `src/store/widgets.js` with `recruiterPosition` + `setRecruiterPosition` persistence.
- [x] Build shared `src/components/RecruiterCard.jsx` supporting Desktop card and compact Mobile bar (`Copy Email` with clipboard feedback, `Resume` window + PDF download, `prefetchWindow("resume")`).
- [x] Refactor `src/components/DesktopWidgets/index.jsx` with a shared draggable rail helper so bottom-left `RecruiterCard` and bottom-right GitHub stack share clamping, dragging, and `lg-widget-receded` behavior without duplicating pointer logic.
- [x] Add compact `RecruiterCard` below the SpringBoard grid in `src/components/MobileOS/index.jsx`.
- [x] Run `npm run lint` and `npm run build` -> verified exit 0 cleanly (`dist/assets/index-CsnNUVRe.js`, `dist/assets/MobileOS-IqOpPSNs.js`).
