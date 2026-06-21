import { Download, Image as ImageIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useExplorer } from '@/contexts/ExplorerContext';
import { describeType, formatSize, formatDate, type ExplorerItem } from '@/lib/parser';
import { resolveFileIcon } from '@/lib/icons';
import { cn } from '@/lib/utils';

interface FileCardProps {
  item: ExplorerItem;
}

export function FileCard({ item }: FileCardProps) {
  const { thumbnails, setSelectedItem } = useExplorer();
  const badge = describeType(item);
  const Icon = resolveFileIcon(item);

  // Click anywhere on the card to open a preview. Folders navigate
  // straight to the directory instead of opening a preview dialog.
  const onCardClick = () => {
    if (item.type === 'directory') {
      window.location.href = item.href;
      return;
    }
    setSelectedItem(item);
  };

  return (
    <div className="bg-background hover:border-primary/50 group flex flex-col overflow-hidden rounded-lg border border-border transition-all duration-200 hover:scale-[1.02] hover:shadow-lg">
      <div className="relative cursor-pointer p-4" onClick={onCardClick}>
        {item.fileType === 'image' ? (
          thumbnails.images ? (
            <div className="bg-muted/20 relative overflow-hidden rounded-md">
              <img
                src={item.href}
                alt={item.name}
                width={200}
                height={150}
                loading="lazy"
                className="h-32 w-full rounded-md object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                <Button size="sm" variant="secondary" className="h-7 w-7 p-0">
                  <ImageIcon className="size-3" />
                </Button>
              </div>
            </div>
          ) : (
            <div
              className={cn(
                'flex h-32 items-center justify-center rounded-md',
                badge.bg,
              )}
            >
              <Icon className={cn('size-10', badge.color)} />
            </div>
          )
        ) : item.fileType === 'video' ? (
          <div
            className={cn(
              'relative flex h-32 items-center justify-center rounded-md',
              badge.bg,
            )}
          >
            {thumbnails.videos && (
              <video
                preload="metadata"
                src={item.href}
                className="absolute inset-0 h-full w-full rounded-md object-cover"
                width={200}
                height={150}
                muted
              />
            )}
            <Button
              size="icon"
              variant="secondary"
              className="relative z-10 size-12 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedItem(item);
              }}
            >
              <Icon className="size-5" />
            </Button>
          </div>
        ) : (
          <div
            className={cn(
              'flex h-32 items-center justify-center rounded-md transition-transform duration-200 group-hover:scale-105',
              badge.bg,
            )}
          >
            <Icon className={cn('size-10', badge.color)} />
          </div>
        )}

        <span
          className={cn(
            'absolute left-2 top-2 rounded-full border px-2 py-1 text-xs font-medium',
            badge.bg,
            badge.color,
            badge.border,
          )}
        >
          {badge.label}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 border-t border-border p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCardClick();
              }}
              className="hover:text-primary block w-full truncate text-left font-medium transition-colors"
              title={item.name}
            >
              {item.name}
            </button>
            {item.ext && (
              <span className="text-muted-foreground text-xs">.{item.ext}</span>
            )}
          </div>
          {item.type === 'file' && (
            <a
              href={item.href}
              download
              onClick={(e) => e.stopPropagation()}
              className="opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Button
                size="icon"
                variant="ghost"
                className="size-8"
                title="Download"
              >
                <Download className="size-4" />
              </Button>
            </a>
          )}
        </div>

        {(item.size || item.modified) && (
          <div className="text-muted-foreground flex flex-col gap-1 text-xs">
            {item.size && (
              <div className="flex items-center gap-1">
                <span className="font-medium">Size:</span>
                <span>{formatSize(item.size)}</span>
              </div>
            )}
            {item.modified && (
              <div className="flex items-center gap-1">
                <span className="font-medium">Modified:</span>
                <span>{formatDate(item.modified)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function FileRow({ item }: { item: ExplorerItem }) {
  const { thumbnails, setSelectedItem } = useExplorer();
  const badge = describeType(item);
  const Icon = resolveFileIcon(item);

  const onRowClick = () => {
    if (item.type === 'directory') {
      window.location.href = item.href;
      return;
    }
    setSelectedItem(item);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onRowClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onRowClick();
        }
      }}
      className={cn(
        'group hover:bg-muted/50 hover:border-primary/50 grid cursor-pointer grid-cols-[48px_1fr_auto_120px] items-center gap-4 rounded-lg border border-border px-4 py-3 transition-all duration-200 hover:shadow-md',
        badge.border,
      )}
    >
      <div
        className={cn(
          'flex size-12 cursor-pointer items-center justify-center rounded-lg',
          badge.bg,
        )}
        onClick={onRowClick}
      >
        {item.fileType === 'image' && thumbnails.images ? (
          <div className="size-full overflow-hidden rounded-lg">
            <img
              src={item.href}
              alt={item.name}
              className="size-full object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />
          </div>
        ) : (
          <Icon className={cn('size-5', badge.color)} />
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRowClick();
          }}
          className="hover:text-primary truncate text-left font-medium transition-colors"
          title={item.name}
        >
          {item.name}
        </button>
        <div className="text-muted-foreground flex items-center gap-3 text-xs">
          <span
            className={cn(
              'rounded-full border px-2 py-0.5 font-medium',
              badge.bg,
              badge.color,
              badge.border,
            )}
          >
            {badge.label}
          </span>
          {item.size && (
            <span className="flex items-center gap-1">
              <span className="font-medium">Size:</span>
              {formatSize(item.size)}
            </span>
          )}
        </div>
      </div>

      <div className="text-muted-foreground hidden text-sm md:block">
        {item.modified && formatDate(item.modified)}
      </div>

      <div className="flex items-center justify-end gap-2">
        {item.type === 'file' && (
          <a
            href={item.href}
            download
            onClick={(e) => e.stopPropagation()}
            className="opacity-0 transition-opacity group-hover:opacity-100"
          >
            <Button
              variant="ghost"
              size="icon"
              className="size-9"
              title="Download"
              asChild={false}
            >
              <Download className="size-4" />
            </Button>
          </a>
        )}
      </div>
    </div>
  );
}
