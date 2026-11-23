import { useState } from 'react';
import { UtensilsCrossed } from 'lucide-react';

interface SafeImageProps {
  src?: string | null;
  alt: string;
  className?: string;
}

export function SafeImage({ src, alt, className = '' }: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#E9E5DA] to-[#CFB799]/40 text-[#26351F]/60 ${className}`}
        role="img"
        aria-label={alt}
      >
        <UtensilsCrossed className="w-8 h-8 mb-1.5 opacity-60" />
        <span className="text-xs font-medium px-3 text-center line-clamp-2 opacity-75">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
