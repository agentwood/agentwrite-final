/**
 * Datasets API Routes
 * Dataset Access API - primary data access endpoint
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { requireScope, type AuthenticatedRequest } from '../middleware/auth.js';
import { requireAction, type RightsRequest } from '../middleware/rights.js';

export const datasetsRouter = Router();

// Mock data store (replace with database in production)
const datasetsStore: Map<string, any> = new Map([
    ['audio-speech-v4', {
        id: uuidv4(),
        name: 'Speech & Acoustics',
        slug: 'audio-speech-v4',
        type: 'public',
        version: '4.2.0',
        mediaType: 'audio',
        metadata: {
            description: 'High-fidelity speech recordings with speaker diarization and emotion tagging',
            category: ['speech', 'acoustics', 'nlp'],
            tags: ['multi-language', 'transcription', 'emotion'],
            languages: ['en', 'es', 'fr', 'de', 'zh', 'ja'],
            totalDuration: 36000000, // 10k+ hours in seconds
            totalAssets: 150000,
            totalSize: 2500000000000, // 2.5TB
            annotationTypes: ['transcription', 'speaker_id', 'emotion', 'language'],
            qualityScore: 94,
        },
        status: 'published',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-12-01'),
    }],
    ['video-action-v2', {
        id: uuidv4(),
        name: 'Action & Context',
        slug: 'video-action-v2',
        type: 'public',
        version: '2.1.0',
        mediaType: 'video',
        metadata: {
            description: 'Frame-accurate event detection for sports, surveillance, and media',
            category: ['action', 'detection', 'video'],
            tags: ['4k', 'bounding-box', 'keypoints', 'scene-graph'],
            totalDuration: 7200000, // 2k hours
            totalAssets: 45000,
            totalSize: 8000000000000, // 8TB
            resolution: '4K',
            annotationTypes: ['action', 'object', 'scene', 'keypoints', 'bounding_box'],
            qualityScore: 91,
        },
        status: 'published',
        createdAt: new Date('2024-03-20'),
        updatedAt: new Date('2024-11-15'),
    }],
]);

/**
 * List all available datasets
 * GET /api/datasets
 */
datasetsRouter.get('/', requireScope('datasets:read'), async (req: Request, res: Response) => {
    const { type, mediaType, limit = 20, offset = 0 } = req.query;

    let datasets = Array.from(datasetsStore.values());

    // Filter by type
    if (type) {
        datasets = datasets.filter(d => d.type === type);
    }

    // Filter by media type
    if (mediaType) {
        datasets = datasets.filter(d => d.mediaType === mediaType);
    }

    // Pagination
    const total = datasets.length;
    const paginatedDatasets = datasets.slice(
        Number(offset),
        Number(offset) + Number(limit)
    );

    res.json({
        data: paginatedDatasets,
        pagination: {
            total,
            limit: Number(limit),
            offset: Number(offset),
            hasMore: Number(offset) + Number(limit) < total,
        },
    });
});

/**
 * Get a specific dataset by ID/slug
 * GET /api/datasets/:datasetId
 */
datasetsRouter.get('/:datasetId', requireScope('datasets:read'), async (req: Request, res: Response) => {
    const { datasetId } = req.params;
    const dataset = datasetsStore.get(datasetId);

    if (!dataset) {
        res.status(404).json({
            error: 'Not Found',
            message: `Dataset '${datasetId}' not found`,
        });
        return;
    }

    res.json({ data: dataset });
});

/**
 * Get dataset statistics
 * GET /api/datasets/:datasetId/stats
 */
datasetsRouter.get('/:datasetId/stats', requireScope('datasets:read'), async (req: Request, res: Response) => {
    const { datasetId } = req.params;
    const dataset = datasetsStore.get(datasetId);

    if (!dataset) {
        res.status(404).json({
            error: 'Not Found',
            message: `Dataset '${datasetId}' not found`,
        });
        return;
    }

    res.json({
        data: {
            datasetId,
            totalAssets: dataset.metadata.totalAssets,
            totalDuration: dataset.metadata.totalDuration,
            totalSize: dataset.metadata.totalSize,
            qualityScore: dataset.metadata.qualityScore,
            annotationCoverage: 0.98,
            lastUpdated: dataset.updatedAt,
        },
    });
});

/**
 * Stream dataset content
 * GET /api/datasets/:datasetId/stream
 */
datasetsRouter.get(
    '/:datasetId/stream',
    requireScope('datasets:read'),
    async (req: RightsRequest, res: Response) => {
        const { datasetId } = req.params;
        const { format = 'jsonl', batchSize = 32 } = req.query;
        const dataset = datasetsStore.get(datasetId);

        if (!dataset) {
            res.status(404).json({ error: 'Not Found' });
            return;
        }

        // Set streaming headers
        res.setHeader('Content-Type', format === 'jsonl' ? 'application/x-ndjson' : 'application/json');
        res.setHeader('Transfer-Encoding', 'chunked');

        // Simulate streaming data
        for (let i = 0; i < 5; i++) {
            const batch = {
                batchIndex: i,
                batchSize: Number(batchSize),
                items: Array(Number(batchSize)).fill(null).map((_, j) => ({
                    id: uuidv4(),
                    assetIndex: i * Number(batchSize) + j,
                    mediaUrl: `https://media.harbor.ai/${datasetId}/asset_${i}_${j}.mp3`,
                    annotations: [],
                })),
            };

            if (format === 'jsonl') {
                res.write(JSON.stringify(batch) + '\n');
            } else {
                res.write(JSON.stringify(batch));
            }

            // Simulate processing time
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        res.end();
    }
);

/**
 * Create a new dataset
 * POST /api/datasets
 */
datasetsRouter.post('/', requireScope('datasets:write'), async (req: AuthenticatedRequest, res: Response) => {
    const { name, type, mediaType, description, tags } = req.body;

    if (!name || !type || !mediaType) {
        res.status(400).json({
            error: 'Bad Request',
            message: 'name, type, and mediaType are required',
        });
        return;
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const dataset = {
        id: uuidv4(),
        name,
        slug,
        type,
        version: '1.0.0',
        mediaType,
        metadata: {
            description: description || '',
            category: [],
            tags: tags || [],
            totalDuration: 0,
            totalAssets: 0,
            totalSize: 0,
            annotationTypes: [],
            qualityScore: 0,
        },
        status: 'draft',
        ownerId: req.apiKey?.ownerId || req.user?.id,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    datasetsStore.set(slug, dataset);

    res.status(201).json({
        data: dataset,
        message: 'Dataset created successfully',
    });
});

/**
 * Get dataset license information
 * GET /api/datasets/:datasetId/license
 */
datasetsRouter.get('/:datasetId/license', async (req: Request, res: Response) => {
    const { datasetId } = req.params;
    const dataset = datasetsStore.get(datasetId);

    if (!dataset) {
        res.status(404).json({ error: 'Not Found' });
        return;
    }

    res.json({
        data: {
            datasetId,
            licenseType: 'api_access',
            terms: {
                allowTraining: true,
                allowInference: true,
                allowCommercial: true,
                allowResearch: true,
                allowRedistribution: false,
                attributionRequired: true,
            },
            pricing: {
                type: 'usage_based',
                perQueryPrice: 0.001,
                currency: 'USD',
            },
        },
    });
});
