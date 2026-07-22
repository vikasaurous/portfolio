import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { WindowControl } from '#components';
import useSafariStore, { getActiveTab, getDomain, selectCanGoBack, selectCanGoForward } from '#store/safari';
import { ChevronLeft, ChevronRight, RotateCw, X, Globe, Lock, Home } from 'lucide-react';

// ─── NavButton ────────────────────────────────────────────────────────────────

const NavButton = ({ icon: Icon, onClick, disabled, title }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    aria-label={title}
    className="w-7 h-7 flex items-center justify-center rounded-md text-[#555] dark:text-gray-400 hover:bg-black/[0.07] dark:hover:bg-white/[0.07] disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
  >
    <Icon className="w-4 h-4" strokeWidth={2} />
  </button>
);

// ─── Toolbar — forwarded ref exposes focusAddress() ───────────────────────────

const Toolbar = forwardRef((_, ref) => {
  const tab        = useSafariStore(getActiveTab);
  const canBack    = useSafariStore(selectCanGoBack);
  const canForward = useSafariStore(selectCanGoForward);
  const openUrl    = useSafariStore((s) => s.openUrl);
  const goBack     = useSafariStore((s) => s.goBack);
  const goForward  = useSafariStore((s) => s.goForward);
  const goHome     = useSafariStore((s) => s.goHome);
  const reload     = useSafariStore((s) => s.reload);
  const stopLoading = useSafariStore((s) => s.stopLoading);

  const [draft, setDraft]         = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef                  = useRef(null);

  // Expose focusAddress() to SafariBrowser for Cmd+L shortcut
  useImperativeHandle(ref, () => ({
    focusAddress: () => {
      inputRef.current?.focus();
      inputRef.current?.select();
    },
  }));

  const isLoading  = tab?.status === 'loading';
  const isSecure   = tab?.url?.startsWith('https://');
  const displayUrl = isFocused ? draft : (tab?.url ? getDomain(tab.url) || tab.url : '');

  const handleFocus = () => {
    setIsFocused(true);
    setDraft(tab?.url ?? '');
    // Defer select so the value is set first
    requestAnimationFrame(() => inputRef.current?.select());
  };

  const handleBlur = () => {
    setIsFocused(false);
    setDraft('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      openUrl(draft);
      inputRef.current?.blur();
    }
    if (e.key === 'Escape') {
      inputRef.current?.blur();
    }
  };

  const handleReloadStop = () => {
    if (isLoading) stopLoading();
    else reload();
  };

  return (
    <div className="safari-toolbar" data-drag-handle>

      {/* ── Traffic lights ── */}
      <WindowControl target="safari" />

      {/* ── Back / Forward / Home ── */}
      <div className="flex items-center gap-0.5 ml-1">
        <NavButton icon={ChevronLeft}  onClick={goBack}    disabled={!canBack}    title="Go Back (Alt+←)"    />
        <NavButton icon={ChevronRight} onClick={goForward} disabled={!canForward} title="Go Forward (Alt+→)"  />
        <NavButton icon={Home}         onClick={goHome}    disabled={!tab?.url}   title="Home"               />
      </div>

      {/* ── Address pill ── */}
      <div
        className={[
          'safari-address-bar',
          isFocused ? 'ring-2 ring-blue-500/40 border-blue-400/60 dark:border-blue-500/60' : '',
        ].join(' ')}
        onClick={() => inputRef.current?.focus()}
        role="none"
      >
        {/* Lock / Globe icon */}
        <span className="text-gray-400 dark:text-gray-500 shrink-0 flex items-center" aria-hidden>
          {isSecure && !isFocused
            ? <Lock  className="w-3 h-3"   strokeWidth={2} />
            : <Globe className="w-3.5 h-3.5" strokeWidth={1.8} />
          }
        </span>

        <input
          ref={inputRef}
          type="text"
          value={displayUrl}
          onChange={(e) => setDraft(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="Search or enter website name"
          className="flex-1 min-w-0 bg-transparent outline-none text-[13px] text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          aria-label="Address bar"
        />

        {/* Clear button — only when focused with content */}
        {isFocused && draft && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()} // keep input focused
            onClick={() => setDraft('')}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 shrink-0 cursor-pointer"
            aria-label="Clear address"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ── Reload / Stop ── */}
      <NavButton
        icon={isLoading ? X : RotateCw}
        onClick={handleReloadStop}
        disabled={!tab?.url && !isLoading}
        title={isLoading ? 'Stop (Esc)' : 'Reload (⌘R)'}
      />
    </div>
  );
});

Toolbar.displayName = 'SafariToolbar';
export default Toolbar;
