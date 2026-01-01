/**
 * Queue System for SEO Tasks
 * Handles async processing of indexing and social posting
 */

interface QueueJob {
    id: string;
    type: 'indexing' | 'social';
    data: any;
    retries: number;
    maxRetries: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    createdAt: Date;
    processedAt?: Date;
}

// In-memory queue (could be replaced with Redis/database in production)
const queue: Map<string, QueueJob> = new Map();

/**
 * Generate a unique job ID
 */
function generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * Queue character indexing job
 * @param characterId - Character ID to index
 * @param maxRetries - Maximum number of retries
 * @returns Job ID
 */
export async function queueCharacterIndexing(
    characterId: string,
    maxRetries: number = 3
): Promise<string> {
    const jobId = generateJobId();

    const job: QueueJob = {
        id: jobId,
        type: 'indexing',
        data: { characterId },
        retries: 0,
        maxRetries,
        status: 'pending',
        createdAt: new Date(),
    };

    queue.set(jobId, job);

    // Process async (non-blocking)
    processQueueJob(jobId).catch(error => {
        console.error(`Queue job ${jobId} failed:`, error);
    });

    return jobId;
}

/**
 * Queue social media posting job
 * @param text - Post text
 * @param url - Post URL
 * @param imageUrl - Optional image URL
 * @param maxRetries - Maximum number of retries
 * @returns Job ID
 */
export async function queueSocialPost(
    text: string,
    url: string,
    imageUrl?: string,
    maxRetries: number = 3
): Promise<string> {
    const jobId = generateJobId();

    const job: QueueJob = {
        id: jobId,
        type: 'social',
        data: { text, url, imageUrl },
        retries: 0,
        maxRetries,
        status: 'pending',
        createdAt: new Date(),
    };

    queue.set(jobId, job);

    // Process async (non-blocking)
    processQueueJob(jobId).catch(error => {
        console.error(`Queue job ${jobId} failed:`, error);
    });

    return jobId;
}

/**
 * Process a queue job
 */
async function processQueueJob(jobId: string): Promise<void> {
    const job = queue.get(jobId);
    if (!job) {
        console.error(`Job ${jobId} not found in queue`);
        return;
    }

    job.status = 'processing';

    try {
        if (job.type === 'indexing') {
            const { indexCharacterPage } = await import('./google-indexing');
            await indexCharacterPage(job.data.characterId);
        } else if (job.type === 'social') {
            const { postToAllPlatforms } = await import('./social-posting');
            await postToAllPlatforms(
                job.data.text,
                job.data.url,
                job.data.imageUrl
            );
        }

        job.status = 'completed';
        job.processedAt = new Date();
    } catch (error) {
        console.error(`Error processing job ${jobId}:`, error);
        job.retries++;

        if (job.retries >= job.maxRetries) {
            job.status = 'failed';
            job.processedAt = new Date();
        } else {
            // Retry with exponential backoff
            const delay = Math.pow(2, job.retries) * 1000;
            setTimeout(() => {
                processQueueJob(jobId).catch(console.error);
            }, delay);
            job.status = 'pending';
        }
    }
}

/**
 * Get job status
 */
export function getJobStatus(jobId: string): QueueJob | undefined {
    return queue.get(jobId);
}

/**
 * Clear completed jobs older than specified time
 * @param olderThanMs - Clear jobs older than this (default: 1 hour)
 */
export function clearCompletedJobs(olderThanMs: number = 3600000): void {
    const now = Date.now();
    for (const [jobId, job] of queue.entries()) {
        if (
            (job.status === 'completed' || job.status === 'failed') &&
            job.processedAt &&
            now - job.processedAt.getTime() > olderThanMs
        ) {
            queue.delete(jobId);
        }
    }
}

/**
 * Get queue statistics
 */
export function getQueueStats() {
    const stats = {
        total: queue.size,
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
    };

    for (const job of queue.values()) {
        stats[job.status]++;
    }

    return stats;
}
