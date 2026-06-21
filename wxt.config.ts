import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  srcDir: 'src',
  manifest: {
    name: 'File Explorer',
    description:
      'Transform local folders and directory listings into a powerful file browser with search, filters, previews & shortcuts.',
    permissions: ['storage', 'activeTab', 'scripting'],
    host_permissions: ['file://*/*'],
    commands: {
      _execute_action: {
        suggested_key: {
          default: 'Alt+Shift+F',
        },
        description: 'Open File Explorer',
      },
    },
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
