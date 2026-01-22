/**
 * Storage Manager - Bin-based data organization
 * Manages file movement through processing stages
 */

import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';
import { EventEmitter } from 'events';

export type Bin = 'pending' | 'processing' | 'rejected' | 'approved';

export type RejectionReason =
    | 'low_resolution'
    | 'corrupted_file'
    | 'nsfw_content'
    | 'deepfake_detected'
    | 'copyright_match'
    | 'duplicate'
    | 'poor_quality'
    | 'no_consent'
    | 'manual_review';

export interface MediaItem {
    id: string;
    uploadId: string;
    filename: string;
    mimeType: string;
    size: number;
    bin: Bin;
    datasetId?: string;
    uploadedAt: Date;
    processedAt?: Date;
    rejectionReason?: RejectionReason;
    annotations?: AnnotationSet;
    metadata: Record<string, any>;
}

export interface AnnotationSet {
    detections?: Detection[];
    segments?: Segment[];
    transcript?: TranscriptEntry[];
    embeddings?: number[];
    sceneLabels?: string[];
}

export interface Detection {
    label: string;
    confidence: number;
    bbox: [number, number, number, number]; // x, y, w, h
    frameIndex?: number;
    timestamp?: number;
}

export interface Segment {
    label: string;
    maskPath: string;
    area: number;
    frameIndex?: number;
}

export interface TranscriptEntry {
    text: string;
    start: number;
    end: number;
    confidence: number;
}

export interface StorageStats {
    pending: { count: number; totalSize: number };
    processing: { count: number; totalSize: number };
    rejected: { count: number; totalSize: number };
    approved: { count: number; totalSize: number };
}

export interface QualityThresholds {
    minResolution: [number, number];
    maxBlurScore: number;
    minBrightness: number;
    maxBrightness: number;
    nsfwThreshold: number;
    deepfakeThreshold: number;
    minDurationSeconds: number;
    maxDurationSeconds: number;
}

const defaultThresholds: QualityThresholds = {
    minResolution: [1280, 720],
    maxBlurScore: 100,
    minBrightness: 0.1,
    maxBrightness: 0.9,
    nsfwThreshold: 0.3,
    deepfakeThreshold: 0.7,
    minDurationSeconds: 3,
    maxDurationSeconds: 600,
};

/**
 * Storage Manager Service
 */
export class StorageManager extends EventEmitter {
    private basePath: string;
    private items: Map<string, MediaItem> = new Map();
    private thresholds: QualityThresholds;

    constructor(basePath: string = './storage', thresholds?: Partial<QualityThresholds>) {
        super();
        this.basePath = basePath;
        this.thresholds = { ...defaultThresholds, ...thresholds };
    }

    /**
     * Initialize storage directories
     */
    async initialize(): Promise<void> {
        const bins: Bin[] = ['pending', 'processing', 'rejected', 'approved'];

        for (const bin of bins) {
            await fs.mkdir(path.join(this.basePath, bin), { recursive: true });
        }

        await fs.mkdir(path.join(this.basePath, 'exports'), { recursive: true });

        console.log(`[Storage] Initialized at ${this.basePath}`);
    }

    /**
     * Register new upload
     */
    async registerUpload(
        uploadId: string,
        filename: string,
        mimeType: string,
        size: number,
        metadata: Record<string, any> = {}
    ): Promise<MediaItem> {
        const item: MediaItem = {
            id: uuidv4(),
            uploadId,
            filename,
            mimeType,
            size,
            bin: 'pending',
            uploadedAt: new Date(),
            metadata,
        };

        this.items.set(item.id, item);

        // Create pending directory
        const itemPath = this.getItemPath(item.id, 'pending');
        await fs.mkdir(path.join(itemPath, 'original'), { recursive: true });

        // Write metadata
        await this.writeMetadata(item);

        this.emit('registered', item);
        console.log(`[Storage] Registered: ${item.id} → pending`);

        return item;
    }

    /**
     * Move item to processing
     */
    async moveToProcessing(mediaId: string): Promise<void> {
        const item = this.items.get(mediaId);
        if (!item) throw new Error(`Item not found: ${mediaId}`);
        if (item.bin !== 'pending') throw new Error(`Item not in pending: ${mediaId}`);

        const oldPath = this.getItemPath(mediaId, 'pending');
        const newPath = this.getItemPath(mediaId, 'processing');

        await fs.mkdir(newPath, { recursive: true });
        await fs.mkdir(path.join(newPath, 'frames'), { recursive: true });
        await fs.mkdir(path.join(newPath, 'temp'), { recursive: true });

        // In production: move actual files
        // await fs.rename(oldPath, newPath);

        item.bin = 'processing';
        await this.writeMetadata(item);

        this.emit('processing', item);
        console.log(`[Storage] Moved: ${mediaId} → processing`);
    }

    /**
     * Move item to approved
     */
    async moveToApproved(
        mediaId: string,
        datasetId: string,
        annotations: AnnotationSet
    ): Promise<void> {
        const item = this.items.get(mediaId);
        if (!item) throw new Error(`Item not found: ${mediaId}`);

        const oldPath = this.getItemPath(mediaId, item.bin);
        const newPath = path.join(this.basePath, 'approved', datasetId, mediaId);

        await fs.mkdir(newPath, { recursive: true });
        await fs.mkdir(path.join(newPath, 'source'), { recursive: true });
        await fs.mkdir(path.join(newPath, 'thumbnails'), { recursive: true });
        await fs.mkdir(path.join(newPath, 'annotations'), { recursive: true });

        item.bin = 'approved';
        item.datasetId = datasetId;
        item.processedAt = new Date();
        item.annotations = annotations;

        // Write annotations
        await this.writeAnnotations(newPath, annotations);
        await this.writeMetadata(item, newPath);

        this.emit('approved', item);
        console.log(`[Storage] Approved: ${mediaId} → ${datasetId}`);
    }

    /**
     * Move item to rejected
     */
    async moveToRejected(mediaId: string, reason: RejectionReason): Promise<void> {
        const item = this.items.get(mediaId);
        if (!item) throw new Error(`Item not found: ${mediaId}`);

        const newPath = this.getItemPath(mediaId, 'rejected');
        await fs.mkdir(newPath, { recursive: true });

        item.bin = 'rejected';
        item.processedAt = new Date();
        item.rejectionReason = reason;

        // Write rejection info
        await fs.writeFile(
            path.join(newPath, 'rejection.json'),
            JSON.stringify({
                mediaId,
                reason,
                timestamp: new Date().toISOString(),
            }, null, 2)
        );

        await this.writeMetadata(item, newPath);

        this.emit('rejected', item);
        console.log(`[Storage] Rejected: ${mediaId} (${reason})`);
    }

    /**
     * Get item by ID
     */
    getItem(mediaId: string): MediaItem | undefined {
        return this.items.get(mediaId);
    }

    /**
     * List items in bin
     */
    listBin(bin: Bin, limit: number = 100): MediaItem[] {
        return Array.from(this.items.values())
            .filter(item => item.bin === bin)
            .slice(0, limit);
    }

    /**
     * List pending items
     */
    listPending(limit: number = 100): MediaItem[] {
        return this.listBin('pending', limit);
    }

    /**
     * List approved by dataset
     */
    listApproved(datasetId?: string, limit: number = 100): MediaItem[] {
        return Array.from(this.items.values())
            .filter(item =>
                item.bin === 'approved' &&
                (!datasetId || item.datasetId === datasetId)
            )
            .slice(0, limit);
    }

    /**
     * Get storage statistics
     */
    async getStats(): Promise<StorageStats> {
        const stats: StorageStats = {
            pending: { count: 0, totalSize: 0 },
            processing: { count: 0, totalSize: 0 },
            rejected: { count: 0, totalSize: 0 },
            approved: { count: 0, totalSize: 0 },
        };

        for (const item of this.items.values()) {
            stats[item.bin].count++;
            stats[item.bin].totalSize += item.size;
        }

        return stats;
    }

    /**
     * Get item path
     */
    getItemPath(mediaId: string, bin: Bin): string {
        return path.join(this.basePath, bin, mediaId);
    }

    /**
     * Get quality thresholds
     */
    getThresholds(): QualityThresholds {
        return { ...this.thresholds };
    }

    /**
     * Update thresholds
     */
    setThresholds(thresholds: Partial<QualityThresholds>): void {
        this.thresholds = { ...this.thresholds, ...thresholds };
    }

    /**
     * Write metadata file
     */
    private async writeMetadata(item: MediaItem, basePath?: string): Promise<void> {
        const metaPath = basePath || this.getItemPath(item.id, item.bin);
        await fs.writeFile(
            path.join(metaPath, 'metadata.json'),
            JSON.stringify(item, null, 2)
        );
    }

    /**
     * Write annotations
     */
    private async writeAnnotations(basePath: string, annotations: AnnotationSet): Promise<void> {
        const annotPath = path.join(basePath, 'annotations');

        if (annotations.detections) {
            await fs.writeFile(
                path.join(annotPath, 'detections.json'),
                JSON.stringify(annotations.detections, null, 2)
            );
        }

        if (annotations.segments) {
            await fs.writeFile(
                path.join(annotPath, 'segments.json'),
                JSON.stringify(annotations.segments, null, 2)
            );
        }

        if (annotations.transcript) {
            await fs.writeFile(
                path.join(annotPath, 'transcript.json'),
                JSON.stringify(annotations.transcript, null, 2)
            );
        }

        if (annotations.embeddings) {
            await fs.writeFile(
                path.join(annotPath, 'embeddings.json'),
                JSON.stringify(annotations.embeddings)
            );
        }
    }
}

// Singleton
export const storageManager = new StorageManager();
