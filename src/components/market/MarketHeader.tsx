import { Heart, Search, ShoppingBag, Sparkles, Store, User } from 'lucide-react';
import type { ProductCondition, UserSession } from '../../types/marketplace';
import { GomaMarkIcon } from '../icons/BrandIcons';
import { PWAInstallButton } from '../pwa/PWAInstallButton';

interface MarketHeaderProps {
  condition: ProductCondition;
  cartItemCount: number;
  wishlistCount: number;
  session: UserSession | null;
  activeView: string;
  showInfoBanner?: boolean;
  onChangeCondition: (condition: ProductCondition) => void;
  onGoVitrine: () => void;
  onGoMarketHome: () => void;
  onGoCatalogue: () => void;
  onGoAssistant: () => void;
  onGoCart: () => void;
  onGoAccount: () => void;
}

export function MarketHeader({
  condition,
  cartItemCount,
  wishlistCount,
  session,
  activeView,
  showInfoBanner = true,
  onChangeCondition,
  onGoVitrine,
  onGoMarketHome,
  onGoCatalogue,
  onGoAssistant,
  onGoCart,
  onGoAccount,
}: MarketHeaderProps) {
  const isProductView = activeView === 'market-product';

  return (
    <div className={isProductView ? 'relative z-[100]' : 'sticky top-0 z-[100]'}>
      <header className="glass-surface-light border-b border-[#2B211B]/10 transition-colors">
        <div className="mx-auto max-w-[1200px] px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-6">
          {/* Left: Brand SVG + Neuf | Frip switch */}
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
            <button
              type="button"
              translate="no"
              onClick={onGoMarketHome}
              className="inline-flex items-center gap-2 font-display text-lg sm:text-xl font-bold tracking-tight text-[#2B211B] whitespace-nowrap shrink-0 active:scale-[0.97] transition-transform cursor-pointer"
            >
              <GomaMarkIcon className="w-6 h-6 shrink-0" />
              <span>Goma</span>
            </button>

            <div
              role="group"
              aria-label="Filtrer par état des pièces"
              className="inline-flex items-center rounded-[10px] border border-[#2B211B]/12 bg-[#FDFCFB]/55 p-0.5 shrink-0"
            >
              <button
                type="button"
                aria-pressed={condition === 'neuf'}
                onClick={() => onChangeCondition('neuf')}
                className={`px-2.5 sm:px-3 py-1 rounded-[8px] text-xs font-display font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  condition === 'neuf'
                    ? 'bg-[#2B211B] text-[#FDFCFB]'
                    : 'text-[#44403C] hover:text-[#201F1C]'
                }`}
              >
                Neuf
              </button>
              <button
                type="button"
                aria-pressed={condition === 'frip'}
                onClick={() => onChangeCondition('frip')}
                className={`px-2.5 sm:px-3 py-1 rounded-[8px] text-xs font-display font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  condition === 'frip'
                    ? 'bg-[#C08A2E] text-[#201F1C]'
                    : 'text-[#44403C] hover:text-[#201F1C]'
                }`}
              >
                Frip
              </button>
            </div>
          </div>

          {/* Desktop middle navigation */}
          <nav
            aria-label="Navigation marketplace"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-[#44403C]"
          >
            <button
              type="button"
              onClick={onGoMarketHome}
              className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                activeView === 'market-home'
                  ? 'text-[#201F1C] font-semibold'
                  : 'hover:text-[#201F1C]'
              }`}
            >
              Accueil
            </button>
            <button
              type="button"
              onClick={onGoCatalogue}
              className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                activeView === 'market-catalogue'
                  ? 'text-[#201F1C] font-semibold'
                  : 'hover:text-[#201F1C]'
              }`}
            >
              Catalogue
            </button>
            <button
              type="button"
              onClick={onGoAssistant}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                activeView === 'market-assistant'
                  ? 'text-[#201F1C] font-semibold'
                  : 'hover:text-[#201F1C]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C08A2E]" aria-hidden="true" />
              <span>Assistant IA &amp; Vente</span>
            </button>
            <button
              type="button"
              onClick={onGoVitrine}
              className="inline-flex items-center gap-1 whitespace-nowrap shrink-0 text-[#7A5B45] hover:text-[#2B211B] transition-colors cursor-pointer"
            >
              <Store className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Vitrine</span>
            </button>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <PWAInstallButton className="hidden lg:inline-flex mr-1" />

            <button
              type="button"
              onClick={onGoCatalogue}
              aria-label="Rechercher dans le catalogue"
              className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-[10px] text-[#2B211B] hover:bg-[#FDFCFB]/60 transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4 sm:w-[18px] sm:h-[18px]" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={onGoAccount}
              aria-label={`Favoris (${wishlistCount}) et espace compte`}
              className="relative hidden sm:inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-[10px] text-[#2B211B] hover:bg-[#FDFCFB]/60 transition-colors cursor-pointer"
            >
              <Heart
                className={`w-[18px] h-[18px] ${
                  wishlistCount > 0 ? 'fill-[#8A5A36] text-[#8A5A36]' : ''
                }`}
                aria-hidden="true"
              />
              {wishlistCount > 0 && (
                <span
                  data-testid="market-wishlist-count"
                  className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#2B211B] text-[#F2E9DA] font-mono-tabular text-[10px] font-bold flex items-center justify-center"
                >
                  {wishlistCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={onGoAccount}
              aria-label={session ? `Compte ${session.fullName}` : 'Connexion ou compte'}
              className="inline-flex items-center justify-center gap-1.5 h-9 sm:h-10 px-2 sm:px-3 rounded-[10px] text-[#2B211B] hover:bg-[#FDFCFB]/60 transition-colors cursor-pointer"
            >
              <User className="w-4 h-4 sm:w-[18px] sm:h-[18px]" aria-hidden="true" />
              {session && (
                <span className="hidden lg:inline font-display text-xs font-semibold text-[#201F1C] max-w-[96px] truncate">
                  {session.fullName.split(' ')[0]}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={onGoCart}
              aria-label={`Ouvrir le panier (${cartItemCount} articles)`}
              className="relative inline-flex items-center gap-1.5 h-9 sm:h-10 px-2.5 sm:px-3.5 rounded-[10px] bg-[#2B211B] text-[#FDFCFB] hover:bg-[#201F1C] active:scale-[0.97] transition-[background-color,transform] duration-150 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-[#D4973B]" aria-hidden="true" />
              <span className="hidden sm:inline font-display text-xs font-semibold">
                Panier
              </span>
              <span
                data-testid="market-cart-count"
                className="font-mono-tabular text-xs font-semibold text-[#D4973B]"
              >
                {cartItemCount}
              </span>
            </button>
          </div>
        </div>
      </header>

      {showInfoBanner && (
        <div className="glass-surface-toast border-b border-[#F2E9DA]/10 py-1.5 px-4 text-center">
          <p className="font-body text-[11px] sm:text-xs text-[#F2E9DA] truncate">
            Livraison gratuite en 48 h · Cotonou, Calavi · Payez via{' '}
            <span translate="no">MTN</span>, <span translate="no">Moov</span> ou à la livraison
          </p>
        </div>
      )}
    </div>
  );
}
