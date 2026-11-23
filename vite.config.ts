import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import fs from 'fs';
import path from 'path';
import { buildSync as esbuildSync } from 'esbuild';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'favicon.ico',
          'favicon-16x16.png',
          'favicon-32x32.png',
          'apple-touch-icon.png',
          'icon.svg',
          'og-image.jpg',
          'og-image.png',
          'robots.txt',
          'sitemap.xml',
          'llms.txt',
          'llms-full.txt',
        ],
        manifest: {
          id: '/',
          name: 'Goma — Delano Collection',
          short_name: 'Goma',
          description:
            'Marketplace de vêtements et accessoires au Bénin : pièces neuves d’atelier, friperie 1er choix et conseiller IA en FCFA.',
          theme_color: '#2B211B',
          background_color: '#FDFCFB',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          lang: 'fr',
          categories: ['shopping', 'lifestyle'],
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-stylesheets',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-webfonts',
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
      // Copies src/assets into dist/ so root-relative URLs like
      // "/src/assets/images/..." (e.g. generate_image output) still resolve
      // in production builds. Do not remove.
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(__dirname, 'dist');
          const srcAssets = path.resolve(__dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {recursive: true, force: true});
          }
          const builtHtml = path.join(distDir, 'index.html');
          const apiShellHtml = path.resolve(__dirname, 'api/_shell.html');
          if (fs.existsSync(builtHtml)) {
            fs.mkdirSync(path.dirname(apiShellHtml), {recursive: true});
            fs.copyFileSync(builtHtml, apiShellHtml);
            // On Vercel, remove static dist/index.html so "/" routes through /api/render for dynamic OG tags
            if (process.env.VERCEL === '1' || process.env.VERCEL === 'true') {
              fs.rmSync(builtHtml, {force: true});
            }
          }

          // Bundle OG resolver into a self-contained ESM module for Vercel Node runtime (/api/render.ts)
          const ogEntry = path.resolve(__dirname, 'src/utils/ogMeta.ts');
          const apiOgOut = path.resolve(__dirname, 'api/_ogMeta.mjs');
          if (fs.existsSync(ogEntry)) {
            fs.mkdirSync(path.dirname(apiOgOut), {recursive: true});
            esbuildSync({
              entryPoints: [ogEntry],
              outfile: apiOgOut,
              bundle: true,
              format: 'esm',
              platform: 'node',
              target: 'node20',
              minify: true,
            });
          }
        },
      },
    ],
    resolve: {
      dedupe: ['react', 'react-dom'],
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'motion/react', 'lucide-react'],
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      ...(process.env.DISABLE_HMR === 'true' ? { ws: false as const } : {}),
    },
  };
});
