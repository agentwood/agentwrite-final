/**
 * Authentication Middleware
 * Enterprise authentication with API key support
 */

import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
    apiKey?: {
        id: string;
        ownerId: string;
        scopes: string[];
        rateLimit: number;
    };
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

/**
 * Validate API key from header
 */
export function authMiddleware(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void {
    const apiKey = req.headers['x-api-key'] as string;
    const authHeader = req.headers.authorization;

    // Allow health checks without auth
    if (req.path === '/' || req.path === '/health') {
        next();
        return;
    }

    // Check for API key
    if (apiKey) {
        // In production, validate against database
        // For now, simulate validation
        if (apiKey.startsWith('hb_live_') || apiKey.startsWith('hb_test_')) {
            req.apiKey = {
                id: 'key_' + apiKey.slice(-8),
                ownerId: 'user_demo',
                scopes: ['datasets:read', 'datasets:write', 'rag:query', 'annotation:read'],
                rateLimit: 1000,
            };
            next();
            return;
        }
    }

    // Check for Bearer token
    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        // In production, validate JWT
        if (token) {
            req.user = {
                id: 'user_demo',
                email: 'demo@harbor.ai',
                role: 'developer',
            };
            next();
            return;
        }
    }

    // Demo mode for development
    if (process.env.NODE_ENV === 'development') {
        req.apiKey = {
            id: 'key_development',
            ownerId: 'user_development',
            scopes: ['*'],
            rateLimit: 10000,
        };
        next();
        return;
    }

    res.status(401).json({
        error: 'Unauthorized',
        message: 'Valid API key or Bearer token required',
        documentation: 'https://docs.harbor.ai/authentication',
    });
}

/**
 * Require specific scope
 */
export function requireScope(scope: string) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
        const scopes = req.apiKey?.scopes || [];

        if (scopes.includes('*') || scopes.includes(scope)) {
            next();
            return;
        }

        res.status(403).json({
            error: 'Forbidden',
            message: `Required scope: ${scope}`,
            currentScopes: scopes,
        });
    };
}
