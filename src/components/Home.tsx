import * as React from 'react';

import { Header } from './Header';
import { Toolbar } from './Toolbar';
import { StatsBar } from './StatsBar';
import { ItemGrid } from './ItemGrid';
import { MediaViewer } from './MediaViewer';
import { KeyboardShortcutsDialog } from './KeyboardShortcutsDialog';
import {
  TooltipProvider,
} from '@/components/ui/tooltip';
import { useExplorer } from '@/contexts/ExplorerContext';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

function Home() {
  const {
    search,
    setSearch,
    setView,
    setFileTypeFilter,
    filtered,
    pageSize,
    setPageSize,
    setSelectedItem,
  } = useExplorer();

  const [helpOpen, setHelpOpen] = React.useState(false);
  const searchRef = React.useRef<HTMLInputElement | null>(null);

  // Build breadcrumb segments from the current URL.
  const segments = React.useMemo(() => {
    if (typeof window === 'undefined') return [] as string[];
    const url = new URL(window.location.href);
    return url.pathname
      .split('/')
      .filter(Boolean)
      .filter((s) => s !== '');
  }, []);

  const onDismiss = React.useCallback(() => {
    // Remove the shadow host from the page and stop further injections.
    const root = document.getElementById('files-explorer-host');
    if (root) root.remove();
  }, []);

  const onFocusSearch = React.useCallback(() => {
    const event = new CustomEvent('files-explorer:focus-search');
    window.dispatchEvent(event);
    searchRef.current?.focus();
    searchRef.current?.select();
  }, []);

  const onClearSearch = React.useCallback(() => {
    setSearch('');
    setFileTypeFilter('all');
  }, [setSearch, setFileTypeFilter]);

  const handlers = React.useMemo(
    () => ({
      onFocusSearch,
      onClearSearch,
      onSetView: setView,
      onSetFilter: (filter: string) => setFileTypeFilter(filter as never),
      onShowHelp: () => setHelpOpen(true),
    }),
    [onFocusSearch, onClearSearch, setView, setFileTypeFilter],
  );

  useKeyboardShortcuts(handlers);

  // Listen for the toolbar's custom focus event so shortcuts work even though
  // Toolbar mounts the input itself.
  React.useEffect(() => {
    const handler = () => searchRef.current?.focus();
    window.addEventListener('files-explorer:focus-search', handler);
    return () =>
      window.removeEventListener('files-explorer:focus-search', handler);
  }, []);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="bg-background flex h-screen flex-col text-foreground">
        <Header
          segments={segments}
          onShowShortcuts={() => setHelpOpen(true)}
          onDismiss={onDismiss}
        />
        <Toolbar />
        <StatsBar items={filtered} total={filtered.length} />
        <ItemGrid />

        <MediaViewer />
        <KeyboardShortcutsDialog open={helpOpen} onOpenChange={setHelpOpen} />

        <input
          ref={searchRef}
          aria-hidden
          className="sr-only"
          tabIndex={-1}
          readOnly
        />
        {/* Use the page size to know whether to keep loading (effect unused here). */}
        <span hidden>{pageSize}</span>
      </div>
    </TooltipProvider>
  );
}

export default Home;
