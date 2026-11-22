import { useEffect, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { INITIAL_PRODUCTS, INITIAL_SHOPS } from './data/catalog';
import {
  authService,
  marketplaceRepository,
} from './services/marketplaceStorage';
import type {
  AppRoute,
  CartItem,
  CheckoutFormValues,
  MarketSegment,
  OrderConfirmation,
  Product,
  ProductCondition,
  SellerDraft,
  SortOption,
  UserSession,
} from './types/marketplace';
import {
  addToCart,
  buildUrlWithSearchState,
  calculateCartTotals,
  createProductFromDraft,
  filterAndSortProducts,
  parseUrlSearchState,
  removeFromCart,
  toggleWishlistItem,
  updateCartQuantity,
} from './utils/marketplaceLogic';
import { VitrineHeader } from './components/vitrine/VitrineHeader';
import { HeroSection } from './components/HeroSection';
import { VitrineUniversSection } from './components/vitrine/VitrineUniversSection';
import { ScrollytellingSection } from './components/ScrollytellingSection';
import { ProofSection } from './components/ProofSection';
import { ConversionFooter } from './components/ConversionFooter';
import { MarketHeader } from './components/market/MarketHeader';
import { MarketBottomNav } from './components/market/MarketBottomNav';
import { MarketHomeView } from './components/market/MarketHomeView';
import { MarketCatalogueView } from './components/market/MarketCatalogueView';
import { ProductDetailView } from './components/market/ProductDetailView';
import { MarketCartView } from './components/market/MarketCartView';
import { MarketLoginView } from './components/market/MarketLoginView';
import { MarketAccountView } from './components/market/MarketAccountView';
import { MarketAiView } from './components/market/MarketAiView';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';

function parsePathToRoute(pathname: string): AppRoute {
  if (pathname === '/' || pathname === '') {
    return { view: 'vitrine' };
  }
  if (pathname === '/market' || pathname === '/market/') {
    return { view: 'market-home' };
  }
  if (pathname === '/market/catalogue') {
    return { view: 'market-catalogue' };
  }
  if (pathname.startsWith('/market/shop/')) {
    const shopId = decodeURIComponent(pathname.slice('/market/shop/'.length));
    return { view: 'market-catalogue', shopId };
  }
  if (pathname.startsWith('/market/product/')) {
    const productId = decodeURIComponent(
      pathname.slice('/market/product/'.length),
    );
    return { view: 'market-product', productId };
  }
  if (pathname === '/market/cart') {
    return { view: 'market-cart' };
  }
  if (pathname === '/market/login') {
    return { view: 'market-login' };
  }
  if (pathname === '/market/account') {
    return { view: 'market-account' };
  }
  if (pathname === '/market/assistant') {
    return { view: 'market-assistant', tab: 'buyer' };
  }
  return { view: 'vitrine' };
}

function routeToPath(route: AppRoute): string {
  switch (route.view) {
    case 'vitrine':
      return '/';
    case 'market-home':
      return '/market';
    case 'market-catalogue':
      return route.shopId
        ? `/market/shop/${encodeURIComponent(route.shopId)}`
        : '/market/catalogue';
    case 'market-product':
      return `/market/product/${encodeURIComponent(route.productId)}`;
    case 'market-cart':
      return '/market/cart';
    case 'market-login':
      return '/market/login';
    case 'market-account':
      return '/market/account';
    case 'market-assistant':
      return '/market/assistant';
  }
}

interface ToastState {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function App() {
  const initialQueryState = useMemo(
    () => parseUrlSearchState(window.location.search),
    [],
  );

  const [route, setRoute] = useState<AppRoute>(() =>
    parsePathToRoute(window.location.pathname),
  );

  const [customProducts, setCustomProducts] = useState<Product[]>(() =>
    marketplaceRepository.getCustomProducts(),
  );
  const products = useMemo(
    () => [...customProducts, ...INITIAL_PRODUCTS],
    [customProducts],
  );

  const [condition, setCondition] = useState<ProductCondition>(() =>
    initialQueryState.etat === 'neuf' || initialQueryState.etat === 'frip'
      ? initialQueryState.etat
      : 'frip',
  );
  const [catalogueConditionFilter, setCatalogueConditionFilter] = useState<
    ProductCondition | 'all'
  >(() => initialQueryState.etat ?? 'all');
  const [selectedSegment, setSelectedSegment] = useState<MarketSegment>(
    () => initialQueryState.segment ?? 'Tous',
  );
  const [searchQuery, setSearchQuery] = useState(
    () => initialQueryState.q ?? '',
  );
  const [sortBy, setSortBy] = useState<SortOption>(
    () => initialQueryState.sort ?? 'featured',
  );

  const [cart, setCart] = useState<CartItem[]>(() =>
    marketplaceRepository.getCart(),
  );
  const [session, setSession] = useState<UserSession | null>(() =>
    authService.getSession(),
  );
  const [orders, setOrders] = useState<OrderConfirmation[]>(() =>
    marketplaceRepository.getOrders(),
  );

  const [guestWishlist, setGuestWishlist] = useState<string[]>(() =>
    marketplaceRepository.getGuestWishlist(),
  );
  const [accountWishlist, setAccountWishlist] = useState<string[]>(() => {
    const initialSession = authService.getSession();
    return initialSession
      ? marketplaceRepository.getAccountWishlist(initialSession)
      : [];
  });

  const activeWishlist = session ? accountWishlist : guestWishlist;

  const [lastOrder, setLastOrder] = useState<OrderConfirmation | null>(null);
  const [aiTab, setAiTab] = useState<'buyer' | 'seller'>(
    () => initialQueryState.tab ?? 'buyer',
  );
  const [prefilledBuyerPrompt, setPrefilledBuyerPrompt] = useState('');
  const [toast, setToast] = useState<ToastState | null>(null);
  const [toastPaused, setToastPaused] = useState(false);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const onPopState = () => {
      const nextRoute = parsePathToRoute(window.location.pathname);
      const qState = parseUrlSearchState(window.location.search);
      setRoute(nextRoute);
      if (nextRoute.view === 'market-catalogue') {
        setCatalogueConditionFilter(qState.etat ?? 'all');
        setSelectedSegment(qState.segment ?? 'Tous');
        setSearchQuery(qState.q ?? '');
        setSortBy(qState.sort ?? 'featured');
      } else if (nextRoute.view === 'market-home') {
        if (qState.etat === 'neuf' || qState.etat === 'frip') {
          setCondition(qState.etat);
        }
      } else if (nextRoute.view === 'market-assistant' && qState.tab) {
        setAiTab(qState.tab);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    marketplaceRepository.saveCart(cart);
  }, [cart]);

  useEffect(() => {
    marketplaceRepository.saveCustomProducts(customProducts);
  }, [customProducts]);

  useEffect(() => {
    marketplaceRepository.saveOrders(orders);
  }, [orders]);

  useEffect(() => {
    marketplaceRepository.saveGuestWishlist(guestWishlist);
  }, [guestWishlist]);

  useEffect(() => {
    if (session) {
      marketplaceRepository.saveAccountWishlist(session, accountWishlist);
    }
  }, [session, accountWishlist]);

  // Synchronize filter/tab state in URL without polluting history stack
  useEffect(() => {
    if (route.view === 'market-catalogue') {
      const basePath = routeToPath(route);
      const nextUrl = buildUrlWithSearchState(basePath, {
        etat: catalogueConditionFilter,
        segment: selectedSegment,
        q: searchQuery,
        sort: sortBy,
      });
      if (window.location.pathname + window.location.search !== nextUrl) {
        window.history.replaceState(window.history.state, '', nextUrl);
      }
    } else if (route.view === 'market-home') {
      const nextUrl = buildUrlWithSearchState('/market', { etat: condition });
      if (window.location.pathname + window.location.search !== nextUrl) {
        window.history.replaceState(window.history.state, '', nextUrl);
      }
    } else if (route.view === 'market-assistant') {
      const nextUrl = buildUrlWithSearchState('/market/assistant', { tab: aiTab });
      if (window.location.pathname + window.location.search !== nextUrl) {
        window.history.replaceState(window.history.state, '', nextUrl);
      }
    }
  }, [
    route,
    condition,
    catalogueConditionFilter,
    selectedSegment,
    searchQuery,
    sortBy,
    aiTab,
  ]);

  // Dynamic <title> reflecting the current view
  useEffect(() => {
    let nextTitle = 'Goma — Delano Collection';
    switch (route.view) {
      case 'vitrine':
        nextTitle = 'Goma — Delano Collection · Vitrine éditoriale';
        break;
      case 'market-home':
        nextTitle = `Marketplace Goma (${condition === 'frip' ? 'Friperie' : 'Neuf'}) · Delano Collection`;
        break;
      case 'market-catalogue':
        nextTitle =
          selectedSegment !== 'Tous'
            ? `Catalogue ${selectedSegment} — Marketplace Goma`
            : 'Catalogue complet — Marketplace Goma';
        break;
      case 'market-product': {
        const prod = products.find((p) => p.id === route.productId);
        nextTitle = prod ? `${prod.name} — Marketplace Goma` : 'Fiche produit — Goma';
        break;
      }
      case 'market-cart':
        nextTitle = 'Votre panier — Marketplace Goma';
        break;
      case 'market-login':
        nextTitle = 'Connexion — Marketplace Goma';
        break;
      case 'market-account':
        nextTitle = 'Mon compte & favoris — Marketplace Goma';
        break;
      case 'market-assistant':
        nextTitle =
          aiTab === 'seller'
            ? 'Vendre une pièce — Marketplace Goma'
            : 'Conseiller Acheteur IA — Marketplace Goma';
        break;
    }
    document.title = nextTitle;
  }, [route, condition, selectedSegment, aiTab, products]);

  // Manage toast auto-dismiss timer cleanly with pause on hover/focus
  useEffect(() => {
    if (!toast || toastPaused) return;
    const duration = toast.actionLabel ? 6500 : 4500;
    toastTimerRef.current = window.setTimeout(() => setToast(null), duration);
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, [toast, toastPaused]);

  const navigate = (nextRoute: AppRoute) => {
    const basePath = routeToPath(nextRoute);
    let targetUrl = basePath;
    if (nextRoute.view === 'market-catalogue') {
      targetUrl = buildUrlWithSearchState(basePath, {
        etat: catalogueConditionFilter,
        segment: nextRoute.segment ?? selectedSegment,
        q: searchQuery,
        sort: sortBy,
      });
    } else if (nextRoute.view === 'market-assistant') {
      targetUrl = buildUrlWithSearchState(basePath, {
        tab: nextRoute.tab ?? aiTab,
      });
    } else if (nextRoute.view === 'market-home') {
      targetUrl = buildUrlWithSearchState(basePath, { etat: condition });
    }

    if (window.location.pathname + window.location.search !== targetUrl) {
      window.history.pushState({}, '', targetUrl);
    }
    if (nextRoute.view === 'market-cart' || nextRoute.view === 'market-login') {
      setToast(null);
    }
    setRoute(nextRoute);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const showToast = (nextToast: ToastState) => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToastPaused(false);
    setToast(nextToast);
  };

  const cartTotals = useMemo(() => calculateCartTotals(cart), [cart]);

  const activeShopId =
    route.view === 'market-catalogue' ? route.shopId : undefined;
  const activeShop = useMemo(
    () =>
      activeShopId
        ? INITIAL_SHOPS.find((s) => s.id === activeShopId) ?? null
        : null,
    [activeShopId],
  );

  const catalogueProducts = useMemo(
    () =>
      filterAndSortProducts(products, {
        condition: activeShop ? 'all' : catalogueConditionFilter,
        segment: selectedSegment,
        query: searchQuery,
        shopId: activeShopId,
        sortBy,
      }),
    [
      products,
      activeShop,
      catalogueConditionFilter,
      selectedSegment,
      searchQuery,
      activeShopId,
      sortBy,
    ],
  );

  const handleAddToCart = (product: Product, size: string) => {
    setLastOrder(null);
    setCart((prev) => addToCart(prev, product, size));
    showToast({
      message: `${product.name} ajouté au panier`,
      actionLabel: 'Voir panier',
      onAction: () => navigate({ view: 'market-cart' }),
    });
  };

  const handleBuyNow = (product: Product, size: string) => {
    setLastOrder(null);
    setCart((prev) => addToCart(prev, product, size));
    navigate({ view: 'market-cart' });
  };

  const handleToggleWishlist = (productId: string) => {
    if (session) {
      const { nextList, added } = toggleWishlistItem(accountWishlist, productId);
      setAccountWishlist(nextList);
      showToast({
        message: added
          ? 'Ajouté aux favoris de votre compte'
          : 'Retiré de vos favoris',
      });
      return;
    }

    const { nextList, added } = toggleWishlistItem(guestWishlist, productId);
    setGuestWishlist(nextList);
    if (added) {
      showToast({
        message: 'Sauvegardé localement · Connectez-vous pour synchroniser',
        actionLabel: 'Se connecter',
        onAction: () => navigate({ view: 'market-login', redirectTo: 'account' }),
      });
    } else {
      showToast({ message: 'Retiré des favoris locaux' });
    }
  };

  const finalizeAuthAndSync = (user: UserSession, redirectTo?: AppRoute['view']) => {
    const { accountIds, syncedCount } =
      marketplaceRepository.syncGuestWishlistToAccount(user);
    setSession(user);
    setAccountWishlist(accountIds);
    setGuestWishlist([]);

    if (syncedCount > 0) {
      showToast({
        message: `${syncedCount} ${
          syncedCount > 1
            ? 'favoris locaux synchronisés'
            : 'favori local synchronisé'
        } sur votre compte`,
      });
    }

    navigate(
      redirectTo === 'market-cart'
        ? { view: 'market-cart' }
        : { view: 'market-account' },
    );
  };

  const handleCompleteOrder = (values: CheckoutFormValues) => {
    const totals = calculateCartTotals(cart, values.city);
    const orderNumber = `#DLN-${String(2026 + orders.length + 101).padStart(4, '0')}`;
    const confirmation: OrderConfirmation = {
      orderNumber,
      customerName: values.fullName.trim(),
      phone: values.phone.trim(),
      city: values.city,
      address: values.address.trim(),
      paymentMethod: values.paymentMethod,
      subtotalFcfa: totals.subtotalFcfa,
      shippingFcfa: totals.shippingFcfa,
      totalFcfa: totals.totalFcfa,
      itemCount: totals.itemCount,
      estimatedDelivery:
        values.city === 'Parakou' ? '72h ouvrées' : '24 à 48h ouvrées',
      createdAt: new Date().toISOString(),
      items: cart,
    };

    setOrders((prev) => [confirmation, ...prev]);
    setLastOrder(confirmation);
    setCart([]);
  };

  const handlePublishProduct = (draft: SellerDraft): Product => {
    const created = createProductFromDraft(
      draft,
      customProducts.length + 1,
      session?.fullName ? `Atelier ${session.fullName}` : 'Boutique Partenaire Goma',
    );
    setCustomProducts((prev) => [created, ...prev]);
    setCondition(created.condition);
    return created;
  };

  const handleEnterMarketplace = () => {
    navigate({ view: 'market-home' });
  };

  const handleScrollToVitrine = () => {
    const el = document.getElementById('univers');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // --- VITRINE (Pure Editorial Showcase, zero transactional controls) ---
  if (route.view === 'vitrine') {
    return (
      <div id="app-shell" className="min-h-screen bg-[#FDFCFB] text-[#201F1C] relative">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[400] focus:rounded-[10px] focus:bg-[#2B211B] focus:px-4 focus:py-2.5 focus:text-xs focus:font-display focus:font-semibold focus:text-[#FDFCFB] focus:shadow-layer-md"
        >
          Aller au contenu principal
        </a>

        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[1] grain-overlay"
        />

        <VitrineHeader onEnterMarketplace={handleEnterMarketplace} />

        <main id="main-content" tabIndex={-1} className="outline-none">
          <HeroSection
            onEnterMarketplace={handleEnterMarketplace}
            onDiscoverVitrine={handleScrollToVitrine}
          />
          <VitrineUniversSection onEnterMarketplace={handleEnterMarketplace} />
          <ScrollytellingSection />
          <ProofSection
            onEnterShop={(shopId) => {
              setSelectedSegment('Tous');
              setSearchQuery('');
              navigate({ view: 'market-catalogue', shopId });
            }}
          />
        </main>

        <ConversionFooter onEnterMarketplace={handleEnterMarketplace} />
      </div>
    );
  }

  // --- MARKETPLACE ---
  const currentProduct =
    route.view === 'market-product'
      ? products.find((p) => p.id === route.productId) ?? products[0]
      : null;

  const currentProductIndex = currentProduct
    ? products.findIndex((p) => p.id === currentProduct.id)
    : -1;
  const prevProduct =
    currentProductIndex > 0 ? products[currentProductIndex - 1] : null;
  const nextProduct =
    currentProductIndex >= 0 && currentProductIndex < products.length - 1
      ? products[currentProductIndex + 1]
      : null;

  const currentProductShop = currentProduct
    ? INITIAL_SHOPS.find((s) => s.id === currentProduct.shopId) ?? null
    : null;

  const similarProducts = currentProduct
    ? products
        .filter(
          (p) =>
            p.id !== currentProduct.id &&
            (p.segment === currentProduct.segment ||
              p.condition === currentProduct.condition),
        )
        .slice(0, 4)
    : [];

  const wishlistedProducts = products.filter((p) =>
    activeWishlist.includes(p.id),
  );

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#201F1C] relative">
      <div id="app-shell">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[400] focus:rounded-[10px] focus:bg-[#2B211B] focus:px-4 focus:py-2.5 focus:text-xs focus:font-display focus:font-semibold focus:text-[#FDFCFB] focus:shadow-layer-md"
        >
          Aller au contenu principal
        </a>

        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[1] grain-overlay"
        />

        <MarketHeader
          condition={condition}
          cartItemCount={cartTotals.itemCount}
          wishlistCount={activeWishlist.length}
          session={session}
          activeView={route.view}
          showInfoBanner={route.view === 'market-home'}
          onChangeCondition={(next) => {
            setCondition(next);
            if (route.view === 'market-catalogue') {
              setCatalogueConditionFilter(next);
            } else if (route.view !== 'market-home') {
              navigate({ view: 'market-home' });
            }
          }}
          onGoVitrine={() => navigate({ view: 'vitrine' })}
          onGoMarketHome={() => navigate({ view: 'market-home' })}
          onGoCatalogue={() => {
            setCatalogueConditionFilter(condition);
            navigate({ view: 'market-catalogue' });
          }}
          onGoAssistant={() => {
            setAiTab('buyer');
            navigate({ view: 'market-assistant', tab: 'buyer' });
          }}
          onGoCart={() => navigate({ view: 'market-cart' })}
          onGoAccount={() =>
            navigate(session ? { view: 'market-account' } : { view: 'market-login' })
          }
        />

        <main id="main-content" tabIndex={-1} className="outline-none">
          {route.view === 'market-home' && (
          <MarketHomeView
            products={products}
            condition={condition}
            wishlistIds={activeWishlist}
            onToggleWishlist={handleToggleWishlist}
            onChangeCondition={setCondition}
            onSelectSegment={(segment) => {
              setSelectedSegment(segment);
              setCatalogueConditionFilter('all');
              navigate({ view: 'market-catalogue', segment });
            }}
            onSelectProduct={(product) =>
              navigate({ view: 'market-product', productId: product.id })
            }
            onGoCatalogue={() => {
              setCatalogueConditionFilter(condition);
              setSelectedSegment('Tous');
              navigate({ view: 'market-catalogue' });
            }}
            onGoAssistant={(tab) => {
              setAiTab(tab);
              navigate({ view: 'market-assistant', tab });
            }}
          />
        )}

        {route.view === 'market-catalogue' && (
          <MarketCatalogueView
            products={catalogueProducts}
            conditionFilter={catalogueConditionFilter}
            selectedSegment={selectedSegment}
            searchQuery={searchQuery}
            sortBy={sortBy}
            activeShop={activeShop}
            wishlistIds={activeWishlist}
            onToggleWishlist={handleToggleWishlist}
            onChangeConditionFilter={setCatalogueConditionFilter}
            onSelectSegment={setSelectedSegment}
            onSearchChange={setSearchQuery}
            onSortChange={setSortBy}
            onClearShop={() => navigate({ view: 'market-catalogue' })}
            onResetFilters={() => {
              setCatalogueConditionFilter('all');
              setSelectedSegment('Tous');
              setSearchQuery('');
              setSortBy('featured');
              if (activeShopId) {
                navigate({ view: 'market-catalogue' });
              }
            }}
            onSelectProduct={(product) =>
              navigate({ view: 'market-product', productId: product.id })
            }
          />
        )}

        {route.view === 'market-product' && currentProduct && (
          <ProductDetailView
            product={currentProduct}
            shop={currentProductShop}
            similarProducts={similarProducts}
            prevProduct={prevProduct}
            nextProduct={nextProduct}
            isWishlisted={activeWishlist.includes(currentProduct.id)}
            wishlistIds={activeWishlist}
            onBack={() => {
              if (window.history.length > 1) {
                window.history.back();
              } else {
                navigate({ view: 'market-home' });
              }
            }}
            onSelectProduct={(product) =>
              navigate({ view: 'market-product', productId: product.id })
            }
            onToggleWishlist={handleToggleWishlist}
            onViewShop={(shopId) => {
              setSelectedSegment('Tous');
              setSearchQuery('');
              navigate({ view: 'market-catalogue', shopId });
            }}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onAskAiAboutProduct={(product) => {
              setAiTab('buyer');
              setPrefilledBuyerPrompt(
                `Comment porter et associer « ${product.name} » (${product.material}) ?`,
              );
              navigate({ view: 'market-assistant', tab: 'buyer' });
            }}
          />
        )}

        {route.view === 'market-cart' && (
          <MarketCartView
            cart={cart}
            session={session}
            lastOrder={lastOrder}
            onUpdateQuantity={(productId, size, delta) =>
              setCart((prev) => updateCartQuantity(prev, productId, size, delta))
            }
            onRemoveItem={(productId, size) =>
              setCart((prev) => removeFromCart(prev, productId, size))
            }
            onGoCatalogue={() => {
              setCatalogueConditionFilter('all');
              navigate({ view: 'market-catalogue' });
            }}
            onRequireAuth={() =>
              navigate({ view: 'market-login', redirectTo: 'cart' })
            }
            onCompleteOrder={handleCompleteOrder}
            onClearReceipt={() => setLastOrder(null)}
          />
        )}

        {route.view === 'market-login' && (
          <MarketLoginView
            pendingGuestFavoritesCount={guestWishlist.length}
            onLoginPhone={(params) => {
              const user = authService.signInWithPhone(params);
              finalizeAuthAndSync(
                user,
                route.redirectTo === 'cart' ? 'market-cart' : 'market-account',
              );
            }}
            onLoginGoogle={() => {
              const user = authService.signInWithGoogle();
              finalizeAuthAndSync(
                user,
                route.redirectTo === 'cart' ? 'market-cart' : 'market-account',
              );
            }}
            onContinueWithoutAccount={() => navigate({ view: 'market-home' })}
          />
        )}

        {route.view === 'market-account' && (
          <MarketAccountView
            session={session}
            orders={orders}
            wishlistedProducts={wishlistedProducts}
            wishlistIds={activeWishlist}
            onToggleWishlist={handleToggleWishlist}
            onGoLogin={() => navigate({ view: 'market-login' })}
            onSignOut={() => {
              authService.signOut();
              setSession(null);
              setAccountWishlist([]);
            }}
            onSelectProduct={(product) =>
              navigate({ view: 'market-product', productId: product.id })
            }
            onGoAssistant={(tab) => {
              setAiTab(tab);
              navigate({ view: 'market-assistant', tab });
            }}
          />
        )}

        {route.view === 'market-assistant' && (
          <MarketAiView
            products={products}
            activeTab={aiTab}
            prefilledBuyerPrompt={prefilledBuyerPrompt}
            onTabChange={setAiTab}
            onSelectProduct={(product) =>
              navigate({ view: 'market-product', productId: product.id })
            }
            onPublishProduct={handlePublishProduct}
            onGoCatalogue={() => {
              setCatalogueConditionFilter('all');
              navigate({ view: 'market-catalogue' });
            }}
          />
        )}
      </main>

      {/* Mobile fixed 4-tab bottom bar (hidden on PDP where fixed buy bar lives) */}
      {route.view !== 'market-product' && (
        <MarketBottomNav
          activeView={route.view}
          cartItemCount={cartTotals.itemCount}
          wishlistCount={activeWishlist.length}
          onGoHome={() => navigate({ view: 'market-home' })}
          onGoCatalogue={() => {
            setCatalogueConditionFilter('all');
            navigate({ view: 'market-catalogue' });
          }}
          onGoCart={() => navigate({ view: 'market-cart' })}
          onGoAccount={() =>
            navigate(
              session ? { view: 'market-account' } : { view: 'market-login' },
            )
          }
        />
      )}
      </div>

      {/* Non-intrusive offline connectivity status */}
      <OfflineIndicator />

      {/* Toast notification (cart addition, local favorite save, account sync) */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          data-testid="market-toast"
          onMouseEnter={() => setToastPaused(true)}
          onMouseLeave={() => setToastPaused(false)}
          onFocus={() => setToastPaused(true)}
          onBlur={() => setToastPaused(false)}
          className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] md:bottom-6 right-4 z-[400] max-w-sm rounded-xl glass-surface-toast text-[#FDFCFB] px-4 py-3 text-xs sm:text-sm font-display font-semibold shadow-layer-lg flex items-center gap-3 border border-[#F2E9DA]/15"
        >
          <span>{toast.message}</span>
          {toast.actionLabel && toast.onAction && (
            <button
              type="button"
              onClick={toast.onAction}
              className="text-[#D4973B] underline underline-offset-2 shrink-0 cursor-pointer active:scale-[0.97] transition-transform"
            >
              {toast.actionLabel}
            </button>
          )}
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Fermer la notification"
            className="ml-1 -mr-1 w-6 h-6 rounded-md inline-flex items-center justify-center text-[#F2E9DA]/75 hover:text-[#FDFCFB] hover:bg-[#FDFCFB]/10 shrink-0 cursor-pointer transition-colors"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
