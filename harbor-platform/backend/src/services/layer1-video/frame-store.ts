/**
 * Layer-1 Video Network - Frame Store
 * Frame-addressable storage for media
 */

import { v4 as uuidv4 } from 'uuid';

export interface MediaAsset {
    id: string;
    type: 'video' | 'audio';
    sourceJobId: string;

    // Timing
    durationMs: number;
    frameCount?: number;
    frameRate?: number;

    // Quality tiers
    tiers: QualityTier[];

    // Metadata
    resolution?: { width: number; height: number };
    aspectRatio?: string;
    codec?: string;
    bitrate?: number;

    // Frame index
    frameIndex?: FrameIndex;

    // Status
    status: 'processing' | 'available' | 'archived' | 'deleted';
    createdAt: Date;
    updatedAt: Date;
}

export interface QualityTier {
    quality: '4k' | '1080p' | '720p' | '480p' | 'audio_only';
    format: 'hls' | 'dash' | 'mp4' | 'webm' | 'aac' | 'mp3';
    manifestUrl: string;
    segmentUrls?: string[];
    sizeBytes: number;
    bitrate: number;
}

export interface FrameIndex {
    totalFrames: number;
    keyframes: KeyframeEntry[];
    sceneChanges: number[];
}

export interface KeyframeEntry {
    frameNumber: number;
    timecodeMs: number;
    thumbnailUrl: string;
    embeddings?: number[];
}

export interface FrameAddress {
    mediaId: string;
    frameNumber?: number;
    timecodeMs?: number;
    quality?: string;
}

export interface FrameRange {
    mediaId: string;
    startFrame?: number;
    endFrame?: number;
    startMs?: number;
    endMs?: number;
}

/**
 * Frame Store Service
 */
export class FrameStore {

    private assets: Map<string, MediaAsset> = new Map();

    /**
     * Register new media asset
     */
    async registerAsset(
        jobId: string,
        type: 'video' | 'audio',
        durationMs: number,
        tiers: QualityTier[],
        metadata?: Partial<MediaAsset>
    ): Promise<MediaAsset> {
        const asset: MediaAsset = {
            id: uuidv4(),
            type,
            sourceJobId: jobId,
            durationMs,
            tiers,
            resolution: metadata?.resolution,
            aspectRatio: metadata?.aspectRatio,
            codec: metadata?.codec,
            bitrate: metadata?.bitrate,
            frameCount: metadata?.frameCount,
            frameRate: metadata?.frameRate,
            status: 'available',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        this.assets.set(asset.id, asset);
        console.log(`[FrameStore] Registered asset: ${asset.id}`);

        return asset;
    }

    /**
     * Get asset by ID
     */
    async getAsset(assetId: string): Promise<MediaAsset | null> {
        return this.assets.get(assetId) || null;
    }

    /**
     * Resolve frame address to URL
     */
    async resolveFrameAddress(address: FrameAddress): Promise<{
        url: string;
        timecodeMs: number;
        frameNumber?: number;
    } | null> {
        const asset = this.assets.get(address.mediaId);
        if (!asset) return null;

        // Find best quality tier
        const tier = this.selectTier(asset, address.quality);
        if (!tier) return null;

        let timecodeMs: number;
        let frameNumber: number | undefined;

        if (address.frameNumber !== undefined && asset.frameRate) {
            frameNumber = address.frameNumber;
            timecodeMs = Math.floor((address.frameNumber / asset.frameRate) * 1000);
        } else if (address.timecodeMs !== undefined) {
            timecodeMs = address.timecodeMs;
            if (asset.frameRate) {
                frameNumber = Math.floor((address.timecodeMs / 1000) * asset.frameRate);
            }
        } else {
            timecodeMs = 0;
        }

        // For HLS/DASH, calculate segment
        const url = this.buildUrl(tier, timecodeMs);

        return { url, timecodeMs, frameNumber };
    }

    /**
     * Select best tier for quality request
     */
    private selectTier(asset: MediaAsset, quality?: string): QualityTier | null {
        if (quality) {
            const exact = asset.tiers.find(t => t.quality === quality);
            if (exact) return exact;
        }

        // Default to highest available
        const priorities = ['4k', '1080p', '720p', '480p'];
        for (const q of priorities) {
            const tier = asset.tiers.find(t => t.quality === q);
            if (tier) return tier;
        }

        return asset.tiers[0] || null;
    }

    /**
     * Build URL for timecode
     */
    private buildUrl(tier: QualityTier, timecodeMs: number): string {
        // In production: calculate HLS segment number from timecode
        const segmentDuration = 6000; // 6 second segments
        const segmentIndex = Math.floor(timecodeMs / segmentDuration);

        if (tier.format === 'hls') {
            return `${tier.manifestUrl}#t=${timecodeMs / 1000}`;
        }

        return `${tier.manifestUrl}?t=${timecodeMs}`;
    }

    /**
     * Generate frame index for asset
     */
    async indexFrames(assetId: string, keyframeInterval: number = 30): Promise<FrameIndex> {
        const asset = this.assets.get(assetId);
        if (!asset) {
            throw new Error(`Asset not found: ${assetId}`);
        }

        const frameRate = asset.frameRate || 30;
        const totalFrames = Math.floor((asset.durationMs / 1000) * frameRate);

        // Generate keyframe entries
        const keyframes: KeyframeEntry[] = [];
        for (let f = 0; f < totalFrames; f += keyframeInterval) {
            keyframes.push({
                frameNumber: f,
                timecodeMs: Math.floor((f / frameRate) * 1000),
                thumbnailUrl: `harbor://thumbnails/${assetId}/frame_${f}.jpg`,
            });
        }

        // Detect scene changes (simulated)
        const sceneChanges: number[] = [];
        const avgSceneLength = frameRate * 5; // Average 5 second scenes
        let nextScene = avgSceneLength;
        while (nextScene < totalFrames) {
            sceneChanges.push(nextScene);
            nextScene += avgSceneLength + Math.floor(Math.random() * avgSceneLength);
        }

        const frameIndex: FrameIndex = {
            totalFrames,
            keyframes,
            sceneChanges,
        };

        asset.frameIndex = frameIndex;
        asset.frameCount = totalFrames;
        asset.updatedAt = new Date();
        this.assets.set(assetId, asset);

        console.log(`[FrameStore] Indexed ${totalFrames} frames for asset: ${assetId}`);
        return frameIndex;
    }

    /**
     * Get frame range data
     */
    async getFrameRange(range: FrameRange): Promise<{
        frames: Array<{ frameNumber: number; timecodeMs: number; url: string }>;
        durationMs: number;
    }> {
        const asset = this.assets.get(range.mediaId);
        if (!asset) {
            throw new Error(`Asset not found: ${range.mediaId}`);
        }

        const frameRate = asset.frameRate || 30;

        let startFrame: number;
        let endFrame: number;

        if (range.startFrame !== undefined && range.endFrame !== undefined) {
            startFrame = range.startFrame;
            endFrame = range.endFrame;
        } else if (range.startMs !== undefined && range.endMs !== undefined) {
            startFrame = Math.floor((range.startMs / 1000) * frameRate);
            endFrame = Math.floor((range.endMs / 1000) * frameRate);
        } else {
            startFrame = 0;
            endFrame = asset.frameCount || Math.floor((asset.durationMs / 1000) * frameRate);
        }

        const tier = this.selectTier(asset)!;
        const frames: Array<{ frameNumber: number; timecodeMs: number; url: string }> = [];

        // Sample frames (not every frame - too expensive)
        const sampleInterval = Math.max(1, Math.floor((endFrame - startFrame) / 100));
        for (let f = startFrame; f <= endFrame; f += sampleInterval) {
            const timecodeMs = Math.floor((f / frameRate) * 1000);
            frames.push({
                frameNumber: f,
                timecodeMs,
                url: this.buildUrl(tier, timecodeMs),
            });
        }

        return {
            frames,
            durationMs: Math.floor(((endFrame - startFrame) / frameRate) * 1000),
        };
    }

    /**
     * Get thumbnail for timecode
     */
    async getThumbnail(
        assetId: string,
        timecodeMs: number
    ): Promise<string | null> {
        const asset = this.assets.get(assetId);
        if (!asset || !asset.frameIndex) return null;

        // Find nearest keyframe
        let nearest = asset.frameIndex.keyframes[0];
        for (const kf of asset.frameIndex.keyframes) {
            if (Math.abs(kf.timecodeMs - timecodeMs) < Math.abs(nearest.timecodeMs - timecodeMs)) {
                nearest = kf;
            }
        }

        return nearest.thumbnailUrl;
    }

    /**
     * List assets with filters
     */
    async listAssets(filters?: {
        type?: 'video' | 'audio';
        status?: string;
        limit?: number;
    }): Promise<MediaAsset[]> {
        let assets = Array.from(this.assets.values());

        if (filters?.type) {
            assets = assets.filter(a => a.type === filters.type);
        }
        if (filters?.status) {
            assets = assets.filter(a => a.status === filters.status);
        }

        return assets.slice(0, filters?.limit || 50);
    }

    /**
     * Update asset status
     */
    async updateStatus(assetId: string, status: MediaAsset['status']): Promise<void> {
        const asset = this.assets.get(assetId);
        if (!asset) return;

        asset.status = status;
        asset.updatedAt = new Date();
        this.assets.set(assetId, asset);
    }
}

// Singleton instance
export const frameStore = new FrameStore();
