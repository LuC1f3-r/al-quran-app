import { useCallback, useEffect, useRef, useState } from 'react';

type ApiState<T> = {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
};

/**
 * Generic data-fetching hook.
 *
 * @param fetcher — async function that returns data of type T
 * @param deps   — refetch when these change (like useEffect deps)
 *
 * Usage:
 *   const { data, loading, error } = useApiData(() => fetchChapters(), []);
 */
export function useApiData<T>(
    fetcher: () => Promise<T>,
    deps: unknown[] = [],
): ApiState<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const mountedRef = useRef(true);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetcher();
            if (mountedRef.current) {
                setData(result);
            }
        } catch (err: any) {
            if (mountedRef.current) {
                setError(err?.message ?? 'Unknown error');
            }
        } finally {
            if (mountedRef.current) {
                setLoading(false);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    useEffect(() => {
        mountedRef.current = true;
        load();
        return () => {
            mountedRef.current = false;
        };
    }, [load]);

    return { data, loading, error, refetch: load };
}
