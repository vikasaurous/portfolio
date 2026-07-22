import { useEffect, useRef, useCallback } from 'react';
import useSafariStore from '#store/safari';
import useWindowStore from '#store/window';
import Toolbar from './components/Toolbar';
import BrowserView from './components/BrowserView';

const SafariBrowser = () => {
  const toolbarRef  = useRef(null);
  const { windows } = useWindowStore();
  const goBack      = useSafariStore((s) => s.goBack);
  const goForward   = useSafariStore((s) => s.goForward);
  const reload      = useSafariStore((s) => s.reload);
  const stopLoading = useSafariStore((s) => s.stopLoading);

  // ── Keyboard shortcuts — active only when Safari has focus ─────────────────
  const handleKeyDown = useCallback((e) => {
    // Guard: only intercept when Safari is open and topmost
    if (!windows.safari?.isOpen) return;

    const isMac = /Mac|iPhone|iPad/.test(navigator.platform ?? '');
    const ctrl  = isMac ? e.metaKey : e.ctrlKey;

    // Cmd/Ctrl + L → focus address bar
    if (ctrl && e.key === 'l') {
      e.preventDefault();
      toolbarRef.current?.focusAddress();
      return;
    }

    // Cmd/Ctrl + R → reload
    if (ctrl && e.key === 'r') {
      e.preventDefault();
      reload();
      return;
    }

    // Alt + ← → back
    if (e.altKey && e.key === 'ArrowLeft') {
      e.preventDefault();
      goBack();
      return;
    }

    // Alt + → → forward
    if (e.altKey && e.key === 'ArrowRight') {
      e.preventDefault();
      goForward();
      return;
    }

    // Esc → stop loading
    if (e.key === 'Escape') {
      stopLoading();
    }
  }, [windows.safari?.isOpen, goBack, goForward, reload, stopLoading]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      <Toolbar ref={toolbarRef} />
      <BrowserView />
    </div>
  );
};

export default SafariBrowser;
