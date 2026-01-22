/**
 * Data Origination - Provenance Tracker
 * Track origin and chain of custody for all media
 */

import { v4 as uuidv4 } from 'uuid';

export interface ProvenanceRecord {
    id: string;
    mediaId: string;
    sourceHash: string;
    captureInfo?: CaptureInfo;
    originalFilename: string;
    chain: ProvenanceEntry[];
    createdAt: Date;
    lastUpdated: Date;
}

export interface CaptureInfo {
    date?: Date;
    device?: string;
    deviceModel?: string;
    software?: string;
    location?: {
        lat: number;
        lng: number;
        accuracy?: number;
        placeName?: string;
    };
    creator?: string;
    copyright?: string;
}

export interface ProvenanceEntry {
    id: string;
    action: ProvenanceAction;
    timestamp: Date;
    actor: string;
    actorType: 'user' | 'system' | 'api';
    details: Record<string, any>;
    previousHash: string;
    entryHash: string;
}

export type ProvenanceAction =
    | 'created'
    | 'uploaded'
    | 'transcoded'
    | 'annotated'
    | 'reviewed'
    | 'exported'
    | 'licensed'
    | 'accessed'
    | 'modified'
    | 'deleted';

export interface ProvenanceQuery {
    mediaId?: string;
    action?: ProvenanceAction;
    actor?: string;
    startDate?: Date;
    endDate?: Date;
}

/**
 * Provenance Tracker Service
 * Immutable audit trail for all media
 */
export class ProvenanceTracker {

    private records: Map<string, ProvenanceRecord> = new Map();
    private mediaIndex: Map<string, string> = new Map(); // mediaId -> recordId

    /**
     * Create provenance record for new media
     */
    async createRecord(
        mediaId: string,
        sourceHash: string,
        originalFilename: string,
        captureInfo?: CaptureInfo,
        actor: string = 'system'
    ): Promise<ProvenanceRecord> {
        const record: ProvenanceRecord = {
            id: uuidv4(),
            mediaId,
            sourceHash,
            captureInfo,
            originalFilename,
            chain: [],
            createdAt: new Date(),
            lastUpdated: new Date(),
        };

        // Add creation entry
        const entry = this.createEntry('created', actor, 'system', {
            sourceHash,
            originalFilename,
            captureInfo,
        }, '0');

        record.chain.push(entry);

        this.records.set(record.id, record);
        this.mediaIndex.set(mediaId, record.id);

        console.log(`[Provenance] Created record for media: ${mediaId}`);
        return record;
    }

    /**
     * Add entry to provenance chain
     */
    async addEntry(
        mediaId: string,
        action: ProvenanceAction,
        actor: string,
        actorType: 'user' | 'system' | 'api',
        details: Record<string, any>
    ): Promise<ProvenanceEntry> {
        const recordId = this.mediaIndex.get(mediaId);
        if (!recordId) {
            throw new Error(`No provenance record for media: ${mediaId}`);
        }

        const record = this.records.get(recordId)!;

        // Get previous hash
        const previousHash = record.chain.length > 0
            ? record.chain[record.chain.length - 1].entryHash
            : record.sourceHash;

        const entry = this.createEntry(action, actor, actorType, details, previousHash);

        record.chain.push(entry);
        record.lastUpdated = new Date();
        this.records.set(recordId, record);

        console.log(`[Provenance] Added entry: ${action} for media: ${mediaId}`);
        return entry;
    }

    /**
     * Create chain entry with hash
     */
    private createEntry(
        action: ProvenanceAction,
        actor: string,
        actorType: 'user' | 'system' | 'api',
        details: Record<string, any>,
        previousHash: string
    ): ProvenanceEntry {
        const entry: ProvenanceEntry = {
            id: uuidv4(),
            action,
            timestamp: new Date(),
            actor,
            actorType,
            details,
            previousHash,
            entryHash: '', // Will be set below
        };

        // Generate entry hash (in production: use crypto)
        entry.entryHash = this.generateEntryHash(entry);

        return entry;
    }

    /**
     * Generate hash for entry
     */
    private generateEntryHash(entry: Omit<ProvenanceEntry, 'entryHash'>): string {
        const data = JSON.stringify({
            id: entry.id,
            action: entry.action,
            timestamp: entry.timestamp.toISOString(),
            actor: entry.actor,
            previousHash: entry.previousHash,
            details: entry.details,
        });
        return Buffer.from(data).toString('base64').slice(0, 32);
    }

    /**
     * Get provenance record for media
     */
    async getRecord(mediaId: string): Promise<ProvenanceRecord | null> {
        const recordId = this.mediaIndex.get(mediaId);
        if (!recordId) return null;
        return this.records.get(recordId) || null;
    }

    /**
     * Verify chain integrity
     */
    async verifyChain(mediaId: string): Promise<{
        valid: boolean;
        brokenAt?: number;
        error?: string;
    }> {
        const record = await this.getRecord(mediaId);
        if (!record) {
            return { valid: false, error: 'Record not found' };
        }

        let previousHash = record.sourceHash;

        for (let i = 0; i < record.chain.length; i++) {
            const entry = record.chain[i];

            // Verify previous hash link
            if (entry.previousHash !== previousHash) {
                return {
                    valid: false,
                    brokenAt: i,
                    error: `Chain broken at entry ${i}: expected ${previousHash}, got ${entry.previousHash}`
                };
            }

            // Verify entry hash
            const { entryHash: _, ...entryWithoutHash } = entry;
            const expectedHash = this.generateEntryHash(entryWithoutHash);

            if (entry.entryHash !== expectedHash) {
                return {
                    valid: false,
                    brokenAt: i,
                    error: `Entry ${i} hash mismatch`
                };
            }

            previousHash = entry.entryHash;
        }

        return { valid: true };
    }

    /**
     * Query provenance entries
     */
    async queryEntries(query: ProvenanceQuery): Promise<ProvenanceEntry[]> {
        const entries: ProvenanceEntry[] = [];
        const records = query.mediaId
            ? [await this.getRecord(query.mediaId)].filter(Boolean) as ProvenanceRecord[]
            : Array.from(this.records.values());

        for (const record of records) {
            for (const entry of record.chain) {
                if (this.matchesQuery(entry, query)) {
                    entries.push(entry);
                }
            }
        }

        return entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }

    /**
     * Check if entry matches query
     */
    private matchesQuery(entry: ProvenanceEntry, query: ProvenanceQuery): boolean {
        if (query.action && entry.action !== query.action) return false;
        if (query.actor && entry.actor !== query.actor) return false;
        if (query.startDate && entry.timestamp < query.startDate) return false;
        if (query.endDate && entry.timestamp > query.endDate) return false;
        return true;
    }

    /**
     * Export provenance certificate
     */
    async exportCertificate(mediaId: string): Promise<{
        mediaId: string;
        sourceHash: string;
        chainLength: number;
        chainValid: boolean;
        entries: ProvenanceEntry[];
        exportedAt: Date;
        certificateHash: string;
    }> {
        const record = await this.getRecord(mediaId);
        if (!record) {
            throw new Error(`No provenance record for media: ${mediaId}`);
        }

        const verification = await this.verifyChain(mediaId);

        const certificate = {
            mediaId,
            sourceHash: record.sourceHash,
            chainLength: record.chain.length,
            chainValid: verification.valid,
            entries: record.chain,
            exportedAt: new Date(),
            certificateHash: '',
        };

        certificate.certificateHash = Buffer.from(
            JSON.stringify({ ...certificate, certificateHash: undefined })
        ).toString('base64').slice(0, 32);

        return certificate;
    }
}

// Singleton instance
export const provenanceTracker = new ProvenanceTracker();
