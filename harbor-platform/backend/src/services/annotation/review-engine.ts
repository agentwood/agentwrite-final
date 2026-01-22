/**
 * Annotation Fabric - Review Engine
 * Multi-pass review with quality scoring
 */

import { v4 as uuidv4 } from 'uuid';
import type { AnnotationTask, AnnotationSubmission, AnnotationItem } from './task-manager.js';

export interface ReviewDecision {
    id: string;
    taskId: string;
    submissionId: string;
    reviewerId: string;

    decision: 'approve' | 'reject' | 'revision_requested';
    notes?: string;

    // Quality assessment
    accuracyScore?: number;
    completenessScore?: number;

    createdAt: Date;
}

export interface AgreementMetrics {
    taskId: string;
    kappa: number; // Cohen's Kappa
    percentAgreement: number;
    disagreements: Array<{
        itemId: string;
        submissionIds: string[];
        values: any[];
    }>;
}

export interface QualityMetrics {
    labelerId: string;
    taskType: string;
    totalTasks: number;
    approvalRate: number;
    avgAccuracy: number;
    avgCompleteness: number;
    avgTimeMs: number;
}

/**
 * Review Engine Service
 */
export class ReviewEngine {

    private decisions: Map<string, ReviewDecision[]> = new Map();
    private labelerStats: Map<string, QualityMetrics[]> = new Map();

    /**
     * Submit review for a submission
     */
    async submitReview(params: {
        taskId: string;
        submissionId: string;
        reviewerId: string;
        decision: 'approve' | 'reject' | 'revision_requested';
        notes?: string;
        accuracyScore?: number;
        completenessScore?: number;
    }, task: AnnotationTask): Promise<ReviewDecision> {
        const submission = task.submissions.find(s => s.id === params.submissionId);
        if (!submission) {
            throw new Error(`Submission not found: ${params.submissionId}`);
        }

        const decision: ReviewDecision = {
            id: uuidv4(),
            taskId: params.taskId,
            submissionId: params.submissionId,
            reviewerId: params.reviewerId,
            decision: params.decision,
            notes: params.notes,
            accuracyScore: params.accuracyScore,
            completenessScore: params.completenessScore,
            createdAt: new Date(),
        };

        const existing = this.decisions.get(params.submissionId) || [];
        existing.push(decision);
        this.decisions.set(params.submissionId, existing);

        // Update submission status
        submission.status = params.decision === 'approve' ? 'approved' :
            params.decision === 'reject' ? 'rejected' : 'revision_requested';
        submission.reviewedBy = params.reviewerId;
        submission.reviewNotes = params.notes;

        console.log(`[ReviewEngine] Review submitted for ${params.submissionId}: ${params.decision}`);

        return decision;
    }

    /**
     * Calculate inter-annotator agreement
     */
    async calculateAgreement(task: AnnotationTask): Promise<AgreementMetrics> {
        const submissions = task.submissions;
        if (submissions.length < 2) {
            return {
                taskId: task.id,
                kappa: 1,
                percentAgreement: 1,
                disagreements: [],
            };
        }

        // Build annotation pairs for comparison
        const allAnnotations: Map<string, any[]> = new Map();

        for (const submission of submissions) {
            for (const item of submission.annotations) {
                // Key by approximate position/time
                const key = this.getAnnotationKey(item);
                const existing = allAnnotations.get(key) || [];
                existing.push({
                    submissionId: submission.id,
                    labelerId: submission.labelerId,
                    value: item.label || item.labels?.join(',') || item.text || 'unlabeled',
                });
                allAnnotations.set(key, existing);
            }
        }

        // Calculate agreement
        let agreed = 0;
        let total = 0;
        const disagreements: AgreementMetrics['disagreements'] = [];

        for (const [key, values] of allAnnotations) {
            if (values.length < 2) continue;

            total++;
            const uniqueValues = new Set(values.map(v => v.value));

            if (uniqueValues.size === 1) {
                agreed++;
            } else {
                disagreements.push({
                    itemId: key,
                    submissionIds: values.map(v => v.submissionId),
                    values: values.map(v => v.value),
                });
            }
        }

        const percentAgreement = total > 0 ? agreed / total : 1;

        // Simplified Kappa (real implementation would account for chance agreement)
        const kappa = this.calculateKappa(percentAgreement, task.labels?.length || 2);

        task.agreementScore = percentAgreement;

        console.log(`[ReviewEngine] Agreement for task ${task.id}: ${(percentAgreement * 100).toFixed(1)}%`);

        return {
            taskId: task.id,
            kappa,
            percentAgreement,
            disagreements,
        };
    }

    /**
     * Get annotation key for matching
     */
    private getAnnotationKey(item: AnnotationItem): string {
        if (item.frameNumber !== undefined) {
            return `frame_${item.frameNumber}`;
        }
        if (item.startMs !== undefined) {
            return `time_${Math.floor(item.startMs / 1000)}`;
        }
        if (item.bbox) {
            return `bbox_${Math.floor(item.bbox.x / 10)}_${Math.floor(item.bbox.y / 10)}`;
        }
        return item.id;
    }

    /**
     * Calculate Cohen's Kappa (simplified)
     */
    private calculateKappa(observedAgreement: number, numCategories: number): number {
        // Expected agreement by chance
        const chanceAgreement = 1 / numCategories;

        if (chanceAgreement >= 1) return 1;

        return (observedAgreement - chanceAgreement) / (1 - chanceAgreement);
    }

    /**
     * Resolve disagreement
     */
    async resolveDisagreement(
        taskId: string,
        resolution: 'majority' | 'expert' | 'merge',
        expertDecision?: any
    ): Promise<AnnotationItem[]> {
        // This would merge/select the correct annotations
        // For now, return empty - full implementation would select winning labels
        console.log(`[ReviewEngine] Resolved disagreement for task ${taskId}: ${resolution}`);
        return [];
    }

    /**
     * Calculate quality score for task
     */
    async calculateQualityScore(task: AnnotationTask): Promise<number> {
        let score = 0;
        let factors = 0;

        // Factor 1: Agreement score
        if (task.agreementScore !== undefined) {
            score += task.agreementScore * 0.4;
            factors += 0.4;
        }

        // Factor 2: Submission completeness
        const completeness = task.submissions.length / task.requiredSubmissions;
        score += Math.min(1, completeness) * 0.2;
        factors += 0.2;

        // Factor 3: Review approval rate
        const approved = task.submissions.filter(s => s.status === 'approved').length;
        const reviewed = task.submissions.filter(s => s.status !== 'pending').length;
        if (reviewed > 0) {
            score += (approved / reviewed) * 0.4;
            factors += 0.4;
        }

        task.qualityScore = factors > 0 ? score / factors : 0;

        return task.qualityScore;
    }

    /**
     * Get labeler quality metrics
     */
    async getLabelerMetrics(labelerId: string): Promise<QualityMetrics | null> {
        const stats = this.labelerStats.get(labelerId);
        if (!stats || stats.length === 0) return null;

        // Aggregate across task types
        const totals = stats.reduce((acc, s) => ({
            totalTasks: acc.totalTasks + s.totalTasks,
            approvedCount: acc.approvedCount + (s.totalTasks * s.approvalRate),
            accuracy: acc.accuracy + (s.totalTasks * s.avgAccuracy),
            completeness: acc.completeness + (s.totalTasks * s.avgCompleteness),
            time: acc.time + (s.totalTasks * s.avgTimeMs),
        }), { totalTasks: 0, approvedCount: 0, accuracy: 0, completeness: 0, time: 0 });

        return {
            labelerId,
            taskType: 'all',
            totalTasks: totals.totalTasks,
            approvalRate: totals.totalTasks > 0 ? totals.approvedCount / totals.totalTasks : 0,
            avgAccuracy: totals.totalTasks > 0 ? totals.accuracy / totals.totalTasks : 0,
            avgCompleteness: totals.totalTasks > 0 ? totals.completeness / totals.totalTasks : 0,
            avgTimeMs: totals.totalTasks > 0 ? totals.time / totals.totalTasks : 0,
        };
    }

    /**
     * Update labeler stats from submission
     */
    async updateLabelerStats(
        submission: AnnotationSubmission,
        taskType: string,
        approved: boolean,
        accuracy?: number,
        completeness?: number
    ): Promise<void> {
        const existing = this.labelerStats.get(submission.labelerId) || [];

        // Find or create stats for this task type
        let stats = existing.find(s => s.taskType === taskType);
        if (!stats) {
            stats = {
                labelerId: submission.labelerId,
                taskType,
                totalTasks: 0,
                approvalRate: 0,
                avgAccuracy: 0,
                avgCompleteness: 0,
                avgTimeMs: 0,
            };
            existing.push(stats);
        }

        // Update with running average
        const n = stats.totalTasks;
        stats.totalTasks++;
        stats.approvalRate = (stats.approvalRate * n + (approved ? 1 : 0)) / stats.totalTasks;
        stats.avgAccuracy = (stats.avgAccuracy * n + (accuracy || 0)) / stats.totalTasks;
        stats.avgCompleteness = (stats.avgCompleteness * n + (completeness || 0)) / stats.totalTasks;
        stats.avgTimeMs = (stats.avgTimeMs * n + submission.durationMs) / stats.totalTasks;

        this.labelerStats.set(submission.labelerId, existing);
    }

    /**
     * Get review decisions for submission
     */
    async getDecisions(submissionId: string): Promise<ReviewDecision[]> {
        return this.decisions.get(submissionId) || [];
    }
}

// Singleton instance
export const reviewEngine = new ReviewEngine();
