import { CostConfig } from '../types';

// SudoWrite-inspired credit costs
// Pro plan: 1M credits ~ 50k-300k words depending on complexity
// We'll use similar ratios: text is cheap, media is expensive

export const COST_CONFIG: CostConfig = {
    textGeneration: 10,        // 10 credits per 100 words (~10k words per 1M credits baseline)
    outlineGeneration: 100,    // 100 credits per outline
    audioGeneration: 5000,     // 5000 credits per minute (significantly higher)
    videoGeneration: 15000,    // 15000 credits per video (very high)
    imageGeneration: 2500,     // 2500 credits per image (high)
};

export const PLAN_CREDITS = {
    hobby: 225000,       // $19/month (or $10/month annually)
    professional: 1000000, // $29/month (or $22/month annually)
    max: 2000000,        // $59/month (or $44/month annually)
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
