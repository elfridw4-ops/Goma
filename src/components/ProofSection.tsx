import { ArrowUpRight } from 'lucide-react';
import { TESTIMONIALS } from '../data/catalog';

interface ProofSectionProps {
  onEnterShop: (shopId: string) => void;
}

export function ProofSection({ onEnterShop }: ProofSectionProps) {
  return (
    <section
      id="boutiques"
      className="py-16 sm:py-20 bg-[#FDFCFB] border-t border-[#E7E2D9]"
    >
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-display font-semibold tracking-[0.06em] text-[#8A5A36] mb-2">
              Maisons &amp; Engagements
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#201F1C]">
              Boutiques partenaires au Bénin &amp; achats encadrés.
            </h2>
          </div>

          <p className="font-mono-tabular text-xs sm:text-sm text-[#78716C]">
            4,8/5 Note acheteurs · Livraison 48h Cotonou &amp; Calavi · Paiement à la livraison
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 pt-8 border-t border-[#E7E2D9]">
          {TESTIMONIALS.map((item) => (
            <div key={item.name} className="flex flex-col justify-between gap-4">
              <div className="space-y-2.5">
                <p className="font-display text-sm font-bold text-[#201F1C]">
                  {item.organization}
                </p>
                <p className="font-body text-sm leading-relaxed text-[#44403C]">
                  « {item.quote} »
                </p>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <span className="font-body text-xs text-[#78716C]">
                  {item.name}
                </span>
                <button
                  type="button"
                  onClick={() => onEnterShop(item.shopId)}
                  className="inline-flex items-center gap-1 font-display text-xs font-semibold text-[#8A5A36] hover:text-[#2B211B] transition-colors cursor-pointer"
                >
                  <span>Voir {item.organization.split(' · ')[0]}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
