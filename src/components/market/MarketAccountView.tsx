import {
  CheckCircle2,
  Heart,
  LogOut,
  Package,
  Sparkles,
  Store,
  User,
} from 'lucide-react';
import { AUTH_LOOKBOOK_IMAGE } from '../../data/catalog';
import type {
  OrderConfirmation,
  Product,
  UserSession,
} from '../../types/marketplace';
import {
  PAYMENT_METHOD_LABELS,
  formatPriceFcfa,
} from '../../utils/marketplaceLogic';
import { ResilientImage } from '../ResilientImage';
import { ProductCard } from './ProductCard';

interface MarketAccountViewProps {
  session: UserSession | null;
  orders: OrderConfirmation[];
  wishlistedProducts: Product[];
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
  onGoLogin: () => void;
  onSignOut: () => void;
  onSelectProduct: (product: Product) => void;
  onGoAssistant: (tab: 'buyer' | 'seller') => void;
}

export function MarketAccountView({
  session,
  orders,
  wishlistedProducts,
  wishlistIds,
  onToggleWishlist,
  onGoLogin,
  onSignOut,
  onSelectProduct,
  onGoAssistant,
}: MarketAccountViewProps) {
  return (
    <div className="mx-auto max-w-[1040px] px-4 sm:px-6 py-6 sm:py-10 space-y-8 pb-24 md:pb-14">
      {/* Editorial Account Banner */}
      {session ? (
        <div className="relative overflow-hidden rounded-2xl border border-[#E7E2D9] bg-[#2B211B] text-[#FDFCFB] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#C08A2E] text-[#201F1C] flex items-center justify-center font-display text-xl font-bold shrink-0">
              {session.fullName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="inline-flex items-center gap-1.5 font-mono-tabular text-[11px] text-[#D4973B] mb-0.5 whitespace-nowrap">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>Compte synchronisé · Bénin</span>
              </p>
              <h1 className="font-display text-xl sm:text-2xl font-bold">
                {session.fullName}
              </h1>
              <p className="font-mono-tabular text-xs text-[#F2E9DA]/85 mt-0.5">
                {session.phone}
                {session.email ? ` · ${session.email}` : ''}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onSignOut}
            className="inline-flex items-center gap-2 rounded-[10px] border border-[#F2E9DA]/25 bg-[#FDFCFB]/10 backdrop-blur-xs px-4 py-2.5 text-xs font-display font-semibold text-[#FDFCFB] hover:bg-[#991B1B] hover:border-[#991B1B] transition-colors self-start sm:self-center cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Se déconnecter</span>
          </button>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl border border-[#E7E2D9] bg-[#2B211B] text-[#FDFCFB] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <ResilientImage
            src={AUTH_LOOKBOOK_IMAGE}
            decorative
            className="absolute inset-0 w-full h-full object-cover opacity-25"
          />
          <div className="relative z-10 flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#C08A2E] text-[#201F1C] flex items-center justify-center shrink-0">
              <User className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h1 className="font-display text-xl sm:text-2xl font-bold">
                Espace Client &amp; Vendeur
              </h1>
              <p className="font-body text-sm text-[#F2E9DA]/90 max-w-xl">
                Connectez-vous ou créez un compte pour finaliser vos achats et
                synchroniser vos {wishlistedProducts.length} favori(s) locaux.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onGoLogin}
            className="relative z-10 rounded-[10px] bg-[#C08A2E] px-5 py-3 text-sm font-display font-bold text-[#201F1C] hover:bg-[#D4973B] shrink-0 cursor-pointer"
          >
            Se connecter / Créer un compte
          </button>
        </div>
      )}

      {/* AI & Seller Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onGoAssistant('buyer')}
          className="text-left rounded-2xl border border-[#E7E2D9] bg-[#F5F3EF] p-5 space-y-1.5 hover:border-[#C08A2E] transition-colors cursor-pointer"
        >
          <div className="inline-flex items-center gap-1.5 text-xs font-display font-semibold text-[#8A5A36]">
            <Sparkles className="w-4 h-4 text-[#C08A2E]" aria-hidden="true" />
            <span>Assistant Acheteur</span>
          </div>
          <p className="font-display text-base font-bold text-[#201F1C]">
            Conseiller Style IA
          </p>
          <p className="font-body text-xs text-[#44403C]">
            Composer une tenue en FCFA sur les pièces disponibles.
          </p>
        </button>

        <button
          type="button"
          onClick={() => onGoAssistant('seller')}
          className="text-left rounded-2xl border border-[#E7E2D9] bg-[#F5F3EF] p-5 space-y-1.5 hover:border-[#C08A2E] transition-colors cursor-pointer"
        >
          <div className="inline-flex items-center gap-1.5 text-xs font-display font-semibold text-[#8A5A36]">
            <Store className="w-4 h-4 text-[#C08A2E]" aria-hidden="true" />
            <span>Espace Vendeur</span>
          </div>
          <p className="font-display text-base font-bold text-[#201F1C]">
            Mettre en vente une pièce
          </p>
          <p className="font-body text-xs text-[#44403C]">
            Publier en Neuf ou Friperie avec rédaction SEO &amp; GEO assistée.
          </p>
        </button>
      </div>

      {/* Wishlist */}
      <section aria-labelledby="account-wishlist-heading" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-[#8A5A36] fill-[#8A5A36]" aria-hidden="true" />
            <h2
              id="account-wishlist-heading"
              className="font-display text-lg font-bold text-[#201F1C]"
            >
              Mes favoris ({wishlistedProducts.length})
            </h2>
          </div>

          <span className="font-mono-tabular text-xs text-[#78716C]">
            {session
              ? 'Synchronisés avec votre compte'
              : 'Sauvegarde locale · Connexion requise pour synchroniser'}
          </span>
        </div>

        {!session && wishlistedProducts.length > 0 && (
          <div className="rounded-xl border border-[#C08A2E]/35 bg-[#F2E9DA]/60 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="font-body text-xs text-[#2B211B]">
              Ces pièces sont enregistrées sur cet appareil. Connectez-vous pour
              les conserver sur votre compte Goma.
            </p>
            <button
              type="button"
              onClick={onGoLogin}
              className="rounded-lg bg-[#2B211B] px-3.5 py-2 text-xs font-display font-semibold text-[#FDFCFB] hover:bg-[#201F1C] shrink-0 cursor-pointer"
            >
              Synchroniser maintenant
            </button>
          </div>
        )}

        {wishlistedProducts.length === 0 ? (
          <p className="font-body text-sm text-[#78716C] border-t border-[#E7E2D9] pt-4">
            Ajoutez vos pièces coup de cœur en cliquant sur le cœur depuis le
            catalogue ou une fiche produit.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 contain-grid">
            {wishlistedProducts.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                isWishlisted={wishlistIds.includes(item.id)}
                onToggleWishlist={onToggleWishlist}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        )}
      </section>

      {/* Orders */}
      <section aria-labelledby="account-orders-heading" className="space-y-4">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-[#8A5A36]" aria-hidden="true" />
          <h2
            id="account-orders-heading"
            className="font-display text-lg font-bold text-[#201F1C]"
          >
            Mes commandes ({orders.length})
          </h2>
        </div>

        {orders.length === 0 ? (
          <p className="font-body text-sm text-[#78716C] border-t border-[#E7E2D9] pt-4">
            Aucune commande passée pour le moment.
          </p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.orderNumber}
                className="rounded-xl border border-[#E7E2D9] bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <p className="font-mono-tabular text-xs font-bold text-[#8A5A36]">
                    {order.orderNumber} · {order.city}
                  </p>
                  <p className="font-body text-sm text-[#201F1C]">
                    {order.itemCount} {order.itemCount > 1 ? 'pièces' : 'pièce'} ·{' '}
                    {PAYMENT_METHOD_LABELS[order.paymentMethod]}
                  </p>
                </div>
                <span className="font-mono-tabular text-sm font-bold text-[#201F1C]">
                  {formatPriceFcfa(order.totalFcfa)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
