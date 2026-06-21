import * as React from 'react';

export interface ShortcutHandlers {
  onFocusSearch?: () => void;
  onClearSearch?: () => void;
  onSetView?: (view: 'grid' | 'list') => void;
  onSetFilter?: (filter: string) => void;
  onShowHelp?: () => void;
}

const TYPE_FILTERS = [
  'all',
  'folders',
  'files',
  'images',
  'videos',
  'audio',
  'documents',
  'code',
  'archives',
] as const;

/**
 * Global keyboard shortcut handler. Ignores key events fired inside form
 * fields so users can still type normally.
 */
export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
        event.preventDefault();
        handlers.onFocusSearch?.();
        return;
      }

      if (event.key === 'Escape') {
        handlers.onClearSearch?.();
        return;
      }

      const key = event.key.toLowerCase();

      if (key === 'g') {
        event.preventDefault();
        handlers.onSetView?.('grid');
        return;
      }
      if (key === 'l') {
        event.preventDefault();
        handlers.onSetView?.('list');
        return;
      }

      if (event.shiftKey && event.key === '?') {
        event.preventDefault();
        handlers.onShowHelp?.();
        return;
      }

      if (/^[1-9]$/.test(event.key)) {
        const idx = parseInt(event.key, 10) - 1;
        const filter = TYPE_FILTERS[idx];
        if (filter) handlers.onSetFilter?.(filter);
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handlers]);
}
