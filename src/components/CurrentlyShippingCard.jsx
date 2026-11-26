import { ArrowUpRight, GitCommitHorizontal } from "lucide-react";
import { formatRelativeTime, getLanguageColor } from "../utils/githubPulse";

const CurrentlyShippingCard = ({ pulse, compact = false }) => {
  const repo = pulse?.latestRepo;
  const commit = pulse?.latestCommit;
  const relativeTime = formatRelativeTime(commit?.date || repo?.pushedAt);
  const langColor = getLanguageColor(repo?.language);

  return (
    <div>
      {/* Header */}
      <div className={`flex items-center justify-between gap-2 ${compact ? "mb-2" : "mb-2.5"}`}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="lg-widget-badge lg-widget-badge-sky shrink-0" aria-hidden="true">
            <GitCommitHorizontal className="size-3.5" />
          </span>
          <span className="text-[12.5px] font-semibold tracking-tight text-[var(--lg-text-primary)] truncate">
            Currently Shipping
          </span>
        </div>

        <span className="lg-widget-status shrink-0">
          <span
            className={`size-1.5 rounded-full ${
              pulse?.source === "offline"
                ? "bg-amber-400"
                : "bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.8)]"
            }`}
          />
          {relativeTime || (pulse?.source === "offline" ? "Offline" : "Active")}
        </span>
      </div>

      {/* Repo + Primary Language */}
      <div className="flex items-center justify-between gap-2 mb-2 min-w-0">
        <a
          href={repo?.url || pulse?.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 min-w-0 font-semibold text-[13.5px] text-[var(--lg-text-primary)] hover:underline group"
          title={`Open ${repo?.name || "repository"} on GitHub`}
        >
          <span className="truncate">{repo?.name || "portfolio"}</span>
          <ArrowUpRight className="size-3.5 shrink-0 opacity-65 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </a>

        {repo?.language && (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[var(--lg-text-secondary)] shrink-0">
            <span
              className="size-2 rounded-full shrink-0"
              style={{ backgroundColor: langColor }}
              aria-hidden="true"
            />
            {repo.language}
          </span>
        )}
      </div>

      {/* Latest Commit Message */}
      <a
        href={commit?.url || repo?.url || pulse?.profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="lg-shipping-commit group"
        title="View latest commit on GitHub"
      >
        <p className="flex-1 min-w-0 text-[11.5px] leading-snug text-[var(--lg-text-secondary)] group-hover:text-[var(--lg-text-primary)] line-clamp-2 break-words transition-colors">
          {commit?.message || "Shipping portfolio updates"}
        </p>

        {commit?.sha && (
          <span className="text-[10px] font-mono font-medium text-[var(--lg-text-muted)] shrink-0 pt-0.5">
            {commit.sha}
          </span>
        )}
      </a>
    </div>
  );
};

export default CurrentlyShippingCard;
