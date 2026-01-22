/**
 * HARBOR API Router
 * Main API gateway - primary product surface
 */

import { Router } from 'express';
import { datasetsRouter } from './routes/datasets.js';
import { annotationRouter } from './routes/annotation.js';
import { ragRouter } from './routes/rag.js';
import { agentsRouter } from './routes/agents.js';
import { adsRouter } from './routes/ads.js';
import clientRouter from './routes/client.js';
import { authMiddleware } from './middleware/auth.js';
import { meteringMiddleware } from './middleware/metering.js';
import { rightsMiddleware } from './middleware/rights.js';

export const apiRouter = Router();

// ============================================
// API ROOT
// ============================================

apiRouter.get('/', (req, res) => {
    res.json({
        name: 'HARBOR API',
        version: 'v1',
        description: 'Media-Native Audio & Video Data Infrastructure',
        documentation: 'https://docs.harbor.ai',
        endpoints: {
            datasets: '/api/datasets',
            annotation: '/api/annotation',
            rag: '/api/rag',
            agents: '/api/agents',
            ads: '/api/ads',
        },
        status: 'operational',
    });
});

// ============================================
// APPLY GLOBAL MIDDLEWARE
// ============================================

// Authentication for all routes below
apiRouter.use(authMiddleware);

// Usage metering
apiRouter.use(meteringMiddleware);

// Rights enforcement
apiRouter.use(rightsMiddleware);

// ============================================
// MOUNT ROUTE HANDLERS
// ============================================

// Dataset Access API
apiRouter.use('/datasets', datasetsRouter);

// Annotation API
apiRouter.use('/annotation', annotationRouter);

// RAG Query API
apiRouter.use('/rag', ragRouter);

// Agent APIs
apiRouter.use('/agents', agentsRouter);

// Harbor Ads Production API
apiRouter.use('/ads', adsRouter);

// Client Portal API (enterprise data browsing)
apiRouter.use('/client', clientRouter);
