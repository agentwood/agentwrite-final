/**
 * Image optimization utilities for performance
 */

/**
 * Generate optimized image URL with Next.js Image optimization
 */
export function getOptimizedImageUrl(
  src: string,
  width?: number,
  quality: number = 75
): string {
  // If using Next.js Image component, it handles optimization automatically
  // This is a helper for generating optimized URLs manually if needed
  
  if (src.startsWith('/')) {
    // Local images - Next.js will optimize these automatically
    return src;
  }
  
  // External images - ensure they're in next.config.ts remotePatterns
  return src;
}

/**
 * Generate srcSet for responsive images
 */
export function generateSrcSet(
  src: string,
  widths: number[] = [400, 800, 1200, 1600]
): string {
  return widths
    .map(width => `${getOptimizedImageUrl(src, width)} ${width}w`)
    .join(', ');
}

/**
 * Get image dimensions from URL (placeholder helper)
 */
export function getImageDimensions(src: string): { width: number; height: number } {
  // Default aspect ratio 16:9 for character avatars
  return {
    width: 800,
    height: 800, // Square for avatars
  };
}

/**
 * Generate blur placeholder for images
 */
export function generateBlurDataURL(width: number = 20, height: number = 20): string {
  // Generate a tiny blurred placeholder
  // In production, use a library like `plaiceholder` or similar
  const canvas = typeof window !== 'undefined' ? document.createElement('canvas') : null;
  if (!canvas) {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+';
  }
  
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, width, height);
  }
  
  return canvas.toDataURL();
}


