/**
 * HARBOR Data Models
 * Core data structures for the platform
 */

import { z } from 'zod';

// ============================================
// MEDIA ASSET MODELS
// ============================================

/**
 * Rights metadata - travels with every frame
 */
export const RightsMetadataSchema = z.object({
    id: z.string().uuid(),
    contributorId: z.string().uuid(),
    consentType: z.enum(['explicit', 'implicit', 'contractual']),
    usageRights: z.array(z.enum(['training', 'inference', 'commercial', 'research', 'redistribution'])),
    restrictions: z.array(z.string()).optional(),
    expiresAt: z.date().optional(),
    territory: z.array(z.string()).default(['worldwide']),
    verifiedAt: z.date(),
});

export type RightsMetadata = z.infer<typeof RightsMetadataSchema>;

/**
 * Provenance chain for tamper-proof tracking
 */
export const ProvenanceChainSchema = z.object({
    origin: z.object({
        source: z.enum(['consumer_app', 'tv_network', 'enterprise', 'hardware', 'partner']),
        deviceId: z.string().optional(),
        captureTime: z.date(),
        location: z.object({
            lat: z.number().optional(),
            lng: z.number().optional(),
            accuracy: z.number().optional(),
        }).optional(),
    }),
    chain: z.array(z.object({
        action: z.string(),
        actor: z.string(),
        timestamp: z.date(),
        hash: z.string(),
    })),
    currentHash: z.string(),
});

export type ProvenanceChain = z.infer<typeof ProvenanceChainSchema>;

/**
 * Frame timestamp for frame-level addressing
 */
export const FrameTimestampSchema = z.object({
    frameNumber: z.number().int().min(0),
    timestamp: z.number(), // milliseconds
    pts: z.number().optional(), // presentation timestamp
    dts: z.number().optional(), // decode timestamp
});

export type FrameTimestamp = z.infer<typeof FrameTimestampSchema>;

/**
 * Media format specification
 */
export const MediaFormatSchema = z.object({
    container: z.string(), // mp4, webm, etc.
    videoCodec: z.string().optional(),
    audioCodec: z.string().optional(),
    width: z.number().int().optional(),
    height: z.number().int().optional(),
    frameRate: z.number().optional(),
    sampleRate: z.number().int().optional(),
    channels: z.number().int().optional(),
    bitrate: z.number().int().optional(),
});

export type MediaFormat = z.infer<typeof MediaFormatSchema>;

/**
 * Media Asset - Frame-addressable with rights metadata
 */
export const MediaAssetSchema = z.object({
    id: z.string().uuid(),
    datasetId: z.string().uuid(),
    source: z.enum(['consumer_app', 'tv_network', 'enterprise', 'hardware', 'partner']),
    type: z.enum(['audio', 'video', 'multimodal']),
    format: MediaFormatSchema,
    duration: z.number(), // seconds
    frameCount: z.number().int().optional(),
    sizeBytes: z.number().int(),
    storageUrl: z.string().url(),
    rights: RightsMetadataSchema,
    provenance: ProvenanceChainSchema,
    status: z.enum(['ingesting', 'processing', 'ready', 'archived', 'deleted']),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type MediaAsset = z.infer<typeof MediaAssetSchema>;

// ============================================
// ANNOTATION MODELS
// ============================================

/**
 * Label with confidence score
 */
export const LabelSchema = z.object({
    key: z.string(),
    value: z.string(),
    confidence: z.number().min(0).max(1),
    source: z.enum(['human', 'machine', 'hybrid']),
});

export type Label = z.infer<typeof LabelSchema>;

/**
 * Review pass for multi-pass annotation
 */
export const ReviewPassSchema = z.object({
    passNumber: z.number().int().min(1),
    reviewerId: z.string().uuid(),
    action: z.enum(['approved', 'rejected', 'modified']),
    modifications: z.array(z.string()).optional(),
    timestamp: z.date(),
    notes: z.string().optional(),
});

export type ReviewPass = z.infer<typeof ReviewPassSchema>;

/**
 * Annotation - Multi-pass reviewed with confidence
 */
export const AnnotationSchema = z.object({
    id: z.string().uuid(),
    assetId: z.string().uuid(),
    type: z.enum(['scene', 'action', 'object', 'speech', 'emotion', 'speaker', 'event', 'segment']),

    // Temporal bounds
    startFrame: z.number().int().min(0).optional(),
    endFrame: z.number().int().min(0).optional(),
    startTime: z.number().min(0), // milliseconds
    endTime: z.number().min(0),   // milliseconds

    // Spatial bounds (for video)
    boundingBox: z.object({
        x: z.number(),
        y: z.number(),
        width: z.number(),
        height: z.number(),
    }).optional(),

    // Annotation data
    labels: z.array(LabelSchema),
    confidence: z.number().min(0).max(1),

    // Review workflow
    status: z.enum(['pending', 'in_review', 'approved', 'rejected']),
    reviewPasses: z.array(ReviewPassSchema),

    // Metadata
    creatorId: z.string().uuid(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type Annotation = z.infer<typeof AnnotationSchema>;

// ============================================
// DATASET MODELS
// ============================================

/**
 * License terms
 */
export const LicenseTermsSchema = z.object({
    allowTraining: z.boolean(),
    allowInference: z.boolean(),
    allowCommercial: z.boolean(),
    allowResearch: z.boolean(),
    allowRedistribution: z.boolean(),
    attributionRequired: z.boolean(),
    exclusivityPeriod: z.number().int().optional(), // days
    customTerms: z.array(z.string()).optional(),
});

export type LicenseTerms = z.infer<typeof LicenseTermsSchema>;

/**
 * Usage restrictions
 */
export const UsageRestrictionsSchema = z.object({
    maxQueries: z.number().int().optional(),
    maxDownloads: z.number().int().optional(),
    maxConcurrentAccess: z.number().int().optional(),
    allowedRegions: z.array(z.string()).optional(),
    blockedRegions: z.array(z.string()).optional(),
    expiresAt: z.date().optional(),
});

export type UsageRestrictions = z.infer<typeof UsageRestrictionsSchema>;

/**
 * Pricing model
 */
export const PricingModelSchema = z.object({
    type: z.enum(['free', 'one_time', 'subscription', 'usage_based', 'enterprise']),
    basePrice: z.number().min(0).optional(),
    currency: z.string().default('USD'),
    perQueryPrice: z.number().min(0).optional(),
    perGBPrice: z.number().min(0).optional(),
});

export type PricingModel = z.infer<typeof PricingModelSchema>;

/**
 * Contributor share for revenue sharing
 */
export const ContributorShareSchema = z.object({
    contributorId: z.string().uuid(),
    sharePercentage: z.number().min(0).max(100),
    payoutThreshold: z.number().min(0).default(50),
});

export type ContributorShare = z.infer<typeof ContributorShareSchema>;

/**
 * License
 */
export const LicenseSchema = z.object({
    id: z.string().uuid(),
    type: z.enum(['api_access', 'one_time', 'subscription', 'exclusive']),
    terms: LicenseTermsSchema,
    restrictions: UsageRestrictionsSchema,
    pricing: PricingModelSchema,
    contributors: z.array(ContributorShareSchema),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type License = z.infer<typeof LicenseSchema>;

/**
 * Dataset metadata
 */
export const DatasetMetadataSchema = z.object({
    description: z.string(),
    category: z.array(z.string()),
    tags: z.array(z.string()),
    languages: z.array(z.string()).optional(),
    totalDuration: z.number(), // seconds
    totalAssets: z.number().int(),
    totalSize: z.number().int(), // bytes
    sampleRate: z.number().optional(),
    resolution: z.string().optional(),
    annotationTypes: z.array(z.string()),
    qualityScore: z.number().min(0).max(100),
});

export type DatasetMetadata = z.infer<typeof DatasetMetadataSchema>;

/**
 * Embedding index for RAG
 */
export const EmbeddingIndexSchema = z.object({
    indexId: z.string().uuid(),
    modelVersion: z.string(),
    dimensions: z.number().int(),
    vectorCount: z.number().int(),
    lastUpdated: z.date(),
});

export type EmbeddingIndex = z.infer<typeof EmbeddingIndexSchema>;

/**
 * Dataset - Living asset with version history
 */
export const DatasetSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1).max(255),
    slug: z.string().regex(/^[a-z0-9-]+$/),
    type: z.enum(['public', 'private', 'vertical', 'exclusive', 'realtime']),
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    mediaType: z.enum(['audio', 'video', 'multimodal']),

    // Relationships
    licenseId: z.string().uuid(),
    ownerId: z.string().uuid(),

    // Metadata
    metadata: DatasetMetadataSchema,
    embeddings: EmbeddingIndexSchema.optional(),

    // Status
    status: z.enum(['draft', 'processing', 'published', 'deprecated', 'archived']),
    publishedAt: z.date().optional(),

    // Timestamps
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type Dataset = z.infer<typeof DatasetSchema>;

// ============================================
// CONTRIBUTOR MODELS
// ============================================

/**
 * Contributor
 */
export const ContributorSchema = z.object({
    id: z.string().uuid(),
    type: z.enum(['individual', 'organization', 'network', 'partner']),
    name: z.string(),
    email: z.string().email(),

    // Verification
    verified: z.boolean().default(false),
    verificationMethod: z.enum(['email', 'identity', 'contract']).optional(),

    // Earnings
    totalEarnings: z.number().default(0),
    pendingPayout: z.number().default(0),
    payoutMethod: z.enum(['bank', 'paypal', 'crypto']).optional(),

    // Stats
    totalAssets: z.number().int().default(0),
    totalDatasets: z.number().int().default(0),

    // Timestamps
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type Contributor = z.infer<typeof ContributorSchema>;

// ============================================
// API MODELS
// ============================================

/**
 * API Key
 */
export const ApiKeySchema = z.object({
    id: z.string().uuid(),
    key: z.string(),
    name: z.string(),
    ownerId: z.string().uuid(),
    scopes: z.array(z.string()),
    rateLimit: z.number().int(),
    expiresAt: z.date().optional(),
    lastUsedAt: z.date().optional(),
    createdAt: z.date(),
});

export type ApiKey = z.infer<typeof ApiKeySchema>;

/**
 * Usage record for metering
 */
export const UsageRecordSchema = z.object({
    id: z.string().uuid(),
    apiKeyId: z.string().uuid(),
    datasetId: z.string().uuid(),
    action: z.enum(['query', 'download', 'stream', 'annotate']),
    bytesTransferred: z.number().int(),
    queryCount: z.number().int(),
    cost: z.number(),
    timestamp: z.date(),
});

export type UsageRecord = z.infer<typeof UsageRecordSchema>;
