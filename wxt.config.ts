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
      'Browse local directories with search, filters, image/video previews, grid/list views, and shortcuts. Fully local, no server calls.',
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
