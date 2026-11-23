import { Search, Star, Store, X } from 'lucide-react';
import type {
  MarketSegment,
  Product,
  ProductCondition,
  Shop,
  SortOption,
} from '../../types/marketplace';
import { SegmentIcon } from '../icons/BrandIcons';
import { ProductCard } from './ProductCard';

interface MarketCatalogueViewProps {
  products: Product[];
  conditionFilter: ProductCondition | 'all';
  selectedSegment: MarketSegment;
  searchQuery: string;
  sortBy: SortOption;
  activeShop: Shop | null;
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
  onChangeConditionFilter: (c: ProductCondition | 'all') => void;
  onSelectSegment: (segment: MarketSegment) => void;
  onSearchChange: (q: string) => void;
  onSortChange: (sort: SortOption) => void;
  onClearShop: () => void;
  onResetFilters: () => void;
  onSelectProduct: (product: Product) => void;
}

const SEGMENTS: MarketSegment[] = [
  'Tous',
  'Homme',
  'Femme',
  'Chaussure',
  'Sacs',
  'Bijoux',
  'Enfant',
  'Accessoires',
];

export function MarketCatalogueView({
  products,
  conditionFilter,
  selectedSegment,
  searchQuery,
  sortBy,
  activeShop,
  wishlistIds,
  onToggleWishlist,
  onChangeConditionFilter,
  onSelectSegment,
  onSearchChange,
  onSortChange,
  onClearShop,
  onResetFilters,
  onSelectProduct,
}: MarketCatalogueViewProps) {
  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-6 sm:py-10 space-y-7 pb-24 md:pb-14">
      {activeShop ? (
        <div className="rounded-2xl border border-[#E7E2D9] bg-[#F5F3EF] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-display font-semibold text-[#8A5A36]">
              <Store className="w-4 h-4" aria-hidden="true" />
              <span>Boutique vérifiée · {activeShop.city}</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-[#201F1C]">
              {activeShop.name}
            </h1>
            <p className="font-body text-sm text-[#44403C]">
              {activeShop.description}
            </p>
            <p className="inline-flex items-center gap-1 font-mono-tabular text-xs text-[#78716C] pt-1">
              <Star className="w-3.5 h-3.5 text-[#C08A2E] fill-[#C08A2E]" aria-hidden="true" />
              <span>
                {activeShop.rating.toFixed(1).replace('.', ',')} ({activeShop.reviewCount} avis)
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClearShop}
            className="inline-flex items-center gap-1.5 rounded-[10px] border border-[#E7E2D9] bg-white px-4 py-2 text-xs font-display font-semibold text-[#201F1C] hover:border-[#8A5A36] self-start sm:self-center cursor-pointer"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Voir tout le catalogue</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="font-mono-tabular text-xs font-semibold text-[#8A5A36] mb-1">
              Marketplace Goma · Bénin
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#201F1C]">
              Catalogue complet
            </h1>
          </div>

          <div
            role="group"
            aria-label="Filtrer Neuf ou Friperie"
            className="inline-flex items-center rounded-[10px] border border-[#E7E2D9] bg-[#F5F3EF] p-0.5 self-start sm:self-auto"
          >
            {(
              [
                { value: 'all', label: 'Tout' },
                { value: 'neuf', label: 'Neuf' },
                { value: 'frip', label: 'Frip' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                aria-pressed={conditionFilter === opt.value}
                onClick={() => onChangeConditionFilter(opt.value)}
                className={`px-3 py-1.5 rounded-[8px] text-xs font-display font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  conditionFilter === opt.value
                    ? 'bg-[#2B211B] text-[#FDFCFB]'
                    : 'text-[#44403C] hover:text-[#201F1C]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className="space-y-4 border-b border-[#E7E2D9] pb-5">
        <div
          role="group"
          aria-label="Filtrer par segment"
          className="flex items-center gap-5 overflow-x-auto pb-1"
        >
          {SEGMENTS.map((segment) => {
            const active = selectedSegment === segment;
            return (
              <button
                key={segment}
                type="button"
                aria-pressed={active}
                onClick={() => onSelectSegment(segment)}
                className={`relative inline-flex items-center gap-1.5 pb-2 text-sm font-display whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  active
                    ? 'font-bold text-[#201F1C]'
                    : 'font-medium text-[#78716C] hover:text-[#201F1C]'
                }`}
              >
                <SegmentIcon
                  segment={segment}
                  className={`w-3.5 h-3.5 ${active ? 'text-[#C08A2E]' : 'text-[#78716C]'}`}
                />
                <span>{segment}</span>
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 inset-x-0 h-[2px] bg-[#C08A2E]"
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <label htmlFor="market-search" className="sr-only">
              Rechercher un article, une matière ou une ville
            </label>
            <input
              id="market-search"
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Robe, sneakers, sac, collier laiton, Cotonou…"
              className="w-full rounded-[10px] border border-[#E7E2D9] bg-white pl-10 pr-4 py-2.5 text-base sm:text-sm text-[#201F1C] placeholder:text-[#78716C] focus:border-[#8A5A36]"
            />
          </div>

          <div>
            <label htmlFor="market-sort" className="sr-only">
              Trier les articles
            </label>
            <select
              id="market-sort"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="w-full sm:w-auto rounded-[10px] border border-[#E7E2D9] bg-white px-4 py-2.5 text-base sm:text-sm font-display text-[#201F1C] focus:border-[#8A5A36] cursor-pointer"
            >
              <option value="featured">Trier par pertinence</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
            </select>
          </div>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <p className="font-display text-lg font-bold text-[#201F1C]">
            Aucune pièce ne correspond à votre recherche.
          </p>
          <p className="font-body text-sm text-[#78716C]">
            Essayez de modifier les filtres Neuf / Frip ou la ville recherchée.
          </p>
          <button
            type="button"
            onClick={onResetFilters}
            className="rounded-[10px] border border-[#E7E2D9] bg-white px-4 py-2 text-sm font-display font-semibold text-[#8A5A36] hover:border-[#8A5A36] active:scale-[0.97] transition-[border-color,transform] duration-150 cursor-pointer"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 contain-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isWishlisted={wishlistIds.includes(product.id)}
              onToggleWishlist={onToggleWishlist}
              onSelect={onSelectProduct}
            />
          ))}
        </div>
      )}
    </div>
  );
}
