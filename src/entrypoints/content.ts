import React from 'react';
import ReactDOM from 'react-dom/client';

import '@/assets/tailwind.css';
import { Home } from '@/components/Home';
import { ThemeProvider } from '@/hooks/useTheme';
import { ExplorerProvider } from '@/contexts/ExplorerContext';

export default defineContentScript({
  matches: ['file://*/*'],
  cssInjectionMode: 'ui',
  async main(ctx) {
    // Only inject on actual directory listings — pages with no <table> and
    // very few anchors are probably not a directory.
    if (!looksLikeDirectory()) return;

    const ui = await createShadowRootUi(ctx, {
      name: 'files-explorer',
      position: 'inline',
      anchor: 'body',
      append: 'first',
      isolateEvents: ['keydown', 'keyup', 'keypress'],
      onMount: (container, shadow, shadowHost) => {
        // Reset host styles so the host page CSS does not leak in.
        shadowHost.id = 'files-explorer-host';
        (shadowHost as HTMLElement).style.cssText =
          'all: initial; contain: layout style; display: block; width: 100%; height: 100vh; z-index: 2147483647;';
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
        return root;
      },
      onRemove: (root) => {
        root?.unmount();
      },
    });

    ui.mount();
  },
});

function looksLikeDirectory(): boolean {
  if (typeof document === 'undefined') return false;
  if (document.querySelector('table')) return true;
  // Heuristic: more than 3 links with relative hrefs.
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
