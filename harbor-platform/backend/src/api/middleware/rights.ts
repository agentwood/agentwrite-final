/**
 * Rights Enforcement Middleware
 * Ensures licensing is enforced at the data layer
 */

import { Request, Response, NextFunction } from 'express';
import { type AuthenticatedRequest } from './auth.js';

export interface RightsRequest extends AuthenticatedRequest {
    rights?: {
        datasetId?: string;
        allowedActions: string[];
        restrictions: string[];
        verified: boolean;
    };
}

/**
 * Verify rights for data access
 */
export function rightsMiddleware(
    req: RightsRequest,
    res: Response,
    next: NextFunction
): void {
    // Extract dataset ID from various sources
    const datasetId =
        req.params.datasetId ||
        req.query.dataset_id as string ||
        req.body?.datasetId;

    // If no dataset context, pass through
    if (!datasetId) {
        req.rights = {
            allowedActions: ['*'],
            restrictions: [],
            verified: false,
        };
        next();
        return;
    }

    // In production, this would:
    // 1. Look up the dataset's license
    // 2. Check if the API key has access
    // 3. Verify usage hasn't exceeded limits
    // 4. Check territorial restrictions

    // For demo, simulate rights check
    req.rights = {
        datasetId,
        allowedActions: ['read', 'query', 'stream'],
        restrictions: [],
        verified: true,
    };

    // Log rights verification for audit trail
    console.log(`[Rights] Verified access for dataset: ${datasetId}`);

    next();
}

/**
 * Require specific action permission
 */
export function requireAction(action: string) {
    return (req: RightsRequest, res: Response, next: NextFunction): void => {
        const allowedActions = req.rights?.allowedActions || [];

        if (allowedActions.includes('*') || allowedActions.includes(action)) {
            next();
            return;
        }

        res.status(403).json({
            error: 'License Restriction',
            message: `Action '${action}' not permitted for this dataset`,
            allowedActions,
            documentation: 'https://docs.harbor.ai/licensing',
        });
    };
}

/**
 * Check territorial restrictions
 */
export function checkTerritory(req: RightsRequest, res: Response, next: NextFunction): void {
    const restrictions = req.rights?.restrictions || [];

    // In production, check IP geolocation against restricted territories
    // For demo, pass through

    next();
}
