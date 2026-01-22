/**
 * Layer-1 Video Network - CDN Manager
 * Content distribution and caching
 */

import { v4 as uuidv4 } from 'uuid';

export interface CDNNode {
    id: string;
    region: string;
    endpoint: string;
    capacity: number;
    currentLoad: number;
    status: 'active' | 'warming' | 'draining' | 'offline';
    latencyMs: number;
}

export interface CacheEntry {
    assetId: string;
    quality: string;
    nodeId: string;
    cachedAt: Date;
    expiresAt: Date;
    hitCount: number;
    sizeBytes: number;
}

export interface DistributionConfig {
    assetId: string;
    regions: string[];
    ttlHours: number;
    priority: 'low' | 'normal' | 'high';
}

export interface DeliveryUrl {
    url: string;
    nodeId: string;
    region: string;
    expiresAt: Date;
    signature?: string;
}

/**
 * CDN Manager Service
 */
export class CDNManager {

    private nodes: Map<string, CDNNode> = new Map();
    private cache: Map<string, CacheEntry[]> = new Map();
    private distributions: Map<string, DistributionConfig> = new Map();

    constructor() {
        this.initializeNodes();
    }

    /**
     * Initialize default CDN nodes
     */
    private initializeNodes(): void {
        const regions = [
            { region: 'us-east-1', latency: 20 },
            { region: 'us-west-2', latency: 40 },
            { region: 'eu-west-1', latency: 80 },
            { region: 'ap-southeast-1', latency: 150 },
            { region: 'ap-northeast-1', latency: 120 },
        ];

        for (const { region, latency } of regions) {
            const node: CDNNode = {
                id: uuidv4(),
                region,
                endpoint: `https://cdn-${region}.harbor.ai`,
                capacity: 1000,
                currentLoad: Math.floor(Math.random() * 500),
                status: 'active',
                latencyMs: latency,
            };
            this.nodes.set(node.id, node);
        }
    }

    /**
     * Distribute asset to CDN
     */
    async distribute(config: DistributionConfig): Promise<{
        distributed: boolean;
        nodes: string[];
        estimatedTimeMs: number;
    }> {
        const nodes: string[] = [];

        for (const node of this.nodes.values()) {
            if (config.regions.includes(node.region) || config.regions.includes('*')) {
                if (node.status === 'active' && node.currentLoad < node.capacity) {
                    nodes.push(node.id);

                    // Create cache entry
                    const entry: CacheEntry = {
                        assetId: config.assetId,
                        quality: 'all',
                        nodeId: node.id,
                        cachedAt: new Date(),
                        expiresAt: new Date(Date.now() + config.ttlHours * 60 * 60 * 1000),
                        hitCount: 0,
                        sizeBytes: 0,
                    };

                    const existing = this.cache.get(config.assetId) || [];
                    existing.push(entry);
                    this.cache.set(config.assetId, existing);
                }
            }
        }

        this.distributions.set(config.assetId, config);

        console.log(`[CDN] Distributed ${config.assetId} to ${nodes.length} nodes`);

        return {
            distributed: nodes.length > 0,
            nodes,
            estimatedTimeMs: nodes.length * 100, // Simulated
        };
    }

    /**
     * Get delivery URL for asset
     */
    async getDeliveryUrl(
        assetId: string,
        quality: string,
        clientRegion?: string
    ): Promise<DeliveryUrl | null> {
        const entries = this.cache.get(assetId);
        if (!entries || entries.length === 0) {
            return null;
        }

        // Select best node based on client region
        let selectedNode: CDNNode | null = null;
        let bestLatency = Infinity;

        for (const entry of entries) {
            const node = this.nodes.get(entry.nodeId);
            if (!node || node.status !== 'active') continue;

            // Prefer same region
            const latency = clientRegion && node.region === clientRegion
                ? node.latencyMs * 0.5
                : node.latencyMs;

            if (latency < bestLatency) {
                bestLatency = latency;
                selectedNode = node;
            }
        }

        if (!selectedNode) return null;

        // Update hit count
        const entry = entries.find(e => e.nodeId === selectedNode!.id);
        if (entry) entry.hitCount++;

        // Generate signed URL
        const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000); // 4 hours
        const signature = this.generateSignature(assetId, quality, expiresAt);

        return {
            url: `${selectedNode.endpoint}/media/${assetId}/${quality}/manifest.m3u8?sig=${signature}`,
            nodeId: selectedNode.id,
            region: selectedNode.region,
            expiresAt,
            signature,
        };
    }

    /**
     * Generate URL signature
     */
    private generateSignature(assetId: string, quality: string, expiresAt: Date): string {
        const data = `${assetId}:${quality}:${expiresAt.getTime()}`;
        return Buffer.from(data).toString('base64').slice(0, 24);
    }

    /**
     * Invalidate cache for asset
     */
    async invalidate(assetId: string): Promise<number> {
        const entries = this.cache.get(assetId);
        if (!entries) return 0;

        const count = entries.length;
        this.cache.delete(assetId);
        this.distributions.delete(assetId);

        console.log(`[CDN] Invalidated ${count} cache entries for ${assetId}`);
        return count;
    }

    /**
     * Get cache stats
     */
    async getStats(): Promise<{
        totalAssets: number;
        totalCacheEntries: number;
        nodeStats: Array<{ nodeId: string; region: string; load: number; status: string }>;
        hitRate: number;
    }> {
        let totalEntries = 0;
        let totalHits = 0;

        for (const entries of this.cache.values()) {
            totalEntries += entries.length;
            totalHits += entries.reduce((sum, e) => sum + e.hitCount, 0);
        }

        return {
            totalAssets: this.cache.size,
            totalCacheEntries: totalEntries,
            nodeStats: Array.from(this.nodes.values()).map(n => ({
                nodeId: n.id,
                region: n.region,
                load: n.currentLoad / n.capacity,
                status: n.status,
            })),
            hitRate: totalEntries > 0 ? totalHits / totalEntries : 0,
        };
    }

    /**
     * Warm cache for asset
     */
    async warmCache(assetId: string, regions: string[]): Promise<void> {
        await this.distribute({
            assetId,
            regions,
            ttlHours: 24,
            priority: 'high',
        });
    }

    /**
     * List nodes
     */
    async listNodes(): Promise<CDNNode[]> {
        return Array.from(this.nodes.values());
    }
}

// Singleton instance
export const cdnManager = new CDNManager();
