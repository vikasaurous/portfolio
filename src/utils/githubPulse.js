const GITHUB_USER = "vikasaurous";
const CONTRIBUTIONS_URL = `https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}?y=last`;
const REPOS_URL = `https://api.github.com/users/${GITHUB_USER}/repos?sort=pushed&per_page=1`;
const CACHE_KEY = "macos_portfolio_github_matrix_v2";
const CACHE_TTL_MS = 15 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 6000;
const WEEKS_TO_SHOW = 12;

let inflightRequest = null;

function buildFallbackDays() {
  const days = [];
  const pattern = [0, 1, 2, 0, 3, 1, 0, 2, 4, 1, 0, 2, 3, 2];
  const today = new Date();
  const totalDays = (WEEKS_TO_SHOW - 1) * 7 + (today.getUTCDay() + 1);

  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86400000);
    const iso = d.toISOString().slice(0, 10);
    const level = i === 0 ? 3 : pattern[(totalDays - i) % pattern.length];
    const count = level === 0 ? 0 : level * 2;
    days.push({ date: iso, count, level });
  }
  return days;
}

/**
 * Group chronologically sorted contribution entries into 12 Sun–Sat columns
 * ending on the latest available day. Trailing days in the final week are `null`.
 */
export function buildContributionWeeks(contributions) {
  if (!Array.isArray(contributions) || contributions.length === 0) {
    return buildContributionWeeks(buildFallbackDays());
  }

  const latestEntry = contributions[contributions.length - 1];
  const latestDow = new Date(`${latestEntry.date}T00:00:00Z`).getUTCDay();
  const windowLength = (WEEKS_TO_SHOW - 1) * 7 + (latestDow + 1);
  const windowDays = contributions.slice(-windowLength);

  const weeks = [];
  let cursor = 0;

  // Pad leading partial week if source array was shorter than expected
  if (windowDays.length < windowLength) {
    const firstDow = new Date(`${windowDays[0].date}T00:00:00Z`).getUTCDay();
    const firstWeek = Array(7).fill(null);
    for (let row = firstDow; row < 7 && cursor < windowDays.length; row++) {
      firstWeek[row] = windowDays[cursor++];
    }
    weeks.push(firstWeek);
  }

  while (cursor < windowDays.length) {
    const week = Array(7).fill(null);
    for (let row = 0; row < 7 && cursor < windowDays.length; row++) {
      week[row] = windowDays[cursor++];
    }
    weeks.push(week);
  }

  // Ensure exactly 12 columns
  const padded = weeks.slice(-WEEKS_TO_SHOW);
  while (padded.length < WEEKS_TO_SHOW) {
    padded.unshift(Array(7).fill(null));
  }

  let total12Weeks = 0;
  let activeDays = 0;
  for (const day of windowDays) {
    const count = Number(day?.count) || 0;
    total12Weeks += count;
    if (count > 0) activeDays++;
  }

  return { weeks: padded, total12Weeks, activeDays };
}

function buildFallbackData() {
  const { weeks, total12Weeks, activeDays } = buildContributionWeeks(buildFallbackDays());
  return {
    username: GITHUB_USER,
    profileUrl: `https://github.com/${GITHUB_USER}`,
    weeks,
    total12Weeks,
    activeDays,
    latestRepo: {
      name: "portfolio",
      url: `https://github.com/${GITHUB_USER}/portfolio`,
    },
    source: "offline",
  };
}

export const FALLBACK_GITHUB_MATRIX = buildFallbackData();

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.data?.weeks || typeof parsed.timestamp !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data }));
  } catch {
    // Ignore storage quota / private mode errors
  }
}

async function fetchJsonWithTimeout(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fetch 12-week GitHub contribution matrix + latest active repository.
 * Deduplicates concurrent calls (React StrictMode safe), caches 15 min,
 * and falls back gracefully to stale cache or offline baseline.
 */
export async function fetchGitHubPulse({ force = false } = {}) {
  const cached = readCache();
  if (!force && cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return { ...cached.data, source: "cached" };
  }

  if (inflightRequest) return inflightRequest;

  inflightRequest = (async () => {
    try {
      const [contribPayload, repos] = await Promise.all([
        fetchJsonWithTimeout(CONTRIBUTIONS_URL),
        fetchJsonWithTimeout(REPOS_URL).catch(() => null),
      ]);

      if (!Array.isArray(contribPayload?.contributions) || contribPayload.contributions.length === 0) {
        throw new Error("Invalid contribution payload");
      }

      const { weeks, total12Weeks, activeDays } = buildContributionWeeks(
        contribPayload.contributions,
      );
      const topRepo = Array.isArray(repos) && repos.length > 0 ? repos[0] : null;

      const freshData = {
        username: GITHUB_USER,
        profileUrl: `https://github.com/${GITHUB_USER}`,
        weeks,
        total12Weeks,
        activeDays,
        latestRepo: topRepo
          ? { name: topRepo.name, url: topRepo.html_url }
          : FALLBACK_GITHUB_MATRIX.latestRepo,
        source: "live",
      };

      writeCache(freshData);
      return freshData;
    } catch {
      if (cached?.data) {
        return { ...cached.data, source: "cached" };
      }
      return buildFallbackData();
    } finally {
      inflightRequest = null;
    }
  })();

  return inflightRequest;
}

const DAY_FORMATTER = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

export function formatContributionDay(day) {
  if (!day?.date) return "";
  const label = DAY_FORMATTER.format(new Date(`${day.date}T00:00:00Z`));
  const count = Number(day.count) || 0;
  const noun = count === 1 ? "commit" : "commits";
  return `${count} ${noun} · ${label}`;
}

export function getMumbaiTimeLabel() {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(new Date());
}
