import type { LucideIcon } from 'lucide-react';
import {
  Archive,
  Code,
  File,
  FileText,
  Folder,
  Image as ImageIcon,
  Music,
  Video as VideoIcon,
} from 'lucide-react';
import type { ExplorerItem } from './parser';

/** Resolve the right Lucide icon for an item based on its type. */
export function resolveFileIcon(item: ExplorerItem): LucideIcon {
  if (item.type === 'directory') return Folder;
  switch (item.fileType) {
    case 'image':
      return ImageIcon;
    case 'video':
      return VideoIcon;
    case 'audio':
      return Music;
    case 'document':
      return FileText;
    case 'code':
      return Code;
    case 'archive':
      return Archive;
    default:
      return File;
  }
}
