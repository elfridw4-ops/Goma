import type {
  CartItem,
  OrderConfirmation,
  Product,
  UserSession,
} from '../types/marketplace';
import { mergeWishlistOnAuth } from '../utils/marketplaceLogic';

/**
 * Couche d'abstraction locale prête pour un futur raccordement
 * Firebase Auth + Firestore sans modifier les composants UI.
 * Les favoris enregistrés hors connexion sont conservés localement
 * puis synchronisés automatiquement dès la connexion ou création de compte.
 */

const KEYS = {
  cart: 'goma_market_cart_v2',
  session: 'goma_market_session_v2',
  customProducts: 'goma_market_custom_products_v2',
  orders: 'goma_market_orders_v2',
  guestWishlist: 'goma_market_wishlist_v2',
  accountWishlists: 'goma_market_account_wishlists_v1',
} as const;

function safeReadJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWriteJson<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota / private mode failures
  }
}

export function getAccountKey(session: UserSession): string {
  if (session.provider === 'google' && session.email) {
    return `google:${session.email.toLowerCase()}`;
  }
  const normalizedPhone = session.phone.replace(/[\s+.-]/g, '');
  return `phone:${normalizedPhone || session.id}`;
}

export const authService = {
  getSession(): UserSession | null {
    return safeReadJson<UserSession | null>(KEYS.session, null);
  },

  signInWithPhone(params: {
    phone: string;
    fullName?: string;
    rememberMe: boolean;
  }): UserSession {
    const cleanName = params.fullName?.trim();
    const session: UserSession = {
      id: `usr-${Date.now()}`,
      fullName: cleanName && cleanName.length > 0 ? cleanName : 'Client Goma',
      phone: params.phone.trim(),
      provider: 'phone',
      rememberMe: params.rememberMe,
      createdAt: new Date().toISOString(),
    };
    safeWriteJson(KEYS.session, session);
    return session;
  },

  signInWithGoogle(): UserSession {
    const session: UserSession = {
      id: `usr-google-${Date.now()}`,
      fullName: 'Amina Tossou',
      phone: '+229 97 45 21 10',
      email: 'amina.tossou@gmail.com',
      provider: 'google',
      rememberMe: true,
      createdAt: new Date().toISOString(),
    };
    safeWriteJson(KEYS.session, session);
    return session;
  },

  signOut(): void {
    try {
      window.localStorage.removeItem(KEYS.session);
    } catch {
      // Ignore
    }
  },
};

export const marketplaceRepository = {
  getCart(): CartItem[] {
    const parsed = safeReadJson<CartItem[]>(KEYS.cart, []);
    return Array.isArray(parsed) ? parsed : [];
  },

  saveCart(cart: CartItem[]): void {
    safeWriteJson(KEYS.cart, cart);
  },

  getCustomProducts(): Product[] {
    const parsed = safeReadJson<Product[]>(KEYS.customProducts, []);
    return Array.isArray(parsed) ? parsed : [];
  },

  saveCustomProducts(products: Product[]): void {
    safeWriteJson(KEYS.customProducts, products);
  },

  getOrders(): OrderConfirmation[] {
    const parsed = safeReadJson<OrderConfirmation[]>(KEYS.orders, []);
    return Array.isArray(parsed) ? parsed : [];
  },

  saveOrders(orders: OrderConfirmation[]): void {
    safeWriteJson(KEYS.orders, orders);
  },

  getGuestWishlist(): string[] {
    const parsed = safeReadJson<string[]>(KEYS.guestWishlist, []);
    return Array.isArray(parsed) ? parsed : [];
  },

  saveGuestWishlist(ids: string[]): void {
    safeWriteJson(KEYS.guestWishlist, ids);
  },

  clearGuestWishlist(): void {
    safeWriteJson(KEYS.guestWishlist, []);
  },

  getAccountWishlist(session: UserSession): string[] {
    const all = safeReadJson<Record<string, string[]>>(KEYS.accountWishlists, {});
    const accountKey = getAccountKey(session);
    const list = all[accountKey];
    return Array.isArray(list) ? list : [];
  },

  saveAccountWishlist(session: UserSession, ids: string[]): void {
    const all = safeReadJson<Record<string, string[]>>(KEYS.accountWishlists, {});
    const accountKey = getAccountKey(session);
    safeWriteJson(KEYS.accountWishlists, {
      ...all,
      [accountKey]: ids,
    });
  },

  syncGuestWishlistToAccount(session: UserSession): {
    accountIds: string[];
    syncedCount: number;
  } {
    const guestIds = this.getGuestWishlist();
    const existingAccountIds = this.getAccountWishlist(session);
    const { merged, syncedCount } = mergeWishlistOnAuth(
      existingAccountIds,
      guestIds,
    );
    this.saveAccountWishlist(session, merged);
    if (guestIds.length > 0) {
      this.clearGuestWishlist();
    }
    return {
      accountIds: merged,
      syncedCount,
    };
  },
};
