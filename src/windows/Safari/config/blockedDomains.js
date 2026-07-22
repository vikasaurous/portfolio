// ─── Known Non-Embeddable Domains ─────────────────────────────────────────────
//
// These domains send X-Frame-Options or Content-Security-Policy headers that
// prevent them from being rendered inside an iframe. Rather than waiting for
// the browser to surface a grey error page, Safari proactively detects these
// and immediately shows the native macOS "This page can't be displayed" flow.
//
// To add more domains: simply add the hostname (without www.) to the Set below.
// The matcher normalises www. prefixes automatically.
// ──────────────────────────────────────────────────────────────────────────────

export const BLOCKED_DOMAINS = new Set([
  // Social & professional networks
  'github.com',
  'linkedin.com',
  'twitter.com',
  'x.com',
  'facebook.com',
  'instagram.com',

  // Google properties
  'google.com',
  'accounts.google.com',
  'docs.google.com',
  'mail.google.com',
  'drive.google.com',
  'youtube.com',

  // AI
  'chat.openai.com',
  'openai.com',

  // Hosting / deployment
  'vercel.com',
]);

/**
 * Returns true if the given URL belongs to a known non-embeddable domain.
 * Handles www. prefixes and malformed URLs gracefully.
 *
 * @param {string} url
 * @returns {boolean}
 */
export function isBlockedDomain(url) {
  if (!url) return false;
  try {
    const { hostname } = new URL(url);
    // Try exact match first, then strip www.
    return (
      BLOCKED_DOMAINS.has(hostname) ||
      BLOCKED_DOMAINS.has(hostname.replace(/^www\./, ''))
    );
  } catch {
    return false;
  }
}
