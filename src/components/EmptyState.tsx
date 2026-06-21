import { FolderOpen, Search } from 'lucide-react';

interface EmptyStateProps {
  search: string;
  hasAnyItems: boolean;
}

export function EmptyState({ search, hasAnyItems }: EmptyStateProps) {
  if (search) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="max-w-md text-center">
          <Search className="text-muted-foreground/50 mx-auto mb-4 size-16" />
          <h3 className="mb-2 text-lg font-semibold">No results found</h3>
          <p className="text-muted-foreground">
            No files or folders match “{search}”. Try a different search term.
          </p>
        </div>
      </div>
    );
  }
  if (!hasAnyItems) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="max-w-md text-center">
          <FolderOpen className="text-muted-foreground/50 mx-auto mb-4 size-16" />
          <h3 className="mb-2 text-lg font-semibold">This folder is empty</h3>
          <p className="text-muted-foreground">
            There are no files or folders in this directory.
          </p>
        </div>
      </div>
    );
  }
  return null;
}
