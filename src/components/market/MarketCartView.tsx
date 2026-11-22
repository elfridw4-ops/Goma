import { useCallback, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import {
  CheckCircle2,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import type {
  CartItem,
  CheckoutFormValues,
  OrderConfirmation,
  PaymentMethod,
  UserSession,
} from '../../types/marketplace';
import {
  BENIN_CITIES,
  PAYMENT_METHOD_LABELS,
  calculateCartTotals,
  formatPriceFcfa,
  validateCheckoutForm,
} from '../../utils/marketplaceLogic';
import {
  focusFirstInvalidField,
  useModalAccessibility,
} from '../../utils/useModalAccessibility';
import { PaymentMethodIcon } from '../icons/BrandIcons';
import { ResilientImage } from '../ResilientImage';

interface MarketCartViewProps {
  cart: CartItem[];
  session: UserSession | null;
  lastOrder: OrderConfirmation | null;
  onUpdateQuantity: (productId: string, size: string, delta: number) => void;
  onRemoveItem: (productId: string, size: string) => void;
  onGoCatalogue: () => void;
  onRequireAuth: () => void;
  onCompleteOrder: (values: CheckoutFormValues) => void;
  onClearReceipt: () => void;
}

const PAYMENT_OPTIONS: PaymentMethod[] = [
  'mtn_money',
  'moov_money',
  'cod',
  'card',
];

export function MarketCartView({
  cart,
  session,
  lastOrder,
  onUpdateQuantity,
  onRemoveItem,
  onGoCatalogue,
  onRequireAuth,
  onCompleteOrder,
  onClearReceipt,
}: MarketCartViewProps) {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const authCloseBtnRef = useRef<HTMLButtonElement>(null);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  useModalAccessibility(authModalOpen, closeAuthModal, authCloseBtnRef);

  const [form, setForm] = useState<CheckoutFormValues>({
    fullName: session?.fullName || '',
    phone: session?.phone || '',
    city: 'Cotonou',
    address: '',
    paymentMethod: 'mtn_money',
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof CheckoutFormValues, string>>
  >({});

  const totals = calculateCartTotals(cart, form.city);

  const handleCheckoutTrigger = () => {
    if (!session) {
      setAuthModalOpen(true);
      return;
    }
    setForm((prev) => ({
      ...prev,
      fullName: prev.fullName || session.fullName,
      phone: prev.phone || session.phone,
    }));
    setCheckoutOpen(true);
  };

  const handleOrderSubmit = (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validateCheckoutForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      focusFirstInvalidField([
        { id: 'co-name', hasError: Boolean(validationErrors.fullName) },
        { id: 'co-phone', hasError: Boolean(validationErrors.phone) },
        { id: 'co-city', hasError: Boolean(validationErrors.city) },
        { id: 'co-address', hasError: Boolean(validationErrors.address) },
      ]);
      return;
    }
    setErrors({});
    onCompleteOrder(form);
    setCheckoutOpen(false);
  };

  return (
    <div className="mx-auto max-w-[960px] px-4 sm:px-6 py-6 sm:py-10 pb-28 md:pb-14">
      <div className="mb-6">
        <p className="font-mono-tabular text-xs font-semibold uppercase tracking-wide text-[#C08A2E] mb-1">
          Panier · {totals.itemCount}{' '}
          {totals.itemCount > 1 ? 'pièces' : 'pièce'}
        </p>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#201F1C]">
          Votre panier
        </h1>
      </div>

      {lastOrder ? (
        <div
          data-testid="order-confirmation-card"
          className="rounded-2xl border border-[#E7E2D9] bg-white p-6 sm:p-8 space-y-5"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2
              className="w-6 h-6 text-[#8A5A36] shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div>
              <p className="font-mono-tabular text-xs font-semibold text-[#8A5A36]">
                Commande {lastOrder.orderNumber} confirmée
              </p>
              <h2 className="font-display text-xl font-bold text-[#201F1C] mt-1">
                Merci {lastOrder.customerName}, votre commande est enregistrée.
              </h2>
            </div>
          </div>

          <div className="rounded-xl bg-[#F5F3EF] p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#78716C]">Livraison prévue</span>
              <span className="font-display font-semibold text-[#201F1C]">
                {lastOrder.city} · {lastOrder.estimatedDelivery}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#78716C]">Paiement choisi</span>
              <span className="font-display font-semibold text-[#201F1C]">
                {PAYMENT_METHOD_LABELS[lastOrder.paymentMethod]}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[#E7E2D9]">
              <span className="font-display font-bold text-[#201F1C]">
                Total réglé / dû
              </span>
              <span className="font-mono-tabular font-bold text-[#C08A2E]">
                {formatPriceFcfa(lastOrder.totalFcfa)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                onClearReceipt();
                onGoCatalogue();
              }}
              className="rounded-[10px] bg-[#C08A2E] px-5 py-3 text-sm font-display font-bold text-[#201F1C] hover:bg-[#D4973B] cursor-pointer"
            >
              Continuer mes achats
            </button>
          </div>
        </div>
      ) : cart.length === 0 ? (
        <div className="rounded-2xl border border-[#E7E2D9] bg-white p-10 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F5F3EF] flex items-center justify-center mx-auto text-[#8A5A36]">
            <ShoppingBag className="w-6 h-6" aria-hidden="true" />
          </div>
          <h2 className="font-display text-lg font-bold text-[#201F1C]">
            Votre panier est vide
          </h2>
          <p className="font-body text-sm text-[#78716C] max-w-md mx-auto">
            Explorez les pièces neuves Delano Collection et les arrivages
            friperie premier choix dès 500 F.
          </p>
          <button
            type="button"
            onClick={onGoCatalogue}
            className="rounded-[10px] bg-[#C08A2E] px-5 py-3 text-sm font-display font-bold text-[#201F1C] hover:bg-[#D4973B] cursor-pointer"
          >
            Parcourir le catalogue
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Items List */}
          <div className="lg:col-span-7 space-y-3">
            {cart.map((item) => (
              <div
                key={`${item.productId}-${item.selectedSize}`}
                className="rounded-2xl border border-[#E7E2D9] bg-white p-4 flex gap-4"
              >
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-[#F5F3EF] shrink-0">
                  <ResilientImage
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="font-display text-base font-bold text-[#201F1C] truncate">
                        {item.name}
                      </h2>
                      <p className="font-body text-xs text-[#78716C]">
                        Taille {item.selectedSize} · {item.shopName}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono-tabular text-sm font-bold text-[#C08A2E]">
                        {formatPriceFcfa(item.priceFcfa * item.quantity)}
                      </p>
                      {item.isUniquePiece && (
                        <p className="font-mono-tabular text-[10px] uppercase tracking-wide text-[#78716C]">
                          Pièce unique
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        onRemoveItem(item.productId, item.selectedSize)
                      }
                      aria-label={`Retirer ${item.name} du panier`}
                      className="inline-flex items-center gap-1 text-xs font-body text-[#78716C] hover:text-[#991B1B] underline underline-offset-2 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Retirer</span>
                    </button>

                    {item.isUniquePiece ? (
                      <span className="rounded-lg border border-[#E7E2D9] bg-[#F5F3EF] px-2.5 py-1 font-mono-tabular text-[11px] text-[#44403C]">
                        Pièce unique · 1
                      </span>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 rounded-lg border border-[#E7E2D9] bg-[#F5F3EF] px-1.5 py-1">
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateQuantity(item.productId, item.selectedSize, -1)
                          }
                          aria-label={`Diminuer la quantité de ${item.name}`}
                          className="w-8 h-8 rounded flex items-center justify-center hover:bg-white active:scale-[0.95] transition-transform cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                        <span className="font-mono-tabular text-xs font-semibold px-1.5">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateQuantity(item.productId, item.selectedSize, 1)
                          }
                          disabled={item.quantity >= item.maxStock}
                          aria-label={`Augmenter la quantité de ${item.name}`}
                          className="w-8 h-8 rounded flex items-center justify-center hover:bg-white disabled:opacity-40 active:scale-[0.95] transition-transform cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary & Checkout Panel */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-[#E7E2D9] bg-white p-5 sm:p-6 space-y-4">
              <h2 className="font-mono-tabular text-xs font-semibold uppercase tracking-wide text-[#78716C]">
                Récapitulatif de commande
              </h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#44403C]">
                    {totals.itemCount}{' '}
                    {totals.itemCount > 1 ? 'pièces' : 'pièce'}
                  </span>
                  <span className="font-mono-tabular font-semibold text-[#201F1C]">
                    {formatPriceFcfa(totals.subtotalFcfa)}
                  </span>
                </div>

                {checkoutOpen && (
                  <div className="flex justify-between">
                    <span className="text-[#44403C]">
                      Livraison ({form.city})
                    </span>
                    <span className="font-mono-tabular font-semibold text-[#201F1C]">
                      {totals.shippingFcfa === 0
                        ? 'Offerte'
                        : formatPriceFcfa(totals.shippingFcfa)}
                    </span>
                  </div>
                )}

                <div className="flex items-baseline justify-between pt-3 border-t border-[#E7E2D9]">
                  <span className="font-display text-sm font-bold uppercase text-[#201F1C]">
                    Total à payer
                  </span>
                  <span className="font-mono-tabular text-2xl font-extrabold text-[#C08A2E]">
                    {formatPriceFcfa(
                      checkoutOpen ? totals.totalFcfa : totals.subtotalFcfa,
                    )}
                  </span>
                </div>
              </div>

              <p className="font-body text-xs text-[#78716C]">
                Taxes incluses · Livraison calculée selon votre ville au Bénin
              </p>

              {!checkoutOpen && (
                <div className="space-y-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleCheckoutTrigger}
                    className="w-full rounded-[10px] bg-[#C08A2E] px-5 py-3.5 text-sm font-display font-bold text-[#201F1C] hover:bg-[#D4973B] active:scale-[0.98] transition-[background-color,transform] duration-150 cursor-pointer"
                  >
                    Passer la commande
                  </button>
                  {!session && (
                    <p className="text-center font-body text-xs text-[#78716C]">
                      Connectez-vous pour finaliser votre commande.
                    </p>
                  )}
                </div>
              )}

              {checkoutOpen && session && (
                <form
                  onSubmit={handleOrderSubmit}
                  noValidate
                  className="space-y-3.5 pt-3 border-t border-[#E7E2D9]"
                >
                  <div>
                    <label
                      htmlFor="co-name"
                      className="block text-xs font-display font-semibold text-[#201F1C] mb-1"
                    >
                      Nom complet
                    </label>
                    <input
                      id="co-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={form.fullName}
                      onChange={(e) =>
                        setForm({ ...form, fullName: e.target.value })
                      }
                      aria-invalid={Boolean(errors.fullName)}
                      aria-describedby={errors.fullName ? 'co-name-error' : undefined}
                      className="w-full rounded-[10px] border border-[#E7E2D9] bg-white px-3 py-2 text-base sm:text-sm text-[#201F1C]"
                    />
                    {errors.fullName && (
                      <p
                        id="co-name-error"
                        aria-live="polite"
                        className="mt-1 text-xs text-[#991B1B]"
                      >
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="co-phone"
                      className="block text-xs font-display font-semibold text-[#201F1C] mb-1"
                    >
                      Téléphone (Bénin)
                    </label>
                    <input
                      id="co-phone"
                      name="tel"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      spellCheck={false}
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={errors.phone ? 'co-phone-error' : undefined}
                      placeholder="+229 97 00 00 00"
                      className="w-full rounded-[10px] border border-[#E7E2D9] bg-white px-3 py-2 text-base sm:text-sm font-mono-tabular text-[#201F1C]"
                    />
                    {errors.phone && (
                      <p
                        id="co-phone-error"
                        aria-live="polite"
                        className="mt-1 text-xs text-[#991B1B]"
                      >
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="co-city"
                      className="block text-xs font-display font-semibold text-[#201F1C] mb-1"
                    >
                      Ville de livraison
                    </label>
                    <select
                      id="co-city"
                      value={form.city}
                      onChange={(e) =>
                        setForm({ ...form, city: e.target.value })
                      }
                      aria-invalid={Boolean(errors.city)}
                      aria-describedby={errors.city ? 'co-city-error' : undefined}
                      className="w-full rounded-[10px] border border-[#E7E2D9] bg-white px-3 py-2 text-base sm:text-sm text-[#201F1C]"
                    >
                      {BENIN_CITIES.filter((c) => c !== 'Autre ville').map(
                        (city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ),
                      )}
                    </select>
                    {errors.city && (
                      <p
                        id="co-city-error"
                        aria-live="polite"
                        className="mt-1 text-xs text-[#991B1B]"
                      >
                        {errors.city}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="co-address"
                      className="block text-xs font-display font-semibold text-[#201F1C] mb-1"
                    >
                      Quartier &amp; repère exact
                    </label>
                    <input
                      id="co-address"
                      name="street-address"
                      type="text"
                      autoComplete="street-address"
                      value={form.address}
                      onChange={(e) =>
                        setForm({ ...form, address: e.target.value })
                      }
                      aria-invalid={Boolean(errors.address)}
                      aria-describedby={errors.address ? 'co-address-error' : undefined}
                      placeholder="Ex. : Haie Vive, près de la pharmacie"
                      className="w-full rounded-[10px] border border-[#E7E2D9] bg-white px-3 py-2 text-base sm:text-sm text-[#201F1C]"
                    />
                    {errors.address && (
                      <p
                        id="co-address-error"
                        aria-live="polite"
                        className="mt-1 text-xs text-[#991B1B]"
                      >
                        {errors.address}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="block text-xs font-display font-semibold text-[#201F1C] mb-1.5">
                      Moyen de paiement
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {PAYMENT_OPTIONS.map((method) => (
                        <button
                          key={method}
                          type="button"
                          aria-pressed={form.paymentMethod === method}
                          onClick={() =>
                            setForm({ ...form, paymentMethod: method })
                          }
                          className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-display font-semibold active:scale-[0.97] transition-[background-color,border-color,transform] cursor-pointer ${
                            form.paymentMethod === method
                              ? 'border-[#C08A2E] bg-[#F2E9DA] text-[#2B211B]'
                              : 'border-[#E7E2D9] bg-white text-[#44403C]'
                          }`}
                        >
                          <PaymentMethodIcon method={method} className="w-4 h-4 shrink-0" />
                          <span
                            translate={
                              method === 'mtn_money' || method === 'moov_money'
                                ? 'no'
                                : undefined
                            }
                            className="truncate"
                          >
                            {PAYMENT_METHOD_LABELS[method]}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-[10px] bg-[#8A5A36] px-5 py-3.5 text-sm font-display font-bold text-[#FDFCFB] hover:bg-[#74492A] active:scale-[0.98] transition-[background-color,transform] duration-150 cursor-pointer"
                  >
                    Confirmer la commande ·{' '}
                    {formatPriceFcfa(totals.totalFcfa)}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auth Gate Modal / Bottom Sheet rendered via Portal so #app-shell can be marked inert */}
      {authModalOpen &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-gate-title"
            className="fixed inset-0 z-[300] glass-surface-dark flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <div className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl bg-[#FDFCFB] border border-[#E7E2D9] p-6 pb-[calc(1.75rem+env(safe-area-inset-bottom))] sm:p-8 text-center space-y-5 shadow-layer-lg">
              <button
                ref={authCloseBtnRef}
                type="button"
                onClick={closeAuthModal}
                aria-label="Fermer l’invitation à se connecter"
                className="absolute top-4 right-4 w-10 h-10 rounded-full border border-[#E7E2D9] bg-[#F5F3EF] flex items-center justify-center text-[#201F1C] hover:bg-[#E7E2D9]/60 active:scale-[0.95] transition-transform cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-[#C08A2E] text-[#201F1C] flex items-center justify-center mx-auto">
                <ShoppingBag className="w-5 h-5" aria-hidden="true" />
              </div>

              <div className="space-y-2">
                <h2
                  id="auth-gate-title"
                  className="font-display text-xl font-bold text-[#201F1C]"
                >
                  Connectez-vous pour commander
                </h2>
                <p className="font-body text-sm text-[#44403C]">
                  Vos pièces restent dans votre panier. Une fois connecté, vous
                  finalisez votre commande en quelques secondes.
                </p>
              </div>

              <div className="space-y-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalOpen(false);
                    onRequireAuth();
                  }}
                  className="w-full rounded-[10px] bg-[#C08A2E] px-5 py-3.5 text-sm font-display font-bold text-[#201F1C] hover:bg-[#D4973B] active:scale-[0.98] transition-[background-color,transform] duration-150 cursor-pointer"
                >
                  Se connecter
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalOpen(false);
                    onRequireAuth();
                  }}
                  className="font-display text-xs font-semibold text-[#201F1C] underline underline-offset-4 cursor-pointer"
                >
                  Pas encore de compte ? Créer un compte
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
