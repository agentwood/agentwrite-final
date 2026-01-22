/**
 * Data Origination - Ingestion Pipeline
 * Accept video/audio uploads, validate, queue for processing
 */

import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';

export interface UploadRequest {
    filename: string;
    mimeType: string;
    sizeBytes: number;
    checksum?: string;
    metadata?: Record<string, any>;
}

export interface UploadSession {
    id: string;
    filename: string;
    mimeType: string;
    expectedSize: number;
    uploadedSize: number;
    chunks: ChunkInfo[];
    status: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed';
    createdAt: Date;
    expiresAt: Date;
    storageUrl?: string;
    error?: string;
}

export interface ChunkInfo {
    index: number;
    size: number;
    checksum: string;
    uploadedAt: Date;
}

export interface IngestionJob {
    id: string;
    uploadSessionId: string;
    sourceUrl: string;
    status: 'queued' | 'processing' | 'transcoding' | 'indexing' | 'completed' | 'failed';
    provenance: ProvenanceRecord;
    rightsDeclaration?: RightsDeclaration;
    outputs: TranscodedOutput[];
    createdAt: Date;
    completedAt?: Date;
    error?: string;
}

export interface ProvenanceRecord {
    sourceHash: string;
    captureDate?: Date;
    captureDevice?: string;
    captureLocation?: { lat: number; lng: number };
    originalFilename: string;
    chain: ProvenanceEntry[];
}

export interface ProvenanceEntry {
    action: 'uploaded' | 'transcoded' | 'annotated' | 'exported';
    timestamp: Date;
    actor: string;
    details?: Record<string, any>;
}

export interface RightsDeclaration {
    declarationType: 'owner' | 'licensed' | 'public_domain' | 'fair_use';
    ownerName?: string;
    ownerContact?: string;
    licenseType?: string;
    restrictions: string[];
    territories: string[];
    declaredAt: Date;
    declaredBy: string;
    attestation?: string;
}

export interface TranscodedOutput {
    quality: '4k' | '1080p' | '720p' | '480p' | 'audio_only';
    format: 'hls' | 'dash' | 'mp4' | 'webm';
    url: string;
    sizeBytes: number;
    durationMs: number;
    bitrate: number;
    createdAt: Date;
}

const ALLOWED_MIME_TYPES = [
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/flac',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024; // 10GB
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
const SESSION_EXPIRY_HOURS = 24;

/**
 * Ingestion Pipeline Service
 */
export class IngestionPipeline extends EventEmitter {

    private sessions: Map<string, UploadSession> = new Map();
    private jobs: Map<string, IngestionJob> = new Map();
    private processingQueue: string[] = [];

    constructor() {
        super();
        // Start background processor
        this.startBackgroundProcessor();
    }

    /**
     * Start a new upload session
     */
    async startUpload(request: UploadRequest): Promise<UploadSession> {
        // Validate mime type
        if (!ALLOWED_MIME_TYPES.includes(request.mimeType)) {
            throw new Error(`Unsupported file type: ${request.mimeType}`);
        }

        // Validate size
        if (request.sizeBytes > MAX_FILE_SIZE) {
            throw new Error(`File too large. Max size: ${MAX_FILE_SIZE} bytes`);
        }

        const session: UploadSession = {
            id: uuidv4(),
            filename: request.filename,
            mimeType: request.mimeType,
            expectedSize: request.sizeBytes,
            uploadedSize: 0,
            chunks: [],
            status: 'pending',
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000),
        };

        this.sessions.set(session.id, session);
        console.log(`[Ingestion] Started upload session: ${session.id}`);

        return session;
    }

    /**
     * Upload a chunk
     */
    async uploadChunk(
        sessionId: string,
        chunkIndex: number,
        data: Buffer,
        checksum: string
    ): Promise<UploadSession> {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error(`Upload session not found: ${sessionId}`);
        }

        if (session.status === 'completed' || session.status === 'failed') {
            throw new Error(`Session already ${session.status}`);
        }

        if (new Date() > session.expiresAt) {
            session.status = 'failed';
            session.error = 'Session expired';
            throw new Error('Upload session expired');
        }

        // Validate chunk
        if (data.length > CHUNK_SIZE * 1.1) { // Allow 10% tolerance
            throw new Error(`Chunk too large. Max: ${CHUNK_SIZE} bytes`);
        }

        // In production: verify checksum, store to object storage
        const chunk: ChunkInfo = {
            index: chunkIndex,
            size: data.length,
            checksum,
            uploadedAt: new Date(),
        };

        session.chunks.push(chunk);
        session.uploadedSize += data.length;
        session.status = 'uploading';

        this.sessions.set(sessionId, session);
        console.log(`[Ingestion] Chunk ${chunkIndex} uploaded for session: ${sessionId}`);

        return session;
    }

    /**
     * Complete upload and start processing
     */
    async completeUpload(sessionId: string): Promise<IngestionJob> {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error(`Upload session not found: ${sessionId}`);
        }

        // Verify all chunks received
        if (session.uploadedSize < session.expectedSize * 0.99) {
            throw new Error(`Incomplete upload. Expected: ${session.expectedSize}, got: ${session.uploadedSize}`);
        }

        session.status = 'processing';
        session.storageUrl = `harbor://media/${sessionId}/${session.filename}`;
        this.sessions.set(sessionId, session);

        // Create ingestion job
        const job = await this.createIngestionJob(session);

        return job;
    }

    /**
     * Create ingestion job for processing
     */
    private async createIngestionJob(session: UploadSession): Promise<IngestionJob> {
        const job: IngestionJob = {
            id: uuidv4(),
            uploadSessionId: session.id,
            sourceUrl: session.storageUrl!,
            status: 'queued',
            provenance: {
                sourceHash: this.generateHash(session),
                originalFilename: session.filename,
                chain: [{
                    action: 'uploaded',
                    timestamp: new Date(),
                    actor: 'system',
                    details: { sessionId: session.id, size: session.uploadedSize },
                }],
            },
            outputs: [],
            createdAt: new Date(),
        };

        this.jobs.set(job.id, job);
        this.processingQueue.push(job.id);

        console.log(`[Ingestion] Created job: ${job.id}`);
        this.emit('job:created', job);

        return job;
    }

    /**
     * Generate provenance hash
     */
    private generateHash(session: UploadSession): string {
        // In production: use actual content hash
        const data = `${session.id}:${session.filename}:${session.uploadedSize}:${session.createdAt.toISOString()}`;
        return Buffer.from(data).toString('base64').slice(0, 32);
    }

    /**
     * Declare rights for a job
     */
    async declareRights(jobId: string, rights: Omit<RightsDeclaration, 'declaredAt'>): Promise<IngestionJob> {
        const job = this.jobs.get(jobId);
        if (!job) {
            throw new Error(`Job not found: ${jobId}`);
        }

        job.rightsDeclaration = {
            ...rights,
            declaredAt: new Date(),
        };

        job.provenance.chain.push({
            action: 'uploaded', // rights declaration is part of upload
            timestamp: new Date(),
            actor: rights.declaredBy,
            details: { rightsType: rights.declarationType },
        });

        this.jobs.set(jobId, job);
        console.log(`[Ingestion] Rights declared for job: ${jobId}`);

        return job;
    }

    /**
     * Get job status
     */
    async getJob(jobId: string): Promise<IngestionJob | null> {
        return this.jobs.get(jobId) || null;
    }

    /**
     * Get session status
     */
    async getSession(sessionId: string): Promise<UploadSession | null> {
        return this.sessions.get(sessionId) || null;
    }

    /**
     * List jobs with filters
     */
    async listJobs(filters?: { status?: string; limit?: number }): Promise<IngestionJob[]> {
        let jobs = Array.from(this.jobs.values());

        if (filters?.status) {
            jobs = jobs.filter(j => j.status === filters.status);
        }

        jobs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        return jobs.slice(0, filters?.limit || 50);
    }

    /**
     * Background processor for queued jobs
     */
    private startBackgroundProcessor(): void {
        setInterval(() => {
            this.processNextJob();
        }, 1000);
    }

    /**
     * Process next job in queue
     */
    private async processNextJob(): Promise<void> {
        const jobId = this.processingQueue.shift();
        if (!jobId) return;

        const job = this.jobs.get(jobId);
        if (!job || job.status !== 'queued') return;

        try {
            job.status = 'processing';
            this.jobs.set(jobId, job);
            this.emit('job:processing', job);

            // Simulate processing steps
            await this.processJob(job);

        } catch (error) {
            job.status = 'failed';
            job.error = error instanceof Error ? error.message : 'Unknown error';
            this.jobs.set(jobId, job);
            this.emit('job:failed', job);
        }
    }

    /**
     * Process a job through all stages
     */
    private async processJob(job: IngestionJob): Promise<void> {
        // Stage 1: Transcoding
        job.status = 'transcoding';
        this.jobs.set(job.id, job);
        await new Promise(resolve => setTimeout(resolve, 500));

        // Add transcoded outputs
        const qualities: Array<'4k' | '1080p' | '720p' | '480p'> = ['1080p', '720p', '480p'];
        for (const quality of qualities) {
            job.outputs.push({
                quality,
                format: 'hls',
                url: `harbor://media/${job.uploadSessionId}/transcoded/${quality}/manifest.m3u8`,
                sizeBytes: Math.floor(Math.random() * 100000000),
                durationMs: 60000, // 1 minute placeholder
                bitrate: quality === '1080p' ? 5000000 : quality === '720p' ? 2500000 : 1000000,
                createdAt: new Date(),
            });
        }

        job.provenance.chain.push({
            action: 'transcoded',
            timestamp: new Date(),
            actor: 'system',
            details: { qualities, format: 'hls' },
        });

        // Stage 2: Indexing
        job.status = 'indexing';
        this.jobs.set(job.id, job);
        await new Promise(resolve => setTimeout(resolve, 300));

        // Complete
        job.status = 'completed';
        job.completedAt = new Date();
        this.jobs.set(job.id, job);

        console.log(`[Ingestion] Job completed: ${job.id}`);
        this.emit('job:completed', job);
    }
}

// Singleton instance
export const ingestionPipeline = new IngestionPipeline();
