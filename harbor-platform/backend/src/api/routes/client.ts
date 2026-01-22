/**
 * Client Portal API Routes
 * Endpoints for enterprise clients to browse and license datasets
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';

const router = Router();

// ============================================
// MOCK DATA (replace with database)
// ============================================

const mockDatasets = [
    {
        id: 'ds-001',
        name: 'Urban Street Scenes 4K',
        description: 'High-resolution footage of city streets, pedestrians, and vehicles from 50+ cities.',
        type: 'video',
        itemCount: 124500,
        annotationCount: 2300000,
        resolution: '4K',
        duration_hours: 847,
        tags: ['Detection', 'Segmentation', '4K'],
        annotations: ['detection', 'segmentation', 'scene_labels', 'tracking'],
        license: {
            usage: 'AI Model Training',
            geography: 'Worldwide',
            duration: 'Perpetual',
            exclusivity: 'Non-exclusive',
        },
        createdAt: new Date('2025-11-15'),
    },
    {
        id: 'ds-002',
        name: 'Conversational Speech',
        description: 'Natural conversations in 12 languages with word-level transcriptions.',
        type: 'audio',
        itemCount: 89000,
        annotationCount: 1100000,
        resolution: null,
        duration_hours: 456,
        tags: ['Transcription', 'Multi-language'],
        annotations: ['transcription', 'speaker_diarization'],
        createdAt: new Date('2025-10-22'),
    },
    {
        id: 'ds-003',
        name: 'Indoor Activities',
        description: 'People performing everyday activities in home and office environments.',
        type: 'video',
        itemCount: 67200,
        annotationCount: 890000,
        resolution: '1080p',
        duration_hours: 312,
        tags: ['Detection', 'Activities', '1080p'],
        annotations: ['detection', 'activity_labels'],
        createdAt: new Date('2025-12-01'),
    },
];

const mockSamples = [
    { id: 'sample-1', datasetId: 'ds-001', filename: 'sample_0001.mp4', duration: 24, objectCount: 12 },
    { id: 'sample-2', datasetId: 'ds-001', filename: 'sample_0002.mp4', duration: 18, objectCount: 8 },
    { id: 'sample-3', datasetId: 'ds-001', filename: 'sample_0003.mp4', duration: 32, objectCount: 24 },
    { id: 'sample-4', datasetId: 'ds-001', filename: 'sample_0004.mp4', duration: 15, objectCount: 18 },
];

// ============================================
// SCHEMAS
// ============================================

const DatasetQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
    type: z.enum(['video', 'audio', 'image']).optional(),
    resolution: z.string().optional(),
    hasAnnotation: z.string().optional(),
    search: z.string().optional(),
});

const LicenseRequestSchema = z.object({
    datasetId: z.string(),
    useCase: z.string(),
    estimatedUsage: z.enum(['full', '50percent', 'sample']),
    notes: z.string().optional(),
});

// ============================================
// ROUTES
// ============================================

/**
 * List available datasets
 */
router.get('/datasets', async (req: Request, res: Response) => {
    try {
        const query = DatasetQuerySchema.parse(req.query);

        let filtered = [...mockDatasets];

        // Filter by type
        if (query.type) {
            filtered = filtered.filter(ds => ds.type === query.type);
        }

        // Filter by resolution
        if (query.resolution) {
            filtered = filtered.filter(ds => ds.resolution === query.resolution);
        }

        // Filter by annotation type
        if (query.hasAnnotation) {
            filtered = filtered.filter(ds =>
                ds.annotations.includes(query.hasAnnotation!)
            );
        }

        // Search
        if (query.search) {
            const searchLower = query.search.toLowerCase();
            filtered = filtered.filter(ds =>
                ds.name.toLowerCase().includes(searchLower) ||
                ds.description.toLowerCase().includes(searchLower)
            );
        }

        // Pagination
        const start = (query.page - 1) * query.limit;
        const end = start + query.limit;
        const paginated = filtered.slice(start, end);

        res.json({
            datasets: paginated,
            pagination: {
                page: query.page,
                limit: query.limit,
                total: filtered.length,
                totalPages: Math.ceil(filtered.length / query.limit),
            },
            stats: {
                totalDatasets: mockDatasets.length,
                totalItems: mockDatasets.reduce((sum, ds) => sum + ds.itemCount, 0),
                totalAnnotations: mockDatasets.reduce((sum, ds) => sum + ds.annotationCount, 0),
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: 'Invalid query parameters', details: error.errors });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

/**
 * Get dataset details
 */
router.get('/datasets/:id', async (req: Request, res: Response) => {
    const dataset = mockDatasets.find(ds => ds.id === req.params.id);

    if (!dataset) {
        return res.status(404).json({ error: 'Dataset not found' });
    }

    res.json({
        ...dataset,
        samples: mockSamples.filter(s => s.datasetId === dataset.id),
    });
});

/**
 * Get dataset samples
 */
router.get('/datasets/:id/samples', async (req: Request, res: Response) => {
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

    const samples = mockSamples
        .filter(s => s.datasetId === req.params.id)
        .slice(0, limit);

    res.json({ samples });
});

/**
 * Search datasets semantically
 */
router.get('/search', async (req: Request, res: Response) => {
    const query = req.query.q as string;

    if (!query) {
        return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    // In production: use CLIP embeddings for semantic search
    const queryLower = query.toLowerCase();
    const results = mockDatasets.filter(ds =>
        ds.name.toLowerCase().includes(queryLower) ||
        ds.description.toLowerCase().includes(queryLower) ||
        ds.tags.some(t => t.toLowerCase().includes(queryLower))
    );

    res.json({
        query,
        results,
        total: results.length,
    });
});

/**
 * Get media item with annotations
 */
router.get('/media/:id', async (req: Request, res: Response) => {
    const sample = mockSamples.find(s => s.id === req.params.id);

    if (!sample) {
        return res.status(404).json({ error: 'Media not found' });
    }

    // Mock annotation data
    res.json({
        ...sample,
        annotations: {
            detections: [
                { label: 'person', count: 4, confidence_avg: 0.92 },
                { label: 'car', count: 3, confidence_avg: 0.88 },
                { label: 'bicycle', count: 1, confidence_avg: 0.85 },
            ],
            segments: [
                { label: 'person', mask_count: 4 },
                { label: 'car', mask_count: 3 },
            ],
            scene_labels: [
                { label: 'urban street', confidence: 0.94 },
                { label: 'outdoor scene', confidence: 0.91 },
            ],
        },
    });
});

/**
 * Request dataset license
 */
router.post('/license-request', async (req: Request, res: Response) => {
    try {
        const data = LicenseRequestSchema.parse(req.body);

        const dataset = mockDatasets.find(ds => ds.id === data.datasetId);
        if (!dataset) {
            return res.status(404).json({ error: 'Dataset not found' });
        }

        // In production: save to database, send notification
        const requestId = `lr-${Date.now()}`;

        res.status(201).json({
            requestId,
            status: 'pending',
            dataset: {
                id: dataset.id,
                name: dataset.name,
            },
            useCase: data.useCase,
            estimatedUsage: data.estimatedUsage,
            createdAt: new Date().toISOString(),
            expectedResponse: '24 hours',
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: 'Invalid request', details: error.errors });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

/**
 * Get my license requests
 */
router.get('/my-licenses', async (req: Request, res: Response) => {
    // Mock data - in production: filter by authenticated user
    res.json({
        licenses: [
            {
                id: 'lic-001',
                datasetId: 'ds-001',
                datasetName: 'Urban Street Scenes 4K',
                status: 'active',
                usage: 'full',
                grantedAt: '2025-12-01',
                expiresAt: null,
            },
        ],
        pending: [],
    });
});

export default router;
