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
  RotateCcw,
  RotateCw,
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

type Rotation = 0 | 90 | 180 | 270;

function nextRotation(current: Rotation, dir: 'cw' | 'ccw'): Rotation {
  const steps: Rotation[] = [0, 90, 180, 270];
  const idx = steps.indexOf(current);
  if (dir === 'cw') return steps[(idx + 1) % 4];
  return steps[(idx + 3) % 4]; // +3 mod 4 = −1 mod 4
}

export function MediaViewer() {
  const { selectedItem, setSelectedItem, mediaItems, cycleMedia } =
    useExplorer();

  const [rotation, setRotation] = React.useState<Rotation>(0);

  // Reset rotation whenever the selected item changes.
  React.useEffect(() => {
    setRotation(0);
  }, [selectedItem?.href]);

  const canRotate =
    selectedItem?.fileType === 'image' || selectedItem?.fileType === 'video';

  const rotateCw = React.useCallback(
    () => canRotate && setRotation((r) => nextRotation(r as Rotation, 'cw')),
    [canRotate],
  );
  const rotateCcw = React.useCallback(
    () => canRotate && setRotation((r) => nextRotation(r as Rotation, 'ccw')),
    [canRotate],
  );

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
      } else if (event.key === '[') {
        event.preventDefault();
        rotateCcw();
      } else if (event.key === ']') {
        event.preventDefault();
        rotateCw();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedItem, cycleMedia, setSelectedItem, rotateCw, rotateCcw]);

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
              {canRotate && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={rotateCcw}
                    title="Rotate left ([)"
                    aria-label="Rotate left"
                  >
                    <RotateCcw className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={rotateCw}
                    title="Rotate right (])"
                    aria-label="Rotate right"
                  >
                    <RotateCw className="size-4" />
                  </Button>
                  <div className="bg-border h-5 w-px" />
                </>
              )}
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

        <div className="bg-muted/30 flex flex-1 items-center justify-center overflow-auto p-6">
          <PreviewSurface item={selectedItem} rotation={rotation} />
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
/**
 * Wraps rotatable media (image / video) so the layout box always matches the
 * visual footprint after rotation.
 *
 * Problem: CSS `transform: rotate()` rotates visually but leaves the element's
 * layout box unchanged. A portrait image rotated 90° looks landscape but the
 * browser still reserves portrait space — the parent flex container sizes to
 * that original box and the rotated image overflows / gets clipped.
 *
 * Solution: a wrapper div whose layout dimensions are already the *swapped*
 * values (width ↔ height constrained axes) so the flex parent accounts for
 * the correct footprint. The media inside fills the wrapper 100%×100% and is
 * then visually rotated in-place — no clipping.
 */
function RotatableWrapper({
  rotation,
  children,
}: {
  rotation: Rotation;
  children: React.ReactNode;
}) {
  const isOdd = rotation === 90 || rotation === 270;

  // At 0°/180° the element fits inside the container normally.
  // At 90°/270° the visual width = original height, visual height = original width.
  // We constrain the wrapper using the *opposite* viewport axis so the rotated
  // media never exceeds the available space on either side.
  const wrapperStyle: React.CSSProperties = isOdd
    ? {
        // visual width (= original height) must not exceed the container height
        maxWidth: 'min(calc(80vh - 80px), 100%)',
        // visual height (= original width) must not exceed the container width
        maxHeight: 'min(80vw, 100%)',
        width: 'min(calc(80vh - 80px), 100%)',
        height: 'min(80vw, 100%)',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }
    : {
        maxWidth: '100%',
        maxHeight: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      };

  const mediaStyle: React.CSSProperties = {
    // Fill the wrapper so the rotate happens inside a correctly-sized box.
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    transform: rotation ? `rotate(${rotation}deg)` : undefined,
    transition: 'transform 250ms ease',
    borderRadius: '0.5rem',
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / .1), 0 4px 6px -4px rgb(0 0 0 / .1)',
  };

  return (
    <div style={wrapperStyle}>
      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<{ style?: React.CSSProperties }>, {
            style: {
              ...(children as React.ReactElement<{ style?: React.CSSProperties }>).props.style,
              ...mediaStyle,
            },
          })
        : children}
    </div>
  );
}

function PreviewSurface({
  item,
  rotation,
}: {
  item: ExplorerItem;
  rotation: Rotation;
}) {
  if (item.type === 'directory') return <DirectoryPreview item={item} />;

  switch (item.fileType) {
    case 'image':
      return (
        <RotatableWrapper rotation={rotation}>
          <img
            src={item.href}
            alt={item.name}
          />
        </RotatableWrapper>
      );
    case 'video':
      return (
        <RotatableWrapper rotation={rotation}>
          <video
            src={item.href}
            controls
            autoPlay
          />
        </RotatableWrapper>
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
