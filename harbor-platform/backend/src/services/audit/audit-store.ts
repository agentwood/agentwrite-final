/**
 * Audit System - Audit Store
 * Storage abstraction for audit events
 */

import { v4 as uuidv4 } from 'uuid';
import type { AuditEvent, AuditCategory } from './audit-logger.js';

export interface AuditQuery {
    actorId?: string;
    actorType?: string;
    category?: AuditCategory;
    action?: string;
    resource?: string;
    resourceId?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
}

export interface AuditStats {
    total: number;
    byCategory: Record<string, number>;
    byStatus: Record<string, number>;
    byDay: Array<{ date: string; count: number }>;
}

export interface AuditExport {
    id: string;
    query: AuditQuery;
    format: 'json' | 'csv';
    status: 'pending' | 'processing' | 'completed' | 'failed';
    url?: string;
    createdAt: Date;
    completedAt?: Date;
}

/**
 * Audit Store Service
 * In-memory implementation (swap for PostgreSQL/Elasticsearch in production)
 */
export class AuditStore {

    private events: AuditEvent[] = [];
    private exports: Map<string, AuditExport> = new Map();
    private readonly maxEvents: number = 100000;

    constructor() {
        // Subscribe to flush events from logger
    }

    /**
     * Store events from flush
     */
    async storeEvents(events: AuditEvent[]): Promise<void> {
        this.events.push(...events);

        // Trim old events if over limit
        if (this.events.length > this.maxEvents) {
            this.events = this.events.slice(-this.maxEvents);
        }
    }

    /**
     * Query events
     */
    async query(query: AuditQuery): Promise<{
        events: AuditEvent[];
        total: number;
        hasMore: boolean;
    }> {
        let filtered = this.events.filter(e => this.matchesQuery(e, query));

        // Sort by timestamp descending
        filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        const total = filtered.length;
        const offset = query.offset || 0;
        const limit = query.limit || 50;

        const events = filtered.slice(offset, offset + limit);

        return {
            events,
            total,
            hasMore: offset + events.length < total,
        };
    }

    /**
     * Match event against query
     */
    private matchesQuery(event: AuditEvent, query: AuditQuery): boolean {
        if (query.actorId && event.actorId !== query.actorId) return false;
        if (query.actorType && event.actorType !== query.actorType) return false;
        if (query.category && event.category !== query.category) return false;
        if (query.action && event.action !== query.action) return false;
        if (query.resource && event.resource !== query.resource) return false;
        if (query.resourceId && event.resourceId !== query.resourceId) return false;
        if (query.status && event.status !== query.status) return false;
        if (query.startDate && event.timestamp < query.startDate) return false;
        if (query.endDate && event.timestamp > query.endDate) return false;
        return true;
    }

    /**
     * Get event by ID
     */
    async getEvent(eventId: string): Promise<AuditEvent | null> {
        return this.events.find(e => e.id === eventId) || null;
    }

    /**
     * Get events for a specific resource
     */
    async getResourceHistory(
        resource: string,
        resourceId: string,
        limit: number = 50
    ): Promise<AuditEvent[]> {
        return this.events
            .filter(e => e.resource === resource && e.resourceId === resourceId)
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, limit);
    }

    /**
     * Get events for a specific actor
     */
    async getActorHistory(actorId: string, limit: number = 50): Promise<AuditEvent[]> {
        return this.events
            .filter(e => e.actorId === actorId)
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, limit);
    }

    /**
     * Get statistics
     */
    async getStats(query?: Partial<AuditQuery>): Promise<AuditStats> {
        let filtered = query
            ? this.events.filter(e => this.matchesQuery(e, query as AuditQuery))
            : this.events;

        const byCategory: Record<string, number> = {};
        const byStatus: Record<string, number> = {};
        const byDayMap: Record<string, number> = {};

        for (const event of filtered) {
            byCategory[event.category] = (byCategory[event.category] || 0) + 1;
            byStatus[event.status] = (byStatus[event.status] || 0) + 1;

            const day = event.timestamp.toISOString().split('T')[0];
            byDayMap[day] = (byDayMap[day] || 0) + 1;
        }

        const byDay = Object.entries(byDayMap)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(-30); // Last 30 days

        return {
            total: filtered.length,
            byCategory,
            byStatus,
            byDay,
        };
    }

    /**
     * Create export job
     */
    async createExport(query: AuditQuery, format: 'json' | 'csv'): Promise<AuditExport> {
        const exportJob: AuditExport = {
            id: uuidv4(),
            query,
            format,
            status: 'pending',
            createdAt: new Date(),
        };

        this.exports.set(exportJob.id, exportJob);

        // Process export async
        this.processExport(exportJob.id);

        return exportJob;
    }

    /**
     * Process export job
     */
    private async processExport(exportId: string): Promise<void> {
        const job = this.exports.get(exportId);
        if (!job) return;

        job.status = 'processing';

        try {
            const result = await this.query({ ...job.query, limit: 10000 });

            // In production: write to S3/GCS
            let data: string;
            if (job.format === 'json') {
                data = JSON.stringify(result.events, null, 2);
            } else {
                // CSV format
                const headers = ['id', 'timestamp', 'actorId', 'action', 'resource', 'status'];
                const rows = result.events.map(e =>
                    headers.map(h => (e as any)[h] || '').join(',')
                );
                data = [headers.join(','), ...rows].join('\n');
            }

            job.url = `harbor://exports/audit/${exportId}.${job.format}`;
            job.status = 'completed';
            job.completedAt = new Date();

            console.log(`[AuditStore] Export completed: ${exportId}`);
        } catch (error) {
            job.status = 'failed';
            console.error(`[AuditStore] Export failed: ${exportId}`, error);
        }
    }

    /**
     * Get export status
     */
    async getExport(exportId: string): Promise<AuditExport | null> {
        return this.exports.get(exportId) || null;
    }

    /**
     * Delete old events
     */
    async purgeOldEvents(beforeDate: Date): Promise<number> {
        const initialCount = this.events.length;
        this.events = this.events.filter(e => e.timestamp >= beforeDate);
        const deleted = initialCount - this.events.length;

        console.log(`[AuditStore] Purged ${deleted} events before ${beforeDate.toISOString()}`);
        return deleted;
    }

    /**
     * Get total event count
     */
    getEventCount(): number {
        return this.events.length;
    }
}

// Singleton instance
export const auditStore = new AuditStore();
