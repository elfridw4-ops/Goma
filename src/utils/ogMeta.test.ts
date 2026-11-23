import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { injectOgIntoHtml, resolveOgMeta, toShareImagePath } from './ogMeta.ts';

test('resolveOgMeta returns site og-image.jpg with dynamic origin for home and market', () => {
  const baseUrl = 'https://goma-custom.vercel.app';
  const homeMeta = resolveOgMeta({ requestPath: '/', baseUrl });
  assert.equal(homeMeta.imageUrl, 'https://goma-custom.vercel.app/og-image.jpg');
  assert.equal(homeMeta.url, 'https://goma-custom.vercel.app/');
  assert.equal(homeMeta.ogType, 'website');

  const marketMeta = resolveOgMeta({ requestPath: '/market?etat=neuf', baseUrl });
  assert.equal(marketMeta.imageUrl, 'https://goma-custom.vercel.app/og-image.jpg');
  assert.match(marketMeta.title, /Neuf/);
});

test('resolveOgMeta returns the exact product image for product detail routes', () => {
  const baseUrl = 'https://goma-custom.vercel.app';
  const meta = resolveOgMeta({
    requestPath: '/market/product/neuf-collier-laiton-benin',
    baseUrl,
  });

  assert.equal(meta.ogType, 'product');
  assert.match(meta.title, /Collier Plastron Laiton Martelé/);
  assert.equal(
    meta.imageUrl,
    'https://goma-custom.vercel.app/og/images/prod_collier_laiton_marte_1795442301646.jpg',
  );
  assert.equal(meta.url, 'https://goma-custom.vercel.app/market/product/neuf-collier-laiton-benin');
});

test('resolveOgMeta resolves segment thumbnail when sharing filtered catalogue', () => {
  const baseUrl = 'https://example.org';
  const meta = resolveOgMeta({
    requestPath: '/market/catalogue?segment=Sacs',
    baseUrl,
  });
  assert.match(meta.title, /Catalogue Sacs/);
  assert.equal(
    meta.imageUrl,
    'https://example.org/og/images/prod_sac_bandouliere_ivoire_1795442302858.jpg',
  );
});

test('injectOgIntoHtml replaces static domain and sets product image in HTML <head>', () => {
  const template = readFileSync('index.html', 'utf-8');
  const baseUrl = 'https://boutique-benin.app';
  const meta = resolveOgMeta({
    requestPath: '/market/product/neuf-sandales-cuir-tresse',
    baseUrl,
  });
  const html = injectOgIntoHtml(template, meta, baseUrl);

  assert.ok(!html.includes('goma-nine.vercel.app'), 'No stale hardcoded domain should remain');
  assert.ok(
    html.includes(
      'content="https://boutique-benin.app/og/images/prod_sandales_cuir_benin_1795442301335.jpg"',
    ),
  );
  assert.ok(html.includes('<meta property="og:type" content="product" />'));
});

test('toShareImagePath maps src/assets/images/*.jpg to /og/images/*.jpg', () => {
  assert.equal(
    toShareImagePath('/src/assets/images/product_robe_noire_1795346536134.jpg'),
    '/og/images/product_robe_noire_1795346536134.jpg',
  );
});
