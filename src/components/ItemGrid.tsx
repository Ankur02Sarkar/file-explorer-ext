import * as React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import { useExplorer } from '@/contexts/ExplorerContext';
import { FileCard, FileRow } from './FileItem';
import { EmptyState } from './EmptyState';
import { FileCardSkeleton } from './LoadingSkeleton';
import { cn } from '@/lib/utils';

const GRID_CLASSES =
  'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6';
const LIST_CLASSES = 'flex flex-col gap-3';

export function ItemGrid() {
  const { paged, total, filtered, search, view, pageSize, setPageSize } =
    useExplorer();

  const hasMore = pageSize < total;
  const isEmpty = filtered.length === 0;

  if (isEmpty) {
    return <EmptyState search={search} hasAnyItems={total > 0} />;
  }

  const gridClasses = view === 'grid' ? GRID_CLASSES : LIST_CLASSES;

  return (
    <div
      id="scrollableDiv"
      className="scrollbar-thin flex-1 overflow-y-auto p-4 sm:p-6"
    >
      <InfiniteScroll
        dataLength={paged.length}
        next={() => setPageSize((prev) => prev + 50)}
        hasMore={hasMore}
        loader={
          <div className={cn(view === 'grid' ? GRID_CLASSES : LIST_CLASSES, 'mt-4')}>
            {Array.from({ length: 6 }).map((_, i) => (
              <FileCardSkeleton key={i} />
            ))}
          </div>
        }
        scrollableTarget="scrollableDiv"
        className={cn(gridClasses)}
      >
        {view === 'grid'
          ? paged.map((item) => <FileCard key={item.href} item={item} />)
          : paged.map((item) => <FileRow key={item.href} item={item} />)}
      </InfiniteScroll>

      {!hasMore && total > 0 && (
        <div className="text-muted-foreground py-8 text-center text-sm">
          Showing all {total} {total === 1 ? 'item' : 'items'}
        </div>
      )}
    </div>
  );
}
