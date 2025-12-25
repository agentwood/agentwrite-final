'use client';

import { useState } from 'react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
}

export default function SafeImage({ src, alt, className = '', fallback }: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      if (fallback) {
        setImgSrc(fallback);
      } else {
        // Default fallback
        const seed = alt.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
        setImgSrc(`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,ffd5dc,ffdfbf&radius=20`);
      }
    }
  };

  return (
    <img 
      src={imgSrc} 
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
}



