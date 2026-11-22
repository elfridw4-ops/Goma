import { ArrowRight } from 'lucide-react';
import { ResilientImage } from '../ResilientImage';

interface VitrineUniversSectionProps {
  onEnterMarketplace: () => void;
}

const SHOWCASE_UNIVERSES = [
  {
    index: '01',
    label: 'Collection Neuve',
    title: 'Vestes, mailles & silhouettes d’atelier',
    detail: 'Coton biologique, gabardine légère et coupes structurées.',
    imageUrl: '/src/assets/images/product_veste_moutarde_1795342522981.jpg',
  },
  {
    index: '02',
    label: 'Friperie Sélectionnée',
    title: 'Pièces uniques triées au premier choix',
    detail: 'Robes, denims et hauts vérifiés dès 500 F en stock unique.',
    imageUrl: '/src/assets/images/product_jean_vintage_1795346535535.jpg',
  },
  {
    index: '03',
    label: 'Chaussures & Cuir',
    title: 'Mocassins patinés et maroquinerie durable',
    detail: 'Cuirs pleine fleur et accessoires conçus pour durer.',
    imageUrl: '/src/assets/images/product_mocassins_cuir_1795346537039.jpg',
  },
];

export function VitrineUniversSection({
  onEnterMarketplace,
}: VitrineUniversSectionProps) {
  return (
    <section id="univers" className="py-20 sm:py-28 bg-[#FDFCFB]">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b border-[#E7E2D9] mb-12">
          <div className="max-w-xl">
            <p className="text-xs font-display font-semibold tracking-[0.06em] text-[#8A5A36] mb-2">
              Vitrine éditoriale · Delano Collection
            </p>
            <h2 className="font-display text-[clamp(1.75rem,3vw,2.45rem)] font-bold leading-[1.12] tracking-[-0.015em] text-[#201F1C] [text-wrap:balance]">
              Une vitrine de caractère, une marketplace complète à portée de clic.
            </h2>
          </div>

          <button
            type="button"
            onClick={onEnterMarketplace}
            className="inline-flex items-center gap-2 font-display text-sm font-semibold text-[#8A5A36] hover:text-[#2B211B] transition-colors whitespace-nowrap shrink-0 cursor-pointer self-start sm:self-auto"
          >
            <span>Entrer dans la marketplace</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Non-transactional gallery showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12">
          {SHOWCASE_UNIVERSES.map((item) => (
            <article key={item.index} className="space-y-4">
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-[#F5F3EF]">
                <ResilientImage
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1.5">
                <p className="font-mono-tabular text-xs text-[#8A5A36]">
                  {item.index} · {item.label}
                </p>
                <h3 className="font-display text-lg font-bold text-[#201F1C]">
                  {item.title}
                </h3>
                <p className="font-body text-sm leading-relaxed text-[#44403C]">
                  {item.detail}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
