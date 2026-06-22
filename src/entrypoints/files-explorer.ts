import React from 'react';
import ReactDOM from 'react-dom/client';
import tailwindCss from '@/assets/tailwind.css?inline';

import { Home } from '@/components/Home';
import { ThemeProvider } from '@/hooks/useTheme';
import { ExplorerProvider } from '@/contexts/ExplorerContext';
import { ShadowPortalProvider } from '@/lib/shadow-portal';

export default defineUnlistedScript(() => {
  // Bail at runtime if not on a file:// URL or if this isn't a directory.
  if (window.location.protocol !== 'file:') return;
  if (!looksLikeDirectory()) return;

  // Avoid double-mounting.
  if (document.getElementById('files-explorer-host')) return;

  mountShadowRoot();
});

function injectGoogleFont() {
  // The Tailwind CSS is injected as an inline <style> inside the shadow root.
  // Shadow DOM <style> blocks cannot trigger external @import url() requests,
  // so the Google Fonts @import inside tailwind.css never fires and the browser
  // falls back to the system font. Injecting a <link> into the main document
  // <head> (outside the shadow root) loads the font face globally so the
  // shadow root can consume it via var(--font-sans).
  const FONT_HREF =
    'https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap';
  if (!document.head.querySelector(`link[href="${FONT_HREF}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = FONT_HREF;
    document.head.appendChild(link);
  }
}

function mountShadowRoot() {
  injectGoogleFont();

  // Hide the native Chrome directory listing so we don't show two views at
  // once. The dismiss button restores it.
  const nativeElements: Element[] = [];
  for (const child of Array.from(document.body.children)) {
    if (child.id === 'files-explorer-host') continue;
    if (child instanceof HTMLElement) {
      nativeElements.push(child);
      child.dataset['filesExplorerHidden'] = '1';
      child.style.display = 'none';
    }
  }

  const host = document.createElement('div');
  host.id = 'files-explorer-host';
  // Position only. We deliberately do NOT set `background` here — the
  // React app's outermost <div className="bg-background …"> provides the
  // surface color. We also avoid `all: initial` because the shorthand
  // fight with subsequent longhands in cssText and can leave the host
  // sized to zero. Tailwind's preflight (loaded into the shadow root)
  // handles cross-page style isolation.
  host.style.cssText =
    'contain: layout style; display: block; position: fixed; inset: 0; z-index: 2147483647;';
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });

  // Inject the Tailwind CSS directly into the shadow root as a <style>
  // tag. Tailwind v4 + @tailwindcss/vite processes the CSS before
  // Vite hands us the `?inline` string, so utility classes are emitted.
  const tailwindStyle = document.createElement('style');
  tailwindStyle.textContent = tailwindCss;
  shadow.appendChild(tailwindStyle);

  // Restore native listing when the host element is removed.
  const observer = new MutationObserver(() => {
    if (!document.getElementById('files-explorer-host')) {
      for (const el of nativeElements) {
        if (el instanceof HTMLElement) {
          el.style.display = '';
          delete el.dataset['filesExplorerHidden'];
        }
      }
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true });

  // Main React mount target.
  const container = document.createElement('div');
  container.className = 'files-explorer-root';
  container.style.cssText = 'width: 100%; height: 100vh;';
  shadow.appendChild(container);

  // Portal target for Radix Dialog / Tooltip / DropdownMenu. It lives
  // inside the shadow root so portaled nodes inherit our Tailwind
  // styles instead of being rendered into document.body unstyled.
  const portalRoot = document.createElement('div');
  portalRoot.id = 'files-explorer-portal-root';
  portalRoot.style.cssText = 'position: relative; z-index: 2147483647;';
  shadow.appendChild(portalRoot);

  const root = ReactDOM.createRoot(container);
  root.render(
    React.createElement(
      ShadowPortalProvider,
      { value: portalRoot, children: React.createElement(
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
      ) },
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
