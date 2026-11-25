import { Suspense, lazy } from "react";
import { ChevronLeft, Download } from "lucide-react";
import useWindowStore from "#store/window";
import MobileFinderView from "./MobileFinderView";

const LazySafariBrowser = lazy(() => import("#windows/Safari/SafariBrowser.jsx"));
const LazyTerminalBody = lazy(() =>
  import("#windows/Terminal/Terminal.jsx").then((m) => ({ default: m.TerminalBody })),
);
const LazyContactBody = lazy(() =>
  import("#windows/Contact.jsx").then((m) => ({ default: m.ContactBody })),
);
const LazyResumeBody = lazy(() =>
  import("#windows/Resume.jsx").then((m) => ({ default: m.ResumeBody })),
);
const LazyTextBody = lazy(() =>
  import("#windows/Text.jsx").then((m) => ({ default: m.TextBody })),
);
const LazyImageBody = lazy(() =>
  import("#windows/Image.jsx").then((m) => ({ default: m.ImageBody })),
);

const APP_TITLES = {
  finder: "Files",
  safari: "Safari",
  terminal: "Terminal",
  contact: "Contact",
  resume: "Resume.pdf",
  txtfile: "Document",
  imgfile: "Preview",
};

const SheetFallback = () => (
  <div className="flex-1 flex items-center justify-center bg-[var(--lg-pane-bg)] text-xs font-medium text-[var(--lg-text-muted)]">
    Loading app...
  </div>
);

const renderSheetContent = (key) => {
  switch (key) {
    case "finder":
      return <MobileFinderView />;
    case "safari":
      return <LazySafariBrowser hideWindowControls />;
    case "terminal":
      return <LazyTerminalBody quickCommands />;
    case "contact":
      return <LazyContactBody />;
    case "resume":
      return <LazyResumeBody />;
    case "txtfile":
      return <LazyTextBody />;
    case "imgfile":
      return <LazyImageBody />;
    default:
      return null;
  }
};

const MobileWindowSheet = () => {
  const windows = useWindowStore((s) => s.windows);
  const closeWindow = useWindowStore((s) => s.closeWindow);

  const openSheets = Object.entries(windows)
    .filter(([key, win]) => key !== "trash" && win?.isOpen)
    .sort(([, a], [, b]) => (a.zIndex ?? 0) - (b.zIndex ?? 0));

  if (openSheets.length === 0) return null;

  return openSheets.map(([key, win], idx) => {
    const title = win.data?.name || APP_TITLES[key] || "App";
    const backLabel = idx > 0 ? "Back" : "Done";

    return (
      <section
        key={key}
        data-app={key}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{ zIndex: win.zIndex }}
        className={`ios-sheet ${key === "terminal" ? "ios-sheet-terminal" : ""}`}
      >
        {/* iOS Sheet Top Bar */}
        <header className="ios-sheet-header">
          <button
            type="button"
            onClick={() => closeWindow(key)}
            className="ios-sheet-back-btn"
            aria-label={`Close ${title}`}
          >
            <ChevronLeft className="size-4 -ml-0.5" />
            <span>{backLabel}</span>
          </button>

          <h2 className="ios-sheet-title">{title}</h2>

          <div className="ios-sheet-right-slot">
            {key === "resume" && (
              <a
                href={`${import.meta.env.BASE_URL}files/resume.pdf`}
                download="Vikas_Yadav_Resume.pdf"
                className="lg-icon-btn"
                title="Download Resume"
                aria-label="Download Resume"
              >
                <Download size={15} />
              </a>
            )}
          </div>
        </header>

        {/* Active App Content */}
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <Suspense fallback={<SheetFallback />}>
            {renderSheetContent(key)}
          </Suspense>
        </div>

        {/* Bottom Home Indicator Dismissal Bar */}
        <div className="ios-sheet-home-bar">
          <button
            type="button"
            onClick={() => closeWindow(key)}
            aria-label={`Return to Home Screen from ${title}`}
            className="ios-home-indicator-btn"
          >
            <span className="ios-home-indicator" />
          </button>
        </div>
      </section>
    );
  });
};

export default MobileWindowSheet;
