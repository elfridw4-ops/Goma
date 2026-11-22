import { useRef, useState } from 'react';
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react';
import { INITIAL_PRODUCTS, STORY_CHAPTERS } from '../data/catalog';
import { formatPriceFcfa } from '../utils/marketplaceLogic';
import { soundFx } from '../utils/soundService';
import { ResilientImage } from './ResilientImage';

export function ScrollytellingSection() {
  const containerRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const railScaleY = useTransform(scrollYProgress, [0, 1], [0.1, 1]);

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (shouldReduceMotion) return;
    if (latest < 0.35) {
      setActiveIndex(0);
    } else if (latest < 0.7) {
      setActiveIndex(1);
    } else {
      setActiveIndex(2);
    }
  });

  const activeChapter = STORY_CHAPTERS[activeIndex];

  const jumpToChapter = (idx: number) => {
    soundFx.playClick();
    setActiveIndex(idx);
    const el = document.getElementById(`story-chapter-${idx}`);
    if (el) {
      el.scrollIntoView({
        behavior: shouldReduceMotion ? 'auto' : 'smooth',
        block: 'center',
      });
    }
  };

  return (
    <section
      id="parcours"
      ref={containerRef}
      className="relative py-16 sm:py-28 bg-[#F2E9DA]/45 border-y border-[#E7E2D9]"
      style={{ minHeight: 'auto' }}
    >
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="max-w-xl mb-10 sm:mb-14 lg:mb-16">
          <p className="text-xs font-display font-semibold tracking-[0.06em] text-[#8A5A36] mb-2">
            L’Expérience <span translate="no">Goma</span>
          </p>
          <h2 className="font-display text-[clamp(1.75rem,3vw,2.4rem)] font-bold leading-[1.12] text-[#201F1C] [text-wrap:balance]">
            Acheter et vendre avec la même simplicité.
          </h2>
        </div>

        {/* --- MOBILE VIEW: Clean interactive card / tabbed carousel (Optimized for mobile UX) --- */}
        <div className="block lg:hidden space-y-6">
          <div className="flex items-center justify-between gap-2 bg-white rounded-xl p-1.5 border border-[#E7E2D9] shadow-sm">
            {STORY_CHAPTERS.map((chapter, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={chapter.index}
                  type="button"
                  onClick={() => jumpToChapter(idx)}
                  className={`flex-1 py-2 px-2.5 rounded-lg font-display text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#C08A2E] text-[#201F1C] shadow-sm'
                      : 'text-[#78716C] hover:text-[#201F1C]'
                  }`}
                >
                  {chapter.index} · {chapter.eyebrow}
                </button>
              );
            })}
          </div>

          <div className="bg-white rounded-2xl border border-[#E7E2D9] p-5 shadow-layer-md space-y-5">
            <div className="flex items-baseline justify-between gap-4">
              <span className="font-mono-tabular text-xs font-medium text-[#8A5A36]">
                {activeChapter.index} · {activeChapter.eyebrow}
              </span>
              <span className="font-mono-tabular text-xs font-semibold text-[#C08A2E]">
                {activeChapter.metricValue}
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="font-display text-lg sm:text-xl font-bold leading-snug text-[#201F1C]">
                {activeChapter.title}
              </h3>
              <p className="font-body text-sm leading-[1.6] text-[#44403C]">
                {activeChapter.summary}
              </p>
            </div>

            {activeIndex === 0 && (
              <div className="relative rounded-xl overflow-hidden bg-[#E7E2D9] shadow-layer-md aspect-[4/3] flex flex-col justify-end">
                <ResilientImage
                  src={INITIAL_PRODUCTS[0].images[0]}
                  alt={INITIAL_PRODUCTS[0].name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#201F1C]/90 via-[#201F1C]/25 to-transparent pointer-events-none" />
                <div className="relative z-10 p-4 flex items-baseline justify-between gap-4 text-[#FDFCFB]">
                  <p className="font-display text-xs sm:text-sm font-bold">
                    Sélection Frip &amp; Neuf · Cotonou
                  </p>
                  <span className="font-mono-tabular text-xs font-semibold text-[#D4973B] shrink-0">
                    Dès {formatPriceFcfa(INITIAL_PRODUCTS[0].priceFcfa)}
                  </span>
                </div>
              </div>
            )}

            {activeIndex === 1 && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  {INITIAL_PRODUCTS.slice(5, 7).map((item) => (
                    <div key={item.id} className="relative rounded-lg overflow-hidden bg-[#E7E2D9] aspect-[4/5] flex flex-col justify-end shadow-sm">
                      <ResilientImage
                        src={item.images[0]}
                        alt={item.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#201F1C]/85 via-transparent to-transparent pointer-events-none" />
                      <div className="relative z-10 p-2 text-[#FDFCFB]">
                        <p className="font-display text-[11px] font-bold truncate">
                          {item.name}
                        </p>
                        <span className="font-mono-tabular text-[10px] text-[#D4973B]">
                          {formatPriceFcfa(item.priceFcfa)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl bg-[#F5F3EF] p-3 text-xs text-[#201F1C]">
                  L’assistant IA intégré à la marketplace conseille selon votre budget en FCFA et le stock disponible.
                </div>
              </div>
            )}

            {activeIndex === 2 && (
              <div className="relative rounded-xl overflow-hidden bg-[#E7E2D9] shadow-layer-md aspect-[4/3] flex flex-col justify-end">
                <ResilientImage
                  src={INITIAL_PRODUCTS[7].images[0]}
                  alt={INITIAL_PRODUCTS[7].name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#201F1C]/90 via-[#201F1C]/25 to-transparent pointer-events-none" />
                <div className="relative z-10 p-4 flex items-baseline justify-between gap-4 text-[#FDFCFB]">
                  <p className="font-display text-xs sm:text-sm font-bold">
                    Cotonou · Calavi · Porto-Novo
                  </p>
                  <span className="font-mono-tabular text-xs font-semibold text-[#D4973B] shrink-0">
                    <span translate="no">MTN</span> / <span translate="no">Moov</span> / Cash
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-[#E7E2D9]">
              <button
                type="button"
                disabled={activeIndex === 0}
                onClick={() => jumpToChapter(Math.max(0, activeIndex - 1))}
                className="px-3.5 py-2 rounded-lg border border-[#E7E2D9] text-xs font-display font-semibold disabled:opacity-30 cursor-pointer"
              >
                ← Précédent
              </button>
              <span className="font-mono-tabular text-xs text-[#78716C]">
                {activeIndex + 1} / 3
              </span>
              <button
                type="button"
                disabled={activeIndex === 2}
                onClick={() => jumpToChapter(Math.min(2, activeIndex + 1))}
                className="px-3.5 py-2 rounded-lg bg-[#C08A2E] text-[#201F1C] text-xs font-display font-bold disabled:opacity-30 cursor-pointer"
              >
                Suivant →
              </button>
            </div>
          </div>
        </div>

        {/* --- DESKTOP VIEW: High-end scrollytelling pinning with sticky stage --- */}
        <div className="hidden lg:grid grid-cols-12 gap-16 items-start" style={{ minHeight: '220vh' }}>
          {/* Sticky left visual container */}
          <div className="col-span-5 sticky top-28 h-[calc(100vh-8rem)] flex flex-col justify-center">
            <div className="flex gap-6 items-stretch">
              <div
                aria-hidden="true"
                className="w-[2px] bg-[#E7E2D9] shrink-0 overflow-hidden"
              >
                <motion.div
                  style={
                    shouldReduceMotion
                      ? { scaleY: 1, transformOrigin: 'top' }
                      : { scaleY: railScaleY, transformOrigin: 'top' }
                  }
                  className="w-full h-full bg-[#C08A2E]"
                />
              </div>

              <div className="flex-1 min-w-0 space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div
                    className="flex items-center gap-4"
                    role="tablist"
                    aria-label="Étapes du parcours client"
                  >
                    {STORY_CHAPTERS.map((chapter, idx) => {
                      const isActive = idx === activeIndex;
                      return (
                        <button
                          key={chapter.index}
                          type="button"
                          role="tab"
                          aria-selected={isActive}
                          onClick={() => jumpToChapter(idx)}
                          className={`font-mono-tabular text-xs pb-1 transition-colors cursor-pointer ${
                            isActive
                              ? 'font-medium text-[#201F1C] border-b border-[#C08A2E]'
                              : 'text-[#78716C] hover:text-[#201F1C]'
                          }`}
                        >
                          {chapter.index}
                        </button>
                      );
                    })}
                  </div>
                  <span className="font-mono-tabular text-xs text-[#78716C]">
                    {activeChapter.index} / 03
                  </span>
                </div>

                {activeIndex === 0 && (
                  <div data-testid="scrolly-stage-0" className="relative rounded-2xl overflow-hidden bg-[#E7E2D9] shadow-layer-lg aspect-[4/5] flex flex-col justify-end">
                    <ResilientImage
                      src={INITIAL_PRODUCTS[0].images[0]}
                      alt={INITIAL_PRODUCTS[0].name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#201F1C]/90 via-[#201F1C]/25 to-transparent pointer-events-none" />
                    <div className="relative z-10 p-6 flex items-baseline justify-between gap-4 text-[#FDFCFB]">
                      <p className="font-display text-base font-bold">
                        Sélection Frip &amp; Neuf · Cotonou
                      </p>
                      <span className="font-mono-tabular text-xs font-semibold text-[#D4973B] shrink-0">
                        Dès {formatPriceFcfa(INITIAL_PRODUCTS[0].priceFcfa)}
                      </span>
                    </div>
                  </div>
                )}

                {activeIndex === 1 && (
                  <div data-testid="scrolly-stage-1" className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      {INITIAL_PRODUCTS.slice(5, 7).map((item) => (
                        <div key={item.id} className="relative rounded-xl overflow-hidden bg-[#E7E2D9] shadow-layer-md aspect-[4/5] flex flex-col justify-end">
                          <ResilientImage
                            src={item.images[0]}
                            alt={item.name}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#201F1C]/85 via-transparent to-transparent pointer-events-none" />
                          <div className="relative z-10 p-3 text-[#FDFCFB]">
                            <p className="font-display text-xs font-bold truncate">
                              {item.name}
                            </p>
                            <span className="font-mono-tabular text-[11px] text-[#D4973B]">
                              {formatPriceFcfa(item.priceFcfa)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-xl bg-[#201F1C]/90 text-[#FDFCFB] p-4 shadow-layer-md backdrop-blur-md">
                      <p className="font-body text-sm text-[#F2E9DA]">
                        L’assistant IA intégré à la marketplace conseille selon votre budget en FCFA et le stock disponible.
                      </p>
                    </div>
                  </div>
                )}

                {activeIndex === 2 && (
                  <div data-testid="scrolly-stage-2" className="relative rounded-2xl overflow-hidden bg-[#E7E2D9] shadow-layer-lg aspect-[4/5] flex flex-col justify-end">
                    <ResilientImage
                      src={INITIAL_PRODUCTS[7].images[0]}
                      alt={INITIAL_PRODUCTS[7].name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#201F1C]/90 via-[#201F1C]/25 to-transparent pointer-events-none" />
                    <div className="relative z-10 p-6 flex items-baseline justify-between gap-4 text-[#FDFCFB]">
                      <p className="font-display text-base font-bold">
                        Cotonou · Calavi · Porto-Novo
                      </p>
                      <span className="font-mono-tabular text-xs font-semibold text-[#D4973B] shrink-0">
                        <span translate="no">MTN</span> / <span translate="no">Moov</span> / Cash
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Scrolling right chapters */}
          <div className="col-span-7 space-y-[70vh] pb-[30vh]">
            {STORY_CHAPTERS.map((chapter, idx) => {
              const isCurrent = shouldReduceMotion || idx === activeIndex;
              return (
                <article
                  id={`story-chapter-${idx}`}
                  key={chapter.index}
                  className={`scrolly-chapter border-t border-[#E7E2D9] pt-8 transition-opacity duration-300 ${
                    isCurrent ? 'opacity-100' : 'opacity-50'
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-4 mb-3">
                    <span className="font-mono-tabular text-xs font-medium text-[#8A5A36]">
                      {chapter.index} · {chapter.eyebrow}
                    </span>
                    <span className="font-mono-tabular text-xs text-[#78716C]">
                      {chapter.metricValue}
                    </span>
                  </div>

                  <h3 className="font-display text-xl sm:text-2xl font-bold leading-snug text-[#201F1C] mb-3">
                    {chapter.title}
                  </h3>

                  <p className="font-body text-base leading-[1.7] text-[#44403C] max-w-[65ch]">
                    {chapter.summary}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
