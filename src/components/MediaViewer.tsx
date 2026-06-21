import * as React from 'react';
import { ChevronLeft, ChevronRight, Download, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useExplorer } from '@/contexts/ExplorerContext';
import { formatSize } from '@/lib/parser';

export function MediaViewer() {
  const { selectedItem, setSelectedItem, mediaItems, cycleMedia } = useExplorer();

  // Keyboard nav: ←/→/Esc
  React.useEffect(() => {
    if (!selectedItem) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        cycleMedia('prev');
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        cycleMedia('next');
      } else if (event.key === 'Escape') {
        setSelectedItem(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedItem, cycleMedia, setSelectedItem]);

  if (!selectedItem) return null;

  const idx = mediaItems.findIndex((i) => i.href === selectedItem.href);
  const hasPrev = idx > 0;
  const hasNext = idx >= 0 && idx < mediaItems.length - 1;

  const onDownload = () => {
    const a = document.createElement('a');
    a.href = selectedItem.href;
    a.download = selectedItem.name;
    a.click();
  };

  return (
    <Dialog open onOpenChange={(open) => !open && setSelectedItem(null)}>
      <DialogContent
        hideClose
        className="flex h-[85vh] w-[90vw] max-w-4xl flex-col gap-0 p-0"
      >
        <DialogHeader className="border-b p-6 pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <DialogTitle className="truncate text-xl">
                {selectedItem.name}
              </DialogTitle>
              <DialogDescription className="mt-1 flex items-center gap-3">
                {selectedItem.ext && (
                  <span className="bg-muted rounded-full px-2 py-0.5 text-xs">
                    .{selectedItem.ext}
                  </span>
                )}
                {selectedItem.size && (
                  <span className="text-sm">{formatSize(selectedItem.size)}</span>
                )}
                {mediaItems.length > 1 && (
                  <span className="text-sm">
                    {idx + 1} of {mediaItems.length}
                  </span>
                )}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={onDownload}
                title="Download"
                aria-label="Download"
              >
                <Download className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSelectedItem(null)}
                title="Close"
                aria-label="Close"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="bg-muted/20 flex flex-1 items-center justify-center overflow-auto p-6">
          {selectedItem.fileType === 'image' && (
            <img
              src={selectedItem.href}
              alt={selectedItem.name}
              className="max-h-full max-w-full rounded-lg object-contain shadow-lg"
            />
          )}
          {selectedItem.fileType === 'video' && (
            <video
              src={selectedItem.href}
              controls
              autoPlay
              className="max-h-full max-w-full rounded-lg shadow-lg"
            />
          )}
          {selectedItem.fileType === 'audio' && (
            <div className="bg-background flex flex-col items-center gap-4 rounded-lg p-8 shadow-lg">
              <div className="text-6xl">🎵</div>
              <div className="text-center">
                <p className="mb-2 text-lg font-semibold">{selectedItem.name}</p>
                {selectedItem.size && (
                  <p className="text-muted-foreground text-sm">
                    {formatSize(selectedItem.size)}
                  </p>
                )}
              </div>
              <audio
                src={selectedItem.href}
                controls
                autoPlay
                className="mt-4 w-full max-w-md"
              />
            </div>
          )}
        </div>

        {mediaItems.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-4 top-1/2 size-10 -translate-y-1/2 rounded-full shadow-lg"
              onClick={() => cycleMedia('prev')}
              disabled={!hasPrev}
              aria-label="Previous"
            >
              <ChevronLeft className="size-5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-4 top-1/2 size-10 -translate-y-1/2 rounded-full shadow-lg"
              onClick={() => cycleMedia('next')}
              disabled={!hasNext}
              aria-label="Next"
            >
              <ChevronRight className="size-5" />
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
