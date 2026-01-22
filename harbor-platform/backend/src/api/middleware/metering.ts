/**
 * Usage Metering Middleware
 * Track all API usage for billing and analytics
 */

import { Request, Response, NextFunction } from 'express';
import { type AuthenticatedRequest } from './auth.js';

export interface MeteredRequest extends AuthenticatedRequest {
    usage?: {
        startTime: number;
        bytesIn: number;
        bytesOut: number;
        action: string;
    };
}

// In-memory usage store (use Redis/DB in production)
const usageStore: Map<string, {
    requests: number;
    bytesTransferred: number;
    lastReset: Date;
}> = new Map();

/**
 * Start metering for the request
 */
export function meteringMiddleware(
    req: MeteredRequest,
    res: Response,
    next: NextFunction
): void {
    const startTime = Date.now();
    const apiKeyId = req.apiKey?.id || 'anonymous';

    // Initialize usage tracking
    req.usage = {
        startTime,
        bytesIn: parseInt(req.headers['content-length'] || '0', 10),
        bytesOut: 0,
        action: `${req.method} ${req.baseUrl}${req.path}`,
    };

    // Get or initialize usage for this API key
    let keyUsage = usageStore.get(apiKeyId);
    if (!keyUsage) {
        keyUsage = { requests: 0, bytesTransferred: 0, lastReset: new Date() };
        usageStore.set(apiKeyId, keyUsage);
    }

    // Increment request count
    keyUsage.requests++;

    // Hook into response to capture output size
    const originalSend = res.send;
    res.send = function (body: any): Response {
        if (req.usage) {
            req.usage.bytesOut = Buffer.byteLength(
                typeof body === 'string' ? body : JSON.stringify(body)
            );

            // Update usage store
            if (keyUsage) {
                keyUsage.bytesTransferred += req.usage.bytesIn + req.usage.bytesOut;
            }

            // Log usage for billing (in production, send to billing service)
            const duration = Date.now() - req.usage.startTime;
            console.log(`[Meter] ${req.usage.action} | ${duration}ms | ${req.usage.bytesIn}B in | ${req.usage.bytesOut}B out`);
        }

        return originalSend.call(this, body);
    };

    next();
}

/**
 * Get usage statistics for an API key
 */
export function getUsageStats(apiKeyId: string): {
    requests: number;
    bytesTransferred: number;
    lastReset: Date;
} | null {
    return usageStore.get(apiKeyId) || null;
}

/**
 * Reset usage for an API key
 */
export function resetUsage(apiKeyId: string): void {
    usageStore.set(apiKeyId, {
        requests: 0,
        bytesTransferred: 0,
        lastReset: new Date(),
    });
}

/**
 * Rate limiting based on usage
 */
export function rateLimitMiddleware(
    req: MeteredRequest,
    res: Response,
    next: NextFunction
): void {
    const apiKeyId = req.apiKey?.id;
    const rateLimit = req.apiKey?.rateLimit || 100;

    if (!apiKeyId) {
        next();
        return;
    }

    const usage = usageStore.get(apiKeyId);
    if (usage && usage.requests > rateLimit) {
        res.status(429).json({
            error: 'Rate Limit Exceeded',
            message: `Rate limit of ${rateLimit} requests exceeded`,
            resetAt: new Date(usage.lastReset.getTime() + 60 * 60 * 1000), // 1 hour
            currentUsage: usage.requests,
        });
        return;
    }

    next();
}
