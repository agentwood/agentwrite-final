/**
 * RAG Engine - Dataset Versioner
 * Version control for datasets with snapshots and rollback
 */

import { v4 as uuidv4 } from 'uuid';

export interface DatasetVersion {
    id: string;
    datasetId: string;
    version: string;

    // Content summary
    itemCount: number;
    sizeBytes: number;

    // Schema
    schema?: Record<string, any>;

    // Diff from previous
    changes?: {
        added: number;
        modified: number;
        removed: number;
    };

    // Metadata
    description?: string;
    tags: string[];

    // Status
    status: 'draft' | 'published' | 'deprecated';

    // Timing
    createdAt: Date;
    createdBy: string;
    publishedAt?: Date;
}

export interface DatasetSnapshot {
    id: string;
    versionId: string;

    // Storage
    storageUrl: string;
    format: 'json' | 'parquet' | 'csv' | 'huggingface';
    sizeBytes: number;
    checksum: string;

    // Compression
    compressed: boolean;
    compressionType?: 'gzip' | 'lz4' | 'zstd';

    createdAt: Date;
    expiresAt?: Date;
}

export interface ExportOptions {
    format: 'json' | 'parquet' | 'csv' | 'huggingface';
    includeMetadata: boolean;
    includeAnnotations: boolean;
    filters?: Record<string, any>;
    limit?: number;
    compress?: boolean;
}

/**
 * Dataset Versioner Service
 */
export class DatasetVersioner {

    private versions: Map<string, DatasetVersion[]> = new Map();
    private snapshots: Map<string, DatasetSnapshot[]> = new Map();

    /**
     * Create new version
     */
    async createVersion(params: {
        datasetId: string;
        itemCount: number;
        sizeBytes: number;
        schema?: Record<string, any>;
        description?: string;
        tags?: string[];
        createdBy: string;
    }): Promise<DatasetVersion> {
        const existing = this.versions.get(params.datasetId) || [];
        const latestVersion = existing.length > 0
            ? existing[existing.length - 1].version
            : '0.0.0';

        const version: DatasetVersion = {
            id: uuidv4(),
            datasetId: params.datasetId,
            version: this.incrementVersion(latestVersion),
            itemCount: params.itemCount,
            sizeBytes: params.sizeBytes,
            schema: params.schema,
            description: params.description,
            tags: params.tags || [],
            status: 'draft',
            createdAt: new Date(),
            createdBy: params.createdBy,
        };

        // Calculate diff from previous
        if (existing.length > 0) {
            const prev = existing[existing.length - 1];
            version.changes = {
                added: Math.max(0, params.itemCount - prev.itemCount),
                modified: 0, // Would need actual content comparison
                removed: Math.max(0, prev.itemCount - params.itemCount),
            };
        }

        existing.push(version);
        this.versions.set(params.datasetId, existing);

        console.log(`[Versioner] Created version ${version.version} for dataset ${params.datasetId}`);
        return version;
    }

    /**
     * Increment semver
     */
    private incrementVersion(version: string): string {
        const parts = version.split('.').map(Number);
        parts[2]++; // Patch
        if (parts[2] >= 100) {
            parts[2] = 0;
            parts[1]++;
        }
        if (parts[1] >= 100) {
            parts[1] = 0;
            parts[0]++;
        }
        return parts.join('.');
    }

    /**
     * Publish version
     */
    async publishVersion(versionId: string): Promise<DatasetVersion> {
        for (const versions of this.versions.values()) {
            const version = versions.find(v => v.id === versionId);
            if (version) {
                version.status = 'published';
                version.publishedAt = new Date();
                console.log(`[Versioner] Published version ${version.version}`);
                return version;
            }
        }
        throw new Error(`Version not found: ${versionId}`);
    }

    /**
     * Deprecate version
     */
    async deprecateVersion(versionId: string): Promise<DatasetVersion> {
        for (const versions of this.versions.values()) {
            const version = versions.find(v => v.id === versionId);
            if (version) {
                version.status = 'deprecated';
                console.log(`[Versioner] Deprecated version ${version.version}`);
                return version;
            }
        }
        throw new Error(`Version not found: ${versionId}`);
    }

    /**
     * Get version by ID
     */
    async getVersion(versionId: string): Promise<DatasetVersion | null> {
        for (const versions of this.versions.values()) {
            const version = versions.find(v => v.id === versionId);
            if (version) return version;
        }
        return null;
    }

    /**
     * List versions for dataset
     */
    async listVersions(datasetId: string): Promise<DatasetVersion[]> {
        return (this.versions.get(datasetId) || []).slice().reverse();
    }

    /**
     * Get latest version
     */
    async getLatestVersion(datasetId: string): Promise<DatasetVersion | null> {
        const versions = this.versions.get(datasetId) || [];
        const published = versions.filter(v => v.status === 'published');
        return published.length > 0 ? published[published.length - 1] : null;
    }

    /**
     * Create snapshot
     */
    async createSnapshot(
        versionId: string,
        options: ExportOptions
    ): Promise<DatasetSnapshot> {
        const version = await this.getVersion(versionId);
        if (!version) {
            throw new Error(`Version not found: ${versionId}`);
        }

        const snapshot: DatasetSnapshot = {
            id: uuidv4(),
            versionId,
            storageUrl: `harbor://snapshots/${version.datasetId}/${version.version}/${uuidv4()}.${options.format}`,
            format: options.format,
            sizeBytes: version.sizeBytes,
            checksum: this.generateChecksum(versionId, options),
            compressed: options.compress || false,
            compressionType: options.compress ? 'gzip' : undefined,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        };

        const existing = this.snapshots.get(versionId) || [];
        existing.push(snapshot);
        this.snapshots.set(versionId, existing);

        console.log(`[Versioner] Created snapshot ${snapshot.id} for version ${versionId}`);
        return snapshot;
    }

    /**
     * Generate checksum
     */
    private generateChecksum(versionId: string, options: ExportOptions): string {
        const data = JSON.stringify({ versionId, options, timestamp: Date.now() });
        return Buffer.from(data).toString('base64').slice(0, 32);
    }

    /**
     * Get snapshot
     */
    async getSnapshot(snapshotId: string): Promise<DatasetSnapshot | null> {
        for (const snapshots of this.snapshots.values()) {
            const snapshot = snapshots.find(s => s.id === snapshotId);
            if (snapshot) return snapshot;
        }
        return null;
    }

    /**
     * List snapshots for version
     */
    async listSnapshots(versionId: string): Promise<DatasetSnapshot[]> {
        return (this.snapshots.get(versionId) || []).slice().reverse();
    }

    /**
     * Export dataset
     */
    async exportDataset(
        datasetId: string,
        versionString?: string,
        options?: Partial<ExportOptions>
    ): Promise<DatasetSnapshot> {
        let version: DatasetVersion | null;

        if (versionString) {
            const versions = this.versions.get(datasetId) || [];
            version = versions.find(v => v.version === versionString) || null;
        } else {
            version = await this.getLatestVersion(datasetId);
        }

        if (!version) {
            throw new Error(`No version found for dataset: ${datasetId}`);
        }

        const exportOptions: ExportOptions = {
            format: options?.format || 'json',
            includeMetadata: options?.includeMetadata ?? true,
            includeAnnotations: options?.includeAnnotations ?? true,
            filters: options?.filters,
            limit: options?.limit,
            compress: options?.compress ?? false,
        };

        return this.createSnapshot(version.id, exportOptions);
    }

    /**
     * Rollback to version
     */
    async rollbackTo(datasetId: string, versionString: string): Promise<DatasetVersion> {
        const versions = this.versions.get(datasetId) || [];
        const targetVersion = versions.find(v => v.version === versionString);

        if (!targetVersion) {
            throw new Error(`Version ${versionString} not found`);
        }

        // Create new version as copy of target
        const rollbackVersion = await this.createVersion({
            datasetId,
            itemCount: targetVersion.itemCount,
            sizeBytes: targetVersion.sizeBytes,
            schema: targetVersion.schema,
            description: `Rollback to ${versionString}`,
            tags: [...targetVersion.tags, 'rollback'],
            createdBy: 'system',
        });

        console.log(`[Versioner] Rolled back ${datasetId} to ${versionString} as ${rollbackVersion.version}`);
        return rollbackVersion;
    }

    /**
     * Compare versions
     */
    async compareVersions(versionIdA: string, versionIdB: string): Promise<{
        versionA: string;
        versionB: string;
        itemCountDiff: number;
        sizeDiff: number;
        schemaDiff: boolean;
        tagsDiff: { added: string[]; removed: string[] };
    }> {
        const vA = await this.getVersion(versionIdA);
        const vB = await this.getVersion(versionIdB);

        if (!vA || !vB) {
            throw new Error('Version not found');
        }

        const tagsA = new Set(vA.tags);
        const tagsB = new Set(vB.tags);

        return {
            versionA: vA.version,
            versionB: vB.version,
            itemCountDiff: vB.itemCount - vA.itemCount,
            sizeDiff: vB.sizeBytes - vA.sizeBytes,
            schemaDiff: JSON.stringify(vA.schema) !== JSON.stringify(vB.schema),
            tagsDiff: {
                added: vB.tags.filter(t => !tagsA.has(t)),
                removed: vA.tags.filter(t => !tagsB.has(t)),
            },
        };
    }
}

// Singleton instance
export const datasetVersioner = new DatasetVersioner();
