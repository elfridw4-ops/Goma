import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import {
  AUTH_LOOKBOOK_IMAGE,
  MARKET_BANNERS,
  SEGMENT_VISUALS,
} from '../../data/catalog';
import type {
  MarketSegment,
  Product,
  ProductCondition,
} from '../../types/marketplace';
import { SegmentIcon } from '../icons/BrandIcons';
import { ResilientImage } from '../ResilientImage';
import { ProductCard } from './ProductCard';

interface MarketHomeViewProps {
  products: Product[];
  condition: ProductCondition;
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
  onChangeCondition: (condition: ProductCondition) => void;
  onSelectSegment: (segment: MarketSegment) => void;
  onSelectProduct: (product: Product) => void;
  onGoCatalogue: () => void;
  onGoAssistant: (tab: 'buyer' | 'seller') => void;
}

const SEGMENTS: Exclude<MarketSegment, 'Tous'>[] = [
  'Homme',
  'Femme',
  'Chaussure',
  'Sacs',
  'Bijoux',
  'Enfant',
  'Accessoires',
];

export function MarketHomeView({
  products,
  condition,
  wishlistIds,
  onToggleWishlist,
  onChangeCondition,
  onSelectSegment,
  onSelectProduct,
  onGoCatalogue,
  onGoAssistant,
}: MarketHomeViewProps) {
  const [bannerIdx, setBannerIdx] = useState(condition === 'frip' ? 0 : 1);
  const [isBannerPaused, setIsBannerPaused] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion || isBannerPaused || MARKET_BANNERS.length <= 1) {
      return;
    }
    const timer = window.setInterval(() => {
      setBannerIdx((prev) => (prev + 1) % MARKET_BANNERS.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [isBannerPaused, shouldReduceMotion]);

  const goPrevBanner = () => {
    setBannerIdx(
      (prev) => (prev - 1 + MARKET_BANNERS.length) % MARKET_BANNERS.length,
    );
  };

  const goNextBanner = () => {
    setBannerIdx((prev) => (prev + 1) % MARKET_BANNERS.length);
  };

  const conditionProducts = products.filter((p) => p.condition === condition);
  const displayPool =
    conditionProducts.length > 0 ? conditionProducts : products;

  const newArrivals = displayPool.filter((p) => p.isNewArrival);
  const bestSellers = displayPool.filter((p) => p.isBestSeller);

  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-6 sm:py-8 space-y-10 pb-24 md:pb-14">
      {/* Promotional Auto-Scrolling Banner Carousel (Argile & Moutarde) */}
      <section
        aria-label="Sélection mise en avant"
        aria-roledescription="carousel"
        className="space-y-3"
        onMouseEnter={() => setIsBannerPaused(true)}
        onMouseLeave={() => setIsBannerPaused(false)}
        onFocus={() => setIsBannerPaused(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
            setIsBannerPaused(false);
          }
        }}
      >
        <div className="relative overflow-hidden rounded-2xl bg-[#C08A2E] text-[#201F1C] border border-[#8A5A36]/25 shadow-layer-sm">
          <div
            className={`flex ${
              shouldReduceMotion
                ? ''
                : 'transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]'
            }`}
            style={{ transform: `translateX(-${bannerIdx * 100}%)` }}
          >
            {MARKET_BANNERS.map((banner, idx) => {
              const isActive = idx === bannerIdx;
              return (
                <div
                  key={banner.id}
                  aria-hidden={!isActive}
                  className="w-full shrink-0 grid grid-cols-1 md:grid-cols-12 md:h-[296px] lg:h-[320px] items-stretch"
                >
                  <div className="md:col-span-7 p-6 sm:p-8 lg:px-10 lg:py-8 flex flex-col justify-center space-y-3">
                    <p className="font-mono-tabular text-[11px] font-semibold uppercase tracking-wider text-[#2B211B]/85">
                      {banner.eyebrow}
                    </p>
                    <h1 className="font-display text-2xl sm:text-[1.75rem] lg:text-3xl font-extrabold leading-tight text-[#201F1C] [text-wrap:balance]">
                      {banner.title}
                    </h1>
                    <p className="font-body text-sm sm:text-base text-[#2B211B]/90 max-w-lg line-clamp-2">
                      {banner.subtitle}
                    </p>
                    <div className="pt-1">
                      <button
                        type="button"
                        tabIndex={isActive ? 0 : -1}
                        onClick={() => {
                          onChangeCondition(banner.condition);
                          onGoCatalogue();
                        }}
                        className="inline-flex items-center gap-2 rounded-[10px] bg-[#2B211B] px-4 py-2.5 text-xs sm:text-sm font-display font-semibold text-[#FDFCFB] hover:bg-[#201F1C] active:scale-[0.97] transition-[background-color,transform] duration-150 cursor-pointer"
                      >
                        <span>{banner.ctaLabel}</span>
                        <ChevronRight className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  <div className="relative h-48 sm:h-56 md:h-full md:col-span-5 bg-[#F2E9DA] overflow-hidden">
                    <ResilientImage
                      src={banner.imageUrl}
                      alt={banner.title}
                      priority={idx === 0 || isActive}
                      className="absolute inset-0 w-full h-full object-cover object-[50%_22%]"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={goPrevBanner}
            aria-label="Bannière précédente"
            className="w-7 h-7 rounded-full border border-[#E7E2D9] bg-white text-[#44403C] flex items-center justify-center hover:border-[#8A5A36] hover:text-[#201F1C] transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
          </button>

          <div className="flex items-center gap-1">
            {MARKET_BANNERS.map((banner, idx) => (
              <button
                key={banner.id}
                type="button"
                aria-label={`Afficher la bannière ${idx + 1}`}
                aria-pressed={idx === bannerIdx}
                onClick={() => setBannerIdx(idx)}
                className="min-w-[28px] min-h-[28px] flex items-center justify-center px-1 cursor-pointer"
              >
                <span
                  aria-hidden="true"
                  className={`block h-1.5 rounded-full transition-[width,background-color] duration-200 ease-out ${
                    idx === bannerIdx ? 'w-7 bg-[#8A5A36]' : 'w-2 bg-[#E7E2D9]'
                  }`}
                />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={goNextBanner}
            aria-label="Bannière suivante"
            className="w-7 h-7 rounded-full border border-[#E7E2D9] bg-white text-[#44403C] flex items-center justify-center hover:border-[#8A5A36] hover:text-[#201F1C] transition-colors cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </section>

      {/* Par catégories with thumbnail photography + Lucide icons */}
      <section aria-labelledby="heading-categories" className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2
            id="heading-categories"
            className="font-display text-lg sm:text-xl font-bold text-[#201F1C]"
          >
            Par catégories
          </h2>
          <button
            type="button"
            onClick={onGoCatalogue}
            className="inline-flex items-center gap-0.5 font-display text-xs sm:text-sm font-semibold text-[#8A5A36] hover:text-[#2B211B] cursor-pointer"
          >
            <span>Tout voir</span>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 contain-grid">
          {SEGMENTS.map((segment, idx) => {
            const visual = SEGMENT_VISUALS[segment];
            return (
              <button
                key={segment}
                type="button"
                onClick={() => onSelectSegment(segment)}
                className={`group relative overflow-hidden rounded-xl border border-[#E7E2D9] bg-white text-left hover:border-[#C08A2E] active:scale-[0.98] transition-[border-color,box-shadow,transform] duration-200 cursor-pointer ${
                  idx === SEGMENTS.length - 1 ? 'col-span-2 sm:col-span-2 lg:col-span-1' : ''
                }`}
              >
                <div className="aspect-[16/10] w-full bg-[#F5F3EF] overflow-hidden">
                  <ResilientImage
                    src={visual.imageUrl}
                    alt={segment}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-display text-sm font-bold text-[#201F1C] truncate">
                      {segment}
                    </p>
                    <p className="font-body text-[11px] text-[#78716C] truncate">
                      {visual.subtitle}
                    </p>
                  </div>
                  <span className="w-7 h-7 rounded-lg bg-[#F5F3EF] text-[#8A5A36] flex items-center justify-center shrink-0">
                    <SegmentIcon segment={segment} className="w-3.5 h-3.5" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Nouveautés */}
      <section aria-labelledby="heading-nouveautes" className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2
              id="heading-nouveautes"
              className="font-display text-lg sm:text-xl font-bold text-[#201F1C]"
            >
              Nouveautés
            </h2>
            <p className="font-body text-xs sm:text-sm text-[#78716C]">
              Nos derniers arrivages · Mode{' '}
              {condition === 'frip' ? 'Friperie' : 'Neuf'}
            </p>
          </div>
          <button
            type="button"
            onClick={onGoCatalogue}
            className="inline-flex items-center gap-0.5 font-display text-xs sm:text-sm font-semibold text-[#8A5A36] hover:text-[#2B211B] cursor-pointer shrink-0"
          >
            <span>Tout voir</span>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex gap-3 sm:gap-5 overflow-x-auto pb-2 snap-x">
          {(newArrivals.length > 0 ? newArrivals : displayPool).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isWishlisted={wishlistIds.includes(product.id)}
              onToggleWishlist={onToggleWishlist}
              onSelect={onSelectProduct}
              className="min-w-[168px] w-[168px] sm:min-w-[225px] sm:w-[225px] snap-start shrink-0"
            />
          ))}
        </div>
      </section>

      {/* Meilleures ventes */}
      <section aria-labelledby="heading-bestsellers" className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2
              id="heading-bestsellers"
              className="font-display text-lg sm:text-xl font-bold text-[#201F1C]"
            >
              Meilleures ventes
            </h2>
            <p className="font-body text-xs sm:text-sm text-[#78716C]">
              Les plus demandés du moment
            </p>
          </div>
          <button
            type="button"
            onClick={onGoCatalogue}
            className="inline-flex items-center gap-0.5 font-display text-xs sm:text-sm font-semibold text-[#8A5A36] hover:text-[#2B211B] cursor-pointer shrink-0"
          >
            <span>Tout voir</span>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex gap-3 sm:gap-5 overflow-x-auto pb-2 snap-x">
          {(bestSellers.length > 0 ? bestSellers : products.slice(0, 4)).map(
            (product) => (
              <ProductCard
                key={`bs-${product.id}`}
                product={product}
                isWishlisted={wishlistIds.includes(product.id)}
                onToggleWishlist={onToggleWishlist}
                onSelect={onSelectProduct}
                className="min-w-[168px] w-[168px] sm:min-w-[225px] sm:w-[225px] snap-start shrink-0"
              />
            ),
          )}
        </div>
      </section>

      {/* Toutes les pièces */}
      <section aria-labelledby="heading-all-items" className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2
            id="heading-all-items"
            className="font-display text-lg sm:text-xl font-bold text-[#201F1C]"
          >
            Toutes les pièces ({condition === 'frip' ? 'Frip' : 'Neuf'})
          </h2>
          <button
            type="button"
            onClick={onGoCatalogue}
            className="inline-flex items-center gap-0.5 font-display text-xs sm:text-sm font-semibold text-[#8A5A36] hover:text-[#2B211B] cursor-pointer"
          >
            <span>Tout voir</span>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 contain-grid">
          {displayPool.map((product) => (
            <ProductCard
              key={`all-${product.id}`}
              product={product}
              isWishlisted={wishlistIds.includes(product.id)}
              onToggleWishlist={onToggleWishlist}
              onSelect={onSelectProduct}
            />
          ))}
        </div>
      </section>

      {/* Integrated AI Assistant & Seller Studio entry with Atelier Lookbook Visual */}
      <section className="overflow-hidden rounded-2xl border border-[#E7E2D9] bg-[#F5F3EF] grid grid-cols-1 md:grid-cols-12 items-stretch">
        <div className="md:col-span-8 p-6 sm:p-8 flex flex-col justify-center space-y-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-display font-semibold text-[#8A5A36]">
            <Sparkles className="w-4 h-4 text-[#C08A2E]" aria-hidden="true" />
            <span>Assistant IA Goma</span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-[#201F1C]">
            Besoin d’un conseil style ou de publier un article ?
          </h2>
          <p className="font-body text-sm text-[#44403C] max-w-xl">
            Notre conseiller vous aide à choisir selon votre budget et
            rédige vos fiches vendeur en moins d’une minute.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => onGoAssistant('buyer')}
              className="rounded-[10px] bg-[#8A5A36] px-4 py-2.5 text-xs sm:text-sm font-display font-semibold text-[#FDFCFB] hover:bg-[#74492A] active:scale-[0.97] transition-[background-color,transform] duration-150 cursor-pointer"
            >
              Conseiller acheteur IA
            </button>
            <button
              type="button"
              onClick={() => onGoAssistant('seller')}
              className="rounded-[10px] border border-[#E7E2D9] bg-white px-4 py-2.5 text-xs sm:text-sm font-display font-semibold text-[#201F1C] hover:border-[#8A5A36] active:scale-[0.97] transition-[border-color,transform] duration-150 cursor-pointer"
            >
              Vendre une pièce
            </button>
          </div>
        </div>

        <div className="hidden md:block md:col-span-4 relative md:min-h-[240px] bg-[#2B211B] overflow-hidden">
          <ResilientImage
            src={AUTH_LOOKBOOK_IMAGE}
            alt="Atelier Goma Delano Collection"
            className="absolute inset-0 w-full h-full object-cover object-[50%_22%]"
          />
        </div>
      </section>
    </div>
  );
}
