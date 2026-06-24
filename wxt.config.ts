import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'node:path';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  srcDir: 'src',
  manifest: {
    name: 'File Explorer',
    description:
      'Transform local file:// directories into a visual file browser — search, filter, preview images & videos, grid/list views, and keyboard shortcuts. All processing is local; no data is sent anywhere.',
    permissions: ['storage', 'activeTab', 'scripting'],
    host_permissions: ['file://*/*'],
    action: {
      default_title: 'File Explorer',
    },
    commands: {
      _execute_action: {
        suggested_key: {
          default: 'Alt+Shift+F',
        },
        description: 'Open File Explorer',
      },
    },
  },
  alias: {
    '@': resolve(import.meta.dirname, './src'),
  },
  vite: () => ({
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': resolve(import.meta.dirname, './src'),
      },
    },
  }),
});
