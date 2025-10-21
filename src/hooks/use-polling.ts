import { useEffect, useRef, useState } from "react";

type UsePollingState<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
  nextFetchAt: number | null;
};

/**
 * Hook that polls an async function at a given interval.
 *
 * @param fetcher - Async function that fetches data
 * @param interval - Polling interval in milliseconds (null to disable polling)
 * @returns Object with data, loading, error, and nextFetchAt timestamp
 */
export function usePolling<T>(
  fetcher: () => Promise<T>,
  interval: number | null
): UsePollingState<T> {
  const [state, setState] = useState<UsePollingState<T>>({
    data: null,
    loading: true,
    error: null,
    nextFetchAt: null,
  });

  const fetcherRef = useRef(fetcher);

  // Keep fetcher ref up to date without triggering re-fetch
  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  useEffect(() => {
    let cancelled = false;
    let timer: Timer | null = null;

    async function tick() {
      const fetchTime = Date.now();
      const nextFetchAt = interval !== null ? fetchTime + interval : null;

      try {
        const result = await fetcherRef.current();
        if (!cancelled) {
          setState({
            data: result,
            loading: false,
            error: null,
            nextFetchAt,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setState({
            data: null,
            loading: false,
            error: err instanceof Error ? err : new Error(String(err)),
            nextFetchAt,
          });
        }
      } finally {
        if (!cancelled && interval !== null) {
          timer = setTimeout(tick, interval);
        }
      }
    }

    tick();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [interval]);

  return state;
}
