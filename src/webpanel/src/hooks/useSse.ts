import { useState, useEffect } from 'react';
import { useToast } from '../components/Toast/useToast';

export function useSse(url: string): EventSource | null {
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const source = new EventSource(url);
    setEventSource(source);


    source.onerror = () => {
      source.close();
    };

    return () => {
      source.close();
    };
  }, [url, showToast]);

  return eventSource;
}