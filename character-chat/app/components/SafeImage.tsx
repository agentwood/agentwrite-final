'use client';

import { useState } from 'react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
}

export default function SafeImage({ src, alt, className = '', fallback }: SafeImageProps) {
  // Generate default fallback for empty/null src
  const getDefaultFallback = () => {
    const seed = alt?.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20) || 'default';
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,ffd5dc,ffdfbf&radius=20`;
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
    <img
      src={imgSrc}
      alt={alt || 'Image'}
      className={className}
      onError={handleError}
    />
  );
}




