/**
 * Annotation API Routes
 * Frame-accurate annotation and curation endpoints
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { requireScope } from '../middleware/auth.js';

export const annotationRouter = Router();

// Mock annotation store
const annotationsStore: Map<string, any[]> = new Map();

/**
 * Get annotations for an asset
 * GET /api/annotation/:assetId
 */
annotationRouter.get('/:assetId', requireScope('annotation:read'), async (req: Request, res: Response) => {
    const { assetId } = req.params;
    const { type, status, limit = 100, offset = 0 } = req.query;

    let annotations = annotationsStore.get(assetId) || [];

    // Filter by type
    if (type) {
        annotations = annotations.filter(a => a.type === type);
    }

    // Filter by status
    if (status) {
        annotations = annotations.filter(a => a.status === status);
    }

    // Pagination
    const total = annotations.length;
    const paginatedAnnotations = annotations.slice(
        Number(offset),
        Number(offset) + Number(limit)
    );

    res.json({
        data: paginatedAnnotations,
        pagination: {
            total,
            limit: Number(limit),
            offset: Number(offset),
        },
    });
});

/**
 * Create new annotation
 * POST /api/annotation
 */
annotationRouter.post('/', requireScope('annotation:write'), async (req: Request, res: Response) => {
    const {
        assetId,
        type,
        startTime,
        endTime,
        startFrame,
        endFrame,
        labels,
        boundingBox,
    } = req.body;

    if (!assetId || !type || startTime === undefined || endTime === undefined) {
        res.status(400).json({
            error: 'Bad Request',
            message: 'assetId, type, startTime, and endTime are required',
        });
        return;
    }

    const annotation = {
        id: uuidv4(),
        assetId,
        type,
        startTime,
        endTime,
        startFrame,
        endFrame,
        boundingBox,
        labels: labels || [],
        confidence: 0.95,
        status: 'pending',
        reviewPasses: [],
        creatorId: 'user_demo',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    // Add to store
    const existing = annotationsStore.get(assetId) || [];
    existing.push(annotation);
    annotationsStore.set(assetId, existing);

    res.status(201).json({
        data: annotation,
        message: 'Annotation created successfully',
    });
});

/**
 * Update an annotation
 * PATCH /api/annotation/:annotationId
 */
annotationRouter.patch('/:annotationId', requireScope('annotation:write'), async (req: Request, res: Response) => {
    const { annotationId } = req.params;
    const updates = req.body;

    // Find annotation across all assets
    let found = false;
    for (const [assetId, annotations] of annotationsStore.entries()) {
        const index = annotations.findIndex(a => a.id === annotationId);
        if (index !== -1) {
            annotations[index] = {
                ...annotations[index],
                ...updates,
                updatedAt: new Date(),
            };
            found = true;
            res.json({ data: annotations[index] });
            return;
        }
    }

    if (!found) {
        res.status(404).json({
            error: 'Not Found',
            message: `Annotation '${annotationId}' not found`,
        });
    }
});

/**
 * Submit annotation for review
 * POST /api/annotation/:annotationId/review
 */
annotationRouter.post('/:annotationId/review', requireScope('annotation:write'), async (req: Request, res: Response) => {
    const { annotationId } = req.params;
    const { action, notes } = req.body;

    if (!action || !['approve', 'reject', 'request_changes'].includes(action)) {
        res.status(400).json({
            error: 'Bad Request',
            message: 'action must be one of: approve, reject, request_changes',
        });
        return;
    }

    // Find and update annotation
    for (const [assetId, annotations] of annotationsStore.entries()) {
        const annotation = annotations.find(a => a.id === annotationId);
        if (annotation) {
            const reviewPass = {
                passNumber: annotation.reviewPasses.length + 1,
                reviewerId: 'reviewer_demo',
                action,
                notes,
                timestamp: new Date(),
            };

            annotation.reviewPasses.push(reviewPass);
            annotation.status = action === 'approve' ? 'approved' :
                action === 'reject' ? 'rejected' : 'in_review';
            annotation.updatedAt = new Date();

            res.json({
                data: annotation,
                message: `Annotation ${action}d`,
            });
            return;
        }
    }

    res.status(404).json({ error: 'Annotation not found' });
});

/**
 * Get annotation types
 * GET /api/annotation/types
 */
annotationRouter.get('/meta/types', async (req: Request, res: Response) => {
    res.json({
        data: {
            types: [
                { id: 'scene', name: 'Scene Detection', description: 'Scene boundaries and transitions' },
                { id: 'action', name: 'Action Recognition', description: 'Human actions and activities' },
                { id: 'object', name: 'Object Detection', description: 'Object localization and classification' },
                { id: 'speech', name: 'Speech Transcription', description: 'Speech-to-text transcription' },
                { id: 'emotion', name: 'Emotion Recognition', description: 'Emotion classification in speech/video' },
                { id: 'speaker', name: 'Speaker Identification', description: 'Speaker diarization and ID' },
                { id: 'event', name: 'Event Detection', description: 'Temporal event detection' },
                { id: 'segment', name: 'Segmentation', description: 'Temporal or spatial segmentation' },
            ],
        },
    });
});

/**
 * Bulk create annotations
 * POST /api/annotation/bulk
 */
annotationRouter.post('/bulk', requireScope('annotation:write'), async (req: Request, res: Response) => {
    const { annotations } = req.body;

    if (!annotations || !Array.isArray(annotations)) {
        res.status(400).json({
            error: 'Bad Request',
            message: 'annotations array is required',
        });
        return;
    }

    const created: any[] = [];
    const errors: any[] = [];

    for (const ann of annotations) {
        try {
            const annotation = {
                id: uuidv4(),
                ...ann,
                confidence: ann.confidence || 0.95,
                status: 'pending',
                reviewPasses: [],
                creatorId: 'user_demo',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const existing = annotationsStore.get(ann.assetId) || [];
            existing.push(annotation);
            annotationsStore.set(ann.assetId, existing);
            created.push(annotation);
        } catch (error) {
            errors.push({ input: ann, error: 'Failed to create' });
        }
    }

    res.status(201).json({
        data: {
            created: created.length,
            errors: errors.length,
            annotations: created,
        },
    });
});
