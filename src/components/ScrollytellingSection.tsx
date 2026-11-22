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
      className="relative py-20 sm:py-28 bg-[#F2E9DA]/45 border-y border-[#E7E2D9]"
      style={{ minHeight: '260vh' }}
    >
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="max-w-xl mb-14 lg:mb-16">
          <p className="text-xs font-display font-semibold tracking-[0.06em] text-[#8A5A36] mb-2">
            L’Expérience <span translate="no">Goma</span>
          </p>
          <h2 className="font-display text-[clamp(1.75rem,3vw,2.4rem)] font-bold leading-[1.12] text-[#201F1C] [text-wrap:balance]">
            Acheter et vendre avec la même simplicité.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Sticky left visual container */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 lg:h-[calc(100vh-8rem)] flex flex-col justify-center">
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
                  <div data-testid="scrolly-stage-0" className="relative rounded-2xl overflow-hidden bg-[#E7E2D9] shadow-layer-lg aspect-[16/13] sm:aspect-[4/5] flex flex-col justify-end">
                    <ResilientImage
                      src={INITIAL_PRODUCTS[0].images[0]}
                      alt={INITIAL_PRODUCTS[0].name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#201F1C]/90 via-[#201F1C]/25 to-transparent pointer-events-none" />
                    <div className="relative z-10 p-5 sm:p-6 flex items-baseline justify-between gap-4 text-[#FDFCFB]">
                      <p className="font-display text-sm sm:text-base font-bold">
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
                      <p className="font-body text-xs sm:text-sm text-[#F2E9DA]">
                        L’assistant IA intégré à la marketplace conseille selon votre budget en FCFA et le stock disponible.
                      </p>
                    </div>
                  </div>
                )}

                {activeIndex === 2 && (
                  <div data-testid="scrolly-stage-2" className="relative rounded-2xl overflow-hidden bg-[#E7E2D9] shadow-layer-lg aspect-[16/13] sm:aspect-[4/5] flex flex-col justify-end">
                    <ResilientImage
                      src={INITIAL_PRODUCTS[7].images[0]}
                      alt={INITIAL_PRODUCTS[7].name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#201F1C]/90 via-[#201F1C]/25 to-transparent pointer-events-none" />
                    <div className="relative z-10 p-5 sm:p-6 flex items-baseline justify-between gap-4 text-[#FDFCFB]">
                      <p className="font-display text-sm sm:text-base font-bold">
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

          {/* Scrolling right chapters with generous spacing so pinning is fully natural */}
          <div className="lg:col-span-7 space-y-[45vh] lg:space-y-[70vh] pb-[30vh]">
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
