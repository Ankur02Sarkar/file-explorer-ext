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

## Install from GitHub Releases (recommended)

Pre-built zips for every release are available on the [GitHub Releases page](https://github.com/Ankur02Sarkar/file-explorer-ext/releases).

### Chrome / Edge / Brave (Manifest V3)

1. Go to the latest release and download `file-explorer-ext-{version}-chrome.zip`.
2. Unzip the file — you'll get a folder like `file-explorer-ext-1.0.0-chrome/`.
3. Open `chrome://extensions` (or `edge://extensions` / `brave://extensions`).
4. Enable **Developer mode** (toggle in the top-right corner).
5. Click **Load unpacked** and select the unzipped folder.
6. **Critical**: Open the extension **Details** (or click the puzzle-piece icon → manage extensions) and enable **Allow access to file URLs**.
   > ⚠️ **Required**: Without this, the extension cannot read `file:///` directories and will not work.
7. Visit any `file:///` directory in your browser — the File Explorer UI will appear automatically.

### Firefox (Manifest V2)

> Firefox requires a signed extension for permanent installation. The provided build is a temporary add-on that loads until you restart Firefox.

1. Go to the latest release and download `file-explorer-ext-{version}-firefox.zip` (keep it zipped).
2. Open `about:debugging` → **This Firefox**.
3. Click **Load Temporary Add-on** and select the downloaded `.zip` file directly.
4. Visit any `file:///` directory — the File Explorer UI will appear.
5. To keep it across restarts, the extension would need to be submitted to and signed by Mozilla AMO (not yet done).

---

## Loading from source (for developers)

If you prefer to build yourself:

```bash
bun install
bun run build          # → .output/chrome-mv3/
bun run zip            # → .output/file-explorer-ext-{version}-chrome.zip
bun run zip:firefox    # → .output/file-explorer-ext-{version}-firefox.zip
```

Then follow the same installation steps above using the generated folders/zips.
