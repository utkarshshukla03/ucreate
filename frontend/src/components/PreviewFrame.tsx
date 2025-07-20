import { WebContainer } from '@webcontainer/api';
import { useEffect, useState } from 'react';

interface PreviewFrameProps {
  files: any[];
  webContainer: WebContainer;
}

export function PreviewFrame({ webContainer }: PreviewFrameProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [installStatus, setInstallStatus] = useState<'installing' | 'starting' | 'ready' | 'error'>('installing');

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
        setInstallStatus('installing');

        console.log('Installing dependencies...');
        const installProcess = await webContainer.spawn('npm', ['install']);
        const installExit = await installProcess.exit;
        
        if (installExit !== 0) {
          // Don't show error immediately, keep showing loading for better UX
          console.warn('Install failed, but continuing with loading state');
          setInstallStatus('installing');
          // Don't throw error, just keep loading state
          return;
        }

        setInstallStatus('starting');
        console.log('Starting dev server...');
        const devProcess = await webContainer.spawn('npm', ['run', 'dev']);
        
        webContainer.on('server-ready', (port, url) => {
          console.log('Server ready:', { port, url });
          setUrl(url);
          setLoading(false);
          setInstallStatus('ready');
        });

        devProcess.output.pipeTo(new WritableStream({
          write(data) {
            console.log('Dev server:', data);
          }
        }));
      } catch (err) {
        console.error('Preview error:', err);
        // Keep showing loading instead of error for better UX
        setInstallStatus('installing');
        console.log('Keeping loading state instead of showing error');
        // Don't set loading to false, keep it true to show loading state
      }
    }

    setupPreview();
  }, [webContainer]);

  if (loading) {
    const getLoadingMessage = () => {
      switch (installStatus) {
        case 'installing':
          return 'Loading dependencies...';
        case 'starting':
          return 'Starting development server...';
        default:
          return 'Loading dependencies...';
      }
    };

    return (
      <div className="h-full bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-gray-300">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <p className="text-sm">{getLoadingMessage()}</p>
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