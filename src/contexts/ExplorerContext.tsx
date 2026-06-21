import * as React from 'react';

import {
  type ExplorerItem,
  type SortKey,
  type SortOrder,
  parseDirectoryListing,
  sortItems,
} from '@/lib/parser';
import { usePersistedState } from '@/hooks/usePersistedState';

export type ViewMode = 'grid' | 'list';
export type FileTypeFilter =
  | 'all'
  | 'folders'
  | 'files'
  | 'images'
  | 'videos'
  | 'audio'
  | 'documents'
  | 'code'
  | 'archives';

export interface ThumbnailsState {
  images: boolean;
  videos: boolean;
}

interface ExplorerState {
  search: string;
  pageSize: number;
  fileTypeFilter: FileTypeFilter;
  view: ViewMode;
  thumbnails: ThumbnailsState;
  sortBy: SortKey;
  sortOrder: SortOrder;
  selectedItem: ExplorerItem | null;
}

interface ExplorerActions {
  setSearch: (value: string) => void;
  setPageSize: (size: number | ((prev: number) => number)) => void;
  setFileTypeFilter: (filter: FileTypeFilter) => void;
  setView: (view: ViewMode) => void;
  setThumbnails: (state: ThumbnailsState) => void;
  setSort: (by: SortKey, order: SortOrder) => void;
  toggleSort: (by: SortKey) => void;
  setSelectedItem: (item: ExplorerItem | null) => void;
  cycleMedia: (direction: 'prev' | 'next') => void;
}

interface ExplorerDerived {
  filtered: ExplorerItem[];
  paged: ExplorerItem[];
  total: number;
  mediaItems: ExplorerItem[];
}

interface ExplorerContextValue extends ExplorerState, ExplorerActions, ExplorerDerived {}

const ExplorerContext = React.createContext<ExplorerContextValue | null>(null);

const PAGE_STEP = 50;

function applyFilter(
  items: ExplorerItem[],
  filter: FileTypeFilter,
  search: string,
): ExplorerItem[] {
  const normalizedSearch = search.trim().toLowerCase();
  return items.filter((item) => {
    if (normalizedSearch) {
      if (!item.name.toLowerCase().includes(normalizedSearch)) return false;
    }
    switch (filter) {
      case 'folders':
        return item.type === 'directory';
      case 'files':
        return item.type === 'file';
      case 'images':
        return item.fileType === 'image';
      case 'videos':
        return item.fileType === 'video';
      case 'audio':
        return item.fileType === 'audio';
      case 'documents':
        return item.ext
          ? ['pdf', 'doc', 'docx', 'txt', 'md', 'rtf', 'odt'].includes(
              item.ext.toLowerCase(),
            )
          : false;
      case 'code':
        return item.ext
          ? [
              'js',
              'jsx',
              'ts',
              'tsx',
              'py',
              'java',
              'cpp',
              'c',
              'h',
              'go',
              'rs',
              'rb',
              'php',
              'html',
              'css',
              'json',
              'yml',
              'yaml',
              'sh',
              'bash',
            ].includes(item.ext.toLowerCase())
          : false;
      case 'archives':
        return item.ext
          ? ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'dmg', 'iso'].includes(
              item.ext.toLowerCase(),
            )
          : false;
      case 'all':
      default:
        return true;
    }
  });
}

export function ExplorerProvider({ children }: { children: React.ReactNode }) {
  const [search, setSearch] = React.useState('');
  const [pageSize, setPageSizeState] = React.useState(50);
  const [fileTypeFilter, setFileTypeFilter] =
    React.useState<FileTypeFilter>('all');
  const [view, setView] = usePersistedState<ViewMode>('grid', 'files-explorer-view');
  const [thumbnails, setThumbnails] = usePersistedState<ThumbnailsState>(
    { images: false, videos: false },
    'files-explorer-thumbnails',
  );
  const [sortState, setSortState] = usePersistedState<{
    by: SortKey;
    order: SortOrder;
  }>({ by: 'name', order: 'asc' }, 'files-explorer-sort');
  const [selectedItem, setSelectedItem] = React.useState<ExplorerItem | null>(
    null,
  );

  const items = React.useMemo<ExplorerItem[]>(() => {
    if (typeof window === 'undefined') return [];
    return parseDirectoryListing();
  }, []);

  const filtered = React.useMemo(
    () => applyFilter(items, fileTypeFilter, search),
    [items, fileTypeFilter, search],
  );

  const sorted = React.useMemo(
    () => sortItems(filtered, sortState.by, sortState.order),
    [filtered, sortState.by, sortState.order],
  );

  const paged = React.useMemo(
    () => sorted.slice(0, pageSize),
    [sorted, pageSize],
  );

  const mediaItems = React.useMemo(
    () =>
      sorted.filter(
        (item) =>
          item.fileType === 'image' ||
          item.fileType === 'video' ||
          item.fileType === 'audio',
      ),
    [sorted],
  );

  const setPageSize = React.useCallback<ExplorerActions['setPageSize']>(
    (next) => {
      setPageSizeState((prev) =>
        typeof next === 'function' ? next(prev) : next,
      );
    },
    [],
  );

  const setSort = React.useCallback<ExplorerActions['setSort']>(
    (by, order) => setSortState({ by, order }),
    [setSortState],
  );

  const toggleSort = React.useCallback<ExplorerActions['toggleSort']>(
    (by) => {
      setSortState((prev) =>
        prev.by === by
          ? { by, order: prev.order === 'asc' ? 'desc' : 'asc' }
          : { by, order: 'asc' },
      );
    },
    [setSortState],
  );

  const cycleMedia = React.useCallback<ExplorerActions['cycleMedia']>(
    (direction) => {
      if (!selectedItem) return;
      const idx = mediaItems.findIndex((i) => i.href === selectedItem.href);
      if (idx < 0) return;
      const nextIdx =
        direction === 'next' ? idx + 1 : idx - 1;
      if (nextIdx < 0 || nextIdx >= mediaItems.length) return;
      setSelectedItem(mediaItems[nextIdx]);
    },
    [mediaItems, selectedItem],
  );

  const value = React.useMemo<ExplorerContextValue>(
    () => ({
      search,
      pageSize,
      fileTypeFilter,
      view,
      thumbnails,
      sortBy: sortState.by,
      sortOrder: sortState.order,
      selectedItem,
      filtered,
      paged,
      total: items.length,
      mediaItems,
      setSearch,
      setPageSize,
      setFileTypeFilter,
      setView,
      setThumbnails,
      setSort,
      toggleSort,
      setSelectedItem,
      cycleMedia,
    }),
    [
      search,
      pageSize,
      fileTypeFilter,
      view,
      thumbnails,
      sortState.by,
      sortState.order,
      selectedItem,
      filtered,
      paged,
      items.length,
      mediaItems,
      setPageSize,
      setSort,
      toggleSort,
      cycleMedia,
    ],
  );

  return (
    <ExplorerContext.Provider value={value}>
      {children}
    </ExplorerContext.Provider>
  );
}

export function useExplorer(): ExplorerContextValue {
  const ctx = React.useContext(ExplorerContext);
  if (!ctx) throw new Error('useExplorer must be used inside <ExplorerProvider>');
  return ctx;
}
