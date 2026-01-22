/**
 * Harbor Ads - Generation Engine Adapter
 * Interface with Veo, Sora, and other generation models
 */

import { v4 as uuidv4 } from 'uuid';
import type {
    AdCreative,
    PromptStructure,
    AdVariant
} from '../../models/ad-project.js';

export interface GenerationConfig {
    model: 'veo' | 'sora' | 'runway' | 'pika' | 'internal';
    quality: 'draft' | 'standard' | 'high';
    variantCount: number;
    seed?: number;
    temperature?: number;
    stylePreset?: string;
}

export interface GenerationRequest {
    creativeId: string;
    promptStructure: PromptStructure;
    referenceMedia: string[];
    brandConstraints: {
        colors?: string[];
        fonts?: string[];
        logoUrl?: string;
        doNots?: string[];
    };
    config: GenerationConfig;
}

export interface GenerationResult {
    requestId: string;
    creativeId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    variants: AdVariant[];
    processingTimeMs?: number;
    error?: string;
    metadata: {
        model: string;
        modelVersion: string;
        tokensUsed?: number;
        gpuSeconds?: number;
    };
}

/**
 * Generation Engine Adapter
 * Abstracts different AI video generation models
 */
export class GenerationEngineAdapter {

    private pendingJobs: Map<string, GenerationResult> = new Map();

    /**
     * Submit generation request
     */
    async submitGeneration(request: GenerationRequest): Promise<string> {
        const requestId = uuidv4();

        // Initialize pending result
        const result: GenerationResult = {
            requestId,
            creativeId: request.creativeId,
            status: 'pending',
            variants: [],
            metadata: {
                model: request.config.model,
                modelVersion: this.getModelVersion(request.config.model),
            },
        };

        this.pendingJobs.set(requestId, result);

        // Start async generation
        this.processGeneration(requestId, request);

        console.log(`[Generation] Submitted job ${requestId} for creative ${request.creativeId}`);
        return requestId;
    }

    /**
     * Get model version
     */
    private getModelVersion(model: string): string {
        const versions: Record<string, string> = {
            veo: '2.0',
            sora: '1.0',
            runway: 'gen-3',
            pika: '1.5',
            internal: 'harbor-v1',
        };
        return versions[model] || 'unknown';
    }

    /**
     * Process generation (simulated)
     */
    private async processGeneration(
        requestId: string,
        request: GenerationRequest
    ): Promise<void> {
        const result = this.pendingJobs.get(requestId);
        if (!result) return;

        // Update to processing
        result.status = 'processing';
        const startTime = Date.now();

        try {
            // Simulate generation time based on quality
            const delay = request.config.quality === 'high' ? 5000 :
                request.config.quality === 'standard' ? 3000 : 1000;
            await new Promise(resolve => setTimeout(resolve, delay));

            // Generate variants
            const variants: AdVariant[] = [];
            for (let i = 0; i < request.config.variantCount; i++) {
                variants.push({
                    id: uuidv4(),
                    name: `Variant ${i + 1}`,
                    mediaUrl: `https://media.harbor.ai/generated/${request.creativeId}/variant_${i}.mp4`,
                    thumbnailUrl: `https://media.harbor.ai/generated/${request.creativeId}/thumb_${i}.jpg`,
                    durationMs: request.promptStructure.totalDurationMs,
                    format: 'mp4',
                    generatedAt: new Date(),
                });
            }

            result.variants = variants;
            result.status = 'completed';
            result.processingTimeMs = Date.now() - startTime;
            result.metadata.gpuSeconds = Math.floor((Date.now() - startTime) / 100);
            result.metadata.tokensUsed = request.promptStructure.body.length * 500;

            console.log(`[Generation] Completed job ${requestId} with ${variants.length} variants`);
        } catch (error) {
            result.status = 'failed';
            result.error = error instanceof Error ? error.message : 'Unknown error';
            console.error(`[Generation] Failed job ${requestId}:`, result.error);
        }
    }

    /**
     * Get generation status
     */
    async getStatus(requestId: string): Promise<GenerationResult | null> {
        return this.pendingJobs.get(requestId) || null;
    }

    /**
     * Cancel generation
     */
    async cancelGeneration(requestId: string): Promise<boolean> {
        const result = this.pendingJobs.get(requestId);
        if (!result || result.status === 'completed' || result.status === 'failed') {
            return false;
        }

        result.status = 'failed';
        result.error = 'Cancelled by user';
        return true;
    }

    /**
     * Build prompt from structure
     */
    buildPrompt(
        structure: PromptStructure,
        brandConstraints: GenerationRequest['brandConstraints']
    ): string {
        const parts: string[] = [];

        // Hook
        parts.push(`[HOOK - ${structure.hook.durationMs}ms]`);
        parts.push(`Style: ${structure.hook.type}`);
        if (structure.hook.text) {
            parts.push(`Text: "${structure.hook.text}"`);
        }

        // Body scenes
        structure.body.forEach((scene, i) => {
            parts.push(`\n[SCENE ${i + 1} - ${scene.durationMs}ms]`);
            parts.push(`Description: ${scene.sceneDescription}`);
            if (scene.visualStyle) {
                parts.push(`Visual style: ${scene.visualStyle}`);
            }
        });

        // CTA
        parts.push(`\n[CTA - ${structure.cta.durationMs}ms]`);
        parts.push(`Text: "${structure.cta.text}"`);
        parts.push(`Style: ${structure.cta.style}`);

        // Brand constraints
        if (brandConstraints.colors?.length) {
            parts.push(`\n[BRAND]`);
            parts.push(`Colors: ${brandConstraints.colors.join(', ')}`);
        }
        if (brandConstraints.doNots?.length) {
            parts.push(`Avoid: ${brandConstraints.doNots.join(', ')}`);
        }

        // Technical specs
        parts.push(`\n[SPECS]`);
        parts.push(`Aspect ratio: ${structure.aspectRatio}`);
        parts.push(`Total duration: ${structure.totalDurationMs}ms`);

        return parts.join('\n');
    }

    /**
     * Estimate generation cost
     */
    estimateCost(config: GenerationConfig, durationMs: number): {
        credits: number;
        estimatedTimeMs: number;
    } {
        const baseCost = {
            veo: 10,
            sora: 15,
            runway: 8,
            pika: 5,
            internal: 2,
        };

        const qualityMultiplier = {
            draft: 0.5,
            standard: 1,
            high: 2,
        };

        const durationMultiplier = durationMs / 10000; // per 10 seconds
        const credits = Math.ceil(
            baseCost[config.model] *
            qualityMultiplier[config.quality] *
            durationMultiplier *
            config.variantCount
        );

        const estimatedTimeMs =
            (config.quality === 'high' ? 60000 : config.quality === 'standard' ? 30000 : 15000) *
            config.variantCount;

        return { credits, estimatedTimeMs };
    }
}

// Singleton instance
export const generationEngineAdapter = new GenerationEngineAdapter();
