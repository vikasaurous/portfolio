import { useEffect, useState } from 'react';
import { Lock, ExternalLink, ChevronLeft, Home, Copy, Check } from 'lucide-react';
import useSafariStore, { selectCanGoBack } from '#store/safari';

// ─── EmbeddedSiteNotice ───────────────────────────────────────────────────────
//
// Shown instead of ErrorView when a URL belongs to a known non-embeddable domain.
// Designed to match macOS Sonoma Safari's native "page can't be displayed" feel:
//   • Glassmorphism card with blur background
//   • Favicon via Google's public favicon service
//   • Apple-style language — no "error", no "blocked", no "failed"
//   • Smooth scale + opacity mount animation (CSS keyframes, zero deps)
//   • Primary CTA: "Open in New Tab" → window.open
//   • Secondary: Copy Link, Go Back, Return Home
// ──────────────────────────────────────────────────────────────────────────────

// ─── Safari compass icon (SVG inline, no img request) ─────────────────────────
const SafariCompassIcon = ({ pulse }) => (
  <div
    style={{
      animation: pulse ? 'safari-icon-pulse 2s ease-in-out infinite' : 'none',
    }}
    className="relative"
  >
    <svg
      width="72"
      height="72"
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Blue gradient background circle */}
      <defs>
        <linearGradient id="safari-bg" x1="0" y1="0" x2="72" y2="72" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34aadc" />
          <stop offset="100%" stopColor="#1a7fba" />
        </linearGradient>
        <linearGradient id="safari-needle-red" x1="36" y1="16" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ff453a" />
          <stop offset="100%" stopColor="#d62828" />
        </linearGradient>
        <filter id="safari-shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Circle background */}
      <rect width="72" height="72" rx="16" fill="url(#safari-bg)" />

      {/* Outer compass ring */}
      <circle cx="36" cy="36" r="22" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" fill="none" />

      {/* Inner circle */}
      <circle cx="36" cy="36" r="18" fill="rgba(255,255,255,0.12)" />

      {/* Compass needle — north (red) */}
      <polygon
        points="36,16 33,36 36,33 39,36"
        fill="url(#safari-needle-red)"
        filter="url(#safari-shadow)"
      />
      {/* Compass needle — south (white) */}
      <polygon
        points="36,56 33,36 36,39 39,36"
        fill="rgba(255,255,255,0.9)"
        filter="url(#safari-shadow)"
      />

      {/* Cardinal dots */}
      {[
        [36, 17.5],  // N
        [36, 54.5],  // S
        [17.5, 36],  // W
        [54.5, 36],  // E
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="1.5" fill="rgba(255,255,255,0.6)" />
      ))}
    </svg>
  </div>
);

// ─── Favicon component ────────────────────────────────────────────────────────
const SiteFavicon = ({ url }) => {
  const [loaded, setLoaded] = useState(false);
  let hostname = '';
  try { hostname = new URL(url).hostname; } catch { /* invalid URL fallback */ }

  if (!hostname) return null;

  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`}
      alt=""
      aria-hidden="true"
      onLoad={() => setLoaded(true)}
      className="w-5 h-5 rounded-sm"
      style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.2s' }}
    />
  );
};

// ─── Action Button components ─────────────────────────────────────────────────
const PrimaryButton = ({ onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className="
      flex items-center justify-center gap-2
      w-full px-5 py-2.5
      bg-[#0a84ff] hover:bg-[#0071e3] active:bg-[#005bb5]
      text-white text-[13px] font-semibold rounded-full
      transition-all duration-150 cursor-pointer
      shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_4px_14px_rgba(10,132,255,0.38)]
      hover:-translate-y-px active:translate-y-0
    "
    aria-label="Open in new tab"
  >
    <ExternalLink className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />
    {children}
  </button>
);

const SecondaryButton = ({ onClick, icon, children, id }) => {
  const Icon = icon;
  return (
    <button
      type="button"
      id={id}
      onClick={onClick}
      className="lg-pill px-4 py-2 text-[12px] font-medium cursor-pointer"
    >
      <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
      {children}
    </button>
  );
};

function copyViaExecCommand(text) {
  try {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.focus();
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  } catch { /* ignore clipboard fallback errors */ }
}

// ─── Main Component ───────────────────────────────────────────────────────────
const EmbeddedSiteNotice = ({ url }) => {
  const goBack    = useSafariStore((s) => s.goBack);
  const goHome    = useSafariStore((s) => s.goHome);
  const canGoBack = useSafariStore(selectCanGoBack);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [iconPulse, setIconPulse] = useState(false);

  // Staggered mount: slight delay so the parent's fade-in is already underway
  useEffect(() => {
    const t1 = setTimeout(() => setMounted(true), 30);
    const t2 = setTimeout(() => setIconPulse(true), 600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  let hostname = '';
  let isHttps = false;
  try {
    const parsed = new URL(url);
    hostname = parsed.hostname;
    isHttps = parsed.protocol === 'https:';
  } catch { /* ignore malformed URL */ }

  const handleCopy = () => {
    const markCopied = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(markCopied).catch(() => {
        copyViaExecCommand(url);
        markCopied();
      });
    } else {
      copyViaExecCommand(url);
      markCopied();
    }
  };

  return (
    <>
      {/* Keyframes injected once */}
      <style>{`
        @keyframes safari-notice-in {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes safari-icon-pulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(52,170,220,0)); }
          50%       { transform: scale(1.06); filter: drop-shadow(0 0 8px rgba(52,170,220,0.5)); }
        }
        @keyframes safari-bg-shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
      `}</style>

      {/* Full-area container on tiered glass */}
      <div
        className="
          absolute inset-0 flex items-center justify-center
          bg-transparent
        "
        style={{
          opacity: mounted ? 1 : 0,
          transition: 'opacity 0.35s ease',
        }}
      >
        {/* Card */}
        <div
          className="
            lg-popover relative w-[380px] max-w-[92vw]
            rounded-[22px]
            overflow-hidden
          "
          style={{
            animation: mounted ? 'safari-notice-in 0.32s cubic-bezier(0.22,1,0.36,1) forwards' : 'none',
          }}
          role="region"
          aria-label="Page can't be displayed"
        >
          {/* Subtle glass reflection at top */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
            }}
            aria-hidden="true"
          />

          {/* Content */}
          <div className="px-8 py-8 flex flex-col items-center text-center">

            {/* Safari icon */}
            <div className="mb-5">
              <SafariCompassIcon pulse={iconPulse} />
            </div>

            {/* Title */}
            <h2
              className="
                text-[17px] font-semibold leading-snug
                text-gray-900 dark:text-gray-50
                mb-3
              "
              style={{ letterSpacing: '-0.01em' }}
            >
              This page can't be displayed in Safari
            </h2>

            {/* Subtitle */}
            <p className="text-[13px] leading-[1.55] text-gray-600 dark:text-gray-300/80 mb-6 max-w-[300px]">
              This website prevents itself from being opened inside embedded
              browsers. This is a security policy defined by the website, not
              an issue with your device.
            </p>

            {/* Site info strip */}
            <div
              className="
                w-full mb-6 rounded-xl overflow-hidden
                divide-y divide-black/[0.06] dark:divide-white/[0.07]
                border border-black/[0.07] dark:border-white/[0.08]
                bg-black/[0.03] dark:bg-white/[0.05]
              "
            >
              {/* URL row */}
              <div className="flex items-center gap-2.5 px-4 py-2.5">
                <SiteFavicon url={url} />
                <span className="flex-1 text-[11.5px] text-gray-500 dark:text-gray-400 truncate font-mono text-left">
                  {url}
                </span>
              </div>

              {/* Domain row */}
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">Domain</span>
                <span className="text-[12px] text-gray-700 dark:text-gray-300 font-medium">{hostname}</span>
              </div>

              {/* Connection row */}
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">Connection</span>
                <span className="flex items-center gap-1.5 text-[12px] font-medium">
                  {isHttps ? (
                    <>
                      <Lock className="w-3 h-3 text-green-500" strokeWidth={2.5} />
                      <span className="text-green-600 dark:text-green-400">HTTPS Secure</span>
                    </>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">HTTP</span>
                  )}
                </span>
              </div>
            </div>

            {/* Primary CTA */}
            <div className="w-full mb-3">
              <PrimaryButton onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}>
                Open in New Tab
              </PrimaryButton>
            </div>

            {/* Secondary actions */}
            <div className="flex items-center gap-2 w-full justify-center">
              <SecondaryButton
                id="safari-notice-copy"
                onClick={handleCopy}
                icon={copied ? Check : Copy}
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </SecondaryButton>

              <SecondaryButton
                id="safari-notice-back"
                onClick={() => canGoBack ? goBack() : goHome()}
                icon={ChevronLeft}
              >
                Go Back
              </SecondaryButton>

              <SecondaryButton
                id="safari-notice-home"
                onClick={goHome}
                icon={Home}
              >
                Home
              </SecondaryButton>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmbeddedSiteNotice;
