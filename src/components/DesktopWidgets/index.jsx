import { useLayoutEffect, useRef, useState } from "react";
import { RefreshCw, ArrowUpRight, GitBranch } from "lucide-react";
import useWidgetStore from "#store/widgets";
import useWindowStore, { selectHasOpenWindow } from "#store/window";
import { useGitHubPulse } from "../../hooks/useGitHubPulse";
import { formatContributionDay } from "../../utils/githubPulse";
import CurrentlyShippingCard from "../CurrentlyShippingCard";
import RecruiterCard from "../RecruiterCard";

const WIDGET_WIDTH = 304;
const EDGE_PADDING = 20;
const SIDE_MARGIN = 26;
const BOTTOM_MARGIN = 30;
const DRAG_THRESHOLD = 5;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function getDesktopBounds(el, fallbackHeight = 200) {
  const nav = document.querySelector("nav");
  const navBottom = nav ? Math.ceil(nav.getBoundingClientRect().bottom) : 44;
  const width = el?.offsetWidth || WIDGET_WIDTH;
  const height = el?.offsetHeight || fallbackHeight;

  return {
    minX: EDGE_PADDING,
    maxX: Math.max(EDGE_PADDING, window.innerWidth - width - EDGE_PADDING),
    minY: navBottom + 12,
    maxY: Math.max(navBottom + 12, window.innerHeight - height - EDGE_PADDING),
  };
}

const getRightRailDefaultPos = (bounds, height) => ({
  x: clamp(window.innerWidth - WIDGET_WIDTH - SIDE_MARGIN, bounds.minX, bounds.maxX),
  y: clamp(window.innerHeight - height - BOTTOM_MARGIN, bounds.minY, bounds.maxY),
});

const getTopRightDefaultPos = (bounds) => ({
  x: clamp(window.innerWidth - WIDGET_WIDTH - SIDE_MARGIN, bounds.minX, bounds.maxX),
  y: bounds.minY,
});

const DraggableWidgetRail = ({
  storedPosition,
  onSavePosition,
  getDefaultPos,
  hasOpenWindow,
  fallbackHeight,
  children,
}) => {
  const [dragging, setDragging] = useState(false);
  const [computedPos, setComputedPos] = useState(null);

  const railRef = useRef(null);
  const dragRef = useRef(null);

  useLayoutEffect(() => {
    const layout = () => {
      const el = railRef.current;
      if (!el) return;

      const bounds = getDesktopBounds(el, fallbackHeight);
      const height = el.offsetHeight || fallbackHeight;
      const defaultPos = getDefaultPos(bounds, height);

      setComputedPos(
        storedPosition
          ? {
              x: clamp(storedPosition.x, bounds.minX, bounds.maxX),
              y: clamp(storedPosition.y, bounds.minY, bounds.maxY),
            }
          : defaultPos,
      );
    };

    layout();
    window.addEventListener("resize", layout);
    return () => window.removeEventListener("resize", layout);
  }, [storedPosition, getDefaultPos, fallbackHeight]);

  const handlePointerDown = (e) => {
    if (e.button !== 0) return;
    if (e.target.closest("a, button, [data-no-drag]")) return;

    const el = railRef.current;
    if (!el) return;

    const bounds = getDesktopBounds(el, fallbackHeight);
    dragRef.current = {
      pointerId: e.pointerId,
      startClientX: e.clientX,
      startClientY: e.clientY,
      originX: computedPos?.x ?? el.offsetLeft,
      originY: computedPos?.y ?? el.offsetTop,
      x: computedPos?.x ?? el.offsetLeft,
      y: computedPos?.y ?? el.offsetTop,
      bounds,
      moved: false,
      element: el,
    };

    el.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;

    const dx = e.clientX - drag.startClientX;
    const dy = e.clientY - drag.startClientY;

    if (!drag.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    if (!drag.moved) {
      drag.moved = true;
      setDragging(true);
    }

    drag.x = Math.round(clamp(drag.originX + dx, drag.bounds.minX, drag.bounds.maxX));
    drag.y = Math.round(clamp(drag.originY + dy, drag.bounds.minY, drag.bounds.maxY));
    drag.element.style.left = `${drag.x}px`;
    drag.element.style.top = `${drag.y}px`;
  };

  const finishDrag = (e) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;

    dragRef.current = null;
    setDragging(false);

    if (drag.element.hasPointerCapture?.(e.pointerId)) {
      drag.element.releasePointerCapture(e.pointerId);
    }

    if (drag.moved) {
      onSavePosition({ x: drag.x, y: drag.y });
    }
  };

  return (
    <div
      ref={railRef}
      className={[
        "lg-widget-stack",
        hasOpenWindow && !dragging ? "lg-widget-receded" : "",
        dragging ? "lg-widget-dragging" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        width: `${WIDGET_WIDTH}px`,
        left: computedPos ? `${computedPos.x}px` : undefined,
        top: computedPos ? `${computedPos.y}px` : undefined,
        opacity: computedPos ? undefined : 0,
        pointerEvents: "auto",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
    >
      {children}
    </div>
  );
};

const DesktopWidgets = () => {
  const showWidgets = useWidgetStore((s) => s.showWidgets);
  const rightPosition = useWidgetStore((s) => s.position);
  const recruiterPosition = useWidgetStore((s) => s.recruiterPosition);
  const setWidgetPosition = useWidgetStore((s) => s.setWidgetPosition);
  const setRecruiterPosition = useWidgetStore((s) => s.setRecruiterPosition);
  const hasOpenWindow = useWindowStore(selectHasOpenWindow);

  const { pulse, syncing, mumbaiTime, refresh } = useGitHubPulse(showWidgets);
  const [hoveredDay, setHoveredDay] = useState(null);

  if (!showWidgets) return null;

  const statusLabel =
    pulse.source === "live"
      ? "Live"
      : pulse.source === "cached"
        ? "Synced"
        : "Offline";

  return (
    <aside
      id="desktop-widgets"
      aria-label="Desktop Quick Widgets"
      className="fixed inset-0 z-10 pointer-events-none max-md:hidden"
    >
      {/* ── Top-Right: Recruiter Quick Card ─────────────────────────────── */}
      <DraggableWidgetRail
        storedPosition={recruiterPosition}
        onSavePosition={setRecruiterPosition}
        getDefaultPos={getTopRightDefaultPos}
        hasOpenWindow={hasOpenWindow}
        fallbackHeight={136}
      >
        <article
          aria-label="Recruiter Quick Card"
          className="lg-widget"
        >
          <RecruiterCard />
        </article>
      </DraggableWidgetRail>

      {/* ── Bottom-Right: Currently Shipping + 12-Week Activity Stack ───── */}
      <DraggableWidgetRail
        storedPosition={rightPosition}
        onSavePosition={setWidgetPosition}
        getDefaultPos={getRightRailDefaultPos}
        hasOpenWindow={hasOpenWindow}
        fallbackHeight={376}
      >
        <article
          aria-label="Currently Shipping on GitHub"
          className="lg-widget"
        >
          <CurrentlyShippingCard pulse={pulse} />
        </article>

        <article
          aria-label="12-Week GitHub Commit Activity"
          className="lg-widget"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <a
              href={pulse.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 min-w-0 group"
              title={`Open @${pulse.username} on GitHub`}
            >
              <span className="lg-widget-badge shrink-0" aria-hidden="true">
                <GitBranch className="size-3.5" />
              </span>
              <div className="flex items-baseline gap-1.5 min-w-0">
                <span className="text-[13px] font-semibold tabular-nums tracking-tight text-[var(--lg-text-primary)] group-hover:underline">
                  {pulse.total12Weeks} commits
                </span>
                <span className="text-[11px] font-medium text-[var(--lg-text-muted)] shrink-0">
                  · 12w
                </span>
              </div>
            </a>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="lg-widget-status">
                <span
                  className={`size-1.5 rounded-full ${
                    pulse.source === "offline"
                      ? "bg-amber-400"
                      : "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.75)]"
                  }`}
                />
                {statusLabel}
              </span>
              <button
                type="button"
                onClick={() => refresh(true)}
                title="Refresh GitHub activity"
                aria-label="Refresh GitHub activity"
                className="lg-icon-btn !w-6 !h-6"
              >
                <RefreshCw className={`size-3 ${syncing ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* 12×7 Contribution Matrix */}
          <div
            className="lg-matrix-grid mb-3"
            role="group"
            aria-label="12-week daily commit heatmap"
            onMouseLeave={() => setHoveredDay(null)}
          >
            {pulse.weeks.flatMap((week, weekIdx) =>
              week.map((day, dayIdx) =>
                day ? (
                  <span
                    key={day.date}
                    role="img"
                    tabIndex={0}
                    data-level={day.level}
                    aria-label={formatContributionDay(day)}
                    className="lg-matrix-cell"
                    onMouseEnter={() => setHoveredDay(day)}
                    onFocus={() => setHoveredDay(day)}
                    onBlur={() => setHoveredDay(null)}
                  />
                ) : (
                  <span
                    key={`empty-${weekIdx}-${dayIdx}`}
                    className="lg-matrix-spacer"
                    aria-hidden="true"
                  />
                ),
              ),
            )}
          </div>

          {/* Calm Footer: Hovered day tooltip OR Repo + Mumbai IST time */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-black/[0.06] dark:border-white/[0.08] text-[11px] min-h-[24px]">
            {hoveredDay ? (
              <span className="font-medium text-[var(--lg-text-primary)] truncate">
                {formatContributionDay(hoveredDay)}
              </span>
            ) : (
              <>
                <a
                  href={pulse.latestRepo?.url || pulse.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 font-medium text-[var(--lg-text-secondary)] hover:text-[var(--lg-text-primary)] truncate group"
                  title={`Latest repo: ${pulse.latestRepo?.name}`}
                >
                  <span className="truncate">{pulse.latestRepo?.name}</span>
                  <ArrowUpRight className="size-3 shrink-0 opacity-65 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
                <span className="text-[10.5px] font-medium tabular-nums text-[var(--lg-text-muted)] shrink-0">
                  Mumbai · {mumbaiTime} IST
                </span>
              </>
            )}
          </div>
        </article>
      </DraggableWidgetRail>
    </aside>
  );
};

export default DesktopWidgets;
