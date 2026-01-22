/**
 * Audit System - Express Middleware
 * Automatically log all API requests
 */

import { Request, Response, NextFunction } from 'express';
import { auditLogger } from './audit-logger.js';
import { auditStore } from './audit-store.js';

export interface AuditMiddlewareOptions {
    excludePaths?: string[];
    excludeMethods?: string[];
    logBody?: boolean;
    logQuery?: boolean;
    sensitiveFields?: string[];
}

const defaultOptions: AuditMiddlewareOptions = {
    excludePaths: ['/health', '/favicon.ico'],
    excludeMethods: [],
    logBody: false,
    logQuery: true,
    sensitiveFields: ['password', 'token', 'apiKey', 'secret', 'authorization'],
};

/**
 * Create audit middleware
 */
export function createAuditMiddleware(options: AuditMiddlewareOptions = {}) {
    const opts = { ...defaultOptions, ...options };

    // Wire logger to store
    auditLogger.on('flush', (events) => {
        auditStore.storeEvents(events);
    });

    return async (req: Request, res: Response, next: NextFunction) => {
        // Skip excluded paths
        if (opts.excludePaths?.some(p => req.path.startsWith(p))) {
            return next();
        }

        // Skip excluded methods
        if (opts.excludeMethods?.includes(req.method)) {
            return next();
        }

        const startTime = Date.now();

        // Capture original end
        const originalEnd = res.end;
        let responseBody: any;

        res.end = function (chunk?: any, encoding?: any, callback?: any) {
            if (chunk) {
                responseBody = chunk;
            }
            return originalEnd.call(this, chunk, encoding, callback);
        };

        res.on('finish', async () => {
            const durationMs = Date.now() - startTime;

            // Determine actor
            const actorId = (req as any).userId || (req as any).apiKeyId || 'anonymous';
            const actorType = (req as any).apiKeyId ? 'api_key' : 'user';

            // Build params (sanitized)
            const params: Record<string, any> = {};

            if (opts.logQuery && req.query) {
                params.query = sanitizeObject(req.query, opts.sensitiveFields!);
            }

            if (opts.logBody && req.body) {
                params.body = sanitizeObject(req.body, opts.sensitiveFields!);
            }

            // Determine status
            const status = res.statusCode >= 400
                ? (res.statusCode === 401 || res.statusCode === 403 ? 'denied' : 'failure')
                : 'success';

            await auditLogger.logApiRequest(
                actorId,
                req.path,
                req.method,
                status,
                res.statusCode,
                durationMs,
                {
                    ip: getClientIp(req),
                    userAgent: req.get('user-agent'),
                    method: req.method,
                    path: req.path,
                    params,
                }
            );
        });

        next();
    };
}

/**
 * Get client IP from request
 */
function getClientIp(req: Request): string {
    const forwarded = req.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    return req.ip || req.socket.remoteAddress || 'unknown';
}

/**
 * Sanitize object by removing sensitive fields
 */
function sanitizeObject(
    obj: Record<string, any>,
    sensitiveFields: string[]
): Record<string, any> {
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
        if (sensitiveFields.includes(key.toLowerCase())) {
            result[key] = '[REDACTED]';
        } else if (typeof value === 'object' && value !== null) {
            result[key] = sanitizeObject(value, sensitiveFields);
        } else {
            result[key] = value;
        }
    }

    return result;
}

/**
 * Middleware for logging specific actions
 */
export function auditAction(action: string, resource: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const actorId = (req as any).userId || 'anonymous';
        const resourceId = req.params.id || req.params.resourceId;

        res.on('finish', async () => {
            const status = res.statusCode >= 400
                ? (res.statusCode === 401 || res.statusCode === 403 ? 'denied' : 'failure')
                : 'success';

            await auditLogger.log({
                actorId,
                actorType: 'user',
                action,
                resource,
                resourceId,
                status,
            }, {
                ip: getClientIp(req),
                userAgent: req.get('user-agent'),
                method: req.method,
                path: req.path,
            });
        });

        next();
    };
}
