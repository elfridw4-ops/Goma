import { useEffect, useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Sparkles,
  Star,
  Store,
  Truck,
  X,
  ZoomIn,
} from 'lucide-react';
import type {
  DeliveryCheckResult,
  Product,
  Shop,
} from '../../types/marketplace';
import {
  BENIN_CITIES,
  PAYMENT_METHOD_LABELS,
  checkDeliveryByCity,
  formatPriceFcfa,
} from '../../utils/marketplaceLogic';
import { PaymentMethodIcon } from '../icons/BrandIcons';
import { ResilientImage } from '../ResilientImage';
import { ProductCard } from './ProductCard';

interface ProductDetailViewProps {
  product: Product;
  shop: Shop | null;
  similarProducts: Product[];
  prevProduct: Product | null;
  nextProduct: Product | null;
  isWishlisted: boolean;
  wishlistIds: string[];
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
  onViewShop: (shopId: string) => void;
  onAddToCart: (product: Product, size: string) => void;
  onBuyNow: (product: Product, size: string) => void;
  onAskAiAboutProduct: (product: Product) => void;
}

export function ProductDetailView({
  product,
  shop,
  similarProducts,
  prevProduct,
  nextProduct,
  isWishlisted,
  wishlistIds,
  onBack,
  onSelectProduct,
  onToggleWishlist,
  onViewShop,
  onAddToCart,
  onBuyNow,
  onAskAiAboutProduct,
}: ProductDetailViewProps) {
  const [imageIdx, setImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 'Unique');
  const [selectedCity, setSelectedCity] = useState('Cotonou');
  const [deliveryCheck, setDeliveryCheck] =
    useState<DeliveryCheckResult | null>(null);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    setImageIdx(0);
    setSelectedSize(product.sizes[0] || 'Unique');
    setDeliveryCheck(null);
    setZoomOpen(false);
  }, [product]);

  const isOutOfStock = product.stockCount <= 0;
  const images = product.images.length > 0 ? product.images : [''];
  const currentImage = images[imageIdx] ?? images[0];

  const handleShare = async () => {
    const shareText = `${product.name} — ${formatPriceFcfa(product.priceFcfa)} sur Goma`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
      }
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 2400);
    } catch {
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 2400);
    }
    void shareText;
  };

  const handleVerifyDelivery = () => {
    setDeliveryCheck(checkDeliveryByCity(selectedCity, product.priceFcfa));
  };

  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-4 sm:py-8 pb-28 md:pb-14">
      {/* Main 2-column PDP split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left: Sticky Photo Gallery */}
        <div className="lg:col-span-7 lg:sticky lg:top-8 space-y-3">
          <div className="relative aspect-[4/3] sm:aspect-square lg:aspect-[4/3] rounded-2xl overflow-hidden bg-[#F5F3EF] border border-[#E7E2D9]">
            <ResilientImage
              src={currentImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />

            {/* Top gallery controls */}
            <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={onBack}
                aria-label="Retour"
                className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#FDFCFB]/90 backdrop-blur-xs border border-[#E7E2D9] text-[#201F1C] hover:bg-white cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" aria-hidden="true" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onToggleWishlist(product.id)}
                  aria-label={
                    isWishlisted
                      ? 'Retirer des favoris'
                      : 'Ajouter aux favoris'
                  }
                  aria-pressed={isWishlisted}
                  className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#FDFCFB]/90 backdrop-blur-xs border border-[#E7E2D9] text-[#201F1C] hover:bg-white cursor-pointer"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isWishlisted ? 'fill-[#8A5A36] text-[#8A5A36]' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  aria-label="Partager cette pièce"
                  className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#FDFCFB]/90 backdrop-blur-xs border border-[#E7E2D9] text-[#201F1C] hover:bg-white cursor-pointer"
                >
                  {shareCopied ? (
                    <Check className="w-4 h-4 text-[#8A5A36]" aria-hidden="true" />
                  ) : (
                    <Share2 className="w-4 h-4" aria-hidden="true" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setZoomOpen(true)}
                  aria-label="Agrandir la photo"
                  className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#FDFCFB]/90 backdrop-blur-xs border border-[#E7E2D9] text-[#201F1C] hover:bg-white cursor-pointer"
                >
                  <ZoomIn className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Bottom status + image counter */}
            <div className="absolute bottom-3 inset-x-3 flex items-center justify-between gap-2">
              <span className="rounded-md bg-[#2B211B]/90 px-2.5 py-1 font-mono-tabular text-[11px] font-semibold text-[#F2E9DA]">
                {isOutOfStock
                  ? 'Rupture de stock'
                  : product.isUniquePiece
                    ? 'Pièce unique'
                    : 'Article Neuf'}
              </span>

              <span className="rounded-md bg-[#2B211B]/80 px-2.5 py-1 font-mono-tabular text-[11px] text-[#FDFCFB]">
                {imageIdx + 1}/{images.length}
              </span>
            </div>
          </div>

          {images.length > 1 && (
            <div className="flex items-center gap-2.5">
              {images.map((imgUrl, idx) => (
                <button
                  key={`${product.id}-thumb-${idx}`}
                  type="button"
                  onClick={() => setImageIdx(idx)}
                  aria-label={`Photo ${idx + 1}`}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors cursor-pointer ${
                    idx === imageIdx ? 'border-[#C08A2E]' : 'border-[#E7E2D9]'
                  }`}
                >
                  <ResilientImage
                    src={imgUrl}
                    alt={`${product.name} vue ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Contiguous Purchase & Verification Module */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <p className="font-mono-tabular text-xs font-semibold uppercase tracking-wide text-[#8A5A36]">
              {product.segment} · Réf. {product.reference}
            </p>

            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#201F1C] leading-tight">
              {product.name}
            </h1>

            {/* Prev / Next product quick links */}
            {(prevProduct || nextProduct) && (
              <div className="flex items-center justify-between gap-4 text-xs text-[#78716C] pt-1">
                {prevProduct ? (
                  <button
                    type="button"
                    onClick={() => onSelectProduct(prevProduct)}
                    className="inline-flex items-center gap-1 hover:text-[#201F1C] truncate cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span className="truncate">{prevProduct.name}</span>
                  </button>
                ) : (
                  <span />
                )}
                {nextProduct && (
                  <button
                    type="button"
                    onClick={() => onSelectProduct(nextProduct)}
                    className="inline-flex items-center gap-1 hover:text-[#201F1C] truncate cursor-pointer"
                  >
                    <span className="truncate">{nextProduct.name}</span>
                    <ChevronRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  </button>
                )}
              </div>
            )}

            <div className="flex items-baseline gap-3 pt-1">
              <span className="font-mono-tabular text-2xl font-extrabold text-[#C08A2E]">
                {formatPriceFcfa(product.priceFcfa)}
              </span>
              <span className="font-body text-xs sm:text-sm text-[#78716C]">
                Livraison offerte Cotonou &amp; Calavi
              </span>
            </div>
          </div>

          {/* 3-card attributes (Taille / Catégorie / Référence) */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-xl border border-[#E7E2D9] bg-[#F5F3EF] p-3">
              <p className="font-mono-tabular text-[10px] uppercase text-[#78716C] mb-1">
                Taille
              </p>
              {product.sizes.length > 1 ? (
                <select
                  aria-label="Choisir la taille"
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full bg-transparent font-display text-sm font-bold text-[#C08A2E] focus:outline-none cursor-pointer"
                >
                  {product.sizes.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="font-display text-sm font-bold text-[#C08A2E]">
                  {selectedSize}
                </p>
              )}
            </div>

            <div className="rounded-xl border border-[#E7E2D9] bg-[#F5F3EF] p-3">
              <p className="font-mono-tabular text-[10px] uppercase text-[#78716C] mb-1">
                Catégorie
              </p>
              <p className="font-display text-sm font-bold text-[#201F1C] truncate">
                {product.segment}
              </p>
            </div>

            <div className="rounded-xl border border-[#E7E2D9] bg-[#F5F3EF] p-3">
              <p className="font-mono-tabular text-[10px] uppercase text-[#78716C] mb-1">
                Référence
              </p>
              <p className="font-mono-tabular text-sm font-bold text-[#201F1C] truncate">
                {product.reference}
              </p>
            </div>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={() => onAddToCart(product, selectedSize)}
              className="flex-1 rounded-[10px] bg-[#C08A2E] px-5 py-3.5 text-sm font-display font-bold text-[#201F1C] hover:bg-[#D4973B] disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isOutOfStock
                ? 'Rupture de stock'
                : `Ajouter au panier · ${formatPriceFcfa(product.priceFcfa)}`}
            </button>

            <button
              type="button"
              disabled={isOutOfStock}
              onClick={() => onBuyNow(product, selectedSize)}
              className="rounded-[10px] border border-[#2B211B] bg-[#2B211B] px-5 py-3.5 text-sm font-display font-bold text-[#FDFCFB] hover:bg-[#201F1C] disabled:opacity-50 transition-colors cursor-pointer"
            >
              Acheter
            </button>
          </div>

          {/* Shop Card */}
          <div className="rounded-xl border border-[#E7E2D9] bg-white p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#F2E9DA] border border-[#E7E2D9] flex items-center justify-center font-display text-sm font-bold text-[#2B211B] shrink-0">
                {product.shopName.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-display text-sm font-bold text-[#201F1C] truncate">
                  {product.shopName}
                </p>
                <p className="flex items-center gap-1 font-mono-tabular text-xs text-[#78716C] min-w-0">
                  <Star className="w-3.5 h-3.5 text-[#C08A2E] fill-[#C08A2E] shrink-0" aria-hidden="true" />
                  <span className="truncate">
                    {shop
                      ? `${shop.rating.toFixed(1).replace('.', ',')} · ${shop.city}`
                      : product.geoCity}
                  </span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onViewShop(product.shopId)}
              className="inline-flex items-center gap-1.5 rounded-[10px] border border-[#E7E2D9] bg-[#FDFCFB] px-3 py-2 text-xs font-display font-semibold text-[#201F1C] hover:border-[#8A5A36] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Store className="w-3.5 h-3.5 text-[#8A5A36]" aria-hidden="true" />
              <span>Voir la boutique</span>
            </button>
          </div>

          {/* Delivery Availability Checker */}
          <div className="rounded-xl border border-[#E7E2D9] bg-white p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#8A5A36]" aria-hidden="true" />
              <label
                htmlFor="delivery-city-select"
                className="font-display text-sm font-bold text-[#201F1C]"
              >
                Vérifier la livraison à votre adresse
              </label>
            </div>

            <div className="flex gap-2">
              <select
                id="delivery-city-select"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="flex-1 rounded-[10px] border border-[#E7E2D9] bg-[#FDFCFB] px-3 py-2.5 text-sm text-[#201F1C] focus:border-[#8A5A36] focus:outline-none"
              >
                {BENIN_CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleVerifyDelivery}
                className="rounded-[10px] bg-[#C08A2E] px-4 py-2.5 text-xs font-display font-bold uppercase tracking-wide text-[#201F1C] hover:bg-[#D4973B] transition-colors shrink-0 cursor-pointer"
              >
                Vérifier
              </button>
            </div>

            {deliveryCheck ? (
              <p
                data-testid="delivery-check-result"
                className={`font-body text-xs leading-relaxed ${
                  deliveryCheck.deliverable
                    ? 'text-[#2B211B] font-medium'
                    : 'text-[#991B1B]'
                }`}
              >
                {deliveryCheck.message}
              </p>
            ) : (
              <p className="font-body text-xs text-[#78716C]">
                Si votre ville n’est pas dans la liste nous ne livrons pas à cette
                adresse.
              </p>
            )}
          </div>

          {/* Détail de la pièce */}
          <div className="space-y-2 pt-2 border-t border-[#E7E2D9]">
            <h2 className="font-mono-tabular text-xs font-semibold uppercase tracking-wide text-[#78716C]">
              Détail de la pièce
            </h2>
            <p className="font-body text-sm sm:text-base leading-relaxed text-[#201F1C]">
              {product.description}
            </p>
            <p className="font-body text-xs text-[#78716C]">
              Matière : {product.material} · Origine : {product.origin}
            </p>
          </div>

          {/* Moyens de paiement */}
          <div className="space-y-2.5">
            <h2 className="font-mono-tabular text-xs font-semibold uppercase tracking-wide text-[#78716C]">
              Moyens de paiement
            </h2>
            <div className="flex flex-wrap gap-2">
              {product.paymentMethods.map((method) => (
                <span
                  key={method}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#E7E2D9] bg-[#F5F3EF] px-3 py-1.5 font-display text-xs font-semibold text-[#201F1C]"
                >
                  <PaymentMethodIcon method={method} className="w-4 h-4 shrink-0" />
                  <span>{PAYMENT_METHOD_LABELS[method]}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Avis */}
          <div className="rounded-xl border border-[#E7E2D9] bg-[#F5F3EF] p-4 space-y-2">
            {product.reviews.length === 0 ? (
              <div className="flex items-center gap-2 text-xs font-body text-[#44403C]">
                <Star className="w-4 h-4 text-[#C08A2E] fill-[#C08A2E] shrink-0" aria-hidden="true" />
                <span>Aucun avis pour le moment sur cette pièce.</span>
              </div>
            ) : (
              product.reviews.map((rev) => (
                <div key={rev.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-display font-bold text-[#201F1C]">
                      {rev.author}
                    </span>
                    <span className="font-mono-tabular text-[#78716C]">
                      {rev.rating}/5 · {rev.date}
                    </span>
                  </div>
                  <p className="font-body text-xs text-[#44403C]">{rev.comment}</p>
                </div>
              ))
            )}
          </div>

          {/* AI Stylist shortcut */}
          <button
            type="button"
            onClick={() => onAskAiAboutProduct(product)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-[10px] border border-[#E7E2D9] bg-white px-4 py-2.5 text-xs font-display font-semibold text-[#8A5A36] hover:border-[#8A5A36] transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#C08A2E]" aria-hidden="true" />
            <span>Demander au conseiller IA comment l’associer</span>
          </button>
        </div>
      </div>

      {/* Pièces similaires */}
      {similarProducts.length > 0 && (
        <section aria-labelledby="similar-heading" className="mt-14 pt-10 border-t border-[#E7E2D9] space-y-5">
          <h2
            id="similar-heading"
            className="font-display text-xl font-bold text-[#201F1C]"
          >
            Pièces similaires
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
            {similarProducts.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                isWishlisted={wishlistIds.includes(item.id)}
                onToggleWishlist={onToggleWishlist}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        </section>
      )}

      {/* Mobile Sticky Purchase Bar (<= 60px, replaces bottom nav on PDP) */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#FDFCFB]/95 backdrop-blur-md border-t border-[#E7E2D9] px-3 py-2.5 flex items-center gap-2">
        <button
          type="button"
          disabled={isOutOfStock}
          onClick={() => onAddToCart(product, selectedSize)}
          className="flex-1 rounded-[10px] bg-[#C08A2E] px-4 py-3 text-xs font-display font-bold text-[#201F1C] disabled:opacity-50 whitespace-nowrap truncate cursor-pointer"
        >
          {isOutOfStock
            ? 'Rupture de stock'
            : `Ajouter au panier · ${formatPriceFcfa(product.priceFcfa)}`}
        </button>

        <button
          type="button"
          disabled={isOutOfStock}
          onClick={() => onBuyNow(product, selectedSize)}
          className="rounded-[10px] border border-[#2B211B] bg-[#2B211B] px-4 py-3 text-xs font-display font-bold text-[#FDFCFB] disabled:opacity-50 shrink-0 cursor-pointer"
        >
          Acheter
        </button>
      </div>

      {/* Lightbox Zoom */}
      {zoomOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Agrandissement ${product.name}`}
          className="fixed inset-0 z-50 bg-[#2B211B]/90 flex items-center justify-center p-4"
        >
          <button
            type="button"
            onClick={() => setZoomOpen(false)}
            aria-label="Fermer l’agrandissement"
            className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white text-[#201F1C] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
          <div className="max-w-3xl w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#F5F3EF]">
            <ResilientImage
              src={currentImage}
              alt={product.name}
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
