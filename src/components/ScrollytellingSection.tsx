import { useRef, useState } from 'react';
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from 'motion/react';
import { INITIAL_PRODUCTS, STORY_CHAPTERS } from '../data/catalog';
import { formatPriceFcfa } from '../utils/marketplaceLogic';
import { ResilientImage } from './ResilientImage';

export function ScrollytellingSection() {
  const containerRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 25%', 'end 75%'],
  });

  const railScaleY = useTransform(scrollYProgress, [0, 1], [0.1, 1]);
  const stageY = useTransform(scrollYProgress, [0, 1], [8, -8]);

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (latest < 0.36) {
      setActiveIndex(0);
    } else if (latest < 0.72) {
      setActiveIndex(1);
    } else {
      setActiveIndex(2);
    }
  });

  const activeChapter = STORY_CHAPTERS[activeIndex];

  const jumpToChapter = (idx: number) => {
    setActiveIndex(idx);
    const el = document.getElementById(`story-chapter-${idx}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <section
      id="parcours"
      ref={containerRef}
      className="py-20 sm:py-28 bg-[#F2E9DA]/45 border-y border-[#E7E2D9]"
    >
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="max-w-xl mb-14 lg:mb-20">
          <p className="text-xs font-display font-semibold tracking-[0.06em] text-[#8A5A36] mb-2">
            L’Expérience Goma
          </p>
          <h2 className="font-display text-[clamp(1.75rem,3vw,2.4rem)] font-bold leading-[1.12] tracking-[-0.015em] text-[#201F1C] [text-wrap:balance]">
            Acheter et vendre avec la même simplicité.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <div className="flex gap-6 items-stretch">
              <div
                aria-hidden="true"
                className="w-[2px] bg-[#E7E2D9] shrink-0 overflow-hidden"
              >
                <motion.div
                  style={{ scaleY: railScaleY, transformOrigin: 'top' }}
                  className="w-full h-full bg-[#C08A2E]"
                />
              </div>

              <motion.div
                style={{ y: stageY }}
                className="flex-1 min-w-0 space-y-6"
              >
                <div className="flex items-center justify-between gap-4">
                  <div
                    className="flex items-center gap-4"
                    role="tablist"
                    aria-label="Étapes du parcours éditorial"
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
                  <div data-testid="scrolly-stage-0" className="space-y-4">
                    <div className="aspect-[4/3] rounded-xl overflow-hidden bg-[#E7E2D9]">
                      <ResilientImage
                        src={INITIAL_PRODUCTS[0].images[0]}
                        alt={INITIAL_PRODUCTS[0].name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex items-baseline justify-between gap-4 pt-1">
                      <p className="font-display text-sm font-semibold text-[#201F1C]">
                        Sélection Frip &amp; Neuf · Cotonou
                      </p>
                      <span className="font-mono-tabular text-xs text-[#8A5A36]">
                        Dès {formatPriceFcfa(INITIAL_PRODUCTS[0].priceFcfa)}
                      </span>
                    </div>
                  </div>
                )}

                {activeIndex === 1 && (
                  <div data-testid="scrolly-stage-1" className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {INITIAL_PRODUCTS.slice(5, 7).map((item) => (
                        <div key={item.id} className="space-y-2">
                          <div className="aspect-[4/3] rounded-xl overflow-hidden bg-[#E7E2D9]">
                            <ResilientImage
                              src={item.images[0]}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="font-display text-xs font-semibold text-[#201F1C] truncate">
                            {item.name}
                          </p>
                        </div>
                      ))}
                    </div>
                    <p className="font-body text-sm text-[#44403C] max-w-[65ch]">
                      L’assistant IA intégré à la marketplace conseille selon
                      votre budget en FCFA et le stock disponible.
                    </p>
                  </div>
                )}

                {activeIndex === 2 && (
                  <div data-testid="scrolly-stage-2" className="space-y-4">
                    <div className="aspect-[4/3] rounded-xl overflow-hidden bg-[#E7E2D9]">
                      <ResilientImage
                        src={INITIAL_PRODUCTS[7].images[0]}
                        alt={INITIAL_PRODUCTS[7].name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex items-baseline justify-between gap-4 pt-1">
                      <p className="font-display text-sm font-semibold text-[#201F1C]">
                        Cotonou · Calavi · Porto-Novo
                      </p>
                      <span className="font-mono-tabular text-xs text-[#8A5A36]">
                        MTN / Moov / À la livraison
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-16 lg:space-y-24">
            {STORY_CHAPTERS.map((chapter, idx) => {
              const isCurrent = idx === activeIndex;
              return (
                <article
                  id={`story-chapter-${idx}`}
                  key={chapter.index}
                  className={`border-t border-[#E7E2D9] pt-8 transition-opacity duration-300 ${
                    isCurrent ? 'opacity-100' : 'opacity-65'
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
