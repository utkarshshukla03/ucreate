import { useEffect, useState } from "react";
import { WebContainer } from '@webcontainer/api';

let webcontainerInstance: WebContainer | null = null;

export function useWebContainer() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (webcontainerInstance) {
      setReady(true);
      return;
    }

    async function initWebContainer() {
      try {
        webcontainerInstance = await WebContainer.boot();
        setReady(true);
      } catch (err) {
        console.error('Failed to initialize WebContainer:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize WebContainer');
      }
    }

    initWebContainer();
  }, []);

  return {
    webcontainer: webcontainerInstance,
    ready,
    error
  };
}