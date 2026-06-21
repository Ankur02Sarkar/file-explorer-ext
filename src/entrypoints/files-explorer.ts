import React from 'react';
import ReactDOM from 'react-dom/client';
import tailwindCss from '@/assets/tailwind.css?inline';

import { Home } from '@/components/Home';
import { ThemeProvider } from '@/hooks/useTheme';
import { ExplorerProvider } from '@/contexts/ExplorerContext';

export default defineUnlistedScript(() => {
  // Bail at runtime if not on a file:// URL or if this isn't a directory.
  if (window.location.protocol !== 'file:') return;
  if (!looksLikeDirectory()) return;

  // Avoid double-mounting.
  if (document.getElementById('files-explorer-host')) return;

  mountShadowRoot();
});

function mountShadowRoot() {
  const host = document.createElement('div');
  host.id = 'files-explorer-host';
  host.style.cssText =
    'all: initial; contain: layout style; display: block; position: relative; width: 100%; height: 100vh; z-index: 2147483647;';
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });

  // Inject Tailwind CSS into the shadow root.
  const styleEl = document.createElement('style');
  styleEl.setAttribute('data-files-explorer', 'tailwind');
  styleEl.textContent = tailwindCss as string;
  shadow.appendChild(styleEl);

  const container = document.createElement('div');
  container.className = 'files-explorer-root';
  container.style.cssText = 'width: 100%; height: 100vh;';
  shadow.appendChild(container);

  const root = ReactDOM.createRoot(container);
  root.render(
    React.createElement(
      React.StrictMode,
      null,
      React.createElement(
        ThemeProvider,
        null,
        React.createElement(
          ExplorerProvider,
          null,
          React.createElement(Home),
        ),
      ),
    ),
  );
}

function looksLikeDirectory(): boolean {
  if (typeof document === 'undefined') return false;
  if (document.querySelector('table')) return true;
  const links = Array.from(document.querySelectorAll('a[href]'));
  let relativeCount = 0;
  for (const a of links) {
    const href = (a as HTMLAnchorElement).getAttribute('href') ?? '';
    if (
      href &&
      !href.startsWith('http://') &&
      !href.startsWith('https://') &&
      !href.startsWith('#')
    ) {
      relativeCount++;
      if (relativeCount >= 3) return true;
    }
  }
  return false;
}
