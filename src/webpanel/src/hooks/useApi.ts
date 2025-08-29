import { useState, useCallback } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

type ApiMethod = "GET" | "POST" | "PUT" | "DELETE";

interface ApiOptions {
  method?: ApiMethod;
  headers?: Record<string, string>;
  body?: unknown;
}

export function useApi<T>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const request = useCallback(async (url: string, options: ApiOptions = {}) => {
    setState({ data: null, loading: true, error: null });
    try {
      console.log(`Fetching URL: ${url} with options:`, options);
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : null,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status} \n fetching url: ${url}` }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status} \n fetching url: ${url}`);
      }
      
      // For DELETE or other methods that might not return a body
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        setState({ data: null, loading: false, error: null });
        return null;
      }

      const data = await response.json();
      setState({ data, loading: false, error: null });
      return data as T;
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error });
      throw error;
    }
  }, []);

  return { ...state, request };
}