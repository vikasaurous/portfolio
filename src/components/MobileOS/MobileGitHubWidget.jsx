import { useCallback, useEffect, useState } from "react";
import { RefreshCw, ArrowUpRight, GitBranch } from "lucide-react";
import useWidgetStore from "#store/widgets";
import {
  FALLBACK_GITHUB_MATRIX,
  fetchGitHubPulse,
  formatContributionDay,
  getMumbaiTimeLabel,
} from "../../utils/githubPulse";

const MobileGitHubWidget = () => {
  const showWidgets = useWidgetStore((s) => s.showWidgets);
  const [matrix, setMatrix] = useState(FALLBACK_GITHUB_MATRIX);
  const [syncing, setSyncing] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [mumbaiTime, setMumbaiTime] = useState(getMumbaiTimeLabel);

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

    const timer = setInterval(() => setMumbaiTime(getMumbaiTimeLabel()), 30000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [showWidgets]);

  if (!showWidgets) return null;

  const statusLabel =
    matrix.source === "live"
      ? "Live"
      : matrix.source === "cached"
        ? "Synced"
        : "Offline";

  return (
    <section
      aria-label="12-Week GitHub Activity"
      className="ios-widget-card w-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <a
          href={matrix.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 min-w-0"
        >
          <span className="lg-widget-badge shrink-0" aria-hidden="true">
            <GitBranch className="size-3.5" />
          </span>
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="text-[13px] font-semibold tabular-nums text-[var(--lg-text-primary)]">
              {matrix.total12Weeks} commits
            </span>
            <span className="text-[11px] font-medium text-[var(--lg-text-muted)]">
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
            aria-label="Refresh GitHub activity"
            className="lg-icon-btn"
          >
            <RefreshCw className={`size-3.5 ${syncing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* 12x7 Contribution Matrix (tappable for touch inspection) */}
      <div className="lg-matrix-grid mb-3" role="group" aria-label="12-week daily commit heatmap">
        {matrix.weeks.flatMap((week, weekIdx) =>
          week.map((day, dayIdx) =>
            day ? (
              <button
                key={day.date}
                type="button"
                data-level={day.level}
                aria-label={formatContributionDay(day)}
                aria-pressed={selectedDay?.date === day.date}
                className={`lg-matrix-cell border-0 p-0 cursor-pointer ${
                  selectedDay?.date === day.date ? "ios-matrix-selected" : ""
                }`}
                onClick={() =>
                  setSelectedDay((prev) => (prev?.date === day.date ? null : day))
                }
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

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-black/[0.06] dark:border-white/[0.08] text-[11px] min-h-[24px]">
        {selectedDay ? (
          <button
            type="button"
            onClick={() => setSelectedDay(null)}
            className="font-medium text-[var(--lg-text-primary)] truncate bg-transparent border-0 p-0 text-left cursor-pointer"
          >
            {formatContributionDay(selectedDay)}
          </button>
        ) : (
          <>
            <a
              href={matrix.latestRepo?.url || matrix.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 font-medium text-[var(--lg-text-secondary)] truncate"
            >
              <span className="truncate">{matrix.latestRepo?.name}</span>
              <ArrowUpRight className="size-3 shrink-0 opacity-70" />
            </a>
            <span className="text-[10.5px] font-medium tabular-nums text-[var(--lg-text-muted)] shrink-0">
              Mumbai · {mumbaiTime} IST
            </span>
          </>
        )}
      </div>
    </section>
  );
};

export default MobileGitHubWidget;
