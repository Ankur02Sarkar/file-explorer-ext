import React from 'react';
import ReactDOM from 'react-dom/client';
import { Button } from '@/components/ui/button';

import '@/assets/tailwind.css';

function Wizard() {
  const openExtensionsPage = () => {
    const id = browser?.runtime?.id ?? '';
    const url = id
      ? `chrome://extensions/?id=${encodeURIComponent(id)}`
      : 'chrome://extensions/';
    window.open(url, '_blank', 'noopener');
  };

  return (
    <div className="bg-background text-foreground flex min-h-screen items-center justify-center p-6">
      <div className="bg-card text-card-foreground w-full max-w-2xl space-y-6 rounded-xl border p-8 shadow-lg">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">File Explorer needs file access</h1>
          <p className="text-muted-foreground">
            To browse local folders, grant the extension permission to read
            <code className="bg-muted mx-1 rounded px-1.5 py-0.5">file://</code>
            URLs.
          </p>
        </header>

        <ol className="space-y-4 text-sm">
          <li className="bg-muted/40 flex gap-3 rounded-lg p-4">
            <span className="bg-primary text-primary-foreground flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold">
              1
            </span>
            <span>
              Open the{' '}
              <strong>chrome://extensions</strong> page (we'll open it for
              you).
            </span>
          </li>
          <li className="bg-muted/40 flex gap-3 rounded-lg p-4">
            <span className="bg-primary text-primary-foreground flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold">
              2
            </span>
            <span>
              Find <strong>File Explorer</strong> in the list and click{' '}
              <strong>Details</strong>.
            </span>
          </li>
          <li className="bg-muted/40 flex gap-3 rounded-lg p-4">
            <span className="bg-primary text-primary-foreground flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold">
              3
            </span>
            <span>
              Enable{' '}
              <strong>Allow access to file URLs</strong>.
            </span>
          </li>
          <li className="bg-muted/40 flex gap-3 rounded-lg p-4">
            <span className="bg-primary text-primary-foreground flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold">
              4
            </span>
            <span>
              Come back to this tab and refresh — that's it!
            </span>
          </li>
        </ol>

        <div className="flex justify-center pt-2">
          <Button onClick={openExtensionsPage} size="lg">
            Open extensions settings
          </Button>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Wizard />
  </React.StrictMode>,
);
