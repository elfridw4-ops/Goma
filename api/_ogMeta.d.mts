export interface ResolvedOgMeta {
  title: string;
  description: string;
  url: string;
  canonicalUrl: string;
  imageUrl: string;
  imageType: 'image/jpeg' | 'image/png';
  imageWidth: string;
  imageHeight: string;
  imageAlt: string;
  ogType: 'website' | 'product';
}

export function normalizeBaseUrl(
  protoHeader?: string | string[],
  hostHeader?: string | string[],
): string;

export function resolveOgMeta(options: {
  requestPath: string;
  baseUrl: string;
}): ResolvedOgMeta;

export function injectOgIntoHtml(
  html: string,
  meta: ResolvedOgMeta,
  baseUrl: string,
): string;
