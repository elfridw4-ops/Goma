import { useRef } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { HERO_IMAGE_URL } from '../data/catalog';
import { ResilientImage } from './ResilientImage';

interface HeroSectionProps {
  onEnterMarketplace: () => void;
  onDiscoverVitrine: () => void;
}

export function HeroSection({
  onEnterMarketplace,
  onDiscoverVitrine,
}: HeroSectionProps) {
  const heroRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '16%']);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.02, 1.1]);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '-12%']);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.15]);

  return (
    <section
      id="accueil"
      ref={heroRef}
      className="relative w-full min-h-[100svh] overflow-hidden bg-[#2B211B] flex flex-col justify-end"
    >
      {/* Edge-to-edge full-viewport parallax showroom visual */}
      <motion.div
        style={shouldReduceMotion ? undefined : { y: imageY, scale: imageScale }}
        className="absolute inset-0"
      >
        <ResilientImage
          src={HERO_IMAGE_URL}
          priority
          alt="Showroom Delano Collection sur la marketplace Goma — manteaux argile, surchemises moutarde et maille mérinos"
          className="w-full h-full object-cover object-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#2B211B]/92 via-[#2B211B]/62 to-[#2B211B]/18"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#2B211B]/85 via-[#2B211B]/25 to-[#2B211B]/35"
        />
      </motion.div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 bottom-12 w-96 h-96 rounded-full bg-[#C08A2E]/20 blur-[120px]"
      />

      <motion.div
        style={shouldReduceMotion ? undefined : { y: contentY, opacity: contentOpacity }}
        className="relative z-10 w-full mx-auto max-w-[1200px] px-4 sm:px-6 pt-32 pb-10 sm:pb-14 lg:pb-16"
      >
        <div className="max-w-2xl">
          <p className="text-xs sm:text-sm font-display font-semibold tracking-[0.06em] text-[#D4973B] mb-4">
            <span translate="no">Goma Marketplace</span> ·{' '}
            <span translate="no">Delano Collection</span>
          </p>

          <h1 className="font-display text-[clamp(2.25rem,4.5vw,3.75rem)] font-bold leading-[1.05] tracking-[-0.03em] text-[#FDFCFB] [text-wrap:balance] mb-5">
            <span translate="no">DELANO COLLECTION</span>, votre référence en vêtements et accessoires.
          </h1>

          <p className="font-body text-base sm:text-lg leading-[1.65] text-[#F2E9DA] max-w-[60ch] mb-8">
            Pièces neuves d’atelier, friperie triée au premier choix et conseil IA
            sur votre taille et votre budget en FCFA — livrés en 48 h à Cotonou et
            Abomey-Calavi.
          </p>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-10 sm:mb-12">
            <button
              type="button"
              onClick={onEnterMarketplace}
              className="inline-flex items-center gap-2.5 rounded-[10px] bg-[#C08A2E] px-6 py-3.5 text-sm sm:text-base font-display font-semibold text-[#201F1C] whitespace-nowrap shrink-0 hover:bg-[#D4973B] active:scale-[0.97] transition-[background-color,transform] duration-150 focus-visible:outline-2 focus-visible:outline-[#FDFCFB] focus-visible:outline-offset-2 cursor-pointer"
            >
              <span>Accéder à la marketplace</span>
              <ArrowRight className="w-4 h-4 stroke-[2]" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={onDiscoverVitrine}
              className="inline-flex items-center gap-2 rounded-[10px] border border-[#F2E9DA]/45 glass-surface-dark px-5 py-3.5 text-sm sm:text-base font-display font-semibold text-[#FDFCFB] whitespace-nowrap shrink-0 hover:border-[#D4973B] active:scale-[0.97] transition-[border-color,transform] duration-150 focus-visible:outline-2 focus-visible:outline-[#D4973B] focus-visible:outline-offset-2 cursor-pointer"
            >
              <span>Découvrir la vitrine</span>
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-[#F2E9DA]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs sm:text-sm text-[#F2E9DA]/85">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-body">
            <span>Neuf &amp; Friperie 1er choix</span>
            <span aria-hidden="true" className="text-[#F2E9DA]/40">·</span>
            <span>Homme, Femme, Chaussure &amp; Enfant</span>
            <span aria-hidden="true" className="text-[#F2E9DA]/40">·</span>
            <span>Cotonou &amp; Abomey-Calavi</span>
          </div>

          <a
            href="#univers"
            className="inline-flex items-center gap-2 font-display text-xs font-semibold text-[#D4973B] hover:text-[#FDFCFB] transition-colors whitespace-nowrap shrink-0"
          >
            <span>Explorer l’univers Delano</span>
            <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
        </div>
      </motion.div>
    </section>
  );
}
