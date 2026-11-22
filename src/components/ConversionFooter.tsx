import { ArrowRight } from 'lucide-react';

interface ConversionFooterProps {
  onEnterMarketplace: () => void;
}

export function ConversionFooter({ onEnterMarketplace }: ConversionFooterProps) {
  return (
    <footer className="bg-[#2B211B] text-[#FDFCFB] py-14 sm:py-16">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-12 border-b border-[#F2E9DA]/15">
          <div className="max-w-lg">
            <h2 className="font-display text-2xl sm:text-3xl font-bold leading-tight text-[#FDFCFB] mb-2">
              Prêt à entrer sur la marketplace Goma ?
            </h2>
            <p className="font-body text-sm sm:text-base text-[#F2E9DA]/80">
              Explorez les collections neuves Delano Collection, nos pièces uniques
              friperie et l’assistance IA personnalisée.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onEnterMarketplace}
              className="inline-flex items-center gap-2 rounded-[10px] bg-[#C08A2E] px-5 py-3 text-sm font-display font-semibold text-[#201F1C] whitespace-nowrap hover:bg-[#D4973B] active:scale-[0.97] transition-[background-color,transform] duration-150 cursor-pointer"
            >
              <span>Accéder à la marketplace</span>
              <ArrowRight className="w-4 h-4 stroke-[2]" aria-hidden="true" />
            </button>

            <a
              href="#accueil"
              className="inline-flex items-center rounded-[10px] border border-[#F2E9DA]/30 px-5 py-3 text-sm font-display font-semibold text-[#FDFCFB] whitespace-nowrap hover:border-[#D4973B] transition-colors"
            >
              <span>Haut de la vitrine</span>
            </a>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#F2E9DA]/70">
          <p className="font-body">
            <strong
              translate="no"
              className="font-display text-sm text-[#FDFCFB] mr-2"
            >
              Goma
            </strong>
            © 2026 <span translate="no">Delano Collection</span> — Vitrine &amp; Marketplace vêtements et accessoires.
          </p>

          <div className="flex flex-wrap items-center gap-6">
            <a href="#univers" className="hover:text-[#FDFCFB] transition-colors">
              Univers
            </a>
            <a href="#parcours" className="hover:text-[#FDFCFB] transition-colors">
              Parcours
            </a>
            <a href="#boutiques" className="hover:text-[#FDFCFB] transition-colors">
              Maisons
            </a>
            <span className="font-mono-tabular text-[#D4973B]">Français · FCFA</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
