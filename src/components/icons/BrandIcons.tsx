import {
  Banknote,
  Briefcase,
  CreditCard,
  Footprints,
  Gem,
  LayoutGrid,
  Shirt,
  ShoppingBag,
  Sparkles,
  Watch,
  type LucideProps,
} from 'lucide-react';
import type { MarketSegment, PaymentMethod } from '../../types/marketplace';

export function GomaMarkIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="2"
        y="2"
        width="28"
        height="28"
        rx="8"
        fill="#2B211B"
      />
      <path
        d="M21.5 11.5C20.2 9.6 18.1 8.5 15.6 8.5C11.4 8.5 8.5 11.7 8.5 16C8.5 20.3 11.4 23.5 15.8 23.5C19.8 23.5 22.8 20.8 23 16.4H16.2"
        stroke="#F2E9DA"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="22.5" cy="9.5" r="2.2" fill="#C08A2E" />
    </svg>
  );
}

export function GoogleLogoIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function PaymentMethodIcon({
  method,
  className = 'w-4 h-4',
}: {
  method: PaymentMethod;
  className?: string;
}) {
  if (method === 'mtn_money') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <rect x="2" y="4" width="20" height="16" rx="4" fill="#FFCC00" />
        <ellipse cx="12" cy="12" rx="6.5" ry="4" stroke="#201F1C" strokeWidth="1.6" />
        <path d="M9.5 13V11L12 12.6L14.5 11V13" stroke="#201F1C" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (method === 'moov_money') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <rect x="2" y="4" width="20" height="16" rx="4" fill="#0066B3" />
        <circle cx="12" cy="12" r="4.5" stroke="#FDFCFB" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="1.6" fill="#FF7900" />
      </svg>
    );
  }

  if (method === 'cod') {
    return <Banknote className={className} aria-hidden="true" />;
  }

  return <CreditCard className={className} aria-hidden="true" />;
}

export function SegmentIcon({
  segment,
  className = 'w-4 h-4',
}: {
  segment: MarketSegment;
  className?: string;
}) {
  const iconProps: LucideProps = { className, 'aria-hidden': true };

  switch (segment) {
    case 'Homme':
      return <Shirt {...iconProps} />;
    case 'Femme':
      return <Sparkles {...iconProps} />;
    case 'Chaussure':
      return <Footprints {...iconProps} />;
    case 'Sacs':
      return <Briefcase {...iconProps} />;
    case 'Bijoux':
      return <Gem {...iconProps} />;
    case 'Enfant':
      return <ShoppingBag {...iconProps} />;
    case 'Accessoires':
      return <Watch {...iconProps} />;
    default:
      return <LayoutGrid {...iconProps} />;
  }
}
