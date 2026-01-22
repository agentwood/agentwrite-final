/**
 * Harbor Ads - Content Selection Service
 * Choose inputs for ad creation with rights enforcement
 */

import { v4 as uuidv4 } from 'uuid';
import type { ClientAdProject, Platform } from '../../models/ad-project.js';

export interface ContentSource {
    id: string;
    type: 'client_owned' | 'harbor_dataset' | 'third_party';
    name: string;
    mediaUrl?: string;
    datasetId?: string;
    thumbnailUrl?: string;
    duration?: number;
    rights: {
        cleared: boolean;
        restrictions: string[];
        territories: string[];
        expiresAt?: Date;
    };
    metadata: {
        format?: string;
        resolution?: string;
        aspectRatio?: string;
        tags?: string[];
    };
}

export interface SelectionCriteria {
    platform: Platform;
    aspectRatio: '9:16' | '16:9' | '1:1' | '4:5';
    minDuration?: number;
    maxDuration?: number;
    tags?: string[];
    excludeTags?: string[];
    brandSafe?: boolean;
    audienceMatch?: string[];
}

export interface ContentSelection {
    id: string;
    projectId: string;
    sources: ContentSource[];
    criteria: SelectionCriteria;
    score: number;
    createdAt: Date;
}

/**
 * Content Selection Service
 */
export class ContentSelectionService {

    // Mock Harbor datasets
    private harborDatasets: Map<string, ContentSource[]> = new Map([
        ['lifestyle-footage-v2', [
            {
                id: uuidv4(),
                type: 'harbor_dataset',
                name: 'Urban lifestyle scene',
                datasetId: 'lifestyle-footage-v2',
                thumbnailUrl: 'https://media.harbor.ai/lifestyle/thumb_001.jpg',
                duration: 15000,
                rights: { cleared: true, restrictions: [], territories: ['worldwide'] },
                metadata: { format: 'mp4', resolution: '4K', aspectRatio: '9:16', tags: ['urban', 'lifestyle', 'modern'] },
            },
        ]],
        ['product-shots-v1', [
            {
                id: uuidv4(),
                type: 'harbor_dataset',
                name: 'Product showcase template',
                datasetId: 'product-shots-v1',
                thumbnailUrl: 'https://media.harbor.ai/product/thumb_001.jpg',
                duration: 10000,
                rights: { cleared: true, restrictions: [], territories: ['worldwide'] },
                metadata: { format: 'mp4', resolution: '4K', aspectRatio: '9:16', tags: ['product', 'showcase', 'clean'] },
            },
        ]],
    ]);

    /**
     * Get available content for a project
     */
    async getAvailableContent(
        project: ClientAdProject,
        criteria: SelectionCriteria
    ): Promise<ContentSource[]> {
        const sources: ContentSource[] = [];

        // Add client-owned assets
        for (const asset of project.assets) {
            if (asset.type === 'video') {
                sources.push({
                    id: asset.id,
                    type: 'client_owned',
                    name: asset.name,
                    mediaUrl: asset.url,
                    rights: { cleared: true, restrictions: [], territories: ['worldwide'] },
                    metadata: { format: asset.mimeType },
                });
            }
        }

        // Add Harbor dataset content
        for (const [, clips] of this.harborDatasets) {
            for (const clip of clips) {
                // Filter by aspect ratio if specified
                if (criteria.aspectRatio && clip.metadata.aspectRatio !== criteria.aspectRatio) {
                    continue;
                }
                // Filter by tags
                if (criteria.tags && criteria.tags.length > 0) {
                    const clipTags = clip.metadata.tags || [];
                    if (!criteria.tags.some(t => clipTags.includes(t))) {
                        continue;
                    }
                }
                sources.push(clip);
            }
        }

        return sources;
    }

    /**
     * Check rights for content
     */
    async checkRights(
        source: ContentSource,
        platform: Platform,
        territory?: string
    ): Promise<{ allowed: boolean; reason?: string }> {
        // Always check if rights are cleared
        if (!source.rights.cleared) {
            return { allowed: false, reason: 'Rights not cleared' };
        }

        // Check territory restrictions
        if (territory && !source.rights.territories.includes('worldwide')) {
            if (!source.rights.territories.includes(territory)) {
                return { allowed: false, reason: `Not licensed for territory: ${territory}` };
            }
        }

        // Check expiry
        if (source.rights.expiresAt && source.rights.expiresAt < new Date()) {
            return { allowed: false, reason: 'Rights have expired' };
        }

        // Check platform restrictions
        const platformRestriction = source.rights.restrictions.find(
            r => r.toLowerCase().includes(platform.toLowerCase())
        );
        if (platformRestriction) {
            return { allowed: false, reason: `Platform restricted: ${platform}` };
        }

        return { allowed: true };
    }

    /**
     * Perform brand safety check
     */
    async checkBrandSafety(source: ContentSource): Promise<{
        safe: boolean;
        score: number;
        flags: string[];
    }> {
        // In production, this would call a content moderation API
        // For demo, simulate check
        const flags: string[] = [];
        let score = 1.0;

        const unsafeTags = ['violence', 'adult', 'controversial', 'political'];
        const tags = source.metadata.tags || [];

        for (const tag of tags) {
            if (unsafeTags.includes(tag.toLowerCase())) {
                flags.push(tag);
                score -= 0.3;
            }
        }

        return {
            safe: score >= 0.7,
            score: Math.max(0, score),
            flags,
        };
    }

    /**
     * Create content selection
     */
    async createSelection(
        projectId: string,
        sources: ContentSource[],
        criteria: SelectionCriteria
    ): Promise<ContentSelection> {
        // Validate all sources have rights
        for (const source of sources) {
            const rightsCheck = await this.checkRights(source, criteria.platform);
            if (!rightsCheck.allowed) {
                throw new Error(`Content ${source.id} failed rights check: ${rightsCheck.reason}`);
            }

            if (criteria.brandSafe) {
                const safetyCheck = await this.checkBrandSafety(source);
                if (!safetyCheck.safe) {
                    throw new Error(`Content ${source.id} failed brand safety: ${safetyCheck.flags.join(', ')}`);
                }
            }
        }

        const selection: ContentSelection = {
            id: uuidv4(),
            projectId,
            sources,
            criteria,
            score: this.calculateSelectionScore(sources, criteria),
            createdAt: new Date(),
        };

        console.log(`[Selection] Created selection ${selection.id} with ${sources.length} sources`);
        return selection;
    }

    /**
     * Calculate selection quality score
     */
    private calculateSelectionScore(
        sources: ContentSource[],
        criteria: SelectionCriteria
    ): number {
        let score = 0;

        // Score based on source diversity
        const clientOwned = sources.filter(s => s.type === 'client_owned').length;
        const harborContent = sources.filter(s => s.type === 'harbor_dataset').length;

        if (clientOwned > 0 && harborContent > 0) {
            score += 0.3; // Bonus for mixed content
        }

        // Score based on aspect ratio match
        const matchingAspect = sources.filter(
            s => s.metadata.aspectRatio === criteria.aspectRatio
        ).length;
        score += (matchingAspect / sources.length) * 0.4;

        // Score based on tag relevance
        if (criteria.tags && criteria.tags.length > 0) {
            let tagMatches = 0;
            for (const source of sources) {
                const tags = source.metadata.tags || [];
                if (criteria.tags.some(t => tags.includes(t))) {
                    tagMatches++;
                }
            }
            score += (tagMatches / sources.length) * 0.3;
        } else {
            score += 0.3;
        }

        return Math.min(1, score);
    }

    /**
     * Suggest content based on project goals
     */
    async suggestContent(
        project: ClientAdProject,
        limit: number = 10
    ): Promise<ContentSource[]> {
        const suggestions: ContentSource[] = [];
        const goalTags: string[] = [];

        // Extract tags from goals
        if (project.goals?.objective === 'awareness') {
            goalTags.push('attention', 'hook', 'bold');
        } else if (project.goals?.objective === 'conversion') {
            goalTags.push('product', 'cta', 'demo');
        }

        // Get content matching goal tags
        for (const [, clips] of this.harborDatasets) {
            for (const clip of clips) {
                const clipTags = clip.metadata.tags || [];
                if (goalTags.some(t => clipTags.includes(t)) || goalTags.length === 0) {
                    suggestions.push(clip);
                }
            }
        }

        return suggestions.slice(0, limit);
    }
}

// Singleton instance
export const contentSelectionService = new ContentSelectionService();
