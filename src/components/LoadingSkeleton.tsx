import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('bg-muted animate-pulse rounded-md', className)}
      aria-hidden
    />
  );
}

export function FileCardSkeleton() {
  return (
    <div className="bg-background flex flex-col overflow-hidden rounded-lg border border-border">
      <div className="p-4">
        <Skeleton className="h-32 w-full rounded-md" />
      </div>
      <div className="flex flex-1 flex-col gap-2 border-t border-border p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}
