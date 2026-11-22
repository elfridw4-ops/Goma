import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');

const CHROME_PATH =
  '/ms-playwright/chromium_headless_shell-1247/chrome-headless-shell-linux64/chrome-headless-shell';

const iconSvg = fs.readFileSync(path.join(publicDir, 'icon.svg'), 'utf-8');
const maskableSvg = fs.readFileSync(
  path.join(publicDir, 'icon-maskable.svg'),
  'utf-8',
);
const ogSvg = fs.readFileSync(path.join(publicDir, 'og-image.svg'), 'utf-8');

const htmlPages = {
  '/icon-192.html': `<!DOCTYPE html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;overflow:hidden;width:192px;height:192px;background:transparent;}svg{width:100%;height:100%;display:block;}</style></head><body>${iconSvg}</body></html>`,
  '/icon-512.html': `<!DOCTYPE html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;overflow:hidden;width:512px;height:512px;background:transparent;}svg{width:100%;height:100%;display:block;}</style></head><body>${iconSvg}</body></html>`,
  '/icon-maskable.html': `<!DOCTYPE html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;overflow:hidden;width:512px;height:512px;background:#2B211B;}svg{width:100%;height:100%;display:block;}</style></head><body>${maskableSvg}</body></html>`,
  '/apple-touch.html': `<!DOCTYPE html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;overflow:hidden;width:180px;height:180px;background:transparent;}svg{width:100%;height:100%;display:block;}</style></head><body>${iconSvg}</body></html>`,
  '/favicon-32.html': `<!DOCTYPE html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;overflow:hidden;width:32px;height:32px;background:transparent;}svg{width:100%;height:100%;display:block;}</style></head><body>${iconSvg}</body></html>`,
  '/favicon-16.html': `<!DOCTYPE html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;overflow:hidden;width:16px;height:16px;background:transparent;}svg{width:100%;height:100%;display:block;}</style></head><body>${iconSvg}</body></html>`,
  '/og-image.html': `<!DOCTYPE html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;overflow:hidden;width:1200px;height:630px;background:#2B211B;}svg{width:100%;height:100%;display:block;}</style></head><body>${ogSvg}</body></html>`,
};

const server = http.createServer((req, res) => {
  const content = htmlPages[req.url || ''];
  if (content) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(content);
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(3099, '127.0.0.1', () => {
  console.log('Temporary asset render server listening on port 3099');

  const tasks = [
    {
      url: 'http://127.0.0.1:3099/icon-192.html',
      output: path.join(publicDir, 'pwa-192x192.png'),
      w: 192,
      h: 192,
    },
    {
      url: 'http://127.0.0.1:3099/icon-512.html',
      output: path.join(publicDir, 'pwa-512x512.png'),
      w: 512,
      h: 512,
    },
    {
      url: 'http://127.0.0.1:3099/icon-maskable.html',
      output: path.join(publicDir, 'pwa-maskable-512x512.png'),
      w: 512,
      h: 512,
    },
    {
      url: 'http://127.0.0.1:3099/apple-touch.html',
      output: path.join(publicDir, 'apple-touch-icon.png'),
      w: 180,
      h: 180,
    },
    {
      url: 'http://127.0.0.1:3099/favicon-32.html',
      output: path.join(publicDir, 'favicon-32x32.png'),
      w: 32,
      h: 32,
    },
    {
      url: 'http://127.0.0.1:3099/favicon-16.html',
      output: path.join(publicDir, 'favicon-16x16.png'),
      w: 16,
      h: 16,
    },
    {
      url: 'http://127.0.0.1:3099/og-image.html',
      output: path.join(publicDir, 'og-image.png'),
      w: 1200,
      h: 630,
    },
  ];

  for (const task of tasks) {
    console.log(`Rendering ${task.output} (${task.w}x${task.h})...`);
    execFileSync(CHROME_PATH, [
      '--no-sandbox',
      '--disable-gpu',
      `--screenshot=${task.output}`,
      `--window-size=${task.w},${task.h}`,
      task.url,
    ]);
  }

  // Create multi-resolution favicon.ico using ImageMagick convert from PNGs
  const fav16 = path.join(publicDir, 'favicon-16x16.png');
  const fav32 = path.join(publicDir, 'favicon-32x32.png');
  const favIco = path.join(publicDir, 'favicon.ico');
  try {
    execFileSync('convert', [fav16, fav32, favIco]);
    console.log('Created favicon.ico successfully');
  } catch (err) {
    console.warn('Could not generate multi-size favicon.ico with convert:', err);
    fs.copyFileSync(fav32, favIco);
  }

  server.close(() => {
    console.log('All PWA and social assets rendered.');
  });
});
