/**
 * Code splitting and lazy loading utilities
 */

import { lazy, ComponentType } from 'react';

/**
 * Lazy load a component with error boundary support
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) {
  return lazy(() =>
    importFn().catch((error) => {
      console.error('Failed to load component:', error);
      if (fallback) {
        return { default: fallback };
      }
      throw error;
    })
  );
}

/**
 * Preload a module for better performance
 */
export function preloadModule(importFn: () => Promise<any>): void {
  if (typeof window !== 'undefined') {
    importFn().catch(() => {
      // Silent fail for preload
    });
  }
}

/**
 * Dynamic import with loading state
 */
export async function dynamicImport<T>(
  importFn: () => Promise<T>,
  loadingCallback?: () => void
): Promise<T> {
  if (loadingCallback) {
    loadingCallback();
  }
  return importFn();
}

