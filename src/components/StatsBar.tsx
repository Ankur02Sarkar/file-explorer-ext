import { File, Folder, Image as ImageIcon, Music, Video as VideoIcon } from 'lucide-react';

import type { ExplorerItem } from '@/lib/parser';
import { cn } from '@/lib/utils';

interface StatsBarProps {
  items: ExplorerItem[];
  total: number;
}

interface Stat {
  label: string;
  count: number;
  color: string; // semantic class — references a CSS variable
  bg: string; // semantic class
  Icon: React.ComponentType<{ className?: string }>;
}

export function StatsBar({ items, total }: StatsBarProps) {
  const stats: Stat[] = [
    {
      label: 'Folders',
      count: items.filter((i) => i.type === 'directory').length,
      color: 'text-folder',
      bg: 'bg-[var(--folder-soft)]',
      Icon: Folder,
    },
    {
      label: 'Files',
      count: items.filter((i) => i.type === 'file').length,
      color: 'text-muted-foreground',
      bg: 'bg-muted',
      Icon: File,
    },
    {
      label: 'Images',
      count: items.filter((i) => i.fileType === 'image').length,
      color: 'text-image',
      bg: 'bg-[var(--image-soft)]',
      Icon: ImageIcon,
    },
    {
      label: 'Videos',
      count: items.filter((i) => i.fileType === 'video').length,
      color: 'text-video',
      bg: 'bg-[var(--video-soft)]',
      Icon: VideoIcon,
    },
    {
      label: 'Audio',
      count: items.filter((i) => i.fileType === 'audio').length,
      color: 'text-audio',
      bg: 'bg-[var(--audio-soft)]',
      Icon: Music,
    },
  ];

  return (
    <div className="scrollbar-thin flex items-center gap-3 overflow-x-auto border-b border-border bg-muted/10 px-4 py-2 text-sm sm:px-6">
      {stats.map((s) => (
        <div
          key={s.label}
          className={cn(
            'flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5',
            s.bg,
          )}
        >
          <s.Icon className={cn('size-3.5', s.color)} />
          <span className="font-medium">{s.count}</span>
          <span className="text-xs text-muted-foreground">{s.label}</span>
        </div>
      ))}
      <div className="ml-auto flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-primary/10 px-3 py-1.5">
        <span className="font-semibold text-primary">{total}</span>
        <span className="text-xs text-muted-foreground">Total</span>
      </div>
    </div>
  );
}
