/**
 * Harbor Ads - Human Review Service
 * Premium quality control with review workflows
 */

import { v4 as uuidv4 } from 'uuid';
import type {
    AdCreative,
    AdVariant,
    ReviewNote
} from '../../models/ad-project.js';

export type ReviewAction = 'approve' | 'reject' | 'request_revision';
export type RevisionType = 'trim' | 'reprompt' | 'replace_scene' | 'brand_polish';

export interface ReviewSubmission {
    creativeId: string;
    variantId: string;
    reviewerId: string;
    action: ReviewAction;
    notes?: string;
    revision?: {
        type: RevisionType;
        description: string;
        targetTimestamp?: number;
    };
}

export interface ReviewQueue {
    id: string;
    creativeId: string;
    variantId: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    assignedTo?: string;
    status: 'pending' | 'in_progress' | 'completed';
    createdAt: Date;
    dueAt?: Date;
}

export interface ReviewStats {
    totalReviews: number;
    approved: number;
    rejected: number;
    revisionsRequested: number;
    avgReviewTimeMs: number;
}

/**
 * Human Review Service
 */
export class HumanReviewService {

    private reviewQueue: Map<string, ReviewQueue> = new Map();
    private creativesStore: Map<string, AdCreative> = new Map();

    /**
     * Submit creative for review
     */
    async submitForReview(
        creative: AdCreative,
        priority: ReviewQueue['priority'] = 'normal'
    ): Promise<ReviewQueue[]> {
        const queueItems: ReviewQueue[] = [];

        // Create queue item for each variant
        for (const variant of creative.variants) {
            const item: ReviewQueue = {
                id: uuidv4(),
                creativeId: creative.id,
                variantId: variant.id,
                priority,
                status: 'pending',
                createdAt: new Date(),
                dueAt: this.calculateDueDate(priority),
            };

            this.reviewQueue.set(item.id, item);
            queueItems.push(item);
        }

        // Update creative status
        creative.status = 'pending_review';
        this.creativesStore.set(creative.id, creative);

        console.log(`[Review] Submitted creative ${creative.id} with ${queueItems.length} items`);
        return queueItems;
    }

    /**
     * Calculate due date based on priority
     */
    private calculateDueDate(priority: ReviewQueue['priority']): Date {
        const now = new Date();
        const hoursToAdd = {
            urgent: 2,
            high: 8,
            normal: 24,
            low: 48,
        };
        return new Date(now.getTime() + hoursToAdd[priority] * 60 * 60 * 1000);
    }

    /**
     * Get pending reviews for reviewer
     */
    async getPendingReviews(reviewerId?: string): Promise<ReviewQueue[]> {
        const items = Array.from(this.reviewQueue.values())
            .filter(item => {
                if (item.status === 'completed') return false;
                if (reviewerId && item.assignedTo && item.assignedTo !== reviewerId) {
                    return false;
                }
                return true;
            })
            .sort((a, b) => {
                // Sort by priority then by due date
                const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
                if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                }
                return (a.dueAt?.getTime() || 0) - (b.dueAt?.getTime() || 0);
            });

        return items;
    }

    /**
     * Assign review to reviewer
     */
    async assignReview(queueId: string, reviewerId: string): Promise<ReviewQueue> {
        const item = this.reviewQueue.get(queueId);
        if (!item) {
            throw new Error(`Review queue item not found: ${queueId}`);
        }

        item.assignedTo = reviewerId;
        item.status = 'in_progress';
        this.reviewQueue.set(queueId, item);

        console.log(`[Review] Assigned ${queueId} to reviewer ${reviewerId}`);
        return item;
    }

    /**
     * Submit review
     */
    async submitReview(submission: ReviewSubmission): Promise<{
        creative: AdCreative;
        nextAction: 'complete' | 'revision' | 'regenerate';
    }> {
        const creative = this.creativesStore.get(submission.creativeId);
        if (!creative) {
            throw new Error(`Creative not found: ${submission.creativeId}`);
        }

        // Create review note
        const reviewNote: ReviewNote = {
            id: uuidv4(),
            reviewerId: submission.reviewerId,
            action: submission.action,
            notes: submission.notes,
            timestamp: new Date(),
            revisionDetails: submission.revision,
        };

        creative.reviewNotes.push(reviewNote);
        creative.updatedAt = new Date();

        // Update queue item
        const queueItem = Array.from(this.reviewQueue.values())
            .find(q => q.creativeId === submission.creativeId && q.variantId === submission.variantId);
        if (queueItem) {
            queueItem.status = 'completed';
            this.reviewQueue.set(queueItem.id, queueItem);
        }

        // Determine next action based on review
        let nextAction: 'complete' | 'revision' | 'regenerate';

        if (submission.action === 'approve') {
            creative.status = 'approved';
            creative.selectedVariant = submission.variantId;
            creative.approvedAt = new Date();
            nextAction = 'complete';
        } else if (submission.action === 'reject') {
            creative.status = 'rejected';
            nextAction = 'regenerate';
        } else {
            creative.status = 'revision_requested';
            nextAction = 'revision';
        }

        this.creativesStore.set(creative.id, creative);
        console.log(`[Review] Submitted review for ${submission.creativeId}: ${submission.action}`);

        return { creative, nextAction };
    }

    /**
     * Apply revision (trim, re-prompt, replace scene, brand polish)
     */
    async applyRevision(
        creativeId: string,
        revisionType: RevisionType,
        details: Record<string, any>
    ): Promise<AdCreative> {
        const creative = this.creativesStore.get(creativeId);
        if (!creative) {
            throw new Error(`Creative not found: ${creativeId}`);
        }

        console.log(`[Review] Applying ${revisionType} revision to ${creativeId}`);

        switch (revisionType) {
            case 'trim':
                // Adjust timing in prompt structure
                if (details.startMs !== undefined || details.endMs !== undefined) {
                    creative.promptStructure.totalDurationMs =
                        (details.endMs || creative.promptStructure.totalDurationMs) -
                        (details.startMs || 0);
                }
                break;

            case 'reprompt':
                // Update prompt structure with new instructions
                if (details.hookText) {
                    creative.promptStructure.hook.text = details.hookText;
                }
                if (details.ctaText) {
                    creative.promptStructure.cta.text = details.ctaText;
                }
                break;

            case 'replace_scene':
                // Mark scene for replacement
                if (details.sceneIndex !== undefined && details.newDescription) {
                    creative.promptStructure.body[details.sceneIndex] = {
                        ...creative.promptStructure.body[details.sceneIndex],
                        sceneDescription: details.newDescription,
                    };
                }
                break;

            case 'brand_polish':
                // Store brand polish notes for regeneration
                creative.generationConfig = {
                    ...creative.generationConfig,
                    brandPolish: details,
                };
                break;
        }

        creative.status = 'generating'; // Back to generation queue
        creative.updatedAt = new Date();
        this.creativesStore.set(creativeId, creative);

        return creative;
    }

    /**
     * Get review statistics
     */
    async getStats(reviewerId?: string): Promise<ReviewStats> {
        const allCreatives = Array.from(this.creativesStore.values());

        let reviews = allCreatives.flatMap(c => c.reviewNotes);
        if (reviewerId) {
            reviews = reviews.filter(r => r.reviewerId === reviewerId);
        }

        return {
            totalReviews: reviews.length,
            approved: reviews.filter(r => r.action === 'approve').length,
            rejected: reviews.filter(r => r.action === 'reject').length,
            revisionsRequested: reviews.filter(r => r.action === 'request_revision').length,
            avgReviewTimeMs: 5 * 60 * 1000, // 5 minutes average (simulated)
        };
    }

    /**
     * Store creative (for testing/demo)
     */
    storeCreative(creative: AdCreative): void {
        this.creativesStore.set(creative.id, creative);
    }
}

// Singleton instance
export const humanReviewService = new HumanReviewService();
