import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import type {
  AiBuyerResponse,
  AiSellerResponse,
  MarketSegment,
  Product,
  ProductCondition,
  SellerDraft,
} from '../../types/marketplace';
import {
  formatPriceFcfa,
  validateSellerDraft,
} from '../../utils/marketplaceLogic';
import { focusFirstInvalidField } from '../../utils/useModalAccessibility';
import { ResilientImage } from '../ResilientImage';

interface MarketAiViewProps {
  products: Product[];
  activeTab: 'buyer' | 'seller';
  prefilledBuyerPrompt: string;
  onTabChange: (tab: 'buyer' | 'seller') => void;
  onSelectProduct: (product: Product) => void;
  onPublishProduct: (draft: SellerDraft) => Product;
  onGoCatalogue: () => void;
}

const BUYER_SUGGESTIONS = [
  'Tenue légère pour Cotonou sous 20 000 F',
  'Pièces friperie femme à petit prix',
  'Veste habillée et mocassins cuir assortis',
];

const INITIAL_SELLER_DRAFT: SellerDraft = {
  name: '',
  condition: 'frip',
  segment: 'Femme',
  priceFcfa: '',
  material: '',
  sizesInput: 'M',
  geoCity: 'Cotonou',
  description: '',
  isUniquePiece: true,
};

const SELLER_SEGMENTS: Exclude<MarketSegment, 'Tous'>[] = [
  'Femme',
  'Homme',
  'Chaussure',
  'Enfant',
  'Accessoires',
];

export function MarketAiView({
  products,
  activeTab,
  prefilledBuyerPrompt,
  onTabChange,
  onSelectProduct,
  onPublishProduct,
  onGoCatalogue,
}: MarketAiViewProps) {
  const [buyerQuery, setBuyerQuery] = useState('');
  const [buyerLoading, setBuyerLoading] = useState(false);
  const [buyerError, setBuyerError] = useState<string | null>(null);
  const [buyerResult, setBuyerResult] = useState<AiBuyerResponse | null>(null);

  const [draft, setDraft] = useState<SellerDraft>(INITIAL_SELLER_DRAFT);
  const [draftErrors, setDraftErrors] = useState<
    Partial<Record<keyof SellerDraft, string>>
  >({});
  const [sellerAiLoading, setSellerAiLoading] = useState(false);
  const [sellerAiError, setSellerAiError] = useState<string | null>(null);
  const [sellerAiPreview, setSellerAiPreview] =
    useState<AiSellerResponse | null>(null);
  const [publishedProduct, setPublishedProduct] = useState<Product | null>(null);
  const buyerAbortRef = useRef<AbortController | null>(null);
  const sellerAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (prefilledBuyerPrompt) {
      setBuyerQuery(prefilledBuyerPrompt);
    }
  }, [prefilledBuyerPrompt]);

  useEffect(() => {
    return () => {
      buyerAbortRef.current?.abort();
      sellerAbortRef.current?.abort();
    };
  }, []);

  const handleBuyerSubmit = async (e: FormEvent, overrideQuery?: string) => {
    e.preventDefault();
    const promptToSend = (overrideQuery ?? buyerQuery).trim();
    if (promptToSend.length < 2) {
      setBuyerError('Décrivez votre besoin de tenue, taille ou budget.');
      focusFirstInvalidField([
        { id: 'market-buyer-ai-input', hasError: true },
      ]);
      return;
    }

    buyerAbortRef.current?.abort();
    const controller = new AbortController();
    buyerAbortRef.current = controller;

    const startedAt = Date.now();
    setBuyerError(null);
    setBuyerLoading(true);
    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          mode: 'buyer',
          query: promptToSend,
          catalog: products,
        }),
      });
      const data = await response.json();
      const elapsed = Date.now() - startedAt;
      if (elapsed < 320) {
        await new Promise((r) => window.setTimeout(r, 320 - elapsed));
      }
      if (controller.signal.aborted) return;

      if (!response.ok) {
        setBuyerError(
          data.error || 'Impossible de contacter le conseiller IA pour le moment.',
        );
        return;
      }
      setBuyerResult(data as AiBuyerResponse);
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setBuyerError('Erreur réseau lors de la connexion au service assistant.');
    } finally {
      if (buyerAbortRef.current === controller) {
        setBuyerLoading(false);
      }
    }
  };

  const handleGenerateSeo = async () => {
    if (draft.name.trim().length < 2) {
      setSellerAiError(
        'Indiquez d’abord le nom de l’article pour rédiger l’annonce par IA.',
      );
      focusFirstInvalidField([{ id: 'seller-name', hasError: true }]);
      return;
    }

    sellerAbortRef.current?.abort();
    const controller = new AbortController();
    sellerAbortRef.current = controller;

    const startedAt = Date.now();
    setSellerAiError(null);
    setSellerAiLoading(true);
    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          mode: 'seller',
          sellerInput: draft,
        }),
      });
      const data = await response.json();
      const elapsed = Date.now() - startedAt;
      if (elapsed < 320) {
        await new Promise((r) => window.setTimeout(r, 320 - elapsed));
      }
      if (controller.signal.aborted) return;

      if (!response.ok) {
        setSellerAiError(
          data.error || 'Impossible de rédiger l’annonce par IA pour le moment.',
        );
        return;
      }
      const aiData = data as AiSellerResponse;
      setSellerAiPreview(aiData);
      setDraft((prev) => ({
        ...prev,
        name: aiData.optimizedTitle || prev.name,
        description: aiData.seoDescription || prev.description,
        priceFcfa:
          prev.priceFcfa.trim() === '' && aiData.suggestedPriceFcfa
            ? String(aiData.suggestedPriceFcfa)
            : prev.priceFcfa,
      }));
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setSellerAiError('Connexion indisponible. Vérifiez votre réseau et réessayez.');
    } finally {
      if (sellerAbortRef.current === controller) {
        setSellerAiLoading(false);
      }
    }
  };

  const submitSellerDraft = () => {
    const validationErrors = validateSellerDraft(draft);
    if (Object.keys(validationErrors).length > 0) {
      setDraftErrors(validationErrors);
      focusFirstInvalidField([
        { id: 'seller-name', hasError: Boolean(validationErrors.name) },
        { id: 'seller-price', hasError: Boolean(validationErrors.priceFcfa) },
        { id: 'seller-material', hasError: Boolean(validationErrors.material) },
        { id: 'seller-city', hasError: Boolean(validationErrors.geoCity) },
        { id: 'seller-sizes', hasError: Boolean(validationErrors.sizesInput) },
        {
          id: 'seller-description',
          hasError: Boolean(validationErrors.description),
        },
      ]);
      return;
    }

    setDraftErrors({});
    const created = onPublishProduct(draft);
    setPublishedProduct(created);
    setDraft(INITIAL_SELLER_DRAFT);
    setSellerAiPreview(null);
  };

  const handlePublishSubmit = (e: FormEvent) => {
    e.preventDefault();
    submitSellerDraft();
  };

  const handleDescriptionKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      submitSellerDraft();
    }
  };

  const recommendedProducts = buyerResult
    ? products.filter((p) => buyerResult.recommendedIds.includes(p.id))
    : [];

  return (
    <div className="mx-auto max-w-[960px] px-4 sm:px-6 py-6 sm:py-10 pb-24 md:pb-14">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-[#E7E2D9] pb-6 mb-8">
        <div>
          <p className="text-xs font-display font-semibold tracking-[0.06em] text-[#8A5A36] mb-1">
            Assistant IA Goma · Bénin
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#201F1C]">
            Conseiller style &amp; mise en vente.
          </h1>
        </div>

        <div
          role="tablist"
          aria-label="Choisir le mode de l'assistant"
          className="flex items-center gap-6 self-start sm:self-auto"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'buyer'}
            onClick={() => onTabChange('buyer')}
            className={`relative pb-2 text-sm font-display whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'buyer'
                ? 'font-bold text-[#201F1C]'
                : 'font-medium text-[#78716C] hover:text-[#201F1C]'
            }`}
          >
            <span>Conseiller Acheteur IA</span>
            {activeTab === 'buyer' && (
              <span
                aria-hidden="true"
                className="absolute bottom-0 inset-x-0 h-[2px] bg-[#C08A2E]"
              />
            )}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'seller'}
            onClick={() => onTabChange('seller')}
            className={`relative pb-2 text-sm font-display whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'seller'
                ? 'font-bold text-[#201F1C]'
                : 'font-medium text-[#78716C] hover:text-[#201F1C]'
            }`}
          >
            <span>Vendre une pièce</span>
            {activeTab === 'seller' && (
              <span
                aria-hidden="true"
                className="absolute bottom-0 inset-x-0 h-[2px] bg-[#C08A2E]"
              />
            )}
          </button>
        </div>
      </div>

      {activeTab === 'buyer' && (
        <div className="space-y-6">
          <form onSubmit={(e) => handleBuyerSubmit(e)} className="space-y-4">
            <label
              htmlFor="market-buyer-ai-input"
              className="block font-body text-base text-[#44403C]"
            >
              Demandez un conseil de tenue, une pièce friperie ou une sélection
              selon votre budget en FCFA.
            </label>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="market-buyer-ai-input"
                type="text"
                value={buyerQuery}
                onChange={(e) => setBuyerQuery(e.target.value)}
                aria-invalid={Boolean(buyerError)}
                aria-describedby={buyerError ? 'buyer-ai-error' : undefined}
                placeholder="Une tenue légère pour Cotonou sous 20 000 F…"
                className="flex-1 rounded-[10px] border border-[#E7E2D9] bg-white px-4 py-3 text-base sm:text-sm text-[#201F1C] placeholder:text-[#78716C] focus:border-[#8A5A36]"
              />
              <button
                type="submit"
                disabled={buyerLoading}
                aria-busy={buyerLoading}
                className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#8A5A36] px-6 py-3 text-sm font-display font-semibold text-[#FDFCFB] whitespace-nowrap shrink-0 hover:bg-[#74492A] active:scale-[0.98] disabled:opacity-60 transition-[background-color,transform] duration-150 cursor-pointer"
              >
                {buyerLoading && (
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                )}
                <span>
                  {buyerLoading
                    ? 'Analyse en cours…'
                    : 'Obtenir une recommandation'}
                </span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
              {BUYER_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={(e) => {
                    setBuyerQuery(suggestion);
                    void handleBuyerSubmit(e, suggestion);
                  }}
                  className="font-body text-xs sm:text-sm text-[#78716C] hover:text-[#8A5A36] underline underline-offset-4 decoration-[#E7E2D9] hover:decoration-[#8A5A36] cursor-pointer text-left"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </form>

          {buyerError && (
            <div
              id="buyer-ai-error"
              role="alert"
              className="rounded-[10px] border border-[#991B1B]/30 bg-[#FEF2F2] px-4 py-3 text-sm text-[#991B1B]"
            >
              {buyerError}
            </div>
          )}

          {buyerResult && (
            <div className="pt-6 border-t border-[#E7E2D9] space-y-6">
              <div className="space-y-2">
                <p className="font-display text-sm font-bold text-[#2B211B]">
                  Recommandation Marketplace Goma
                </p>
                <p className="font-body text-base leading-relaxed text-[#201F1C] max-w-[65ch]">
                  {buyerResult.advice}
                </p>
                <p className="font-body text-sm text-[#7A5B45] max-w-[65ch]">
                  {buyerResult.stylingNotes}
                </p>
              </div>

              {recommendedProducts.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {recommendedProducts.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelectProduct(item)}
                      className="text-left rounded-xl border border-[#E7E2D9] bg-white overflow-hidden hover:border-[#C08A2E] transition-colors cursor-pointer"
                    >
                      <div className="aspect-[4/3] bg-[#F5F3EF]">
                        <ResilientImage
                          src={item.images[0]}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3 space-y-1">
                        <p className="font-display text-sm font-bold text-[#201F1C] truncate">
                          {item.name}
                        </p>
                        <p className="font-mono-tabular text-xs font-bold text-[#C08A2E]">
                          {formatPriceFcfa(item.priceFcfa)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'seller' && (
        <form onSubmit={handlePublishSubmit} noValidate className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label
                htmlFor="seller-name"
                className="block text-xs font-display font-semibold text-[#201F1C] mb-1.5"
              >
                Nom de l’article
              </label>
              <input
                id="seller-name"
                type="text"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                aria-invalid={Boolean(draftErrors.name)}
                aria-describedby={draftErrors.name ? 'seller-name-error' : undefined}
                placeholder="Robe lin naturel ou jean coupe droite"
                className="w-full rounded-[10px] border border-[#E7E2D9] bg-white px-3.5 py-2.5 text-base sm:text-sm text-[#201F1C]"
              />
              {draftErrors.name && (
                <p
                  id="seller-name-error"
                  aria-live="polite"
                  className="mt-1 text-xs text-[#991B1B]"
                >
                  {draftErrors.name}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="seller-condition"
                className="block text-xs font-display font-semibold text-[#201F1C] mb-1.5"
              >
                Univers (Neuf / Frip)
              </label>
              <select
                id="seller-condition"
                value={draft.condition}
                onChange={(e) => {
                  const next = e.target.value as ProductCondition;
                  setDraft({
                    ...draft,
                    condition: next,
                    isUniquePiece: next === 'frip',
                  });
                }}
                className="w-full rounded-[10px] border border-[#E7E2D9] bg-white px-3.5 py-2.5 text-base sm:text-sm text-[#201F1C]"
              >
                <option value="frip">Friperie (Pièce unique)</option>
                <option value="neuf">Neuf</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label
                htmlFor="seller-segment"
                className="block text-xs font-display font-semibold text-[#201F1C] mb-1.5"
              >
                Catégorie
              </label>
              <select
                id="seller-segment"
                value={draft.segment}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    segment: e.target.value as Exclude<MarketSegment, 'Tous'>,
                  })
                }
                className="w-full rounded-[10px] border border-[#E7E2D9] bg-white px-3.5 py-2.5 text-base sm:text-sm text-[#201F1C]"
              >
                {SELLER_SEGMENTS.map((seg) => (
                  <option key={seg} value={seg}>
                    {seg}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="seller-price"
                className="block text-xs font-display font-semibold text-[#201F1C] mb-1.5"
              >
                Prix (FCFA)
              </label>
              <input
                id="seller-price"
                type="number"
                inputMode="numeric"
                min="100"
                value={draft.priceFcfa}
                onChange={(e) =>
                  setDraft({ ...draft, priceFcfa: e.target.value })
                }
                aria-invalid={Boolean(draftErrors.priceFcfa)}
                aria-describedby={draftErrors.priceFcfa ? 'seller-price-error' : undefined}
                placeholder="2500"
                className="w-full rounded-[10px] border border-[#E7E2D9] bg-white px-3.5 py-2.5 text-base sm:text-sm font-mono-tabular text-[#201F1C]"
              />
              {draftErrors.priceFcfa && (
                <p
                  id="seller-price-error"
                  aria-live="polite"
                  className="mt-1 text-xs text-[#991B1B]"
                >
                  {draftErrors.priceFcfa}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="seller-material"
                className="block text-xs font-display font-semibold text-[#201F1C] mb-1.5"
              >
                Matière
              </label>
              <input
                id="seller-material"
                type="text"
                value={draft.material}
                onChange={(e) =>
                  setDraft({ ...draft, material: e.target.value })
                }
                aria-invalid={Boolean(draftErrors.material)}
                aria-describedby={draftErrors.material ? 'seller-material-error' : undefined}
                placeholder="Coton, Denim, Cuir…"
                className="w-full rounded-[10px] border border-[#E7E2D9] bg-white px-3.5 py-2.5 text-base sm:text-sm text-[#201F1C]"
              />
              {draftErrors.material && (
                <p
                  id="seller-material-error"
                  aria-live="polite"
                  className="mt-1 text-xs text-[#991B1B]"
                >
                  {draftErrors.material}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="seller-city"
                className="block text-xs font-display font-semibold text-[#201F1C] mb-1.5"
              >
                Ville (Bénin)
              </label>
              <input
                id="seller-city"
                type="text"
                value={draft.geoCity}
                onChange={(e) =>
                  setDraft({ ...draft, geoCity: e.target.value })
                }
                aria-invalid={Boolean(draftErrors.geoCity)}
                aria-describedby={draftErrors.geoCity ? 'seller-city-error' : undefined}
                placeholder="Cotonou"
                className="w-full rounded-[10px] border border-[#E7E2D9] bg-white px-3.5 py-2.5 text-base sm:text-sm text-[#201F1C]"
              />
              {draftErrors.geoCity && (
                <p
                  id="seller-city-error"
                  aria-live="polite"
                  className="mt-1 text-xs text-[#991B1B]"
                >
                  {draftErrors.geoCity}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="seller-sizes"
              className="block text-xs font-display font-semibold text-[#201F1C] mb-1.5"
            >
              Taille(s)
            </label>
            <input
              id="seller-sizes"
              type="text"
              value={draft.sizesInput}
              onChange={(e) =>
                setDraft({ ...draft, sizesInput: e.target.value })
              }
              aria-invalid={Boolean(draftErrors.sizesInput)}
              aria-describedby={draftErrors.sizesInput ? 'seller-sizes-error' : undefined}
              placeholder="M ou S, M, L"
              className="w-full sm:w-1/2 rounded-[10px] border border-[#E7E2D9] bg-white px-3.5 py-2.5 text-base sm:text-sm font-mono-tabular text-[#201F1C]"
            />
            {draftErrors.sizesInput && (
              <p
                id="seller-sizes-error"
                aria-live="polite"
                className="mt-1 text-xs text-[#991B1B]"
              >
                {draftErrors.sizesInput}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <label
                htmlFor="seller-description"
                className="block text-xs font-display font-semibold text-[#201F1C]"
              >
                Description
              </label>
              <button
                type="button"
                onClick={handleGenerateSeo}
                disabled={sellerAiLoading}
                aria-busy={sellerAiLoading}
                className="inline-flex items-center gap-1.5 text-xs font-display font-semibold text-[#8A5A36] hover:text-[#2B211B] disabled:opacity-60 active:scale-[0.97] transition-transform cursor-pointer"
              >
                {sellerAiLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-[#C08A2E]" aria-hidden="true" />
                )}
                <span>
                  {sellerAiLoading
                    ? 'Rédaction en cours…'
                    : 'Rédiger l’annonce par IA'}
                </span>
              </button>
            </div>
            <textarea
              id="seller-description"
              rows={3}
              value={draft.description}
              onChange={(e) =>
                setDraft({ ...draft, description: e.target.value })
              }
              onKeyDown={handleDescriptionKeyDown}
              aria-invalid={Boolean(draftErrors.description)}
              aria-describedby={
                draftErrors.description ? 'seller-description-error' : 'seller-description-hint'
              }
              placeholder="Décrivez la coupe, l’état et les finitions…"
              className="w-full rounded-[10px] border border-[#E7E2D9] bg-white px-3.5 py-2.5 text-base sm:text-sm text-[#201F1C]"
            />
            <p
              id="seller-description-hint"
              className="mt-1 text-[11px] font-mono-tabular text-[#78716C]"
            >
              Ctrl / ⌘ + Entrée pour publier
            </p>
            {draftErrors.description && (
              <p
                id="seller-description-error"
                aria-live="polite"
                className="mt-1 text-xs text-[#991B1B]"
              >
                {draftErrors.description}
              </p>
            )}
          </div>

          {sellerAiError && (
            <div
              role="alert"
              className="rounded-[10px] border border-[#991B1B]/30 bg-[#FEF2F2] px-4 py-3 text-sm text-[#991B1B]"
            >
              {sellerAiError}
            </div>
          )}

          {sellerAiPreview && (
            <p className="font-body text-xs text-[#7A5B45]">
              Visibilité locale : {sellerAiPreview.geoSummary} ·{' '}
              {sellerAiPreview.keywords.join(', ')}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <button
              type="submit"
              className="rounded-[10px] bg-[#C08A2E] px-6 py-3 text-sm font-display font-bold text-[#201F1C] hover:bg-[#D4973B] active:scale-[0.98] transition-[background-color,transform] duration-150 cursor-pointer"
            >
              Publier sur la marketplace
            </button>

            {publishedProduct && (
              <div
                data-testid="seller-published-banner"
                className="inline-flex items-center gap-2 text-sm text-[#2B211B]"
              >
                <CheckCircle2 className="w-4 h-4 text-[#8A5A36]" aria-hidden="true" />
                <span className="font-body">
                  <strong>{publishedProduct.name}</strong> publié.
                </span>
                <button
                  type="button"
                  onClick={onGoCatalogue}
                  className="font-display text-xs font-semibold text-[#8A5A36] underline underline-offset-4 cursor-pointer"
                >
                  Voir au catalogue
                </button>
              </div>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
