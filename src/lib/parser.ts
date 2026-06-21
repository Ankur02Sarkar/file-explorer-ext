/**
 * Directory listing parser + formatters.
 *
 * Mirrors the original extension's parser closely so we behave identically
 * on Apache/Nginx directory listings and generic link lists.
 */

export type FileType =
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'code'
  | 'archive'
  | null;

export interface ExplorerItem {
  name: string;
  href: string;
  type: 'file' | 'directory';
  ext?: string;
  fileType: FileType;
  size?: string;
  modified?: string;
}

const IMAGE_EXTS = [
  'bmp',
  'gif',
  'heic',
  'ico',
  'j2c',
  'jp2',
  'jpm',
  'jpx',
  'jxr',
  'png',
  'psd',
  'svg',
  'tif',
  'webp',
  'jpg',
  'jpeg',
  'avif',
];

const VIDEO_EXTS = [
  '3g2',
  '3gp',
  'avif',
  'avi',
  'flv',
  'm4v',
  'mkv',
  'mov',
  'mp4',
  'mpg',
  'ogv',
  'webm',
];

const AUDIO_EXTS = [
  'aac',
  'ac3',
  'amr',
  'ape',
  'flac',
  'm4a',
  'm4b',
  'm4p',
  'mp3',
  'ogg',
  'opus',
  'spx',
  'wav',
];

const DOCUMENT_EXTS = ['pdf', 'doc', 'docx', 'txt', 'md', 'rtf', 'odt'];

const CODE_EXTS = [
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
];

const ARCHIVE_EXTS = ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'dmg', 'iso'];

export function classifyExtension(ext: string | undefined): FileType {
  if (!ext) return null;
  const e = ext.toLowerCase();
  if (IMAGE_EXTS.includes(e)) return 'image';
  if (VIDEO_EXTS.includes(e)) return 'video';
  if (AUDIO_EXTS.includes(e)) return 'audio';
  if (DOCUMENT_EXTS.includes(e)) return 'document';
  if (CODE_EXTS.includes(e)) return 'code';
  if (ARCHIVE_EXTS.includes(e)) return 'archive';
  return null;
}

/** Strip extension from a filename for display. */
function stripExt(name: string, ext: string | undefined): string {
  if (!ext) return name;
  const suffix = `.${ext}`;
  if (name.toLowerCase().endsWith(suffix)) {
    return name.slice(0, -suffix.length);
  }
  return name;
}

/** Read a link and turn it into a partial ExplorerItem (no size/modified yet). */
function readAnchor(anchor: HTMLAnchorElement | HTMLAreaElement, baseHref: string): ExplorerItem {
  const t: ExplorerItem = {
    name: '',
    href: '',
    type: 'file',
    fileType: null,
  };
  const rawHref = anchor.href.split('?')[0];
  t.href = rawHref;
  let rel = decodeURIComponent(rawHref.replace(baseHref.split('?')[0], ''));
  if (rel.startsWith('/')) rel = rel.slice(1);
  if (rel.endsWith('/') || !rel.includes('.')) {
    if (rel.endsWith('/')) rel = rel.slice(0, -1);
    t.type = 'directory';
  } else {
    t.type = 'file';
    const ext = rel.split('.').pop();
    if (ext) {
      t.ext = ext;
      t.fileType = classifyExtension(ext);
      rel = stripExt(rel, ext) || rel;
    }
  }
  t.name = rel || anchor.textContent?.trim() || '';
  return t;
}

/** Parse header row to discover column indices for name/size/modified/description. */
function parseHeaderRow(row: HTMLTableRowElement): Record<number, string> {
  const columns = ['name', 'size', 'modified', 'description'];
  const mapping: Record<number, string> = {};
  Array.from(row.children).forEach((cell, idx) => {
    const text = cell.textContent?.trim().toLowerCase() ?? '';
    const match = columns.find((c) => text.includes(c));
    if (text && match) mapping[idx] = match;
  });
  return mapping;
}

function parseBodyRow(
  row: HTMLTableRowElement,
  headerMap: Record<number, string>,
  baseHref: string,
): ExplorerItem | null {
  let item: Partial<ExplorerItem> = {};
  Object.entries(headerMap).forEach(([idxStr, col]) => {
    const idx = Number(idxStr);
    const cell = row.children[idx];
    if (!cell) return;
    if (col === 'name') {
      const anchor = cell.querySelector('a');
      if (anchor) Object.assign(item, readAnchor(anchor, baseHref));
    } else {
      const value = cell.textContent?.trim();
      if (value) (item as Record<string, string>)[col] = value;
    }
  });
  if (!item.name || !item.href) return null;
  return item as ExplorerItem;
}

/** Detect & parse the page's directory listing. */
export function parseDirectoryListing(): ExplorerItem[] {
  if (typeof document === 'undefined') return [];
  const baseHref = window.location.href;
  const table = document.querySelector('table');
  const items: ExplorerItem[] = [];

  if (table) {
    const rows = Array.from(table.querySelectorAll('tr'));
    if (rows.length === 0) return [];
    const headerMap = parseHeaderRow(rows[0]);
    for (let i = 1; i < rows.length; i++) {
      const parsed = parseBodyRow(rows[i], headerMap, baseHref);
      if (parsed) items.push(parsed);
    }
  } else {
    Array.from(document.links).forEach((anchor) => {
      const parsed = readAnchor(anchor, baseHref);
      if (parsed.name && parsed.href) items.push(parsed);
    });
  }

  return items
    .filter((item) => !baseHref.includes(item.href))
    .filter((item) => Object.keys(item).length > 0);
}

/** Format bytes / "1.5K" / "2M" → "1.5 KB" / "2.0 MB" / "1.5 GB". */
export function formatSize(input: string | number | undefined | null): string {
  if (!input && input !== 0) return '—';
  if (typeof input === 'number') return formatBytes(input);
  const value = String(input).trim();
  if (!value || value === '-') return '—';
  const shortMatch = value.match(/^([\d.]+)([KMGT]?)$/i);
  if (shortMatch) {
    const num = parseFloat(shortMatch[1]);
    const unit = shortMatch[2].toUpperCase();
    if (!unit) return formatBytes(num);
    const map: Record<string, string> = {
      K: 'KB',
      M: 'MB',
      G: 'GB',
      T: 'TB',
    };
    return `${num} ${map[unit] ?? unit}`;
  }
  return formatBytes(parseFloat(value));
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

/** Format a date string into relative form, e.g. "Just now" / "3 hours ago". */
export function formatDate(input: string | number | Date | undefined | null): string {
  if (!input) return '—';
  let date: Date;
  try {
    date = new Date(input);
    if (Number.isNaN(date.getTime())) return String(input);
  } catch {
    return String(input);
  }
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) {
    const m = Math.floor(diffSec / 60);
    return `${m} minute${m > 1 ? 's' : ''} ago`;
  }
  if (diffSec < 86_400) {
    const h = Math.floor(diffSec / 3600);
    return `${h} hour${h > 1 ? 's' : ''} ago`;
  }
  if (diffSec < 604_800) {
    const d = Math.floor(diffSec / 86_400);
    return `${d} day${d > 1 ? 's' : ''} ago`;
  }
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** CSS-var classnames for the type badge / tinted surfaces. */
export function typeBadgeClasses(type: FileType | undefined) {
  switch (type) {
    case 'image':
      return {
        label: 'Image',
        color: 'text-image',
        bg: 'bg-[var(--image-soft)]',
        border: 'border-[var(--image-border)]',
      };
    case 'video':
      return {
        label: 'Video',
        color: 'text-video',
        bg: 'bg-[var(--video-soft)]',
        border: 'border-[var(--video-border)]',
      };
    case 'audio':
      return {
        label: 'Audio',
        color: 'text-audio',
        bg: 'bg-[var(--audio-soft)]',
        border: 'border-[var(--audio-border)]',
      };
    case 'document':
      return {
        label: 'Document',
        color: 'text-document',
        bg: 'bg-[var(--document-soft)]',
        border: 'border-[var(--document-border)]',
      };
    case 'code':
      return {
        label: 'Code',
        color: 'text-code',
        bg: 'bg-[var(--code-soft)]',
        border: 'border-[var(--code-border)]',
      };
    case 'archive':
      return {
        label: 'Archive',
        color: 'text-archive',
        bg: 'bg-[var(--archive-soft)]',
        border: 'border-[var(--archive-border)]',
      };
    default:
      return null;
  }
}

export function describeType(item: ExplorerItem): {
  label: string;
  color: string;
  bg: string;
  border: string;
} {
  if (item.type === 'directory') {
    return {
      label: 'Folder',
      color: 'text-folder',
      bg: 'bg-[var(--folder-soft)]',
      border: 'border-[var(--folder-border)]',
    };
  }
  const badge = typeBadgeClasses(item.fileType);
  if (badge) return badge;
  return {
    label: item.ext ? item.ext.toUpperCase() : 'File',
    color: 'text-muted-foreground',
    bg: 'bg-muted',
    border: 'border-border',
  };
}

export type SortKey = 'name' | 'size' | 'modified' | 'type';
export type SortOrder = 'asc' | 'desc';

export function sortItems(
  items: ExplorerItem[],
  by: SortKey,
  order: SortOrder,
): ExplorerItem[] {
  const dir = order === 'asc' ? 1 : -1;
  const dirsFirst = [...items].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
    return 0;
  });
  return dirsFirst.sort((a, b) => {
    if (a.type !== b.type) return 0;
    let cmp = 0;
    switch (by) {
      case 'name':
        cmp = a.name.localeCompare(b.name, undefined, { numeric: true });
        break;
      case 'size': {
        const av = parseSize(a.size);
        const bv = parseSize(b.size);
        cmp = av - bv;
        break;
      }
      case 'modified': {
        const av = parseDate(a.modified);
        const bv = parseDate(b.modified);
        cmp = av - bv;
        break;
      }
      case 'type':
        cmp = (a.fileType ?? 'zz').localeCompare(b.fileType ?? 'zz');
        break;
    }
    return cmp * dir;
  });
}

function parseSize(input: string | undefined): number {
  if (!input) return -1;
  const match = input.match(/^([\d.]+)\s*([KMGT]?B)?$/i);
  if (!match) return parseFloat(input) || -1;
  const n = parseFloat(match[1]);
  const unit = (match[2] || '').toUpperCase();
  const mult: Record<string, number> = {
    KB: 1024,
    MB: 1024 ** 2,
    GB: 1024 ** 3,
    TB: 1024 ** 4,
  };
  return n * (mult[unit] ?? 1);
}

function parseDate(input: string | undefined): number {
  if (!input) return 0;
  const t = new Date(input).getTime();
  return Number.isNaN(t) ? 0 : t;
}
