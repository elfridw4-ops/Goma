import { useState } from 'react';
import { Download, Share, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from './usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'pill' | 'header' | 'footer' | 'account';
}

export function PWAInstallButton({
  className = '',
  variant = 'pill',
}: PWAInstallButtonProps) {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Suppress button if already installed as standalone PWA
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'account') {
      return (
        <button
          type="button"
          onClick={install}
          className={`w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#2B211B] px-4 py-3 text-xs font-display font-bold text-[#FDFCFB] hover:bg-[#201F1C] active:scale-[0.98] transition-[background-color,transform] cursor-pointer ${className}`}
        >
          <Download className="w-4 h-4 text-[#C08A2E]" aria-hidden="true" />
          <span>Installer l’application Goma</span>
        </button>
      );
    }

    if (variant === 'footer') {
      return (
        <button
          type="button"
          onClick={install}
          className={`inline-flex items-center gap-1.5 font-body text-xs text-[#78716C] hover:text-[#201F1C] transition-colors cursor-pointer ${className}`}
        >
          <Download className="w-3.5 h-3.5 text-[#C08A2E]" aria-hidden="true" />
          <span>Installer l’application (PWA)</span>
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={install}
        className={`inline-flex items-center gap-1.5 rounded-lg border border-[#E7E2D9] bg-white px-3 py-1.5 text-xs font-display font-semibold text-[#201F1C] hover:border-[#8A5A36] active:scale-[0.97] transition-all cursor-pointer ${className}`}
      >
        <Download className="w-3.5 h-3.5 text-[#C08A2E]" aria-hidden="true" />
        <span>Installer l’application</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported on WebKit iOS)
  if (isIOS) {
    return (
      <>
        {variant === 'account' ? (
          <button
            type="button"
            onClick={() => setShowIOSGuide(true)}
            className={`w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#E7E2D9] bg-white px-4 py-3 text-xs font-display font-bold text-[#201F1C] hover:border-[#8A5A36] active:scale-[0.98] transition-all cursor-pointer ${className}`}
          >
            <Smartphone className="w-4 h-4 text-[#8A5A36]" aria-hidden="true" />
            <span>Installer sur iPhone / iPad</span>
          </button>
        ) : variant === 'footer' ? (
          <button
            type="button"
            onClick={() => setShowIOSGuide(true)}
            className={`inline-flex items-center gap-1.5 font-body text-xs text-[#78716C] hover:text-[#201F1C] transition-colors cursor-pointer ${className}`}
          >
            <Smartphone className="w-3.5 h-3.5 text-[#8A5A36]" aria-hidden="true" />
            <span>Installer sur iOS</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowIOSGuide(true)}
            className={`inline-flex items-center gap-1.5 rounded-lg border border-[#E7E2D9] bg-white px-3 py-1.5 text-xs font-display font-semibold text-[#201F1C] hover:border-[#8A5A36] active:scale-[0.97] transition-all cursor-pointer ${className}`}
          >
            <Smartphone className="w-3.5 h-3.5 text-[#8A5A36]" aria-hidden="true" />
            <span>Installer sur iOS</span>
          </button>
        )}

        {showIOSGuide && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-guide-title"
            className="fixed inset-0 z-[300] glass-surface-toast flex items-center justify-center p-4"
          >
            <div className="w-full max-w-sm rounded-2xl bg-[#FDFCFB] p-6 shadow-layer-lg border border-[#E7E2D9] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#2B211B] flex items-center justify-center text-[#F2E9DA]">
                    <Smartphone className="w-4 h-4 text-[#C08A2E]" aria-hidden="true" />
                  </div>
                  <h3
                    id="ios-guide-title"
                    className="font-display text-base font-bold text-[#201F1C]"
                  >
                    Installer Goma sur iPhone
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Fermer le guide d’installation"
                  className="rounded-lg p-1 text-[#78716C] hover:text-[#201F1C] cursor-pointer"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              <div className="space-y-3 font-body text-sm text-[#44403C]">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#F2E9DA] text-[#2B211B] font-mono-tabular text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <p>
                    Touchez le bouton <strong>Partager</strong>{' '}
                    <Share className="inline w-3.5 h-3.5 text-[#8A5A36] mx-0.5" aria-hidden="true" />{' '}
                    dans la barre Safari.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#F2E9DA] text-[#2B211B] font-mono-tabular text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <p>
                    Faites défiler puis touchez{' '}
                    <strong>« Sur l’écran d’accueil »</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#F2E9DA] text-[#2B211B] font-mono-tabular text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <p>
                    Touchez <strong>Ajouter</strong> en haut à droite pour accéder à Goma comme une vraie application.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-xl bg-[#2B211B] py-2.5 text-xs font-display font-bold text-[#FDFCFB] hover:bg-[#201F1C] active:scale-[0.98] transition-transform cursor-pointer"
              >
                Compris
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback for browsers that don't dispatch prompt yet (render unobtrusive footer / account option)
  if (variant === 'account' || variant === 'footer') {
    return (
      <button
        type="button"
        onClick={() => {
          if (navigator.share) {
            void navigator.share({
              title: 'Goma — Delano Collection',
              text: 'Marketplace de vêtements et accessoires au Bénin.',
              url: window.location.href,
            });
          } else {
            void navigator.clipboard?.writeText(window.location.href);
          }
        }}
        className={
          variant === 'account'
            ? `w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#E7E2D9] bg-white px-4 py-3 text-xs font-display font-semibold text-[#201F1C] hover:border-[#8A5A36] cursor-pointer ${className}`
            : `inline-flex items-center gap-1.5 font-body text-xs text-[#78716C] hover:text-[#201F1C] transition-colors cursor-pointer ${className}`
        }
      >
        <Smartphone className="w-3.5 h-3.5 text-[#8A5A36]" aria-hidden="true" />
        <span>Application web Goma (PWA)</span>
      </button>
    );
  }

  return null;
}
