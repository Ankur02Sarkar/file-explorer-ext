import * as React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Code,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  Music,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useExplorer } from '@/contexts/ExplorerContext';
import { describeType, formatSize, type ExplorerItem } from '@/lib/parser';

const TEXT_PREVIEW_LIMIT = 200 * 1024; // 200 KB cap on text previews.

export function MediaViewer() {
  const { selectedItem, setSelectedItem, mediaItems, cycleMedia } =
    useExplorer();

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
  const badge = describeType(selectedItem);

  const onDownload = () => {
    const a = document.createElement('a');
    a.href = selectedItem.href;
    a.download = selectedItem.name;
    a.click();
  };

  const onOpenExternal = () => {
    window.open(selectedItem.href, '_blank', 'noopener');
  };

  return (
    <Dialog open onOpenChange={(open) => !open && setSelectedItem(null)}>
      <DialogContent
        hideClose
        className="flex h-[90vh] w-[95vw] max-w-5xl flex-col gap-0 overflow-hidden p-0"
      >
        <DialogHeader className="border-b p-5 pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <DialogTitle className="truncate text-xl">
                {selectedItem.name}
              </DialogTitle>
              <DialogDescription className="mt-1 flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full border px-2 py-0.5 text-xs font-medium ${badge.bg} ${badge.color} ${badge.border}`}
                >
                  {badge.label}
                </span>
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
                onClick={onOpenExternal}
                title="Open in new tab"
                aria-label="Open in new tab"
              >
                <ExternalLink className="size-4" />
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
          <PreviewSurface item={selectedItem} />
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

/**
 * Renders the right preview surface for the selected item. Falls back to
 * an iframe (which Chrome handles natively for PDFs and other MIME types)
 * and finally to a generic file card.
 */
function PreviewSurface({ item }: { item: ExplorerItem }) {
  if (item.type === 'directory') return <DirectoryPreview item={item} />;

  switch (item.fileType) {
    case 'image':
      return (
        <img
          src={item.href}
          alt={item.name}
          className="max-h-full max-w-full rounded-lg object-contain shadow-lg"
        />
      );
    case 'video':
      return (
        <video
          src={item.href}
          controls
          autoPlay
          className="max-h-full max-w-full rounded-lg shadow-lg"
        />
      );
    case 'audio':
      return <AudioPreview item={item} />;
    case 'document':
    case 'code':
      return <TextOrIframePreview item={item} />;
    case 'archive':
      return <GenericPreview item={item} />;
    default:
      return <GenericPreview item={item} />;
  }
}

function AudioPreview({ item }: { item: ExplorerItem }) {
  return (
    <div className="bg-background flex flex-col items-center gap-4 rounded-lg p-8 shadow-lg">
      <div className="text-6xl">🎵</div>
      <div className="text-center">
        <p className="mb-2 text-lg font-semibold">{item.name}</p>
        {item.size && (
          <p className="text-muted-foreground text-sm">
            {formatSize(item.size)}
          </p>
        )}
      </div>
      <audio src={item.href} controls autoPlay className="mt-4 w-full max-w-md" />
    </div>
  );
}

/**
 * For documents/code we try a text fetch first (cheap, in-place preview).
 * If the file is too large, not text, or `fetch` is blocked by the
 * `file://` same-origin policy (Chrome treats every `file://` URL as a
 * unique origin), we fall through to `GenericPreview` which offers
 * Download / Open in new tab buttons. We deliberately do NOT use an
 * `<iframe>` here because Chrome refuses to load `file://` URLs from a
 * `file://` page (`Unsafe attempt to load URL file:///... from frame`).
 */
function TextOrIframePreview({ item }: { item: ExplorerItem }) {
  const [text, setText] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [fallback, setFallback] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    setText(null);
    setFallback(false);
    setLoading(true);

    // Detect binary MIME types we should never try to read as text.
    const lowerName = item.name.toLowerCase();
    const isBinary =
      item.ext === 'pdf' ||
      item.ext === 'doc' ||
      item.ext === 'docx' ||
      item.ext === 'xls' ||
      item.ext === 'xlsx' ||
      item.ext === 'ppt' ||
      item.ext === 'pptx' ||
      /\.(png|jpe?g|gif|webp|bmp|ico|svg|avif)$/.test(lowerName);

    if (isBinary) {
      setLoading(false);
      setFallback(true);
      return;
    }

    (async () => {
      try {
        const res = await fetch(item.href);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        if (blob.size > TEXT_PREVIEW_LIMIT) throw new Error('too-large');
        const reader = new FileReader();
        reader.onload = () => {
          if (cancelled) return;
          const value = String(reader.result ?? '');
          // Heuristic: if the first 4 KB contains a NUL byte, treat as binary.
          const probe = value.slice(0, 4096);
          if (probe.includes(' ')) {
            setFallback(true);
          } else {
            setText(value);
          }
          setLoading(false);
        };
        reader.onerror = () => {
          if (cancelled) return;
          setFallback(true);
          setLoading(false);
        };
        reader.readAsText(blob);
      } catch (err) {
        if (cancelled) return;
        // `fetch` against `file://` URLs is blocked by Chrome's
        // same-origin policy when running from a `file://` page — that's
        // expected, just fall back gracefully.
        void err;
        setFallback(true);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [item.href, item.name, item.ext]);

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
        <p className="text-sm">Loading preview…</p>
      </div>
    );
  }

  if (text !== null && !fallback) {
    return (
      <pre className="bg-background max-h-full max-w-full overflow-auto rounded-lg p-4 text-left text-xs shadow-lg">
        <code>{text}</code>
      </pre>
    );
  }

  // Fetch failed, file too large, binary MIME, or blocked by file://
  // same-origin policy — offer Download / Open in new tab instead of a
  // broken iframe.
  return <GenericPreview item={item} />;
}

function DirectoryPreview({ item }: { item: ExplorerItem }) {
  return (
    <div className="bg-background flex flex-col items-center gap-4 rounded-lg p-8 shadow-lg">
      <div className="text-6xl">📁</div>
      <div className="text-center">
        <p className="mb-2 text-lg font-semibold">{item.name}</p>
        <p className="text-muted-foreground text-sm">Folder</p>
      </div>
      <a
        href={item.href}
        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium shadow"
      >
        Open folder
      </a>
    </div>
  );
}

function GenericPreview({ item }: { item: ExplorerItem }) {
  const badge = describeType(item);
  return (
    <div className="bg-background flex max-w-md flex-col items-center gap-4 rounded-lg p-8 text-center shadow-lg">
      {item.fileType === 'code' ? (
        <Code className="text-code size-12" />
      ) : item.fileType === 'document' ? (
        <FileText className="text-document size-12" />
      ) : item.fileType === 'archive' ? (
        <div className="text-5xl">📦</div>
      ) : item.fileType === 'audio' ? (
        <Music className="text-audio size-12" />
      ) : (
        <FileText className="text-muted-foreground size-12" />
      )}
      <div>
        <p className="mb-1 text-lg font-semibold">{item.name}</p>
        <p className="text-muted-foreground text-sm">
          {badge.label}
          {item.size && ` • ${formatSize(item.size)}`}
        </p>
      </div>
      <p className="text-muted-foreground text-xs">
        No inline preview available. Download or open in a new tab.
      </p>
    </div>
  );
}
