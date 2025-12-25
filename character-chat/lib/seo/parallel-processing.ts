/**
 * Parallel Processing Utilities for 10x Speed Improvement
 * Phase 1: Quick Wins
 */

/**
 * Process items in parallel with concurrency control
 */
export async function processInParallel<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  concurrency: number = 10
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
  }
  
  return results;
}

/**
 * Process items in parallel with error handling
 */
export async function processInParallelWithErrors<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  concurrency: number = 10
): Promise<{ success: R[]; errors: Array<{ item: T; error: Error }> }> {
  const success: R[] = [];
  const errors: Array<{ item: T; error: Error }> = [];
  
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.allSettled(batch.map(item => processor(item)));
    
    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        success.push(result.value);
      } else {
        errors.push({ item: batch[index], error: result.reason });
      }
    });
  }
  
  return { success, errors };
}

/**
 * Batch process with progress tracking
 */
export async function processBatches<T, R>(
  items: T[],
  processor: (batch: T[]) => Promise<R[]>,
  batchSize: number = 100
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await processor(batch);
    results.push(...batchResults);
  }
  
  return results;
}

/**
 * Execute tasks with retry logic in parallel
 */
export async function processWithRetry<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  maxRetries: number = 3,
  concurrency: number = 10
): Promise<R[]> {
  const processWithRetries = async (item: T): Promise<R> => {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await processor(item);
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxRetries - 1) {
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }
    
    throw lastError || new Error('Max retries exceeded');
  };
  
  return processInParallel(items, processWithRetries, concurrency);
}


