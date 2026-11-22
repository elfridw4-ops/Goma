import { useState, type FormEvent } from 'react';
import {
  ArrowRight,
  Eye,
  EyeOff,
  Heart,
  Lock,
  Phone,
  ShieldCheck,
  Sparkles,
  Truck,
  User,
} from 'lucide-react';
import { AUTH_LOOKBOOK_IMAGE } from '../../data/catalog';
import { validateLoginForm } from '../../utils/marketplaceLogic';
import { focusFirstInvalidField } from '../../utils/useModalAccessibility';
import { GomaMarkIcon, GoogleLogoIcon } from '../icons/BrandIcons';
import { ResilientImage } from '../ResilientImage';

interface MarketLoginViewProps {
  pendingGuestFavoritesCount: number;
  onLoginPhone: (params: {
    phone: string;
    fullName?: string;
    rememberMe: boolean;
  }) => void;
  onLoginGoogle: () => void;
  onContinueWithoutAccount: () => void;
}

export function MarketLoginView({
  pendingGuestFavoritesCount,
  onLoginPhone,
  onLoginGoogle,
  onContinueWithoutAccount,
}: MarketLoginViewProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [forgotNotice, setForgotNotice] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<'fullName' | 'phone' | 'password', string>>
  >({});

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validateLoginForm({
      phone,
      password,
      fullName,
      isRegister,
    });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      focusFirstInvalidField([
        { id: 'login-fullname', hasError: Boolean(validationErrors.fullName) },
        { id: 'login-phone', hasError: Boolean(validationErrors.phone) },
        { id: 'login-password', hasError: Boolean(validationErrors.password) },
      ]);
      return;
    }
    setErrors({});
    onLoginPhone({
      phone,
      fullName: isRegister ? fullName : undefined,
      rememberMe,
    });
  };

  return (
    <div className="mx-auto max-w-[1120px] px-4 sm:px-6 py-6 sm:py-10 pb-28 md:pb-14">
      <div className="grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden border border-[#E7E2D9] bg-white shadow-layer-md items-stretch">
        {/* Left Editorial Lookbook Panel */}
        <div className="lg:col-span-5 relative min-h-[240px] sm:min-h-[300px] lg:min-h-[620px] bg-[#2B211B] overflow-hidden flex flex-col justify-between p-6 sm:p-8 text-[#FDFCFB]">
          <ResilientImage
            src={AUTH_LOOKBOOK_IMAGE}
            priority
            alt="Atelier Delano Collection à Cotonou — sélection Argile et Moutarde"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[#2B211B] via-[#2B211B]/55 to-[#2B211B]/35"
          />

          <div className="relative z-10 flex items-center gap-2.5">
            <GomaMarkIcon className="w-7 h-7 shrink-0" />
            <span
              translate="no"
              className="font-display text-lg font-bold tracking-tight text-[#FDFCFB]"
            >
              Goma · Delano Collection
            </span>
          </div>

          <div className="relative z-10 space-y-5 mt-8">
            <div className="space-y-2">
              <p className="font-mono-tabular text-[11px] uppercase tracking-[0.08em] text-[#D4973B]">
                Espace Membre Bénin
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold leading-tight [text-wrap:balance]">
                Retrouvez vos pièces, vos favoris et vos commandes en 48 h.
              </h2>
            </div>

            <ul className="space-y-2.5 text-xs sm:text-sm text-[#F2E9DA] font-body">
              <li className="flex items-center gap-2.5">
                <Heart className="w-4 h-4 text-[#D4973B] shrink-0" aria-hidden="true" />
                <span>Synchronisation automatique de vos favoris locaux</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-[#D4973B] shrink-0" aria-hidden="true" />
                <span>Livraison suivie à Cotonou, Calavi &amp; Porto-Novo</span>
              </li>
              <li className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#D4973B] shrink-0" aria-hidden="true" />
                <span>Règlement sécurisé MTN Money, Moov Money &amp; livraison</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Authentication Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-[#FDFCFB]">
          <div className="mx-auto w-full max-w-md space-y-6">
            {/* Mode Switcher Tabs */}
            <div className="space-y-4">
              <div
                role="tablist"
                aria-label="Choisir connexion ou inscription"
                className="grid grid-cols-2 rounded-xl border border-[#E7E2D9] bg-[#F5F3EF] p-1"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={!isRegister}
                  onClick={() => {
                    setIsRegister(false);
                    setErrors({});
                  }}
                  className={`py-2 px-3 rounded-[9px] text-xs sm:text-sm font-display font-semibold transition-colors cursor-pointer ${
                    !isRegister
                      ? 'bg-[#2B211B] text-[#FDFCFB]'
                      : 'text-[#44403C] hover:text-[#201F1C]'
                  }`}
                >
                  Connexion
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={isRegister}
                  onClick={() => {
                    setIsRegister(true);
                    setErrors({});
                  }}
                  className={`py-2 px-3 rounded-[9px] text-xs sm:text-sm font-display font-semibold transition-colors cursor-pointer ${
                    isRegister
                      ? 'bg-[#2B211B] text-[#FDFCFB]'
                      : 'text-[#44403C] hover:text-[#201F1C]'
                  }`}
                >
                  Créer un compte
                </button>
              </div>

              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#201F1C]">
                  {isRegister ? 'Créer un compte Goma' : 'Connexion'}
                </h1>
                <p className="font-body text-sm text-[#78716C] mt-1">
                  {isRegister
                    ? 'Activez votre espace acheteur et vendeur en quelques secondes.'
                    : 'Accédez à votre panier, vos commandes et vos favoris synchronisés.'}
                </p>
              </div>
            </div>

            {pendingGuestFavoritesCount > 0 && (
              <div
                data-testid="pending-favorites-sync-notice"
                className="rounded-xl border border-[#C08A2E]/40 bg-[#F2E9DA]/65 px-4 py-3 flex items-start gap-3"
              >
                <Sparkles
                  className="w-4 h-4 text-[#8A5A36] shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <p className="font-body text-xs leading-relaxed text-[#2B211B]">
                  <strong>
                    {pendingGuestFavoritesCount}{' '}
                    {pendingGuestFavoritesCount > 1
                      ? 'favoris enregistrés localement'
                      : 'favori enregistré localement'}
                  </strong>{' '}
                  :{' '}
                  {pendingGuestFavoritesCount > 1
                    ? 'ils seront automatiquement synchronisés sur votre compte dès validation.'
                    : 'il sera automatiquement synchronisé sur votre compte dès validation.'}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={onLoginGoogle}
              className="w-full rounded-xl border border-[#E7E2D9] bg-white px-4 py-3 text-sm font-display font-semibold text-[#201F1C] hover:border-[#8A5A36] hover:bg-[#F5F3EF] active:scale-[0.98] transition-[background-color,border-color,transform] duration-150 flex items-center justify-center gap-3 shadow-layer-sm cursor-pointer"
            >
              <GoogleLogoIcon className="w-[18px] h-[18px] shrink-0" />
              <span>Continuer avec Google</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-[#E7E2D9]" />
              <span className="shrink-0 text-xs font-display font-semibold text-[#78716C]">
                ou avec votre numéro
              </span>
              <div className="h-px flex-1 bg-[#E7E2D9]" />
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {isRegister && (
                <div>
                  <label
                    htmlFor="login-fullname"
                    className="block text-xs font-display font-semibold text-[#201F1C] mb-1.5"
                  >
                    Nom complet
                  </label>
                  <div className="relative">
                    <User
                      className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      aria-hidden="true"
                    />
                    <input
                      id="login-fullname"
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      aria-invalid={Boolean(errors.fullName)}
                      aria-describedby={errors.fullName ? 'login-fullname-error' : undefined}
                      placeholder="Amina Tossou"
                      className="w-full rounded-xl border border-[#E7E2D9] bg-white pl-10 pr-3.5 py-3 text-base sm:text-sm text-[#201F1C] placeholder:text-[#78716C] focus:border-[#8A5A36]"
                    />
                  </div>
                  {errors.fullName && (
                    <p
                      id="login-fullname-error"
                      aria-live="polite"
                      className="mt-1 text-xs text-[#991B1B]"
                    >
                      {errors.fullName}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label
                  htmlFor="login-phone"
                  className="block text-xs font-display font-semibold text-[#201F1C] mb-1.5"
                >
                  Téléphone (Bénin)
                </label>
                <div className="relative">
                  <Phone
                    className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="login-phone"
                    name="tel"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    spellCheck={false}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? 'login-phone-error' : undefined}
                    placeholder="+229 97 00 00 00"
                    className="w-full rounded-xl border border-[#E7E2D9] bg-white pl-10 pr-3.5 py-3 text-base sm:text-sm font-mono-tabular text-[#201F1C] placeholder:text-[#78716C] focus:border-[#8A5A36]"
                  />
                </div>
                {errors.phone && (
                  <p
                    id="login-phone-error"
                    aria-live="polite"
                    className="mt-1 text-xs text-[#991B1B]"
                  >
                    {errors.phone}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="block text-xs font-display font-semibold text-[#201F1C] mb-1.5"
                >
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock
                    className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={isRegister ? 'new-password' : 'current-password'}
                    spellCheck={false}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? 'login-password-error' : undefined}
                    placeholder="Minimum 6 caractères"
                    className="w-full rounded-xl border border-[#E7E2D9] bg-white pl-10 pr-12 py-3 text-base sm:text-sm text-[#201F1C] placeholder:text-[#78716C] focus:border-[#8A5A36]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword
                        ? 'Masquer le mot de passe'
                        : 'Afficher le mot de passe'
                    }
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-lg text-[#78716C] hover:text-[#201F1C] cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <Eye className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p
                    id="login-password-error"
                    aria-live="polite"
                    className="mt-1 text-xs text-[#991B1B]"
                  >
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 text-xs">
                <label className="inline-flex items-center gap-2.5 py-2 text-[#44403C] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 accent-[#8A5A36] rounded cursor-pointer"
                  />
                  <span>Se souvenir de moi</span>
                </label>

                <button
                  type="button"
                  onClick={() => setForgotNotice(true)}
                  className="py-2 font-display font-semibold text-[#8A5A36] hover:text-[#2B211B] cursor-pointer"
                >
                  Mot de passe oublié
                </button>
              </div>

              {forgotNotice && (
                <p className="rounded-xl border border-[#E7E2D9] bg-[#F5F3EF] px-3.5 py-2.5 font-body text-xs text-[#44403C]">
                  La réinitialisation par SMS arrive bientôt. Connectez-vous avec
                  Google ou créez un nouvel accès avec votre numéro.
                </p>
              )}

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#C08A2E] px-5 py-3.5 text-sm font-display font-bold text-[#201F1C] hover:bg-[#D4973B] active:scale-[0.98] transition-[background-color,transform] duration-150 cursor-pointer"
              >
                <span>{isRegister ? 'Créer mon compte' : 'Se connecter'}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </form>

            <div className="text-center space-y-2.5 pt-1 border-t border-[#E7E2D9]">
              <p className="font-body text-xs text-[#44403C] pt-2">
                {isRegister ? 'Déjà inscrit ?' : 'Nouveau sur Goma ?'}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister((prev) => !prev);
                    setErrors({});
                  }}
                  className="font-display font-bold text-[#8A5A36] hover:text-[#2B211B] cursor-pointer"
                >
                  {isRegister ? 'Se connecter' : 'Créer un compte'}
                </button>
              </p>

              <button
                type="button"
                onClick={onContinueWithoutAccount}
                className="font-display text-xs font-semibold text-[#44403C] underline underline-offset-4 hover:text-[#201F1C] cursor-pointer"
              >
                Parcourir sans compte
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
