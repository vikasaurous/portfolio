import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { RefreshCw, ArrowUpRight, GitBranch } from "lucide-react";
import useWidgetStore from "#store/widgets";
import useWindowStore, { selectHasOpenWindow } from "#store/window";
import {
  FALLBACK_GITHUB_MATRIX,
  fetchGitHubPulse,
  formatContributionDay,
  getMumbaiTimeLabel,
} from "../../utils/githubPulse";

const WIDGET_WIDTH = 304;
const EDGE_PADDING = 20;
const RIGHT_MARGIN = 26;
const BOTTOM_MARGIN = 30;
const DRAG_THRESHOLD = 5;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function getDesktopBounds(el) {
  const nav = document.querySelector("nav");
  const navBottom = nav ? Math.ceil(nav.getBoundingClientRect().bottom) : 44;
  const width = el?.offsetWidth || WIDGET_WIDTH;
  const height = el?.offsetHeight || 226;

  return {
    minX: EDGE_PADDING,
    maxX: Math.max(EDGE_PADDING, window.innerWidth - width - EDGE_PADDING),
    minY: navBottom + 12,
    maxY: Math.max(navBottom + 12, window.innerHeight - height - EDGE_PADDING),
  };
}

const DesktopWidgets = () => {
  const showWidgets = useWidgetStore((s) => s.showWidgets);
  const storedPosition = useWidgetStore((s) => s.position);
  const setWidgetPosition = useWidgetStore((s) => s.setWidgetPosition);
  const hasOpenWindow = useWindowStore(selectHasOpenWindow);

  const [matrix, setMatrix] = useState(FALLBACK_GITHUB_MATRIX);
  const [syncing, setSyncing] = useState(true);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [mumbaiTime, setMumbaiTime] = useState(getMumbaiTimeLabel);
  const [dragging, setDragging] = useState(false);
  const [computedPos, setComputedPos] = useState(null);

  const cardRef = useRef(null);
  const dragRef = useRef(null);

  const loadMatrix = useCallback(async (force = false) => {
    setSyncing(true);
    const result = await fetchGitHubPulse({ force });
    setMatrix(result);
    setSyncing(false);
  }, []);

  useEffect(() => {
    if (!showWidgets) return;
    let active = true;

    fetchGitHubPulse().then((result) => {
      if (!active) return;
      setMatrix(result);
      setSyncing(false);
    });

    const clockTimer = setInterval(() => {
      setMumbaiTime(getMumbaiTimeLabel());
    }, 30000);

    return () => {
      active = false;
      clearInterval(clockTimer);
    };
  }, [showWidgets]);

  // Compute safe default position & clamp persisted position inside desktop bounds
  useLayoutEffect(() => {
    if (!showWidgets) return;

    const layout = () => {
      const el = cardRef.current;
      if (!el) return;

      const bounds = getDesktopBounds(el);
      const height = el.offsetHeight || 226;
      const defaultPos = {
        x: clamp(window.innerWidth - WIDGET_WIDTH - RIGHT_MARGIN, bounds.minX, bounds.maxX),
        y: clamp(window.innerHeight - height - BOTTOM_MARGIN, bounds.minY, bounds.maxY),
      };

      const saved = useWidgetStore.getState().position;
      setComputedPos(
        saved
          ? {
              x: clamp(saved.x, bounds.minX, bounds.maxX),
              y: clamp(saved.y, bounds.minY, bounds.maxY),
            }
          : defaultPos,
      );
    };

    layout();
    window.addEventListener("resize", layout);
    return () => window.removeEventListener("resize", layout);
  }, [showWidgets, storedPosition]);

  const handlePointerDown = (e) => {
    if (e.button !== 0) return;
    if (e.target.closest("a, button, [data-no-drag]")) return;

    const el = cardRef.current;
    if (!el) return;

    const bounds = getDesktopBounds(el);
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
      setWidgetPosition({ x: drag.x, y: drag.y });
    }
  };

  if (!showWidgets) return null;

  const statusLabel =
    matrix.source === "live"
      ? "Live"
      : matrix.source === "cached"
        ? "Synced"
        : "Offline";

  return (
    <aside
      id="desktop-widgets"
      aria-label="12-Week GitHub Activity Widget"
      className="fixed inset-0 z-10 pointer-events-none max-md:hidden"
    >
      <article
        ref={cardRef}
        aria-label="12-Week GitHub Commit Activity"
        className={[
          "lg-widget",
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
        {/* ── Header: Commit count + live dot + refresh ───────────────────── */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <a
            href={matrix.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 min-w-0 group"
            title={`Open @${matrix.username} on GitHub`}
          >
            <span className="lg-widget-badge shrink-0" aria-hidden="true">
              <GitBranch className="size-3.5" />
            </span>
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="text-[13px] font-semibold tabular-nums tracking-tight text-[var(--lg-text-primary)] group-hover:underline">
                {matrix.total12Weeks} commits
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
                  matrix.source === "offline"
                    ? "bg-amber-400"
                    : "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.75)]"
                }`}
              />
              {statusLabel}
            </span>
            <button
              type="button"
              onClick={() => loadMatrix(true)}
              title="Refresh GitHub activity"
              aria-label="Refresh GitHub activity"
              className="lg-icon-btn !w-6 !h-6"
            >
              <RefreshCw className={`size-3 ${syncing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* ── Focal Visual: 12×7 Contribution Matrix ──────────────────────── */}
        <div
          className="lg-matrix-grid mb-3"
          role="group"
          aria-label="12-week daily commit heatmap"
          onMouseLeave={() => setHoveredDay(null)}
        >
          {matrix.weeks.flatMap((week, weekIdx) =>
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

        {/* ── Calm Footer: Hovered day tooltip OR Repo + Mumbai IST time ──── */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-black/[0.06] dark:border-white/[0.08] text-[11px] min-h-[24px]">
          {hoveredDay ? (
            <span className="font-medium text-[var(--lg-text-primary)] truncate">
              {formatContributionDay(hoveredDay)}
            </span>
          ) : (
            <>
              <a
                href={matrix.latestRepo?.url || matrix.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 font-medium text-[var(--lg-text-secondary)] hover:text-[var(--lg-text-primary)] truncate group"
                title={`Latest repo: ${matrix.latestRepo?.name}`}
              >
                <span className="truncate">{matrix.latestRepo?.name}</span>
                <ArrowUpRight className="size-3 shrink-0 opacity-65 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
              <span className="text-[10.5px] font-medium tabular-nums text-[var(--lg-text-muted)] shrink-0">
                Mumbai · {mumbaiTime} IST
              </span>
            </>
          )}
        </div>
      </article>
    </aside>
  );
};

export default DesktopWidgets;
