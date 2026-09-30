import { defineConfig, build, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

function buildExtensionScripts(): Plugin {
  return {
    name: 'build-extension-scripts',
    apply: 'build',
    async closeBundle() {
      // 1. Build content script as a self-contained IIFE classic script (no ES import/export)
      await build({
        configFile: false,
        plugins: [],
        resolve: {
          alias: {
            '@': resolve(__dirname, './src'),
          },
        },
        build: {
          outDir: 'dist',
          emptyOutDir: false,
          lib: {
            entry: resolve(__dirname, 'src/content/index.ts'),
            name: 'FocusFeedContent',
            formats: ['iife'],
            fileName: () => 'content/index.js',
          },
          rollupOptions: {
            output: {
              extend: true,
            },
          },
        },
        define: {
          'process.env.NODE_ENV': '"production"',
        },
      });

      // 2. Build background service worker as a self-contained bundle
      await build({
        configFile: false,
        plugins: [],
        resolve: {
          alias: {
            '@': resolve(__dirname, './src'),
          },
        },
        build: {
          outDir: 'dist',
          emptyOutDir: false,
          lib: {
            entry: resolve(__dirname, 'src/background/index.ts'),
            name: 'FocusFeedBackground',
            formats: ['es'],
            fileName: () => 'background/index.js',
          },
          rollupOptions: {
            output: {
              inlineDynamicImports: true,
            },
          },
        },
        define: {
          'process.env.NODE_ENV': '"production"',
        },
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), buildExtensionScripts()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/index.html'),
        onboarding: resolve(__dirname, 'src/onboarding/index.html'),
        settings: resolve(__dirname, 'src/settings/index.html'),
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'ui.css';
          }
          return 'assets/[name]-[hash].[ext]';
        },
      },
    },
  },
});

