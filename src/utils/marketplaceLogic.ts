import type {
  CartItem,
  CheckoutFormValues,
  DeliveryCheckResult,
  MarketSegment,
  PaymentMethod,
  Product,
  ProductCondition,
  SellerDraft,
  SortOption,
} from '../types/marketplace';

export const FREE_SHIPPING_THRESHOLD_FCFA = 25000;
export const STANDARD_SHIPPING_NOKOUE_FCFA = 1000;
export const STANDARD_SHIPPING_NATIONAL_FCFA = 2000;

export const BENIN_CITIES = [
  'Cotonou',
  'Abomey-Calavi',
  'Sèmè-Kpodji',
  'Ouidah',
  'Porto-Novo',
  'Parakou',
  'Autre ville',
] as const;

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  mtn_money: 'MTN Money',
  moov_money: 'Moov Money',
  cod: 'À la livraison',
  card: 'Carte',
};

export function formatPriceFcfa(amount: number): string {
  const rounded = Math.max(0, Math.round(amount));
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(rounded)
    .replace(/\u202f|\u00a0/g, ' ');
  return `${formatted} F`;
}

export function checkDeliveryByCity(
  city: string,
  subtotalFcfa = 0,
): DeliveryCheckResult {
  const normalized = city.trim().toLowerCase();

  if (!normalized) {
    return {
      deliverable: false,
      city: '',
      delay: '',
      feeFcfa: 0,
      payOnDelivery: false,
      message: 'Sélectionnez une ville pour vérifier la livraison.',
    };
  }

  if (normalized === 'cotonou' || normalized === 'abomey-calavi') {
    const isFree = subtotalFcfa === 0 || subtotalFcfa >= FREE_SHIPPING_THRESHOLD_FCFA;
    return {
      deliverable: true,
      city,
      delay: 'Livraison en 24h à 48h',
      feeFcfa: isFree ? 0 : 0,
      payOnDelivery: true,
      message: `Livraison gratuite en 48h à ${city} · Paiement à la livraison disponible.`,
    };
  }

  if (normalized === 'sèmè-kpodji' || normalized === 'seme-kpodji' || normalized === 'ouidah' || normalized === 'porto-novo') {
    const isFree = subtotalFcfa >= FREE_SHIPPING_THRESHOLD_FCFA;
    const fee = isFree ? 0 : STANDARD_SHIPPING_NOKOUE_FCFA;
    return {
      deliverable: true,
      city,
      delay: 'Livraison en 48h',
      feeFcfa: fee,
      payOnDelivery: true,
      message: isFree
        ? `Livraison offerte en 48h à ${city} · Paiement à la livraison disponible.`
        : `Livraison en 48h à ${city} (${formatPriceFcfa(fee)}) · Paiement à la livraison disponible.`,
    };
  }

  if (normalized === 'parakou') {
    const isFree = subtotalFcfa >= FREE_SHIPPING_THRESHOLD_FCFA * 2;
    const fee = isFree ? 0 : STANDARD_SHIPPING_NATIONAL_FCFA;
    return {
      deliverable: true,
      city,
      delay: 'Expédition 72h',
      feeFcfa: fee,
      payOnDelivery: false,
      message: `Expédition vers ${city} en 72h (${formatPriceFcfa(fee)}) · Paiement MTN Money, Moov Money ou Carte.`,
    };
  }

  return {
    deliverable: false,
    city,
    delay: '',
    feeFcfa: 0,
    payOnDelivery: false,
    message:
      'Si votre ville n’est pas dans la liste desservie, contactez le retrait en boutique à Cotonou ou Calavi.',
  };
}

export function filterAndSortProducts(
  products: Product[],
  options: {
    condition?: ProductCondition | 'all';
    segment: MarketSegment;
    query: string;
    shopId?: string;
    sortBy: SortOption;
  },
): Product[] {
  const normalizedQuery = options.query.trim().toLowerCase();

  const filtered = products.filter((product) => {
    if (
      options.condition &&
      options.condition !== 'all' &&
      product.condition !== options.condition
    ) {
      return false;
    }

    if (options.shopId && product.shopId !== options.shopId) {
      return false;
    }

    const matchesSegment =
      options.segment === 'Tous' || product.segment === options.segment;

    if (!matchesSegment) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const haystack = [
      product.name,
      product.reference,
      product.segment,
      product.condition,
      product.material,
      product.shopName,
      product.geoCity,
      product.description,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });

  if (options.sortBy === 'price-asc') {
    return [...filtered].sort((a, b) => a.priceFcfa - b.priceFcfa);
  }

  if (options.sortBy === 'price-desc') {
    return [...filtered].sort((a, b) => b.priceFcfa - a.priceFcfa);
  }

  return filtered;
}

export function addToCart(
  cart: CartItem[],
  product: Product,
  selectedSize: string,
): CartItem[] {
  if (product.stockCount <= 0) {
    return cart;
  }

  const size = selectedSize || product.sizes[0] || 'Unique';
  const maxStock = product.isUniquePiece ? 1 : Math.max(1, product.stockCount);
  const existingIndex = cart.findIndex(
    (item) => item.productId === product.id && item.selectedSize === size,
  );

  if (existingIndex >= 0) {
    return cart.map((item, idx) => {
      if (idx !== existingIndex) return item;
      const nextQty = Math.min(maxStock, item.quantity + 1);
      return { ...item, quantity: nextQty };
    });
  }

  return [
    ...cart,
    {
      productId: product.id,
      name: product.name,
      priceFcfa: product.priceFcfa,
      imageUrl: product.images[0] || '',
      selectedSize: size,
      quantity: 1,
      isUniquePiece: product.isUniquePiece,
      shopName: product.shopName,
      maxStock,
    },
  ];
}

export function updateCartQuantity(
  cart: CartItem[],
  productId: string,
  selectedSize: string,
  delta: number,
): CartItem[] {
  return cart
    .map((item) => {
      if (item.productId === productId && item.selectedSize === selectedSize) {
        if (item.isUniquePiece && delta > 0) {
          return item;
        }
        const nextQty = Math.min(item.maxStock, item.quantity + delta);
        return { ...item, quantity: nextQty };
      }
      return item;
    })
    .filter((item) => item.quantity > 0);
}

export function removeFromCart(
  cart: CartItem[],
  productId: string,
  selectedSize: string,
): CartItem[] {
  return cart.filter(
    (item) => !(item.productId === productId && item.selectedSize === selectedSize),
  );
}

export function calculateCartTotals(
  cart: CartItem[],
  city = 'Cotonou',
): {
  itemCount: number;
  subtotalFcfa: number;
  shippingFcfa: number;
  freeShippingRemainingFcfa: number;
  totalFcfa: number;
} {
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotalFcfa = cart.reduce(
    (sum, item) => sum + item.priceFcfa * item.quantity,
    0,
  );

  if (itemCount === 0) {
    return {
      itemCount: 0,
      subtotalFcfa: 0,
      shippingFcfa: 0,
      freeShippingRemainingFcfa: FREE_SHIPPING_THRESHOLD_FCFA,
      totalFcfa: 0,
    };
  }

  const delivery = checkDeliveryByCity(city, subtotalFcfa);
  const shippingFcfa = delivery.deliverable ? delivery.feeFcfa : STANDARD_SHIPPING_NOKOUE_FCFA;
  const freeShippingRemainingFcfa = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD_FCFA - subtotalFcfa,
  );

  return {
    itemCount,
    subtotalFcfa,
    shippingFcfa,
    freeShippingRemainingFcfa,
    totalFcfa: subtotalFcfa + shippingFcfa,
  };
}

export function validateLoginForm(values: {
  phone: string;
  password: string;
  fullName?: string;
  isRegister?: boolean;
}): Partial<Record<'fullName' | 'phone' | 'password', string>> {
  const errors: Partial<Record<'fullName' | 'phone' | 'password', string>> = {};

  if (values.isRegister && (!values.fullName || values.fullName.trim().length < 2)) {
    errors.fullName = 'Veuillez saisir votre nom complet.';
  }

  const cleanPhone = values.phone.replace(/[\s+.-]/g, '');
  if (cleanPhone.length < 8) {
    errors.phone = 'Numéro de téléphone invalide (minimum 8 chiffres).';
  }

  if (values.password.trim().length < 6) {
    errors.password = 'Le mot de passe doit contenir au moins 6 caractères.';
  }

  return errors;
}

export function validateCheckoutForm(
  values: CheckoutFormValues,
): Partial<Record<keyof CheckoutFormValues, string>> {
  const errors: Partial<Record<keyof CheckoutFormValues, string>> = {};

  if (values.fullName.trim().length < 2) {
    errors.fullName = 'Veuillez saisir votre nom complet.';
  }

  const cleanPhone = values.phone.replace(/[\s+.-]/g, '');
  if (cleanPhone.length < 8) {
    errors.phone = 'Numéro de téléphone Bénin invalide.';
  }

  const delivery = checkDeliveryByCity(values.city, 0);
  if (!delivery.deliverable) {
    errors.city = 'Sélectionnez une ville desservie (Cotonou, Calavi, Porto-Novo…).';
  }

  if (values.address.trim().length < 4) {
    errors.address = 'Indiquez votre quartier et repère de livraison.';
  }

  return errors;
}

export function validateSellerDraft(
  draft: SellerDraft,
): Partial<Record<keyof SellerDraft, string>> {
  const errors: Partial<Record<keyof SellerDraft, string>> = {};

  if (draft.name.trim().length < 3) {
    errors.name = 'Le nom de l’article doit contenir au moins 3 caractères.';
  }

  const parsedPrice = Number(draft.priceFcfa);
  if (!Number.isFinite(parsedPrice) || parsedPrice < 100) {
    errors.priceFcfa = 'Indiquez un prix valide (minimum 100 F).';
  }

  if (draft.material.trim().length < 3) {
    errors.material = 'Précisez la matière (ex. Coton, Denim, Cuir).';
  }

  const parsedSizes = draft.sizesInput
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (parsedSizes.length === 0) {
    errors.sizesInput = 'Indiquez au moins une taille (ex. M ou S, M, L).';
  }

  if (draft.geoCity.trim().length < 2) {
    errors.geoCity = 'Indiquez votre ville au Bénin.';
  }

  if (draft.description.trim().length < 15) {
    errors.description =
      'Ajoutez une description d’au moins 15 caractères (ou générez-la via l’IA).';
  }

  return errors;
}

const FALLBACK_IMAGES_BY_SEGMENT: Record<
  Exclude<MarketSegment, 'Tous'>,
  string[]
> = {
  Homme: [
    '/src/assets/images/product_jean_vintage_1795346535535.jpg',
    '/src/assets/images/product_veste_moutarde_1795342522981.jpg',
  ],
  Femme: [
    '/src/assets/images/product_robe_noire_1795346536134.jpg',
    '/src/assets/images/product_manteau_argile_1795342522861.jpg',
  ],
  Chaussure: ['/src/assets/images/product_mocassins_cuir_1795346537039.jpg'],
  Sacs: ['/src/assets/images/prod_sac_bandouliere_ivoire_1795442302858.jpg'],
  Bijoux: ['/src/assets/images/prod_collier_laiton_marte_1795442301646.jpg'],
  Enfant: ['/src/assets/images/product_chemise_enfant_1795346537168.jpg'],
  Accessoires: [
    '/src/assets/images/product_sac_cuir_1795342521974.jpg',
    '/src/assets/images/product_lunettes_ambre_1795342523617.jpg',
  ],
};

export function createProductFromDraft(
  draft: SellerDraft,
  sequenceNumber: number,
  shopName = 'Boutique Partenaire Goma',
): Product {
  const sizes = draft.sizesInput
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const isUnique = draft.condition === 'frip' || draft.isUniquePiece;

  return {
    id: `goma-vendeur-${sequenceNumber}`,
    reference: `GM-${100 + sequenceNumber}`,
    name: draft.name.trim(),
    brand: draft.condition === 'neuf' ? 'Delano Collection' : shopName,
    shopId: 'shop-partenaire-goma',
    shopName,
    condition: draft.condition,
    segment: draft.segment,
    priceFcfa: Math.round(Number(draft.priceFcfa)),
    material: draft.material.trim(),
    origin: `Vendeur vérifié · ${draft.geoCity.trim()}`,
    sizes: sizes.length > 0 ? sizes : ['Unique'],
    stockCount: isUnique ? 1 : 5,
    isUniquePiece: isUnique,
    isNewArrival: true,
    isBestSeller: false,
    images: FALLBACK_IMAGES_BY_SEGMENT[draft.segment],
    description: draft.description.trim(),
    geoCity: draft.geoCity.trim(),
    paymentMethods: ['mtn_money', 'moov_money', 'cod', 'card'],
    reviews: [],
    featuredNote: isUnique ? 'Pièce unique' : 'Nouveau',
  };
}

export function toggleWishlistItem(
  list: string[],
  productId: string,
): { nextList: string[]; added: boolean } {
  if (list.includes(productId)) {
    return {
      nextList: list.filter((id) => id !== productId),
      added: false,
    };
  }
  return {
    nextList: [productId, ...list],
    added: true,
  };
}

export function mergeWishlistOnAuth(
  accountWishlist: string[],
  guestWishlist: string[],
): { merged: string[]; syncedCount: number } {
  if (guestWishlist.length === 0) {
    return { merged: [...accountWishlist], syncedCount: 0 };
  }
  const existingSet = new Set(accountWishlist);
  let syncedCount = 0;
  const newlyAdded: string[] = [];

  for (const id of guestWishlist) {
    if (!existingSet.has(id)) {
      existingSet.add(id);
      newlyAdded.push(id);
      syncedCount += 1;
    }
  }

  return {
    merged: [...newlyAdded, ...accountWishlist],
    syncedCount,
  };
}

export interface UrlSearchState {
  etat?: ProductCondition | 'all';
  segment?: MarketSegment;
  q?: string;
  sort?: SortOption;
  tab?: 'buyer' | 'seller';
}

const VALID_SEGMENTS: MarketSegment[] = [
  'Tous',
  'Homme',
  'Femme',
  'Chaussure',
  'Sacs',
  'Bijoux',
  'Enfant',
  'Accessoires',
];

const VALID_SORTS: SortOption[] = ['featured', 'price-asc', 'price-desc'];

export function parseUrlSearchState(search: string): UrlSearchState {
  const params = new URLSearchParams(search);
  const result: UrlSearchState = {};

  const etat = params.get('etat');
  if (etat === 'neuf' || etat === 'frip' || etat === 'all') {
    result.etat = etat;
  }

  const segment = params.get('segment') as MarketSegment | null;
  if (segment && VALID_SEGMENTS.includes(segment)) {
    result.segment = segment;
  }

  const q = params.get('q');
  if (q !== null) {
    result.q = q;
  }

  const sort = params.get('sort') as SortOption | null;
  if (sort && VALID_SORTS.includes(sort)) {
    result.sort = sort;
  }

  const tab = params.get('tab');
  if (tab === 'buyer' || tab === 'seller') {
    result.tab = tab;
  }

  return result;
}

export function buildUrlWithSearchState(
  pathname: string,
  state: UrlSearchState,
): string {
  const params = new URLSearchParams();

  if (state.etat && state.etat !== 'all') {
    params.set('etat', state.etat);
  }
  if (state.segment && state.segment !== 'Tous') {
    params.set('segment', state.segment);
  }
  if (state.q && state.q.trim() !== '') {
    params.set('q', state.q.trim());
  }
  if (state.sort && state.sort !== 'featured') {
    params.set('sort', state.sort);
  }
  if (state.tab && state.tab !== 'buyer') {
    params.set('tab', state.tab);
  }

  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}
