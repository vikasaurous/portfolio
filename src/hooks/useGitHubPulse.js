import { useCallback, useEffect, useState } from "react";
import {
  FALLBACK_GITHUB_MATRIX,
  fetchGitHubPulse,
  getMumbaiTimeLabel,
} from "../utils/githubPulse";

export function useGitHubPulse(enabled = true) {
  const [pulse, setPulse] = useState(FALLBACK_GITHUB_MATRIX);
  const [syncing, setSyncing] = useState(true);
  const [mumbaiTime, setMumbaiTime] = useState(getMumbaiTimeLabel);

  const refresh = useCallback(async (force = false) => {
    setSyncing(true);
    const result = await fetchGitHubPulse({ force });
    setPulse(result);
    setSyncing(false);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let active = true;

    fetchGitHubPulse().then((result) => {
      if (!active) return;
      setPulse(result);
      setSyncing(false);
    });

    const timer = setInterval(() => {
      setMumbaiTime(getMumbaiTimeLabel());
    }, 30000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [enabled]);

  return { pulse, syncing, mumbaiTime, refresh };
}
