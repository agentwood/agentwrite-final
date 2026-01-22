/**
 * Harbor Ads API Routes
 * Ad Production API endpoints
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { requireScope, type AuthenticatedRequest } from '../middleware/auth.js';
import {
    clientIntakeService,
    contentSelectionService,
    creativeAssemblyService,
    generationEngineAdapter,
    humanReviewService,
    performanceFeedbackService,
} from '../../services/harbor-ads/index.js';
import { workflowEngine } from '../../services/workflow/index.js';

export const adsRouter = Router();

// ============================================
// PROJECT ENDPOINTS
// ============================================

/**
 * Create new ad project
 * POST /api/ads/projects
 */
adsRouter.post('/projects', requireScope('ads:write'), async (req: AuthenticatedRequest, res: Response) => {
    const { clientId, name, platforms, goals, targetAudience, brandGuidelines } = req.body;

    if (!name || !platforms || platforms.length === 0) {
        res.status(400).json({
            error: 'Bad Request',
            message: 'name and platforms are required',
        });
        return;
    }

    try {
        const project = await clientIntakeService.createProject({
            clientId: clientId || req.apiKey?.ownerId || 'client_demo',
            projectName: name,
            platforms,
            goals,
            targetAudience,
            brandGuidelines,
        });

        res.status(201).json({
            data: project,
            message: 'Project created successfully',
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create project', message: String(error) });
    }
});

/**
 * Get project by ID
 * GET /api/ads/projects/:projectId
 */
adsRouter.get('/projects/:projectId', requireScope('ads:read'), async (req: Request, res: Response) => {
    const { projectId } = req.params;

    const project = await clientIntakeService.getProject(projectId);
    if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
    }

    res.json({ data: project });
});

/**
 * List projects for client
 * GET /api/ads/projects
 */
adsRouter.get('/projects', requireScope('ads:read'), async (req: AuthenticatedRequest, res: Response) => {
    const clientId = req.query.clientId as string || req.apiKey?.ownerId || 'client_demo';
    const projects = await clientIntakeService.listProjects(clientId);

    res.json({
        data: projects,
        total: projects.length,
    });
});

/**
 * Submit intake form
 * POST /api/ads/projects/:projectId/intake
 */
adsRouter.post('/projects/:projectId/intake', requireScope('ads:write'), async (req: Request, res: Response) => {
    const { projectId } = req.params;

    try {
        const project = await clientIntakeService.submitIntake(projectId, req.body);

        // Validate intake
        const validation = clientIntakeService.validateIntake(project);

        res.json({
            data: project,
            validation,
            message: validation.valid ? 'Intake complete' : 'Intake submitted with missing items',
        });
    } catch (error) {
        res.status(500).json({ error: 'Intake failed', message: String(error) });
    }
});

/**
 * Upload asset to project
 * POST /api/ads/projects/:projectId/assets
 */
adsRouter.post('/projects/:projectId/assets', requireScope('ads:write'), async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const { type, name, url, mimeType, sizeBytes, metadata } = req.body;

    if (!type || !name || !url) {
        res.status(400).json({
            error: 'Bad Request',
            message: 'type, name, and url are required',
        });
        return;
    }

    try {
        const asset = await clientIntakeService.uploadAsset(projectId, {
            type,
            name,
            url,
            mimeType: mimeType || 'application/octet-stream',
            sizeBytes: sizeBytes || 0,
            metadata,
        });

        res.status(201).json({ data: asset });
    } catch (error) {
        res.status(500).json({ error: 'Asset upload failed', message: String(error) });
    }
});

// ============================================
// CONTENT SELECTION ENDPOINTS
// ============================================

/**
 * Get available content for project
 * GET /api/ads/projects/:projectId/content
 */
adsRouter.get('/projects/:projectId/content', requireScope('ads:read'), async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const { platform, aspectRatio } = req.query;

    const project = await clientIntakeService.getProject(projectId);
    if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
    }

    const content = await contentSelectionService.getAvailableContent(project, {
        platform: (platform as any) || project.platforms[0],
        aspectRatio: (aspectRatio as any) || '9:16',
    });

    res.json({
        data: content,
        total: content.length,
    });
});

/**
 * Create content selection
 * POST /api/ads/projects/:projectId/content/select
 */
adsRouter.post('/projects/:projectId/content/select', requireScope('ads:write'), async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const { sourceIds, platform, aspectRatio, brandSafe } = req.body;

    const project = await clientIntakeService.getProject(projectId);
    if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
    }

    try {
        const availableContent = await contentSelectionService.getAvailableContent(project, {
            platform,
            aspectRatio,
        });

        const selectedSources = availableContent.filter(c => sourceIds.includes(c.id));

        const selection = await contentSelectionService.createSelection(
            projectId,
            selectedSources,
            { platform, aspectRatio, brandSafe }
        );

        res.status(201).json({ data: selection });
    } catch (error) {
        res.status(400).json({ error: 'Selection failed', message: String(error) });
    }
});

// ============================================
// CREATIVE ENDPOINTS
// ============================================

/**
 * Generate creative from project
 * POST /api/ads/projects/:projectId/generate
 */
adsRouter.post('/projects/:projectId/generate', requireScope('ads:write'), async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const { model = 'internal', quality = 'standard', variantCount = 3 } = req.body;

    const project = await clientIntakeService.getProject(projectId);
    if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
    }

    try {
        // Get available content
        const content = await contentSelectionService.getAvailableContent(project, {
            platform: project.platforms[0],
            aspectRatio: '9:16',
        });

        // Create selection
        const selection = await contentSelectionService.createSelection(
            projectId,
            content.slice(0, 5),
            { platform: project.platforms[0], aspectRatio: '9:16' }
        );

        // Create blueprint
        const blueprint = await creativeAssemblyService.createBlueprint(project, selection);

        // Create creative
        const creative = await creativeAssemblyService.createCreative(blueprint, model);

        // Submit to generation engine
        const requestId = await generationEngineAdapter.submitGeneration({
            creativeId: creative.id,
            promptStructure: creative.promptStructure,
            referenceMedia: creative.sourceMedia,
            brandConstraints: {
                colors: project.brandGuidelines?.primaryColor ? [project.brandGuidelines.primaryColor] : undefined,
                doNots: project.brandGuidelines?.doNots,
            },
            config: { model, quality, variantCount },
        });

        // Update project status
        await clientIntakeService.updateStatus(projectId, 'generating');

        res.status(202).json({
            data: {
                creative,
                generationRequestId: requestId,
                estimatedTime: generationEngineAdapter.estimateCost(
                    { model, quality, variantCount },
                    creative.promptStructure.totalDurationMs
                ).estimatedTimeMs,
            },
            message: 'Generation started',
        });
    } catch (error) {
        res.status(500).json({ error: 'Generation failed', message: String(error) });
    }
});

/**
 * Get generation status
 * GET /api/ads/generation/:requestId
 */
adsRouter.get('/generation/:requestId', requireScope('ads:read'), async (req: Request, res: Response) => {
    const { requestId } = req.params;

    const result = await generationEngineAdapter.getStatus(requestId);
    if (!result) {
        res.status(404).json({ error: 'Generation request not found' });
        return;
    }

    res.json({ data: result });
});

/**
 * List creatives for project
 * GET /api/ads/projects/:projectId/creatives
 */
adsRouter.get('/projects/:projectId/creatives', requireScope('ads:read'), async (req: Request, res: Response) => {
    const { projectId } = req.params;

    // In production, fetch from database
    // For demo, return empty list
    res.json({
        data: [],
        total: 0,
    });
});

// ============================================
// REVIEW ENDPOINTS
// ============================================

/**
 * Submit creative for review
 * POST /api/ads/creatives/:creativeId/review
 */
adsRouter.post('/creatives/:creativeId/review', requireScope('ads:write'), async (req: Request, res: Response) => {
    const { creativeId } = req.params;
    const { action, notes, revision, variantId } = req.body;

    if (!action || !variantId) {
        res.status(400).json({
            error: 'Bad Request',
            message: 'action and variantId are required',
        });
        return;
    }

    try {
        const result = await humanReviewService.submitReview({
            creativeId,
            variantId,
            reviewerId: 'reviewer_demo',
            action,
            notes,
            revision,
        });

        res.json({
            data: result.creative,
            nextAction: result.nextAction,
        });
    } catch (error) {
        res.status(500).json({ error: 'Review failed', message: String(error) });
    }
});

/**
 * Get pending reviews
 * GET /api/ads/reviews/pending
 */
adsRouter.get('/reviews/pending', requireScope('ads:read'), async (req: Request, res: Response) => {
    const reviews = await humanReviewService.getPendingReviews();

    res.json({
        data: reviews,
        total: reviews.length,
    });
});

// ============================================
// PERFORMANCE ENDPOINTS
// ============================================

/**
 * Get performance report
 * GET /api/ads/projects/:projectId/performance
 */
adsRouter.get('/projects/:projectId/performance', requireScope('ads:read'), async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const { creativeId, period = 'week' } = req.query;

    if (!creativeId) {
        res.status(400).json({
            error: 'Bad Request',
            message: 'creativeId query parameter is required',
        });
        return;
    }

    try {
        const report = await performanceFeedbackService.getReport(
            creativeId as string,
            period as any
        );

        res.json({ data: report });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get performance', message: String(error) });
    }
});

/**
 * Ingest performance data
 * POST /api/ads/performance
 */
adsRouter.post('/performance', requireScope('ads:write'), async (req: Request, res: Response) => {
    const { creativeId, platform, metrics } = req.body;

    if (!creativeId || !platform || !metrics) {
        res.status(400).json({
            error: 'Bad Request',
            message: 'creativeId, platform, and metrics are required',
        });
        return;
    }

    try {
        const performance = await performanceFeedbackService.ingestPerformance(
            creativeId,
            platform,
            metrics
        );

        res.status(201).json({ data: performance });
    } catch (error) {
        res.status(500).json({ error: 'Ingestion failed', message: String(error) });
    }
});

/**
 * Get insights for creative
 * GET /api/ads/creatives/:creativeId/insights
 */
adsRouter.get('/creatives/:creativeId/insights', requireScope('ads:read'), async (req: Request, res: Response) => {
    const { creativeId } = req.params;

    const insights = await performanceFeedbackService.getInsights(creativeId);

    res.json({
        data: insights,
        total: insights.length,
    });
});

// ============================================
// WORKFLOW ENDPOINTS
// ============================================

/**
 * Start ad production workflow
 * POST /api/ads/projects/:projectId/workflow
 */
adsRouter.post('/projects/:projectId/workflow', requireScope('ads:write'), async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const { webhookUrl } = req.body;

    const project = await clientIntakeService.getProject(projectId);
    if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
    }

    try {
        const run = await workflowEngine.startRun(
            'ad_production',
            projectId,
            { project },
            webhookUrl
        );

        res.status(202).json({
            data: run,
            message: 'Workflow started',
        });
    } catch (error) {
        res.status(500).json({ error: 'Workflow start failed', message: String(error) });
    }
});

/**
 * Get workflow run status
 * GET /api/ads/workflows/:runId
 */
adsRouter.get('/workflows/:runId', requireScope('ads:read'), async (req: Request, res: Response) => {
    const { runId } = req.params;

    const run = await workflowEngine.getRun(runId);
    if (!run) {
        res.status(404).json({ error: 'Workflow run not found' });
        return;
    }

    res.json({ data: run });
});

/**
 * Resume workflow after human action
 * POST /api/ads/workflows/:runId/resume
 */
adsRouter.post('/workflows/:runId/resume', requireScope('ads:write'), async (req: Request, res: Response) => {
    const { runId } = req.params;
    const { output } = req.body;

    try {
        const run = await workflowEngine.resumeRun(runId, output);
        res.json({ data: run });
    } catch (error) {
        res.status(500).json({ error: 'Resume failed', message: String(error) });
    }
});

/**
 * Get workflow logs
 * GET /api/ads/workflows/:runId/logs
 */
adsRouter.get('/workflows/:runId/logs', requireScope('ads:read'), async (req: Request, res: Response) => {
    const { runId } = req.params;

    const run = await workflowEngine.getRun(runId);
    if (!run) {
        res.status(404).json({ error: 'Workflow run not found' });
        return;
    }

    res.json({
        data: run.logs,
        total: run.logs.length,
    });
});
