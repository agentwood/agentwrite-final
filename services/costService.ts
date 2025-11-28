import { CostConfig } from '../types';

// SudoWrite-inspired credit costs
// Pro plan: 1M credits ~ 50k-300k words depending on complexity
// We'll use similar ratios: text is cheap, media is expensive

export const COST_CONFIG: CostConfig = {
    textGeneration: 1,         // 1 credit per 100 words
    outlineGeneration: 10,     // 10 credits per outline
    audioGeneration: 500,      // 500 credits per minute
    videoGeneration: 1500,     // 1500 credits per video
    imageGeneration: 250,      // 250 credits per image
};

export const PLAN_CREDITS = {
    hobby: 15000,        // $14/month (or $7/month annually)
    professional: 75000, // $24/month (or $15/month annually)
    max: Infinity,       // $44/month (or $29/month annually) - Unlimited
};

/**
 * Check if user has enough credits for an operation
 */
export function hasEnoughCredits(userCredits: number, cost: number): boolean {
    return userCredits >= cost;
}

/**
 * Calculate cost for text generation
 */
export function calculateTextCost(wordCount: number): number {
    return Math.ceil((wordCount / 100) * COST_CONFIG.textGeneration);
}

/**
 * Calculate cost for outline generation
 */
export function calculateOutlineCost(): number {
    return COST_CONFIG.outlineGeneration;
}

/**
 * Calculate cost for audio generation
 */
export function calculateAudioCost(durationMinutes: number = 1): number {
    return Math.ceil(durationMinutes * COST_CONFIG.audioGeneration);
}

/**
 * Calculate cost for video generation
 */
export function calculateVideoCost(): number {
    return COST_CONFIG.videoGeneration;
}

/**
 * Calculate cost for image generation
 */
export function calculateImageCost(): number {
    return COST_CONFIG.imageGeneration;
}

/**
 * Estimate cost for a long-form writing project
 */
export function estimateProjectCost(targetWordCount: number): {
    outline: number;
    writing: number;
    total: number;
    estimatedWords: string;
} {
    const outlineCost = calculateOutlineCost();
    const writingCost = calculateTextCost(targetWordCount);
    const total = outlineCost + writingCost;

    return {
        outline: outlineCost,
        writing: writingCost,
        total,
        estimatedWords: `${Math.floor(targetWordCount / 1000)}k words`,
    };
}

/**
 * Format credits with K/M suffixes
 */
export function formatCredits(credits: number): string {
    if (credits >= 1000000) {
        return `${(credits / 1000000).toFixed(1)}M`;
    } else if (credits >= 1000) {
        return `${(credits / 1000).toFixed(0)}K`;
    }
    return credits.toString();
}
