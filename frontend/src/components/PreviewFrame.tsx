import { WebContainer } from '@webcontainer/api';
import React, { useEffect, useState } from 'react';

interface PreviewFrameProps {
  files: any[];
  webContainer: WebContainer;
}

export function PreviewFrame({ files, webContainer }: PreviewFrameProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function setupPreview() {
      if (!webContainer) {
        setError('WebContainer is not initialized');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log('Installing dependencies...');
        const installProcess = await webContainer.spawn('npm', ['install']);
        const installExit = await installProcess.exit;
        
        if (installExit !== 0) {
          throw new Error('Failed to install dependencies');
        }

        console.log('Starting dev server...');
        const devProcess = await webContainer.spawn('npm', ['run', 'dev']);
        
        webContainer.on('server-ready', (port, url) => {
          console.log('Server ready:', { port, url });
          setUrl(url);
          setLoading(false);
        });

        devProcess.output.pipeTo(new WritableStream({
          write(data) {
            console.log('Dev server:', data);
          }
        }));
      } catch (err) {
        console.error('Preview error:', err);
        setError(err instanceof Error ? err.message : 'Failed to start preview');
        setLoading(false);
      }
    }

    setupPreview();
  }, [webContainer]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          <p className="text-gray-400 mt-2">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900">
        <div className="text-center text-red-500">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!url) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900">
        <div className="text-center">
          <p className="text-gray-400">Waiting for preview URL...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white">
      <iframe
        src={url}
        className="w-full h-full border-0"
        title="Preview"
      />
    </div>
  );
}