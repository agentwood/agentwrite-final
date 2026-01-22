/**
 * Harbor Ads Data Models
 * Data structures for the ad production platform
 */

import { z } from 'zod';

// ============================================
// AD PROJECT MODELS
// ============================================

/**
 * Platform targets for ad delivery
 */
export const PlatformSchema = z.enum([
    'tiktok',
    'instagram_reels',
    'youtube_shorts',
    'facebook_reels',
    'snapchat',
    'pinterest',
    'twitter',
]);

export type Platform = z.infer<typeof PlatformSchema>;

/**
 * Ad goals and KPIs
 */
export const AdGoalsSchema = z.object({
    objective: z.enum(['awareness', 'consideration', 'conversion', 'engagement']),
    targetCtr: z.number().min(0).max(1).optional(),
    targetCpm: z.number().min(0).optional(),
    targetRoas: z.number().min(0).optional(),
    keyMessages: z.array(z.string()),
    cta: z.string().optional(),
});

export type AdGoals = z.infer<typeof AdGoalsSchema>;

/**
 * Client assets
 */
export const ClientAssetSchema = z.object({
    id: z.string().uuid(),
    type: z.enum(['logo', 'video', 'image', 'font', 'audio', 'brandkit']),
    name: z.string(),
    url: z.string().url(),
    mimeType: z.string(),
    sizeBytes: z.number().int(),
    metadata: z.record(z.any()).optional(),
    uploadedAt: z.date(),
});

export type ClientAsset = z.infer<typeof ClientAssetSchema>;

/**
 * Project status
 */
export const ProjectStatusSchema = z.enum([
    'draft',
    'intake_pending',
    'intake_complete',
    'selecting_content',
    'assembling',
    'generating',
    'in_review',
    'approved',
    'delivered',
    'archived',
]);

export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;

/**
 * Client Ad Project
 */
export const ClientAdProjectSchema = z.object({
    id: z.string().uuid(),
    clientId: z.string().uuid(),
    name: z.string().min(1).max(255),

    // Goals and targeting
    goals: AdGoalsSchema.optional(),
    platforms: z.array(PlatformSchema),
    targetAudience: z.object({
        demographics: z.array(z.string()).optional(),
        interests: z.array(z.string()).optional(),
        behaviors: z.array(z.string()).optional(),
    }).optional(),

    // Assets
    assets: z.array(ClientAssetSchema),

    // Brand guidelines
    brandGuidelines: z.object({
        primaryColor: z.string().optional(),
        secondaryColors: z.array(z.string()).optional(),
        fontFamily: z.string().optional(),
        tone: z.enum(['professional', 'casual', 'playful', 'luxury', 'bold']).optional(),
        doNots: z.array(z.string()).optional(),
    }).optional(),

    // Status
    status: ProjectStatusSchema,

    // Metadata
    createdAt: z.date(),
    updatedAt: z.date(),
    deliveredAt: z.date().optional(),
});

export type ClientAdProject = z.infer<typeof ClientAdProjectSchema>;

// ============================================
// AD CREATIVE MODELS
// ============================================

/**
 * Creative status
 */
export const CreativeStatusSchema = z.enum([
    'draft',
    'generating',
    'generated',
    'pending_review',
    'approved',
    'rejected',
    'revision_requested',
]);

export type CreativeStatus = z.infer<typeof CreativeStatusSchema>;

/**
 * Prompt structure for generation
 */
export const PromptStructureSchema = z.object({
    hook: z.object({
        type: z.enum(['question', 'statement', 'action', 'emotion']),
        text: z.string().optional(),
        durationMs: z.number().int(),
    }),
    body: z.array(z.object({
        sceneDescription: z.string(),
        durationMs: z.number().int(),
        visualStyle: z.string().optional(),
        audioStyle: z.string().optional(),
    })),
    cta: z.object({
        text: z.string(),
        style: z.enum(['overlay', 'voiceover', 'both']),
        durationMs: z.number().int(),
    }),
    totalDurationMs: z.number().int(),
    aspectRatio: z.enum(['9:16', '16:9', '1:1', '4:5']),
});

export type PromptStructure = z.infer<typeof PromptStructureSchema>;

/**
 * Ad variant
 */
export const AdVariantSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    mediaUrl: z.string().url(),
    thumbnailUrl: z.string().url().optional(),
    durationMs: z.number().int(),
    format: z.string(),
    generatedAt: z.date(),
});

export type AdVariant = z.infer<typeof AdVariantSchema>;

/**
 * Review note
 */
export const ReviewNoteSchema = z.object({
    id: z.string().uuid(),
    reviewerId: z.string().uuid(),
    action: z.enum(['approve', 'reject', 'request_revision']),
    notes: z.string().optional(),
    timestamp: z.date(),
    revisionDetails: z.object({
        type: z.enum(['trim', 'reprompt', 'replace_scene', 'brand_polish']),
        description: z.string(),
        targetTimestamp: z.number().optional(),
    }).optional(),
});

export type ReviewNote = z.infer<typeof ReviewNoteSchema>;

/**
 * Ad Creative
 */
export const AdCreativeSchema = z.object({
    id: z.string().uuid(),
    projectId: z.string().uuid(),
    name: z.string(),

    // Source content
    sourceMedia: z.array(z.string().uuid()), // MediaObject IDs
    harborDatasets: z.array(z.string()).optional(), // Dataset slugs used

    // Generation
    promptStructure: PromptStructureSchema,
    generationModel: z.enum(['veo', 'sora', 'runway', 'pika', 'internal']),
    generationConfig: z.record(z.any()).optional(),

    // Output
    status: CreativeStatusSchema,
    variants: z.array(AdVariantSchema),
    selectedVariant: z.string().uuid().optional(),

    // Review
    reviewNotes: z.array(ReviewNoteSchema),

    // Timestamps
    createdAt: z.date(),
    updatedAt: z.date(),
    generatedAt: z.date().optional(),
    approvedAt: z.date().optional(),
});

export type AdCreative = z.infer<typeof AdCreativeSchema>;

// ============================================
// WORKFLOW MODELS
// ============================================

/**
 * Workflow step type
 */
export const StepTypeSchema = z.enum([
    'intake',
    'content_selection',
    'creative_assembly',
    'generation',
    'human_review',
    'revision',
    'delivery',
    'feedback_collection',
]);

export type StepType = z.infer<typeof StepTypeSchema>;

/**
 * Step status
 */
export const StepStatusSchema = z.enum([
    'pending',
    'running',
    'completed',
    'failed',
    'skipped',
    'waiting_human',
]);

export type StepStatus = z.infer<typeof StepStatusSchema>;

/**
 * Workflow step
 */
export const WorkflowStepSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    type: StepTypeSchema,
    status: StepStatusSchema,

    // Execution
    input: z.record(z.any()),
    output: z.record(z.any()).optional(),

    // Error handling
    retries: z.number().int().default(0),
    maxRetries: z.number().int().default(3),
    error: z.string().optional(),

    // Timing
    startedAt: z.date().optional(),
    completedAt: z.date().optional(),
    durationMs: z.number().int().optional(),
});

export type WorkflowStep = z.infer<typeof WorkflowStepSchema>;

/**
 * Workflow log entry
 */
export const WorkflowLogSchema = z.object({
    timestamp: z.date(),
    level: z.enum(['debug', 'info', 'warn', 'error']),
    stepId: z.string().uuid().optional(),
    message: z.string(),
    data: z.record(z.any()).optional(),
});

export type WorkflowLog = z.infer<typeof WorkflowLogSchema>;

/**
 * Workflow run
 */
export const WorkflowRunSchema = z.object({
    id: z.string().uuid(),
    projectId: z.string().uuid(),
    workflowType: z.enum(['ad_production', 'revision', 'batch_generation']),

    // State machine
    steps: z.array(WorkflowStepSchema),
    currentState: z.string(),
    currentStepId: z.string().uuid().optional(),

    // Logging
    logs: z.array(WorkflowLogSchema),

    // Webhooks
    webhookUrl: z.string().url().optional(),

    // Timing
    startedAt: z.date(),
    completedAt: z.date().optional(),

    // Status
    status: z.enum(['running', 'completed', 'failed', 'paused', 'cancelled']),
});

export type WorkflowRun = z.infer<typeof WorkflowRunSchema>;

// ============================================
// PERFORMANCE MODELS
// ============================================

/**
 * Performance metrics for an ad
 */
export const AdPerformanceSchema = z.object({
    creativeId: z.string().uuid(),
    platform: PlatformSchema,

    // Core metrics
    impressions: z.number().int(),
    clicks: z.number().int(),
    ctr: z.number(),

    // Engagement
    views: z.number().int(),
    completions: z.number().int(),
    completionRate: z.number(),
    avgWatchTimeMs: z.number().int(),

    // Conversions
    conversions: z.number().int().optional(),
    conversionRate: z.number().optional(),
    roas: z.number().optional(),

    // Cost
    spend: z.number().optional(),
    cpm: z.number().optional(),
    cpc: z.number().optional(),

    // Time range
    startDate: z.date(),
    endDate: z.date(),

    // Last updated
    updatedAt: z.date(),
});

export type AdPerformance = z.infer<typeof AdPerformanceSchema>;
