'use client';

import { useState } from 'react';
import Image from 'next/image';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
}

export default function SafeImage({ src, alt, className = '', fallback }: SafeImageProps) {
  // Generate default fallback for empty/null src
  const getDefaultFallback = () => {
    // Use UI Avatars (Initials) for a cleaner, non-cartoon look as requested
    const name = alt || 'AI';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=27272a&color=ffffff&size=128&bold=true`;
  };

  // Use fallback or default if src is empty/null
  const initialSrc = src && src.trim() !== '' ? src : (fallback || getDefaultFallback());

  const [imgSrc, setImgSrc] = useState(initialSrc);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      if (fallback && imgSrc !== fallback) {
        setImgSrc(fallback);
      } else {
        setImgSrc(getDefaultFallback());
      }
    }
  };

  // Don't render if we somehow still have no valid src
  if (!imgSrc || imgSrc.trim() === '') {
    return null;
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={isValidUrl(imgSrc) ? imgSrc : getDefaultFallback()}
        alt={alt || 'Character'}
        fill
        className="object-cover transition-opacity duration-300"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        onError={handleError}
        unoptimized={!isValidUrl(imgSrc)}
        priority={false}
      />
    </div>
  );
}

function isValidUrl(url: string) {
  if (!url) return false;
  if (url.startsWith('/')) return true; // Allow local paths
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
