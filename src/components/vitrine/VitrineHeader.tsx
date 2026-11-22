import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { GomaMarkIcon } from '../icons/BrandIcons';

interface VitrineHeaderProps {
  onEnterMarketplace: () => void;
}

const NAV_LINKS = [
  { href: '#univers', label: 'Univers' },
  { href: '#parcours', label: 'Parcours' },
  { href: '#boutiques', label: 'Maisons' },
];

export function VitrineHeader({ onEnterMarketplace }: VitrineHeaderProps) {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 64);
      if (currentY > 140 && currentY > lastScrollY.current + 12) {
        setHidden(true);
      } else if (currentY < lastScrollY.current - 6 || currentY <= 80) {
        setHidden(false);
      }
      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isLightGlass = scrolled || mobileMenuOpen;

  return (
    <header
      className={`fixed top-0 inset-x-0 z-[100] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        hidden && !mobileMenuOpen ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 pt-3 sm:pt-4">
        <div
          className={`flex items-center justify-between gap-3 md:gap-8 rounded-2xl border px-4 sm:px-5 py-3 shadow-layer-sm transition-colors duration-300 ${
            isLightGlass
              ? 'glass-surface-light border-[#2B211B]/12 text-[#201F1C]'
              : 'glass-surface-dark border-[#F2E9DA]/20 text-[#FDFCFB]'
          }`}
        >
          {/* Zone 1: Brand mark + single-line wordmark */}
          <a
            href="#accueil"
            translate="no"
            className={`inline-flex items-center gap-2 font-display text-xl font-bold tracking-tight whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#C08A2E] focus-visible:outline-offset-2 rounded ${
              isLightGlass ? 'text-[#2B211B]' : 'text-[#FDFCFB]'
            }`}
          >
            <GomaMarkIcon className="w-6 h-6 shrink-0" />
            <span>Goma</span>
          </a>

          {/* Zone 2: Editorial single-line links */}
          <nav
            aria-label="Navigation vitrine"
            className={`hidden md:flex items-center gap-7 text-sm font-medium ${
              isLightGlass ? 'text-[#44403C]' : 'text-[#F2E9DA]/90'
            }`}
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`group relative py-1 whitespace-nowrap shrink-0 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-[#C08A2E] focus-visible:outline-offset-4 rounded ${
                  isLightGlass ? 'hover:text-[#2B211B]' : 'hover:text-[#FDFCFB]'
                }`}
              >
                <span>{link.label}</span>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-0 left-0 h-[1.5px] w-full origin-left scale-x-0 bg-[#C08A2E] transition-transform duration-200 ease-out group-hover:scale-x-100"
                />
              </a>
            ))}
          </nav>

          {/* Zone 3: Single primary portal action into the marketplace */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onEnterMarketplace}
              className="inline-flex items-center gap-2 rounded-[10px] bg-[#C08A2E] px-4 py-2.5 text-xs sm:text-sm font-display font-semibold text-[#201F1C] whitespace-nowrap shrink-0 hover:bg-[#D4973B] active:scale-[0.97] transition-[background-color,transform] duration-150 focus-visible:outline-2 focus-visible:outline-[#FDFCFB] focus-visible:outline-offset-2 cursor-pointer"
            >
              <span>Accéder à la marketplace</span>
              <ArrowRight className="w-4 h-4 stroke-[2]" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={mobileMenuOpen}
              className={`md:hidden inline-flex items-center justify-center w-11 h-11 rounded-[10px] border transition-colors duration-150 cursor-pointer ${
                isLightGlass
                  ? 'border-[#2B211B]/15 bg-[#FDFCFB]/60 text-[#2B211B] hover:bg-[#FDFCFB]/85'
                  : 'border-[#F2E9DA]/25 bg-[#2B211B]/50 text-[#FDFCFB] hover:bg-[#2B211B]/75'
              }`}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav
            aria-label="Navigation vitrine mobile"
            className="md:hidden mt-2 rounded-2xl border border-[#2B211B]/12 glass-surface-light p-4 shadow-layer-md flex flex-col gap-1"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-3 text-base font-medium text-[#201F1C] rounded-[10px] hover:bg-[#FDFCFB]/50 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
