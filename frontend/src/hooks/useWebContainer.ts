import { useEffect, useState } from "react";
import { WebContainer } from '@webcontainer/api';

let webcontainerInstance: WebContainer | null = null;

export function useWebContainer() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (webcontainerInstance) {
      setReady(true);
      return;
    }

    let timeoutId: NodeJS.Timeout;

    async function initWebContainer() {
      try {
        // Set a timeout for WebContainer initialization
        timeoutId = setTimeout(() => {
          if (!ready) {
            console.warn('WebContainer initialization timed out after 30 seconds');
            setTimedOut(true);
            setError('WebContainer initialization timed out. Proceeding with fallback mode.');
          }
        }, 30000); // 30 second timeout

        webcontainerInstance = await WebContainer.boot();
        clearTimeout(timeoutId);
        setReady(true);
      } catch (err) {
        clearTimeout(timeoutId);
        console.error('Failed to initialize WebContainer:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize WebContainer');
      }
    }

    initWebContainer();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [ready]);

  return {
    webcontainer: webcontainerInstance,
    ready,
    error,
    timedOut
  };
}