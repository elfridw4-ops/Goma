import { INITIAL_PRODUCTS, SEGMENT_VISUALS } from '../data/catalog';
import type { MarketSegment, Product } from '../types/marketplace';
import { formatPriceFcfa } from './marketplaceLogic';

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

export function toShareImagePath(rawImagePath: string): string {
  if (!rawImagePath) {
    return '/og-image.jpg';
  }
  if (rawImagePath.startsWith('/src/assets/images/') && rawImagePath.endsWith('.jpg')) {
    const filename = rawImagePath.slice('/src/assets/images/'.length);
    return `/og/images/${filename}`;
  }
  return rawImagePath;
}

export function toAbsoluteShareImageUrl(rawImagePath: string, baseUrl: string): string {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  if (rawImagePath.startsWith('http://') || rawImagePath.startsWith('https://')) {
    return rawImagePath;
  }
  const normalizedPath = toShareImagePath(rawImagePath);
  return `${cleanBase}${normalizedPath.startsWith('/') ? '' : '/'}${normalizedPath}`;
}

export function normalizeBaseUrl(protoHeader?: string | string[], hostHeader?: string | string[]): string {
  const rawHost = Array.isArray(hostHeader) ? hostHeader[0] : hostHeader;
  const rawProto = Array.isArray(protoHeader) ? protoHeader[0] : protoHeader;
  const host = (rawHost || 'localhost:3000').split(',')[0].trim();
  const defaultProto = host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https';
  const proto = (rawProto || defaultProto).split(',')[0].trim();
  return `${proto}://${host}`;
}

export function resolveOgMeta(options: {
  requestPath: string;
  baseUrl: string;
  products?: Product[];
}): ResolvedOgMeta {
  const cleanBase = options.baseUrl.replace(/\/+$/, '');
  const products = options.products ?? INITIAL_PRODUCTS;

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(options.requestPath.startsWith('http') ? options.requestPath : `${cleanBase}${options.requestPath.startsWith('/') ? '' : '/'}${options.requestPath}`);
  } catch {
    parsedUrl = new URL(`${cleanBase}/`);
  }

  const pathname = parsedUrl.pathname;
  const search = parsedUrl.searchParams;
  const fullUrl = `${cleanBase}${pathname}${parsedUrl.search}`;

  // Default Site-level OG metadata
  let title = 'Goma — Delano Collection | Marketplace & Assistance IA';
  let description =
    'DELANO COLLECTION, votre référence en vêtements et accessoires sur la marketplace Goma avec assistance IA personnalisée au Bénin.';
  let imageUrl = `${cleanBase}/og-image.jpg`;
  let imageType: 'image/jpeg' | 'image/png' = 'image/jpeg';
  let imageWidth = '1200';
  let imageHeight = '630';
  let imageAlt = 'Aperçu officiel de la marketplace Goma — Delano Collection Bénin';
  let ogType: 'website' | 'product' = 'website';

  if (pathname === '/' || pathname === '') {
    title = 'Goma — Delano Collection · Vitrine éditoriale';
    description =
      'Découvrez l’univers de la maison Goma, ses collections exclusives Delano Collection et la marketplace au Bénin.';
  } else if (pathname === '/market' || pathname === '/market/') {
    const etat = search.get('etat');
    title =
      etat === 'neuf'
        ? 'Marketplace Goma (Neuf) · Delano Collection'
        : 'Marketplace Goma (Friperie) · Delano Collection';
    description =
      'Achetez et vendez des vêtements neufs et friperie 1er choix au Bénin avec paiement Mobile Money.';
  } else if (pathname === '/market/catalogue' || pathname.startsWith('/market/shop/')) {
    const segmentParam = search.get('segment') as Exclude<MarketSegment, 'Tous'> | null;
    if (segmentParam && segmentParam in SEGMENT_VISUALS) {
      const segVisual = SEGMENT_VISUALS[segmentParam];
      title = `Catalogue ${segmentParam} — Marketplace Goma`;
      description = `${segVisual.subtitle} sur Goma — Delano Collection au Bénin. Paiement Mobile Money & livraison locale.`;
      imageUrl = toAbsoluteShareImageUrl(segVisual.imageUrl, cleanBase);
      imageWidth = '960';
      imageHeight = '720';
      imageAlt = `${segmentParam} — Goma Marketplace Bénin`;
    } else {
      title = 'Catalogue complet — Marketplace Goma';
      description =
        'Parcourez notre sélection rigoureuse de pièces neuves et de friperie validées par nos boutiques partenaires à Cotonou et Calavi.';
    }
  } else if (pathname === '/market/assistant') {
    const tab = search.get('tab');
    title =
      tab === 'seller'
        ? 'Vendre une pièce — Marketplace Goma'
        : 'Conseiller Acheteur IA — Marketplace Goma';
    description =
      'Discutez avec l’assistant IA Goma pour trouver la silhouette parfaite ou mettre en ligne votre pièce en 2 minutes.';
  } else if (pathname.startsWith('/market/product/')) {
    const productId = decodeURIComponent(pathname.slice('/market/product/'.length));
    const product = products.find((p) => p.id === productId);
    const imgParam = Number.parseInt(search.get('img') ?? '0', 10);
    const imgIdx = Number.isFinite(imgParam) && imgParam >= 0 ? imgParam : 0;

    if (product) {
      const activeImg = product.images[imgIdx] ?? product.images[0];
      title = `${product.name} — ${formatPriceFcfa(product.priceFcfa)} | Goma`;
      description = `${product.description} · ${product.material} · Tailles : ${product.sizes.join(', ')} · Livraison Bénin.`;
      imageUrl = toAbsoluteShareImageUrl(activeImg, cleanBase);
      imageWidth = '960';
      imageHeight = '720';
      imageAlt = `${product.name} (${formatPriceFcfa(product.priceFcfa)}) — ${product.shopName}`;
      ogType = 'product';
    } else {
      // Safe fallback for client-created custom items that encode local preview hints
      const customTitle = search.get('title');
      const customImg = search.get('imgUrl');
      if (customTitle) {
        title = `${customTitle.slice(0, 80)} | Goma`;
      }
      if (
        customImg &&
        (customImg.startsWith('/src/assets/images/') || customImg.startsWith('/og/images/')) &&
        !customImg.includes('..')
      ) {
        imageUrl = toAbsoluteShareImageUrl(customImg, cleanBase);
        imageWidth = '960';
        imageHeight = '720';
        imageAlt = title;
        ogType = 'product';
      }
    }
  }

  return {
    title,
    description,
    url: fullUrl,
    canonicalUrl: fullUrl,
    imageUrl,
    imageType,
    imageWidth,
    imageHeight,
    imageAlt,
    ogType,
  };
}

function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function upsertMetaTag(
  html: string,
  attrKey: 'name' | 'property',
  attrVal: string,
  content: string,
): string {
  const safeContent = escapeHtmlAttr(content);
  const regex = new RegExp(
    `<meta\\s+[^>]*${attrKey}=["']${attrVal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`,
    'i',
  );
  const replacement = `<meta ${attrKey}="${attrVal}" content="${safeContent}" />`;
  if (regex.test(html)) {
    return html.replace(regex, replacement);
  }
  return html.replace('</head>', `  ${replacement}\n  </head>`);
}

export function injectOgIntoHtml(html: string, meta: ResolvedOgMeta, baseUrl: string): string {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  let next = html.replace(/https:\/\/goma-nine\.vercel\.app/g, cleanBase);

  next = next.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtmlAttr(meta.title)}</title>`);
  next = next.replace(
    /<link\s+rel=["']canonical["'][^>]*>/i,
    `<link rel="canonical" href="${escapeHtmlAttr(meta.canonicalUrl)}" />`,
  );

  next = upsertMetaTag(next, 'name', 'description', meta.description);
  next = upsertMetaTag(next, 'property', 'og:type', meta.ogType);
  next = upsertMetaTag(next, 'property', 'og:title', meta.title);
  next = upsertMetaTag(next, 'property', 'og:description', meta.description);
  next = upsertMetaTag(next, 'property', 'og:url', meta.url);
  next = upsertMetaTag(next, 'property', 'og:image', meta.imageUrl);
  next = upsertMetaTag(next, 'property', 'og:image:secure_url', meta.imageUrl);
  next = upsertMetaTag(next, 'property', 'og:image:type', meta.imageType);
  next = upsertMetaTag(next, 'property', 'og:image:width', meta.imageWidth);
  next = upsertMetaTag(next, 'property', 'og:image:height', meta.imageHeight);
  next = upsertMetaTag(next, 'property', 'og:image:alt', meta.imageAlt);

  next = upsertMetaTag(next, 'name', 'twitter:title', meta.title);
  next = upsertMetaTag(next, 'name', 'twitter:description', meta.description);
  next = upsertMetaTag(next, 'name', 'twitter:image', meta.imageUrl);

  return next;
}
