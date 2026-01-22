/**
 * Licensing - Revenue Calculator
 * Compute revenue share for contributors
 */

import { v4 as uuidv4 } from 'uuid';
import type { License, RevenueShareEntry, UsageRecord } from './rights-engine.js';

export interface RevenueEvent {
    id: string;
    licenseId: string;

    // Event type
    type: 'payment' | 'usage_fee' | 'bonus' | 'adjustment';

    // Amount
    grossAmount: number;
    netAmount: number;
    platformFee: number;
    currency: string;

    // Period
    periodStart: Date;
    periodEnd: Date;

    // Metadata
    description?: string;

    createdAt: Date;
}

export interface PayoutRecord {
    id: string;
    contributorId: string;

    // Amount
    amount: number;
    currency: string;

    // Source
    revenueEvents: string[];

    // Status
    status: 'pending' | 'processing' | 'completed' | 'failed';

    // Payment details
    paymentMethod?: string;
    transactionId?: string;

    // Timing
    createdAt: Date;
    processedAt?: Date;
}

export interface ContributorEarnings {
    contributorId: string;
    contributorName: string;

    // Totals
    totalEarned: number;
    totalPaid: number;
    pendingPayout: number;

    // By role
    byRole: Record<string, number>;

    // By dataset
    byDataset: Array<{
        datasetId: string;
        datasetName: string;
        amount: number;
    }>;

    // Recent activity
    recentEvents: RevenueEvent[];
}

/**
 * Revenue Calculator Service
 */
export class RevenueCalculator {

    private revenueEvents: Map<string, RevenueEvent[]> = new Map();
    private payoutRecords: Map<string, PayoutRecord[]> = new Map();
    private contributorEarnings: Map<string, number> = new Map();

    private platformFeeRate = 0.15; // 15% platform fee

    /**
     * Record revenue event
     */
    async recordRevenue(params: {
        licenseId: string;
        type: RevenueEvent['type'];
        grossAmount: number;
        currency: string;
        periodStart: Date;
        periodEnd: Date;
        description?: string;
    }): Promise<RevenueEvent> {
        const platformFee = params.grossAmount * this.platformFeeRate;
        const netAmount = params.grossAmount - platformFee;

        const event: RevenueEvent = {
            id: uuidv4(),
            licenseId: params.licenseId,
            type: params.type,
            grossAmount: params.grossAmount,
            netAmount,
            platformFee,
            currency: params.currency,
            periodStart: params.periodStart,
            periodEnd: params.periodEnd,
            description: params.description,
            createdAt: new Date(),
        };

        const existing = this.revenueEvents.get(params.licenseId) || [];
        existing.push(event);
        this.revenueEvents.set(params.licenseId, existing);

        console.log(`[Revenue] Recorded ${params.type} event: $${params.grossAmount} for license ${params.licenseId}`);
        return event;
    }

    /**
     * Calculate distribution for a license
     */
    async calculateDistribution(
        license: License,
        revenueEvent: RevenueEvent
    ): Promise<Array<{ contributorId: string; amount: number }>> {
        const distributions: Array<{ contributorId: string; amount: number }> = [];
        const netAmount = revenueEvent.netAmount;

        for (const share of license.revenueShare) {
            const amount = netAmount * (share.sharePercentage / 100);
            distributions.push({
                contributorId: share.contributorId,
                amount: Math.round(amount * 100) / 100, // Round to cents
            });

            // Update contributor earnings
            const current = this.contributorEarnings.get(share.contributorId) || 0;
            this.contributorEarnings.set(share.contributorId, current + amount);
        }

        console.log(`[Revenue] Distributed $${netAmount} to ${distributions.length} contributors`);
        return distributions;
    }

    /**
     * Create payout for contributor
     */
    async createPayout(
        contributorId: string,
        amount: number,
        currency: string,
        eventIds: string[]
    ): Promise<PayoutRecord> {
        const payout: PayoutRecord = {
            id: uuidv4(),
            contributorId,
            amount,
            currency,
            revenueEvents: eventIds,
            status: 'pending',
            createdAt: new Date(),
        };

        const existing = this.payoutRecords.get(contributorId) || [];
        existing.push(payout);
        this.payoutRecords.set(contributorId, existing);

        console.log(`[Revenue] Created payout ${payout.id}: $${amount} for contributor ${contributorId}`);
        return payout;
    }

    /**
     * Process payout
     */
    async processPayout(payoutId: string): Promise<PayoutRecord> {
        for (const payouts of this.payoutRecords.values()) {
            const payout = payouts.find(p => p.id === payoutId);
            if (payout) {
                payout.status = 'processing';

                // Simulate payment processing
                await new Promise(resolve => setTimeout(resolve, 100));

                payout.status = 'completed';
                payout.processedAt = new Date();
                payout.transactionId = `txn_${uuidv4().slice(0, 8)}`;

                console.log(`[Revenue] Processed payout ${payoutId}`);
                return payout;
            }
        }
        throw new Error(`Payout not found: ${payoutId}`);
    }

    /**
     * Get contributor earnings summary
     */
    async getContributorEarnings(
        contributorId: string,
        contributorName: string
    ): Promise<ContributorEarnings> {
        const totalEarned = this.contributorEarnings.get(contributorId) || 0;

        // Calculate paid amount
        const payouts = this.payoutRecords.get(contributorId) || [];
        const totalPaid = payouts
            .filter(p => p.status === 'completed')
            .reduce((sum, p) => sum + p.amount, 0);

        const pendingPayout = totalEarned - totalPaid;

        // Get recent events (would join with license data in production)
        const recentEvents: RevenueEvent[] = [];

        return {
            contributorId,
            contributorName,
            totalEarned,
            totalPaid,
            pendingPayout,
            byRole: {}, // Would be populated from license share data
            byDataset: [], // Would be populated from license data
            recentEvents,
        };
    }

    /**
     * Calculate usage-based revenue
     */
    async calculateUsageRevenue(
        license: License,
        usageRecords: UsageRecord[]
    ): Promise<number> {
        if (license.pricing.model !== 'usage_based' || !license.pricing.usageRate) {
            return 0;
        }

        const totalRequests = usageRecords.length;
        const revenue = (totalRequests / 1000) * license.pricing.usageRate;

        return Math.round(revenue * 100) / 100;
    }

    /**
     * Get revenue summary for license
     */
    async getLicenseRevenueSummary(licenseId: string): Promise<{
        totalGross: number;
        totalNet: number;
        totalPlatformFee: number;
        eventCount: number;
        byType: Record<string, number>;
    }> {
        const events = this.revenueEvents.get(licenseId) || [];

        const byType: Record<string, number> = {};
        let totalGross = 0;
        let totalNet = 0;
        let totalPlatformFee = 0;

        for (const event of events) {
            totalGross += event.grossAmount;
            totalNet += event.netAmount;
            totalPlatformFee += event.platformFee;
            byType[event.type] = (byType[event.type] || 0) + event.grossAmount;
        }

        return {
            totalGross,
            totalNet,
            totalPlatformFee,
            eventCount: events.length,
            byType,
        };
    }

    /**
     * Get payout history
     */
    async getPayoutHistory(contributorId: string): Promise<PayoutRecord[]> {
        return (this.payoutRecords.get(contributorId) || []).slice().reverse();
    }

    /**
     * Get pending payouts
     */
    async getPendingPayouts(): Promise<PayoutRecord[]> {
        const pending: PayoutRecord[] = [];

        for (const payouts of this.payoutRecords.values()) {
            for (const payout of payouts) {
                if (payout.status === 'pending') {
                    pending.push(payout);
                }
            }
        }

        return pending.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    }

    /**
     * Get platform revenue summary
     */
    async getPlatformRevenue(startDate?: Date, endDate?: Date): Promise<{
        totalFees: number;
        totalProcessed: number;
        licenseCount: number;
    }> {
        let totalFees = 0;
        let totalProcessed = 0;
        let licenseCount = 0;

        for (const [, events] of this.revenueEvents) {
            let hasRelevantEvents = false;

            for (const event of events) {
                if (startDate && event.createdAt < startDate) continue;
                if (endDate && event.createdAt > endDate) continue;

                totalFees += event.platformFee;
                totalProcessed += event.grossAmount;
                hasRelevantEvents = true;
            }

            if (hasRelevantEvents) licenseCount++;
        }

        return { totalFees, totalProcessed, licenseCount };
    }
}

// Singleton instance
export const revenueCalculator = new RevenueCalculator();
