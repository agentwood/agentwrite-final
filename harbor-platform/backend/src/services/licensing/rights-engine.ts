/**
 * Licensing - Rights Engine
 * Enforce access rights with territory and usage restrictions
 */

import { v4 as uuidv4 } from 'uuid';

export interface License {
    id: string;
    datasetId: string;
    name: string;

    // Type
    type: 'exclusive' | 'non_exclusive' | 'evaluation' | 'research' | 'enterprise';

    // Grantee
    granteeId: string;
    granteeName: string;
    granteeType: 'individual' | 'company' | 'academic' | 'nonprofit';

    // Validity
    validFrom: Date;
    validUntil: Date;

    // Territories
    territories: string[]; // ISO country codes or 'worldwide'

    // Usage limits
    usageLimits: {
        maxRequests?: number;
        maxDataTransferBytes?: number;
        maxExports?: number;
        allowedUses: string[];
        prohibitedUses: string[];
    };

    // Pricing
    pricing: {
        model: 'one_time' | 'monthly' | 'annual' | 'usage_based';
        basePrice: number;
        currency: string;
        usageRate?: number; // per 1000 requests
    };

    // Revenue share
    revenueShare: RevenueShareEntry[];

    // Restrictions
    restrictions: string[];

    // Status
    status: 'pending' | 'active' | 'suspended' | 'expired' | 'terminated';

    // Audit
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
}

export interface RevenueShareEntry {
    contributorId: string;
    contributorName: string;
    sharePercentage: number;
    role: 'creator' | 'annotator' | 'curator' | 'platform';
}

export interface UsageRecord {
    id: string;
    licenseId: string;

    // What was accessed
    action: 'query' | 'download' | 'stream' | 'export' | 'api_call';
    datasetId: string;
    itemCount?: number;
    bytesTransferred?: number;

    // Who accessed
    userId: string;
    ipAddress?: string;
    userAgent?: string;

    // Where
    territory?: string;

    // When
    timestamp: Date;
    durationMs?: number;
}

export interface AccessCheck {
    allowed: boolean;
    reason?: string;
    licenseId?: string;
    remainingQuota?: {
        requests: number;
        bytes: number;
        exports: number;
    };
}

/**
 * Rights Engine Service
 */
export class RightsEngine {

    private licenses: Map<string, License> = new Map();
    private usageRecords: Map<string, UsageRecord[]> = new Map();
    private datasetLicenseIndex: Map<string, string[]> = new Map();
    private granteeLicenseIndex: Map<string, string[]> = new Map();

    /**
     * Create license
     */
    async createLicense(params: Omit<License, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<License> {
        const license: License = {
            id: uuidv4(),
            ...params,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        this.licenses.set(license.id, license);

        // Index by dataset
        const datasetIdx = this.datasetLicenseIndex.get(params.datasetId) || [];
        datasetIdx.push(license.id);
        this.datasetLicenseIndex.set(params.datasetId, datasetIdx);

        // Index by grantee
        const granteeIdx = this.granteeLicenseIndex.get(params.granteeId) || [];
        granteeIdx.push(license.id);
        this.granteeLicenseIndex.set(params.granteeId, granteeIdx);

        console.log(`[Rights] Created license ${license.id} for dataset ${params.datasetId}`);
        return license;
    }

    /**
     * Activate license
     */
    async activateLicense(licenseId: string): Promise<License> {
        const license = this.licenses.get(licenseId);
        if (!license) {
            throw new Error(`License not found: ${licenseId}`);
        }

        license.status = 'active';
        license.updatedAt = new Date();
        this.licenses.set(licenseId, license);

        console.log(`[Rights] Activated license ${licenseId}`);
        return license;
    }

    /**
     * Check access permissions
     */
    async checkAccess(params: {
        granteeId: string;
        datasetId: string;
        action: UsageRecord['action'];
        territory?: string;
        bytesRequested?: number;
    }): Promise<AccessCheck> {
        // Find active license
        const licenseIds = this.granteeLicenseIndex.get(params.granteeId) || [];

        for (const licenseId of licenseIds) {
            const license = this.licenses.get(licenseId);
            if (!license) continue;
            if (license.datasetId !== params.datasetId) continue;
            if (license.status !== 'active') continue;

            // Check validity period
            const now = new Date();
            if (now < license.validFrom || now > license.validUntil) {
                continue;
            }

            // Check territory
            if (params.territory && !this.checkTerritory(license, params.territory)) {
                continue;
            }

            // Check usage limits
            const usage = await this.getUsageStats(licenseId);
            const quota = this.checkQuota(license, usage, params);

            if (!quota.withinLimits) {
                return {
                    allowed: false,
                    reason: quota.reason,
                    licenseId: license.id,
                };
            }

            // Check prohibited uses
            if (license.usageLimits.prohibitedUses.includes(params.action)) {
                return {
                    allowed: false,
                    reason: `Action ${params.action} is prohibited`,
                    licenseId: license.id,
                };
            }

            // Access granted
            return {
                allowed: true,
                licenseId: license.id,
                remainingQuota: {
                    requests: (license.usageLimits.maxRequests || Infinity) - usage.requests,
                    bytes: (license.usageLimits.maxDataTransferBytes || Infinity) - usage.bytes,
                    exports: (license.usageLimits.maxExports || Infinity) - usage.exports,
                },
            };
        }

        return {
            allowed: false,
            reason: 'No valid license found for this dataset',
        };
    }

    /**
     * Check territory restriction
     */
    private checkTerritory(license: License, territory: string): boolean {
        if (license.territories.includes('worldwide')) return true;
        return license.territories.includes(territory);
    }

    /**
     * Check quota limits
     */
    private checkQuota(
        license: License,
        usage: { requests: number; bytes: number; exports: number },
        request: { action: string; bytesRequested?: number }
    ): { withinLimits: boolean; reason?: string } {
        const limits = license.usageLimits;

        if (limits.maxRequests && usage.requests >= limits.maxRequests) {
            return { withinLimits: false, reason: 'Request quota exceeded' };
        }

        if (limits.maxDataTransferBytes) {
            const bytesAfter = usage.bytes + (request.bytesRequested || 0);
            if (bytesAfter > limits.maxDataTransferBytes) {
                return { withinLimits: false, reason: 'Data transfer quota exceeded' };
            }
        }

        if (limits.maxExports && request.action === 'export' && usage.exports >= limits.maxExports) {
            return { withinLimits: false, reason: 'Export quota exceeded' };
        }

        return { withinLimits: true };
    }

    /**
     * Record usage
     */
    async recordUsage(params: Omit<UsageRecord, 'id' | 'timestamp'>): Promise<UsageRecord> {
        const record: UsageRecord = {
            id: uuidv4(),
            ...params,
            timestamp: new Date(),
        };

        const existing = this.usageRecords.get(params.licenseId) || [];
        existing.push(record);
        this.usageRecords.set(params.licenseId, existing);

        return record;
    }

    /**
     * Get usage stats for license
     */
    async getUsageStats(licenseId: string): Promise<{
        requests: number;
        bytes: number;
        exports: number;
    }> {
        const records = this.usageRecords.get(licenseId) || [];

        return {
            requests: records.length,
            bytes: records.reduce((sum, r) => sum + (r.bytesTransferred || 0), 0),
            exports: records.filter(r => r.action === 'export').length,
        };
    }

    /**
     * Get license by ID
     */
    async getLicense(licenseId: string): Promise<License | null> {
        return this.licenses.get(licenseId) || null;
    }

    /**
     * List licenses for dataset
     */
    async listDatasetLicenses(datasetId: string): Promise<License[]> {
        const ids = this.datasetLicenseIndex.get(datasetId) || [];
        return ids.map(id => this.licenses.get(id)!).filter(Boolean);
    }

    /**
     * List licenses for grantee
     */
    async listGranteeLicenses(granteeId: string): Promise<License[]> {
        const ids = this.granteeLicenseIndex.get(granteeId) || [];
        return ids.map(id => this.licenses.get(id)!).filter(Boolean);
    }

    /**
     * Suspend license
     */
    async suspendLicense(licenseId: string, reason: string): Promise<License> {
        const license = this.licenses.get(licenseId);
        if (!license) {
            throw new Error(`License not found: ${licenseId}`);
        }

        license.status = 'suspended';
        license.restrictions.push(`Suspended: ${reason}`);
        license.updatedAt = new Date();
        this.licenses.set(licenseId, license);

        console.log(`[Rights] Suspended license ${licenseId}: ${reason}`);
        return license;
    }

    /**
     * Terminate license
     */
    async terminateLicense(licenseId: string): Promise<License> {
        const license = this.licenses.get(licenseId);
        if (!license) {
            throw new Error(`License not found: ${licenseId}`);
        }

        license.status = 'terminated';
        license.updatedAt = new Date();
        this.licenses.set(licenseId, license);

        console.log(`[Rights] Terminated license ${licenseId}`);
        return license;
    }

    /**
     * Get usage records
     */
    async getUsageRecords(licenseId: string, limit?: number): Promise<UsageRecord[]> {
        const records = this.usageRecords.get(licenseId) || [];
        return records.slice(-(limit || 100)).reverse();
    }
}

// Singleton instance
export const rightsEngine = new RightsEngine();
