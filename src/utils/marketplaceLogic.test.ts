import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_PRODUCTS } from '../data/catalog';
import {
  addToCart,
  calculateCartTotals,
  checkDeliveryByCity,
  createProductFromDraft,
  filterAndSortProducts,
  formatPriceFcfa,
  mergeWishlistOnAuth,
  removeFromCart,
  toggleWishlistItem,
  updateCartQuantity,
  validateCheckoutForm,
  validateLoginForm,
  validateSellerDraft,
} from './marketplaceLogic';

test('formatPriceFcfa formats amounts cleanly in FCFA', () => {
  assert.equal(formatPriceFcfa(500), '500 F');
  assert.equal(formatPriceFcfa(1770), '1 770 F');
  assert.equal(formatPriceFcfa(25000), '25 000 F');
});

test('checkDeliveryByCity validates Cotonou, Calavi, Porto-Novo, Parakou and unsupported cities', () => {
  const cotonou = checkDeliveryByCity('Cotonou', 5000);
  assert.equal(cotonou.deliverable, true);
  assert.equal(cotonou.feeFcfa, 0);
  assert.equal(cotonou.payOnDelivery, true);

  const portoNovo = checkDeliveryByCity('Porto-Novo', 5000);
  assert.equal(portoNovo.deliverable, true);
  assert.equal(portoNovo.feeFcfa, 1000);

  const portoNovoFree = checkDeliveryByCity('Porto-Novo', 30000);
  assert.equal(portoNovoFree.feeFcfa, 0);

  const unknown = checkDeliveryByCity('Autre ville', 5000);
  assert.equal(unknown.deliverable, false);
});

test('filterAndSortProducts filters by Neuf/Frip condition, segment and search query', () => {
  const fripItems = filterAndSortProducts(INITIAL_PRODUCTS, {
    condition: 'frip',
    segment: 'Tous',
    query: '',
    sortBy: 'featured',
  });
  assert.ok(fripItems.length > 0);
  assert.ok(fripItems.every((p) => p.condition === 'frip'));

  const femmeItems = filterAndSortProducts(INITIAL_PRODUCTS, {
    condition: 'all',
    segment: 'Femme',
    query: '',
    sortBy: 'featured',
  });
  assert.ok(femmeItems.length >= 2);
  assert.ok(femmeItems.every((p) => p.segment === 'Femme'));

  const robeSearch = filterAndSortProducts(INITIAL_PRODUCTS, {
    condition: 'frip',
    segment: 'Tous',
    query: 'robe',
    sortBy: 'featured',
  });
  assert.ok(robeSearch.some((p) => p.id === 'frip-robe-taille-m'));
});

test('cart enforces unique piece max quantity = 1 and prevents adding out-of-stock items', () => {
  const uniqueDress = INITIAL_PRODUCTS.find((p) => p.id === 'frip-robe-taille-m')!;
  const newJacket = INITIAL_PRODUCTS.find((p) => p.id === 'neuf-surchemise-moutarde')!;
  const outOfStock = INITIAL_PRODUCTS.find((p) => p.stockCount === 0)!;

  let cart = addToCart([], outOfStock, 'M');
  assert.equal(cart.length, 0);

  cart = addToCart([], uniqueDress, 'M');
  assert.equal(cart.length, 1);
  assert.equal(cart[0].quantity, 1);

  // Attempting to add a unique piece again keeps quantity at 1
  cart = addToCart(cart, uniqueDress, 'M');
  assert.equal(cart[0].quantity, 1);
  cart = updateCartQuantity(cart, uniqueDress.id, 'M', 1);
  assert.equal(cart[0].quantity, 1);

  // Multi-stock Neuf piece increments properly
  cart = addToCart(cart, newJacket, 'L');
  cart = addToCart(cart, newJacket, 'L');
  assert.equal(cart[1].quantity, 2);

  const totals = calculateCartTotals(cart, 'Cotonou');
  assert.equal(totals.itemCount, 3);
  assert.equal(totals.shippingFcfa, 0);

  cart = removeFromCart(cart, uniqueDress.id, 'M');
  assert.equal(cart.length, 1);
});

test('validateLoginForm, validateCheckoutForm and validateSellerDraft validate properly', () => {
  const badLogin = validateLoginForm({
    phone: '123',
    password: 'abc',
    fullName: 'A',
    isRegister: true,
  });
  assert.ok(badLogin.fullName);
  assert.ok(badLogin.phone);
  assert.ok(badLogin.password);

  assert.deepEqual(
    validateLoginForm({ phone: '97001122', password: 'secret12' }),
    {},
  );

  const badCheckout = validateCheckoutForm({
    fullName: 'A',
    phone: '12',
    city: 'Autre ville',
    address: 'Rue',
    paymentMethod: 'mtn_money',
  });
  assert.ok(badCheckout.fullName);
  assert.ok(badCheckout.phone);
  assert.ok(badCheckout.city);
  assert.ok(badCheckout.address);

  const validCheckout = validateCheckoutForm({
    fullName: 'Amina Tossou',
    phone: '+229 97 45 21 10',
    city: 'Cotonou',
    address: 'Haie Vive, Rue 312',
    paymentMethod: 'mtn_money',
  });
  assert.deepEqual(validCheckout, {});

  const draft = {
    name: 'Jean Vintage Délavé',
    condition: 'frip' as const,
    segment: 'Homme' as const,
    priceFcfa: '1770',
    material: 'Denim 100% coton',
    sizesInput: 'M',
    geoCity: 'Abomey-Calavi',
    description: 'Jean coupe droite premier choix en excellent état, vérifié en atelier.',
    isUniquePiece: true,
  };
  assert.deepEqual(validateSellerDraft(draft), {});
  const created = createProductFromDraft(draft, 1, 'Chic Frip');
  assert.equal(created.priceFcfa, 1770);
  assert.equal(created.isUniquePiece, true);
  assert.equal(created.stockCount, 1);
});

test('wishlist supports local toggling and deduplicated account synchronization on login', () => {
  const firstToggle = toggleWishlistItem([], 'frip-robe-taille-m');
  assert.equal(firstToggle.added, true);
  assert.deepEqual(firstToggle.nextList, ['frip-robe-taille-m']);

  const secondToggle = toggleWishlistItem(firstToggle.nextList, 'neuf-robe-lin-moutarde');
  assert.equal(secondToggle.added, true);
  assert.deepEqual(secondToggle.nextList, ['neuf-robe-lin-moutarde', 'frip-robe-taille-m']);

  const removeToggle = toggleWishlistItem(secondToggle.nextList, 'frip-robe-taille-m');
  assert.equal(removeToggle.added, false);
  assert.deepEqual(removeToggle.nextList, ['neuf-robe-lin-moutarde']);

  const synced = mergeWishlistOnAuth(
    ['neuf-surchemise-moutarde', 'frip-robe-taille-m'],
    ['neuf-robe-lin-moutarde', 'frip-robe-taille-m'],
  );
  assert.equal(synced.syncedCount, 1);
  assert.deepEqual(synced.merged, [
    'neuf-robe-lin-moutarde',
    'neuf-surchemise-moutarde',
    'frip-robe-taille-m',
  ]);
});

import {
  buildUrlWithSearchState,
  parseUrlSearchState,
} from './marketplaceLogic';

test('URL search state serializes and parses filters and assistant tab safely', () => {
  const url = buildUrlWithSearchState('/market/catalogue', {
    etat: 'neuf',
    segment: 'Femme',
    q: 'lin',
    sort: 'price-asc',
  });
  assert.equal(
    url,
    '/market/catalogue?etat=neuf&segment=Femme&q=lin&sort=price-asc',
  );

  const parsed = parseUrlSearchState('?etat=neuf&segment=Femme&q=lin&sort=price-asc');
  assert.deepEqual(parsed, {
    etat: 'neuf',
    segment: 'Femme',
    q: 'lin',
    sort: 'price-asc',
  });

  const cleanDefaultUrl = buildUrlWithSearchState('/market/catalogue', {
    etat: 'all',
    segment: 'Tous',
    q: '',
    sort: 'featured',
  });
  assert.equal(cleanDefaultUrl, '/market/catalogue');

  // Invalid params are safely ignored
  assert.deepEqual(
    parseUrlSearchState('?etat=invalid&segment=Unknown&tab=seller'),
    { tab: 'seller' },
  );
});
