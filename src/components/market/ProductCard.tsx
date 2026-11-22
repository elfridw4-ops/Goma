import { Heart } from 'lucide-react';
import type { Product } from '../../types/marketplace';
import { formatPriceFcfa } from '../../utils/marketplaceLogic';
import { ResilientImage } from '../ResilientImage';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (productId: string) => void;
  className?: string;
}

export function ProductCard({
  product,
  onSelect,
  isWishlisted = false,
  onToggleWishlist,
  className = '',
}: ProductCardProps) {
  const isOutOfStock = product.stockCount <= 0;
  const statusLabel = isOutOfStock
    ? 'Rupture de stock'
    : product.isUniquePiece
      ? '1 seul'
      : 'Neuf';

  return (
    <article
      className={`group relative flex flex-col rounded-xl border border-[#E7E2D9] bg-white overflow-hidden transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-[#C08A2E] hover:shadow-layer-sm ${className}`}
    >
      <div className="relative aspect-[4/3] w-full bg-[#F5F3EF] overflow-hidden">
        <button
          type="button"
          onClick={() => onSelect(product)}
          aria-label={`Voir ${product.name} à ${formatPriceFcfa(product.priceFcfa)}`}
          className="w-full h-full block focus-visible:outline-2 focus-visible:outline-[#8A5A36] cursor-pointer"
        >
          <ResilientImage
            src={product.images[0]}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03] ${
              isOutOfStock ? 'opacity-65 grayscale-[25%]' : ''
            }`}
          />
        </button>

        <span
          className={`pointer-events-none absolute top-2 left-2 rounded-md px-2 py-0.5 font-mono-tabular text-[10px] font-semibold tracking-wide ${
            isOutOfStock
              ? 'bg-[#2B211B] text-[#FDFCFB]'
              : product.isUniquePiece
                ? 'bg-[#2B211B]/85 text-[#F2E9DA]'
                : 'bg-[#8A5A36]/90 text-[#FDFCFB]'
          }`}
        >
          {statusLabel}
        </span>

        {onToggleWishlist && (
          <button
            type="button"
            onClick={() => onToggleWishlist(product.id)}
            aria-label={
              isWishlisted
                ? `Retirer ${product.name} des favoris`
                : `Ajouter ${product.name} aux favoris`
            }
            aria-pressed={isWishlisted}
            className={`absolute top-2 right-2 w-9 h-9 rounded-lg border flex items-center justify-center active:scale-[0.95] transition-[background-color,border-color,transform] cursor-pointer ${
              isWishlisted
                ? 'glass-surface-toast border-[#C08A2E] text-[#D4973B]'
                : 'glass-surface-light border-[#E7E2D9] text-[#2B211B] hover:bg-[#FDFCFB]'
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-[#D4973B]' : ''}`}
              aria-hidden="true"
            />
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => onSelect(product)}
        className="p-3 sm:p-3.5 flex flex-col gap-1.5 w-full text-left focus-visible:outline-2 focus-visible:outline-[#8A5A36] cursor-pointer"
      >
        <div className="flex items-center justify-between gap-2 w-full">
          <span className="inline-block rounded-md bg-[#C08A2E] px-2 py-0.5 font-mono-tabular text-xs font-bold text-[#201F1C]">
            {formatPriceFcfa(product.priceFcfa)}
          </span>
          <span className="font-mono-tabular text-[11px] text-[#78716C] truncate">
            {product.sizes[0]}
          </span>
        </div>

        <h3 className="font-display text-sm font-bold text-[#201F1C] truncate w-full">
          {product.name}
        </h3>

        <div className="flex items-center justify-between gap-2 text-[11px] text-[#78716C] w-full">
          <span className="font-body truncate">{product.segment}</span>
          <span className="font-body truncate hidden sm:inline">
            {product.shopName}
          </span>
        </div>
      </button>
    </article>
  );
}
