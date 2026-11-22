import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 md:bottom-6 left-4 z-[250] flex items-center gap-2.5 rounded-xl border border-[#C08A2E]/30 bg-[#2B211B] px-4 py-2.5 text-xs font-display font-medium text-[#FDFCFB] shadow-layer-lg animate-in fade-in"
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C08A2E] opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#C08A2E]" />
      </span>
      <WifiOff className="w-3.5 h-3.5 text-[#C08A2E]" aria-hidden="true" />
      <span>Mode hors ligne actif · Catalogue en cache disponible</span>
    </div>
  );
}
