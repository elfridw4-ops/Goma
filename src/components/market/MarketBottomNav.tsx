import { Home, LayoutGrid, ShoppingBag, User } from 'lucide-react';

interface MarketBottomNavProps {
  activeView: string;
  cartItemCount: number;
  wishlistCount?: number;
  onGoHome: () => void;
  onGoCatalogue: () => void;
  onGoCart: () => void;
  onGoAccount: () => void;
}

export function MarketBottomNav({
  activeView,
  cartItemCount,
  wishlistCount = 0,
  onGoHome,
  onGoCatalogue,
  onGoCart,
  onGoAccount,
}: MarketBottomNavProps) {
  const items = [
    {
      id: 'market-home',
      label: 'Accueil',
      icon: Home,
      active: activeView === 'market-home',
      onClick: onGoHome,
      badge: 0,
    },
    {
      id: 'market-catalogue',
      label: 'Catalogue',
      icon: LayoutGrid,
      active: activeView === 'market-catalogue' || activeView === 'market-assistant',
      onClick: onGoCatalogue,
      badge: 0,
    },
    {
      id: 'market-cart',
      label: 'Panier',
      icon: ShoppingBag,
      active: activeView === 'market-cart',
      onClick: onGoCart,
      badge: cartItemCount,
    },
    {
      id: 'market-account',
      label: 'Compte',
      icon: User,
      active: activeView === 'market-account' || activeView === 'market-login',
      onClick: onGoAccount,
      badge: wishlistCount,
    },
  ];

  return (
    <nav
      aria-label="Navigation mobile marketplace"
      className="md:hidden fixed bottom-0 inset-x-0 z-[100] min-h-[3.5rem] pb-[env(safe-area-inset-bottom)] glass-surface-light border-t border-[#2B211B]/12 px-2 grid grid-cols-4 items-center"
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            onClick={item.onClick}
            aria-current={item.active ? 'page' : undefined}
            className={`relative flex flex-col items-center justify-center gap-0.5 py-1.5 min-h-[44px] text-[11px] font-display active:scale-[0.97] transition-[color,transform] cursor-pointer ${
              item.active ? 'text-[#2B211B] font-bold' : 'text-[#7A5B45]'
            }`}
          >
            <span className="relative">
              <Icon className="w-[18px] h-[18px]" aria-hidden="true" />
              {item.badge > 0 && (
                <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-[#C08A2E] text-[#201F1C] font-mono-tabular text-[10px] font-bold flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
