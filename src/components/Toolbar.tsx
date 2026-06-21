import * as React from 'react';
import {
  ArrowDownAZ,
  ArrowUpAZ,
  Filter,
  Image as ImageIcon,
  LayoutGrid,
  Search,
  SortAsc,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  type FileTypeFilter,
  useExplorer,
} from '@/contexts/ExplorerContext';
import type { SortKey, SortOrder } from '@/lib/parser';

const FILTER_OPTIONS: Array<{ value: FileTypeFilter; label: string }> = [
  { value: 'all', label: 'All Items' },
  { value: 'folders', label: 'Folders' },
  { value: 'files', label: 'Files' },
  { value: 'images', label: 'Images' },
  { value: 'videos', label: 'Videos' },
  { value: 'audio', label: 'Audio' },
  { value: 'documents', label: 'Documents' },
  { value: 'code', label: 'Code' },
  { value: 'archives', label: 'Archives' },
];

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: 'name', label: 'Name' },
  { value: 'size', label: 'Size' },
  { value: 'modified', label: 'Last Modified' },
  { value: 'type', label: 'Type' },
];

export function Toolbar() {
  const {
    search,
    setSearch,
    view,
    setView,
    thumbnails,
    setThumbnails,
    fileTypeFilter,
    setFileTypeFilter,
    sortBy,
    sortOrder,
    setSort,
  } = useExplorer();

  const searchInputRef = React.useRef<HTMLInputElement | null>(null);

  // Expose focus to keyboard shortcut handler.
  React.useEffect(() => {
    const handler = () => {
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    };
    window.addEventListener('files-explorer:focus-search', handler);
    return () =>
      window.removeEventListener('files-explorer:focus-search', handler);
  }, []);

  const SortIcon =
    sortBy === 'name'
      ? sortOrder === 'asc'
        ? ArrowDownAZ
        : ArrowUpAZ
      : SortAsc;

  return (
    <div className="flex flex-col gap-2 border-b border-border bg-muted/20 px-4 py-2 sm:flex-row sm:items-center sm:gap-3 sm:px-6">
      {/* Search */}
      <div className="relative flex-1">
        <Search
          className="text-muted-foreground pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2"
          aria-hidden
        />
        <Input
          ref={searchInputRef}
          type="search"
          placeholder="Search files and folders…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 pr-8"
          aria-label="Search files and folders"
        />
        {search && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 size-7 -translate-y-1/2"
            onClick={() => setSearch('')}
            aria-label="Clear search"
          >
            <X className="size-3.5" />
          </Button>
        )}
      </div>

      {/* Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={fileTypeFilter === 'all' ? 'outline' : 'default'}
            size="icon"
            title="Filter by type"
            aria-label="Filter by type"
          >
            <Filter className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-44">
          <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={fileTypeFilter}
            onValueChange={(v) => setFileTypeFilter(v as FileTypeFilter)}
          >
            {FILTER_OPTIONS.map((opt) => (
              <DropdownMenuRadioItem key={opt.value} value={opt.value}>
                {opt.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Thumbnails */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            title="Thumbnails"
            aria-label="Thumbnails"
          >
            <ImageIcon className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-40">
          <DropdownMenuLabel>Thumbnails</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={thumbnails.images}
            onCheckedChange={(checked) =>
              setThumbnails({ ...thumbnails, images: !!checked })
            }
            onSelect={(e) => e.preventDefault()}
          >
            Images
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={thumbnails.videos}
            onCheckedChange={(checked) =>
              setThumbnails({ ...thumbnails, videos: !!checked })
            }
            onSelect={(e) => e.preventDefault()}
          >
            Videos
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* View */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            title="View mode"
            aria-label="View mode"
          >
            <LayoutGrid className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-40">
          <DropdownMenuLabel>View Mode</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={view}
            onValueChange={(v) => setView(v as 'grid' | 'list')}
          >
            <DropdownMenuRadioItem value="grid">Grid View</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="list">List View</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Sort */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" title="Sort by" aria-label="Sort by">
            <SortIcon className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-48">
          <DropdownMenuLabel>Sort By</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={sortBy}
            onValueChange={(v) => setSort(v as SortKey, sortOrder)}
          >
            {SORT_OPTIONS.map((opt) => (
              <DropdownMenuRadioItem key={opt.value} value={opt.value}>
                {opt.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Order</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={sortOrder}
            onValueChange={(v) => setSort(sortBy, v as SortOrder)}
          >
            <DropdownMenuRadioItem value="asc">Ascending</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="desc">Descending</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
