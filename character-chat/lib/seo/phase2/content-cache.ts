/**
 * Content Template Caching System
 * Phase 2: Scale
 */

interface CachedContent {
  key: string;
  content: string;
  metadata: Record<string, any>;
  expiresAt: Date;
}

class ContentCache {
  private cache: Map<string, CachedContent> = new Map();
  private defaultTTL: number = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Get cached content
   */
  get(key: string): string | null {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }

    if (cached.expiresAt < new Date()) {
      this.cache.delete(key);
      return null;
    }

    return cached.content;
  }

  /**
   * Set cached content
   */
  set(key: string, content: string, metadata: Record<string, any> = {}, ttl?: number): void {
    const expiresAt = new Date(Date.now() + (ttl || this.defaultTTL));
    
    this.cache.set(key, {
      key,
      content,
      metadata,
      expiresAt,
    });
  }

  /**
   * Generate cache key
   */
  generateKey(prefix: string, ...parts: string[]): string {
    return `${prefix}:${parts.join(':')}`;
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = new Date();
    for (const [key, cached] of this.cache.entries()) {
      if (cached.expiresAt < now) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Singleton instance
export const contentCache = new ContentCache();

/**
 * Cache character page metadata
 */
export function cacheCharacterMetadata(characterId: string, metadata: Record<string, any>): void {
  const key = contentCache.generateKey('character', 'metadata', characterId);
  contentCache.set(key, JSON.stringify(metadata), metadata, 12 * 60 * 60 * 1000); // 12 hours
}

/**
 * Get cached character metadata
 */
export function getCachedCharacterMetadata(characterId: string): Record<string, any> | null {
  const key = contentCache.generateKey('character', 'metadata', characterId);
  const cached = contentCache.get(key);
  return cached ? JSON.parse(cached) : null;
}

/**
 * Cache listing page content
 */
export function cacheListingContent(
  pageType: string,
  pageValue: string,
  page: number,
  content: string
): void {
  const key = contentCache.generateKey('listing', pageType, pageValue, String(page));
  contentCache.set(key, content, {}, 6 * 60 * 60 * 1000); // 6 hours
}

/**
 * Get cached listing content
 */
export function getCachedListingContent(
  pageType: string,
  pageValue: string,
  page: number
): string | null {
  const key = contentCache.generateKey('listing', pageType, pageValue, String(page));
  return contentCache.get(key);
}


