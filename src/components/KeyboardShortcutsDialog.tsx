import { Keyboard } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATEGORIES = [
  {
    title: 'Navigation',
    items: [
      { keys: ['Ctrl', 'F'], description: 'Focus search' },
      { keys: ['Esc'], description: 'Clear search and filters' },
      { keys: ['←', '→'], description: 'Navigate media in popup' },
    ],
  },
  {
    title: 'View Controls',
    items: [
      { keys: ['G'], description: 'Switch to grid view' },
      { keys: ['L'], description: 'Switch to list view' },
    ],
  },
  {
    title: 'Filters (Quick Access)',
    items: [
      { keys: ['1'], description: 'Show all items' },
      { keys: ['2'], description: 'Show only folders' },
      { keys: ['3'], description: 'Show only files' },
      { keys: ['4'], description: 'Show only images' },
      { keys: ['5'], description: 'Show only videos' },
      { keys: ['6'], description: 'Show only audio' },
      { keys: ['7'], description: 'Show only documents' },
      { keys: ['8'], description: 'Show only code files' },
      { keys: ['9'], description: 'Show only archives' },
    ],
  },
  {
    title: 'Help',
    items: [{ keys: ['Shift', '?'], description: 'Show this help dialog' }],
  },
];

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Keyboard className="size-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to navigate and control the file
            explorer more efficiently.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {CATEGORIES.map((cat) => (
            <div key={cat.title}>
              <h3 className="text-muted-foreground mb-3 text-sm font-semibold uppercase tracking-wide">
                {cat.title}
              </h3>
              <div className="space-y-2">
                {cat.items.map((item, i) => (
                  <div
                    key={i}
                    className="hover:bg-muted/50 flex items-center justify-between rounded-lg px-3 py-2"
                  >
                    <span className="text-sm">{item.description}</span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((key, j) => (
                        <div key={j} className="flex items-center gap-1">
                          <kbd className="bg-background min-w-8 rounded border border-border px-2 py-1 text-center text-xs font-semibold shadow-sm">
                            {key}
                          </kbd>
                          {j < item.keys.length - 1 && (
                            <span className="text-muted-foreground text-xs">+</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={() => onOpenChange(false)}>Got it!</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
