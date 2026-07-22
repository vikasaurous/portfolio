import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// ─── Utilities ────────────────────────────────────────────────────────────────

const genId = () => Math.random().toString(36).slice(2, 9);

export const normalizeUrl = (raw) => {
  if (!raw) return '';
  const s = raw.trim();
  if (!s) return '';
  if (s.startsWith('mailto:') || s.startsWith('tel:')) return s;
  if (/^https?:\/\//i.test(s)) return s;
  // Looks like a domain (has dot, no spaces)
  if (!s.includes(' ') && s.includes('.')) return `https://${s}`;
  // Treat as Google search
  return `https://www.google.com/search?q=${encodeURIComponent(s)}`;
};

export const getDomain = (url) => {
  try { return new URL(url).hostname.replace(/^www\./, ''); }
  catch { return url || ''; }
};

// ─── Tab factory ──────────────────────────────────────────────────────────────

const makeTab = (url = '', title = '') => ({
  id: genId(),
  url,
  title: title || (url ? getDomain(url) : 'New Tab'),
  history: url ? [url] : [],
  historyIndex: url ? 0 : -1,
  status: 'idle',    // 'idle' | 'loading' | 'loaded' | 'error'
  reloadKey: 0,      // incremented to force iframe remount
});

const _defaultTab = makeTab();

// ─── Selectors ────────────────────────────────────────────────────────────────

export const getActiveTab = (s) =>
  s.tabs.find((t) => t.id === s.activeTabId) ?? s.tabs[0] ?? null;

export const selectCanGoBack = (s) => {
  const t = s.tabs.find((x) => x.id === s.activeTabId) ?? s.tabs[0];
  return !!t && t.historyIndex > 0;
};

export const selectCanGoForward = (s) => {
  const t = s.tabs.find((x) => x.id === s.activeTabId) ?? s.tabs[0];
  return !!t && t.historyIndex < t.history.length - 1;
};

// ─── Store ────────────────────────────────────────────────────────────────────

const useSafariStore = create(
  persist(
    immer((set) => ({
      // Tab-ready architecture: array of tabs + active tab pointer
      tabs: [_defaultTab],
      activeTabId: _defaultTab.id,

      // Navigate the active tab to a URL
      openUrl: (rawUrl) => set((d) => {
        const url = normalizeUrl(rawUrl);
        if (!url) return;
        const tab = d.tabs.find((t) => t.id === d.activeTabId) ?? d.tabs[0];
        if (!tab) return;
        // Truncate forward history if we branched from the middle
        if (tab.historyIndex < tab.history.length - 1) {
          tab.history = tab.history.slice(0, tab.historyIndex + 1);
        }
        tab.history.push(url);
        tab.historyIndex = tab.history.length - 1;
        tab.url = url;
        tab.status = 'loading';
        tab.title = getDomain(url) || 'Loading…';
        tab.reloadKey = (tab.reloadKey || 0) + 1;
      }),

      goBack: () => set((d) => {
        const tab = d.tabs.find((t) => t.id === d.activeTabId) ?? d.tabs[0];
        if (!tab || tab.historyIndex <= 0) return;
        tab.historyIndex -= 1;
        tab.url = tab.history[tab.historyIndex];
        tab.status = 'loading';
        tab.title = getDomain(tab.url) || 'Loading…';
        tab.reloadKey = (tab.reloadKey || 0) + 1;
      }),

      goForward: () => set((d) => {
        const tab = d.tabs.find((t) => t.id === d.activeTabId) ?? d.tabs[0];
        if (!tab || tab.historyIndex >= tab.history.length - 1) return;
        tab.historyIndex += 1;
        tab.url = tab.history[tab.historyIndex];
        tab.status = 'loading';
        tab.title = getDomain(tab.url) || 'Loading…';
        tab.reloadKey = (tab.reloadKey || 0) + 1;
      }),

      reload: () => set((d) => {
        const tab = d.tabs.find((t) => t.id === d.activeTabId) ?? d.tabs[0];
        if (!tab || !tab.url) return;
        tab.status = 'loading';
        tab.reloadKey = (tab.reloadKey || 0) + 1;
      }),

      goHome: () => set((d) => {
        const tab = d.tabs.find((t) => t.id === d.activeTabId) ?? d.tabs[0];
        if (!tab) return;
        tab.url = '';
        tab.status = 'idle';
        tab.title = 'New Tab';
      }),

      setStatus: (status, title) => set((d) => {
        const tab = d.tabs.find((t) => t.id === d.activeTabId) ?? d.tabs[0];
        if (!tab) return;
        tab.status = status;
        if (title) tab.title = title;
      }),

      stopLoading: () => set((d) => {
        const tab = d.tabs.find((t) => t.id === d.activeTabId) ?? d.tabs[0];
        if (!tab || tab.status !== 'loading') return;
        tab.status = 'error';
      }),
    })),
    {
      name: 'macos-safari-v1',
      // Use sessionStorage: state is intentionally ephemeral (matches macOS behavior)
      storage: {
        getItem: (k) => {
          try { const v = sessionStorage.getItem(k); return v ? JSON.parse(v) : null; }
          catch { return null; }
        },
        setItem: (k, v) => { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch {} },
        removeItem: (k) => { try { sessionStorage.removeItem(k); } catch {} },
      },
      // Don't persist loading state — always start fresh on reload
      partialize: (s) => ({
        tabs: s.tabs.map((t) => ({ ...t, status: t.status === 'loading' ? 'idle' : t.status })),
        activeTabId: s.activeTabId,
      }),
    }
  )
);

export default useSafariStore;
