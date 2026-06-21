import * as React from 'react';

import { Header } from './Header';
import { Toolbar } from './Toolbar';
import { StatsBar } from './StatsBar';
import { ItemGrid } from './ItemGrid';
import { MediaViewer } from './MediaViewer';
import { KeyboardShortcutsDialog } from './KeyboardShortcutsDialog';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useExplorer } from '@/contexts/ExplorerContext';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export function Home() {
  const {
    setSearch,
    setView,
    setFileTypeFilter,
    filtered,
  } = useExplorer();

  const [helpOpen, setHelpOpen] = React.useState(false);

  // Build breadcrumb segments from the current URL.
  const segments = React.useMemo(() => {
    if (typeof window === 'undefined') return [] as string[];
    const url = new URL(window.location.href);
    return url.pathname.split('/').filter(Boolean);
  }, []);

  const onDismiss = React.useCallback(() => {
    const root = document.getElementById('files-explorer-host');
    if (root) root.remove();
  }, []);

  const onClearSearch = React.useCallback(() => {
    setSearch('');
    setFileTypeFilter('all');
  }, [setSearch, setFileTypeFilter]);

  const handlers = React.useMemo(
    () => ({
      onFocusSearch: () => {
        window.dispatchEvent(new CustomEvent('files-explorer:focus-search'));
      },
      onClearSearch,
      onSetView: setView,
      onSetFilter: (filter: string) =>
        setFileTypeFilter(filter as never),
      onShowHelp: () => setHelpOpen(true),
    }),
    [onClearSearch, setView, setFileTypeFilter],
  );

  useKeyboardShortcuts(handlers);

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
      </div>
    </TooltipProvider>
  );
}
