import { useState } from 'react';
import { ImageOff } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt?: string;
  className?: string;
  priority?: boolean;
  decorative?: boolean;
}

export function ResilientImage({
  src,
  alt = '',
  className = '',
  priority = false,
  decorative = false,
}: ResilientImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        role={decorative ? undefined : 'img'}
        aria-label={decorative ? undefined : alt}
        aria-hidden={decorative || undefined}
        className={`flex flex-col items-center justify-center bg-[#F2E9DA] text-[#7A5B45] p-6 text-center ${className}`}
      >
        <ImageOff className="w-7 h-7 mb-2 stroke-[1.5]" aria-hidden="true" />
        {!decorative && (
          <span className="font-display text-sm font-semibold text-[#2B211B]">
            {alt}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={decorative ? '' : alt}
      aria-hidden={decorative || undefined}
      referrerPolicy="no-referrer"
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
