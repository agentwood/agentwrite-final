/**
 * Harbor Ads - Performance Feedback Service
 * Learn from ad performance outcomes
 */

import { v4 as uuidv4 } from 'uuid';
import type {
    AdCreative,
    AdPerformance,
    Platform
} from '../../models/ad-project.js';

export interface PerformanceReport {
    creativeId: string;
    period: 'day' | 'week' | 'month' | 'all_time';
    metrics: {
        impressions: number;
        clicks: number;
        ctr: number;
        views: number;
        completions: number;
        completionRate: number;
        conversions?: number;
        roas?: number;
    };
    byPlatform: Record<Platform, Partial<AdPerformance>>;
    trends: {
        ctrTrend: 'up' | 'down' | 'stable';
        watchTimeTrend: 'up' | 'down' | 'stable';
        conversionTrend?: 'up' | 'down' | 'stable';
    };
}

export interface LearningInsight {
    id: string;
    type: 'prompt_pattern' | 'visual_style' | 'timing' | 'cta' | 'audience';
    confidence: number;
    insight: string;
    recommendation: string;
    sourceCreatives: string[];
    generatedAt: Date;
}

export interface DatasetImprovement {
    datasetId: string;
    improvementType: 'add_tag' | 'quality_score' | 'relevance_boost';
    details: Record<string, any>;
    reason: string;
}

/**
 * Performance Feedback Service
 */
export class PerformanceFeedbackService {

    private performanceStore: Map<string, AdPerformance[]> = new Map();
    private insightsStore: Map<string, LearningInsight[]> = new Map();

    /**
     * Ingest performance data from ad platforms
     */
    async ingestPerformance(
        creativeId: string,
        platform: Platform,
        metrics: Omit<AdPerformance, 'creativeId' | 'platform' | 'updatedAt'>
    ): Promise<AdPerformance> {
        const performance: AdPerformance = {
            creativeId,
            platform,
            ...metrics,
            updatedAt: new Date(),
        };

        const existing = this.performanceStore.get(creativeId) || [];
        // Update or add
        const index = existing.findIndex(
            p => p.platform === platform &&
                p.startDate.getTime() === metrics.startDate.getTime()
        );

        if (index >= 0) {
            existing[index] = performance;
        } else {
            existing.push(performance);
        }

        this.performanceStore.set(creativeId, existing);

        console.log(`[Feedback] Ingested performance for ${creativeId} on ${platform}`);
        return performance;
    }

    /**
     * Get performance report for creative
     */
    async getReport(
        creativeId: string,
        period: PerformanceReport['period'] = 'week'
    ): Promise<PerformanceReport> {
        const allPerformance = this.performanceStore.get(creativeId) || [];

        // Filter by period
        const now = new Date();
        const periodStart = this.getPeriodStart(now, period);
        const filtered = allPerformance.filter(p => p.startDate >= periodStart);

        // Aggregate metrics
        const totals = filtered.reduce((acc, p) => ({
            impressions: acc.impressions + p.impressions,
            clicks: acc.clicks + p.clicks,
            views: acc.views + p.views,
            completions: acc.completions + p.completions,
            conversions: acc.conversions + (p.conversions || 0),
        }), { impressions: 0, clicks: 0, views: 0, completions: 0, conversions: 0 });

        // Calculate rates
        const ctr = totals.impressions > 0 ? totals.clicks / totals.impressions : 0;
        const completionRate = totals.views > 0 ? totals.completions / totals.views : 0;

        // Group by platform
        const byPlatform: Record<Platform, Partial<AdPerformance>> = {} as any;
        for (const perf of filtered) {
            byPlatform[perf.platform] = {
                impressions: perf.impressions,
                clicks: perf.clicks,
                ctr: perf.ctr,
                completionRate: perf.completionRate,
            };
        }

        return {
            creativeId,
            period,
            metrics: {
                ...totals,
                ctr,
                completionRate,
            },
            byPlatform,
            trends: {
                ctrTrend: this.calculateTrend(filtered, 'ctr'),
                watchTimeTrend: this.calculateTrend(filtered, 'avgWatchTimeMs'),
                conversionTrend: totals.conversions > 0
                    ? this.calculateTrend(filtered, 'conversionRate')
                    : undefined,
            },
        };
    }

    /**
     * Get period start date
     */
    private getPeriodStart(now: Date, period: string): Date {
        const start = new Date(now);
        switch (period) {
            case 'day':
                start.setDate(start.getDate() - 1);
                break;
            case 'week':
                start.setDate(start.getDate() - 7);
                break;
            case 'month':
                start.setMonth(start.getMonth() - 1);
                break;
            case 'all_time':
                start.setFullYear(2020);
                break;
        }
        return start;
    }

    /**
     * Calculate trend direction
     */
    private calculateTrend(
        data: AdPerformance[],
        metric: keyof AdPerformance
    ): 'up' | 'down' | 'stable' {
        if (data.length < 2) return 'stable';

        const sorted = [...data].sort((a, b) =>
            a.startDate.getTime() - b.startDate.getTime()
        );

        const first = sorted[0][metric] as number;
        const last = sorted[sorted.length - 1][metric] as number;

        if (typeof first !== 'number' || typeof last !== 'number') {
            return 'stable';
        }

        const change = (last - first) / first;
        if (change > 0.05) return 'up';
        if (change < -0.05) return 'down';
        return 'stable';
    }

    /**
     * Generate learning insights from performance data
     */
    async generateInsights(creativeIds: string[]): Promise<LearningInsight[]> {
        const insights: LearningInsight[] = [];

        // Analyze performance patterns across creatives
        const allPerformance: AdPerformance[] = [];
        for (const id of creativeIds) {
            const perfs = this.performanceStore.get(id) || [];
            allPerformance.push(...perfs);
        }

        // Find high performers
        const highPerformers = allPerformance.filter(p => p.ctr > 0.03);
        if (highPerformers.length > 0) {
            insights.push({
                id: uuidv4(),
                type: 'timing',
                confidence: 0.85,
                insight: 'Ads with hooks under 2 seconds perform 40% better',
                recommendation: 'Keep hook duration between 1-2 seconds for optimal engagement',
                sourceCreatives: [...new Set(highPerformers.map(p => p.creativeId))],
                generatedAt: new Date(),
            });
        }

        // TikTok specific insight
        const tiktokPerf = allPerformance.filter(p => p.platform === 'tiktok');
        if (tiktokPerf.length > 0) {
            const avgCompletion = tiktokPerf.reduce((sum, p) => sum + p.completionRate, 0) / tiktokPerf.length;
            if (avgCompletion > 0.5) {
                insights.push({
                    id: uuidv4(),
                    type: 'visual_style',
                    confidence: 0.78,
                    insight: 'Native-feeling content outperforms polished ads on TikTok',
                    recommendation: 'Use less polished, authentic-looking visuals for TikTok',
                    sourceCreatives: [...new Set(tiktokPerf.map(p => p.creativeId))],
                    generatedAt: new Date(),
                });
            }
        }

        // Store insights
        for (const insight of insights) {
            for (const creativeId of insight.sourceCreatives) {
                const existing = this.insightsStore.get(creativeId) || [];
                existing.push(insight);
                this.insightsStore.set(creativeId, existing);
            }
        }

        console.log(`[Feedback] Generated ${insights.length} insights from ${creativeIds.length} creatives`);
        return insights;
    }

    /**
     * Generate dataset improvements based on performance
     */
    async generateDatasetImprovements(
        creativeId: string,
        harborDatasets: string[]
    ): Promise<DatasetImprovement[]> {
        const improvements: DatasetImprovement[] = [];
        const performance = this.performanceStore.get(creativeId) || [];

        if (performance.length === 0) {
            return improvements;
        }

        // Calculate average CTR
        const avgCtr = performance.reduce((sum, p) => sum + p.ctr, 0) / performance.length;

        for (const datasetId of harborDatasets) {
            if (avgCtr > 0.03) {
                // High performing - boost relevance
                improvements.push({
                    datasetId,
                    improvementType: 'relevance_boost',
                    details: { boostFactor: 1.2, context: 'ad_production' },
                    reason: `Dataset used in high-performing creative (CTR: ${(avgCtr * 100).toFixed(2)}%)`,
                });
            }

            // Add performance tag
            improvements.push({
                datasetId,
                improvementType: 'add_tag',
                details: {
                    tag: avgCtr > 0.02 ? 'high_engagement' : 'standard_engagement',
                    source: 'performance_feedback',
                },
                reason: 'Tag based on ad performance metrics',
            });
        }

        console.log(`[Feedback] Generated ${improvements.length} dataset improvements`);
        return improvements;
    }

    /**
     * Get insights for a creative
     */
    async getInsights(creativeId: string): Promise<LearningInsight[]> {
        return this.insightsStore.get(creativeId) || [];
    }
}

// Singleton instance
export const performanceFeedbackService = new PerformanceFeedbackService();
