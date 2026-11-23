import fs from 'node:fs';
import path from 'node:path';
import { injectOgIntoHtml, normalizeBaseUrl, resolveOgMeta } from './_ogMeta.mjs';

interface ServerlessRequest {
  method?: string;
  url?: string;
  headers?: Record<string, string | string[] | undefined>;
  query?: Record<string, string | string[] | undefined>;
}

interface ServerlessResponse {
  status: (statusCode: number) => ServerlessResponse;
  setHeader: (name: string, value: string) => void;
  send: (body: string) => void;
}

function readShellTemplate(): string | null {
  const candidates = [
    path.resolve(process.cwd(), 'api/_shell.html'),
    path.resolve(process.cwd(), 'dist/index.html'),
    path.resolve(process.cwd(), 'index.html'),
  ];
  for (const filePath of candidates) {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf-8');
    }
  }
  return null;
}

export default function handler(req: ServerlessRequest, res: ServerlessResponse) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    res.status(405).send('Method Not Allowed');
    return;
  }

  const baseUrl = normalizeBaseUrl(
    req.headers?.['x-forwarded-proto'],
    req.headers?.['x-forwarded-host'] ?? req.headers?.host,
  );

  const rawPathParam = req.query?.__path;
  const pathOverride = Array.isArray(rawPathParam) ? rawPathParam[0] : rawPathParam;

  const incomingUrl = new URL(req.url || '/', baseUrl);
  incomingUrl.searchParams.delete('__path');
  incomingUrl.searchParams.delete('__seo');

  const pathname = pathOverride
    ? pathOverride.startsWith('/')
      ? pathOverride
      : `/${pathOverride}`
    : incomingUrl.pathname;
  const requestPath = `${pathname}${incomingUrl.search}`;

  const template = readShellTemplate();
  if (!template) {
    res.status(500).send('HTML shell introuvable.');
    return;
  }

  const meta = resolveOgMeta({ requestPath, baseUrl });
  const html = injectOgIntoHtml(template, meta, baseUrl);

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  res.status(200).send(html);
}
