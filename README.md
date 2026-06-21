# File Explorer

A Chrome extension that transforms local folders and `file://` directory listings into a powerful file browser — search, filters, previews, grid/list views, sort, and keyboard shortcuts. Built with **WXT + React 19 + Tailwind CSS v4 + shadcn/ui (radix-nova)**.

## Stack

- **Framework**: [WXT](https://wxt.dev) 0.20 (Manifest V3, Vite-powered)
- **UI**: React 19, Radix UI primitives, shadcn/ui (radix-nova / neutral)
- **Styling**: Tailwind CSS v4 with OKLCH CSS variables — no raw hex in components
- **Icons**: lucide-react
- **Runtime**: Bun

## Project structure

```
src/
├── assets/tailwind.css          # design tokens (CSS vars only) + tailwind import
├── components/
│   ├── ui/                      # shadcn primitives (button, dialog, …)
│   ├── Header.tsx               # breadcrumb + theme + shortcuts + dismiss
│   ├── Toolbar.tsx              # search + filter/thumbnails/view/sort
│   ├── StatsBar.tsx             # folder/file/image/video/audio/total counts
│   ├── ItemGrid.tsx             # infinite-scroll grid + list views
│   ├── FileItem.tsx             # grid card + list row renderers
│   ├── MediaViewer.tsx          # image/video/audio dialog with ←/→
│   ├── KeyboardShortcutsDialog.tsx
│   ├── EmptyState.tsx           # empty folder / no results
│   ├── LoadingSkeleton.tsx
│   ├── ThemeToggle.tsx          # Light / Dark / System
│   └── Home.tsx                 # root component tree
├── contexts/ExplorerContext.tsx # state for items/search/view/filter/sort
├── hooks/
│   ├── usePersistedState.ts     # chrome.storage.local wrapper
│   ├── useTheme.tsx             # theme provider with system detection
│   └── useKeyboardShortcuts.ts  # Ctrl+F, Esc, G, L, 1-9, Shift+?
├── lib/
│   ├── utils.ts                 # cn() helper
│   ├── parser.ts                # directory listing parser + formatters
│   └── icons.tsx                # per-type icon resolver
└── entrypoints/
    ├── background.ts            # service worker (action + command listener)
    ├── content.ts               # content script (ShadowRoot UI on file://)
    └── file-access-help/        # setup wizard page
        ├── index.html
        └── main.tsx
```

## Features

- **Directory parser** — Apache/Nginx `<table>` style + generic link fallback
- **Smart filters** — All / Folders / Files / Images / Videos / Audio / Documents / Code / Archives
- **Search** — case-insensitive, debounced via React state
- **Sort** — Name / Size / Last Modified / Type, ascending or descending
- **Views** — Grid (with optional image & video thumbnails) and List
- **Breadcrumbs** — Home + path segments, click to navigate up
- **Media viewer** — image / video / audio in a Radix Dialog with keyboard arrow nav
- **Stats bar** — live counts per type and total
- **Infinite scroll** — `react-infinite-scroll-component`, 50 items per page
- **Keyboard shortcuts** — `Ctrl+F` focus search, `Esc` clear, `G/L` view, `1-9` filters, `Shift+?` help
- **Theme** — Light / Dark / System, persisted to `chrome.storage.local`
- **Empty states** — empty folder & no search results
- **Loading skeletons** — during paginated loads

## Design tokens

All colors live in `src/assets/tailwind.css` as CSS variables (OKLCH). Components use semantic tokens (`bg-background`, `text-muted-foreground`, `text-folder`, etc.) — never hex. New file-type semantic colors can be added by extending the `--folder`, `--image`, `--video`, `--audio`, `--document`, `--code`, `--archive` (and their `-soft` / `-border` variants) variables.

## Development

```bash
bun install
bun run dev          # hot-reload dev mode
bun run build        # production build → .output/chrome-mv3
bun run zip          # packaged .zip for the Chrome Web Store
bun run compile      # type-check
```

## Loading in Chrome

1. `bun run build`
2. Open `chrome://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked** and select `.output/chrome-mv3/`
5. Visit any `file:///` directory in Chrome
6. If prompted, open **Details** for the extension and enable **Allow access to file URLs**
