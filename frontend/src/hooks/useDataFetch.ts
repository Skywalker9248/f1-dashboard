import { useEffect, useState } from 'react';
import API from '../axios';

interface UseDataFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

/**
 * Generic data-fetching hook. Calls the given API endpoint on mount
 * and returns { data, loading, error, retry }.
 */
function useDataFetch<T>(url: string): UseDataFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        const response = await API.get<T>(url);
        if (!cancelled) {
          setData(response.data);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'An error occurred');
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [url, retryCount]);

  const retry = () => setRetryCount(n => n + 1);

  return { data, loading, error, retry };
}

export default useDataFetch;
