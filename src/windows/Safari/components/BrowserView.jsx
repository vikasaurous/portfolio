import { useRef, useEffect, useCallback, useState, lazy, Suspense } from 'react';
import useSafariStore, { getActiveTab } from '#store/safari';
import LoadingBar from './LoadingBar';
import StartPage from './StartPage';
import ErrorView from './ErrorView';
import { isBlockedDomain } from '../config/blockedDomains';

// ── Lazy-load EmbeddedSiteNotice — zero bundle cost until first use ───────────
const EmbeddedSiteNotice = lazy(() => import('./EmbeddedSiteNotice'));

// ── Pre-flight check ──────────────────────────────────────────────────────────
// Before mounting the iframe, do a no-CORS HEAD request.
// If the request fails → DNS / network error → show ErrorView immediately.
// This catches ERR_NAME_NOT_RESOLVED and connection refused.
//
// NOTE: Known blocked domains (github.com, etc.) are intercepted BEFORE this
// runs via isBlockedDomain(). The preflight only runs for unknown domains.
// ──────────────────────────────────────────────────────────────────────────────

async function preflight(url) {
  try {
    await fetch(url, { method: 'HEAD', mode: 'no-cors', signal: AbortSignal.timeout(6000) });
    return 'ok';
  } catch (err) {
    if (err.name === 'TimeoutError') return 'timeout';
    return 'error';
  }
}

// ── macOS Safari loading sequence for blocked domains ─────────────────────────
// Runs the 3-phase status bar animation that mimics native Safari's connection
// feedback, then resolves so the caller can show EmbeddedSiteNotice.
//
// Returns a cleanup function that cancels the sequence if the component unmounts
// or the URL changes before it finishes.
// ──────────────────────────────────────────────────────────────────────────────

const LOADING_PHASES = [
  { msg: 'Connecting securely…',                                           delay: 0   },
  { msg: 'Checking website permissions…',                                  delay: 800 },
  { msg: 'This website doesn\'t allow being displayed inside another application.', delay: 1600 },
];

function runBlockedSequence(onPhase, onComplete) {
  const timers = [];

  LOADING_PHASES.forEach(({ msg, delay }) => {
    timers.push(setTimeout(() => onPhase(msg), delay));
  });

  // After the final message has shown for ~500ms, complete → fade in card
  timers.push(setTimeout(onComplete, 1600 + 500));

  return () => timers.forEach(clearTimeout);
}

// ─── BrowserView ──────────────────────────────────────────────────────────────

const BrowserView = () => {
  const tab        = useSafariStore(getActiveTab);
  const setStatus  = useSafariStore((s) => s.setStatus);
  const iframeRef  = useRef(null);
  const timeoutRef = useRef(null);

  // ── Local state for the blocked-domain animation flow ─────────────────────
  // Kept local to avoid polluting the Zustand store with UI-only state.
  const [statusMsg, setStatusMsg]     = useState('');   // status-bar overlay text
  const [showNotice, setShowNotice]   = useState(false); // show EmbeddedSiteNotice

  // ── Reset notice when URL changes ─────────────────────────────────────────
  useEffect(() => {
    setShowNotice(false);
    setStatusMsg('');
  }, [tab?.url, tab?.reloadKey]);

  // ── Blocked-domain detection — fires first, before any iframe work ─────────
  useEffect(() => {
    if (!tab?.url || tab.status !== 'loading') return;
    if (!isBlockedDomain(tab.url)) return;   // not blocked — normal iframe flow

    // Run the macOS loading sequence
    const cancel = runBlockedSequence(
      (msg) => setStatusMsg(msg),
      () => {
        // Tell the store to finish "loading" → LoadingBar completes its fill
        setStatus('error');
        setStatusMsg('');
        // Small delay so the LoadingBar fade-out starts before card appears
        setTimeout(() => setShowNotice(true), 180);
      },
    );

    return cancel;
  }, [tab?.url, tab?.reloadKey, tab?.status, setStatus]);

  // ── Pre-flight on every new navigation (non-blocked domains only) ──────────
  useEffect(() => {
    if (!tab?.url || tab.status !== 'loading') return;
    if (isBlockedDomain(tab.url)) return;    // handled above

    let cancelled = false;
    preflight(tab.url).then((result) => {
      if (cancelled) return;
      if (result === 'error') setStatus('error');
    });

    return () => { cancelled = true; };
  }, [tab?.url, tab?.reloadKey, tab?.status, setStatus]);

  // ── Hard timeout (non-blocked domains only) ────────────────────────────────
  useEffect(() => {
    if (isBlockedDomain(tab?.url)) return;   // blocked sequence handles its own timing
    if (tab?.status === 'loading') {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setStatus('error'), 5_000);
    }
    return () => clearTimeout(timeoutRef.current);
  }, [tab?.status, tab?.reloadKey, tab?.url, setStatus]);

  // ── Iframe event handlers ─────────────────────────────────────────────────
  const handleLoad = useCallback(() => {
    clearTimeout(timeoutRef.current);
    const iframe = iframeRef.current;
    if (!iframe) return;

    try {
      const loc = iframe.contentWindow?.location?.href;
      if (!loc || loc === 'about:blank') {
        setStatus('error');
      } else {
        setStatus('loaded');
      }
    } catch {
      // SecurityError → cross-origin content loaded (real page)
      setStatus('loaded');
    }
  }, [setStatus]);

  const handleError = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setStatus('error');
  }, [setStatus]);

  if (!tab) return null;

  const showStart   = !tab.url;
  const isBlocked   = isBlockedDomain(tab.url);
  // During the blocked animation, status is still 'loading'.
  // After the sequence, status becomes 'error' and showNotice=true.
  const showError   = tab.status === 'error' && !isBlocked && !showNotice;
  const showFrame   = !showStart && !showError && !isBlocked;

  return (
    <div className="safari-content">
      <LoadingBar status={tab.status} />

      {showStart && <StartPage />}
      {showError  && <ErrorView url={tab.url} />}

      {/* ── Blocked domain: macOS-native information screen ── */}
      {isBlocked && showNotice && (
        <Suspense fallback={null}>
          <EmbeddedSiteNotice url={tab.url} />
        </Suspense>
      )}

      {/* ── Status bar overlay — visible only during blocked loading sequence ── */}
      {isBlocked && !showNotice && statusMsg && (
        <div
          aria-live="polite"
          aria-label={statusMsg}
          className="
            absolute bottom-3 left-1/2 -translate-x-1/2
            px-3 py-1.5
            bg-black/60 dark:bg-black/75
            backdrop-blur-md
            rounded-full
            text-[11px] text-white/90
            pointer-events-none select-none
            transition-all duration-300
            z-40
          "
          style={{
            opacity: statusMsg ? 1 : 0,
            transform: statusMsg
              ? 'translateX(-50%) translateY(0)'
              : 'translateX(-50%) translateY(6px)',
          }}
        >
          {statusMsg}
        </div>
      )}

      {/* ── iframe — never mounted for blocked domains ── */}
      {tab.url && !isBlocked && (
        <iframe
          key={tab.reloadKey}
          ref={iframeRef}
          src={tab.url}
          title={tab.title || 'Safari'}
          className="w-full h-full border-0"
          style={{ display: showFrame ? 'block' : 'none' }}
          onLoad={handleLoad}
          onError={handleError}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          referrerPolicy="no-referrer-when-downgrade"
          aria-label={`Web page: ${tab.title}`}
        />
      )}
    </div>
  );
};

export default BrowserView;
