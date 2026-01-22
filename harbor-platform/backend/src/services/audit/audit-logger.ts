/**
 * Audit System - Audit Logger
 * Core service for logging platform activity
 */

import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';

export type AuditCategory =
    | 'auth'
    | 'data'
    | 'license'
    | 'admin'
    | 'billing'
    | 'api'
    | 'system';

export type AuditAction =
    // Auth
    | 'auth.login'
    | 'auth.logout'
    | 'auth.signup'
    | 'auth.password_reset'
    | 'auth.mfa_enabled'
    | 'auth.api_key_created'
    // Data
    | 'data.upload'
    | 'data.download'
    | 'data.delete'
    | 'data.annotate'
    | 'data.export'
    | 'data.share'
    // License
    | 'license.create'
    | 'license.activate'
    | 'license.suspend'
    | 'license.verify'
    | 'license.usage'
    // Admin
    | 'admin.user_create'
    | 'admin.user_update'
    | 'admin.user_delete'
    | 'admin.role_assign'
    | 'admin.settings_update'
    // Billing
    | 'billing.payment'
    | 'billing.refund'
    | 'billing.payout'
    | 'billing.subscription'
    // API
    | 'api.request'
    | 'api.rate_limit'
    | 'api.error'
    // System
    | 'system.startup'
    | 'system.shutdown'
    | 'system.error'
    | 'system.maintenance';

export interface AuditEvent {
    id: string;
    timestamp: Date;

    // Actor
    actorId: string;
    actorType: 'user' | 'system' | 'api_key' | 'service';
    actorEmail?: string;
    actorIp?: string;
    actorUserAgent?: string;

    // Action
    category: AuditCategory;
    action: AuditAction | string;

    // Resource
    resource: string;
    resourceId?: string;
    resourceName?: string;

    // Request context
    method?: string;
    path?: string;
    params?: Record<string, any>;

    // Result
    status: 'success' | 'failure' | 'denied';
    statusCode?: number;
    errorCode?: string;
    errorMessage?: string;

    // Timing
    durationMs?: number;

    // Metadata
    metadata?: Record<string, any>;

    // Compliance
    sensitiveFields?: string[];
    retentionDays?: number;
}

export interface AuditLogOptions {
    actorId: string;
    actorType: AuditEvent['actorType'];
    action: AuditAction | string;
    resource: string;
    resourceId?: string;
    status: AuditEvent['status'];
    metadata?: Record<string, any>;
}

export interface RequestContext {
    ip?: string;
    userAgent?: string;
    method?: string;
    path?: string;
    params?: Record<string, any>;
}

/**
 * Audit Logger Service
 */
export class AuditLogger extends EventEmitter {

    private buffer: AuditEvent[] = [];
    private flushInterval: NodeJS.Timeout | null = null;
    private readonly bufferSize: number = 100;
    private readonly flushIntervalMs: number = 5000;

    constructor() {
        super();
        this.startAutoFlush();
    }

    /**
     * Log an audit event
     */
    async log(
        options: AuditLogOptions,
        context?: RequestContext
    ): Promise<AuditEvent> {
        const category = this.extractCategory(options.action);

        const event: AuditEvent = {
            id: uuidv4(),
            timestamp: new Date(),

            actorId: options.actorId,
            actorType: options.actorType,
            actorIp: context?.ip,
            actorUserAgent: context?.userAgent,

            category,
            action: options.action,

            resource: options.resource,
            resourceId: options.resourceId,

            method: context?.method,
            path: context?.path,
            params: context?.params,

            status: options.status,
            metadata: options.metadata,
        };

        this.buffer.push(event);
        this.emit('event', event);

        // Flush if buffer is full
        if (this.buffer.length >= this.bufferSize) {
            await this.flush();
        }

        return event;
    }

    /**
     * Log authentication event
     */
    async logAuth(
        action: 'login' | 'logout' | 'signup' | 'password_reset',
        userId: string,
        status: 'success' | 'failure',
        context?: RequestContext,
        metadata?: Record<string, any>
    ): Promise<AuditEvent> {
        return this.log({
            actorId: userId,
            actorType: 'user',
            action: `auth.${action}`,
            resource: 'user',
            resourceId: userId,
            status,
            metadata,
        }, context);
    }

    /**
     * Log data access event
     */
    async logDataAccess(
        action: 'upload' | 'download' | 'delete' | 'export',
        actorId: string,
        resourceType: string,
        resourceId: string,
        status: 'success' | 'failure' | 'denied',
        context?: RequestContext,
        metadata?: Record<string, any>
    ): Promise<AuditEvent> {
        return this.log({
            actorId,
            actorType: 'user',
            action: `data.${action}`,
            resource: resourceType,
            resourceId,
            status,
            metadata,
        }, context);
    }

    /**
     * Log API request
     */
    async logApiRequest(
        apiKeyId: string,
        path: string,
        method: string,
        status: 'success' | 'failure' | 'denied',
        statusCode: number,
        durationMs: number,
        context?: RequestContext,
        metadata?: Record<string, any>
    ): Promise<AuditEvent> {
        const event = await this.log({
            actorId: apiKeyId,
            actorType: 'api_key',
            action: 'api.request',
            resource: 'api',
            resourceId: path,
            status,
            metadata: {
                ...metadata,
                method,
                statusCode,
                durationMs,
            },
        }, context);

        event.statusCode = statusCode;
        event.durationMs = durationMs;

        return event;
    }

    /**
     * Log license event
     */
    async logLicense(
        action: 'create' | 'activate' | 'suspend' | 'verify' | 'usage',
        actorId: string,
        licenseId: string,
        status: 'success' | 'failure' | 'denied',
        metadata?: Record<string, any>
    ): Promise<AuditEvent> {
        return this.log({
            actorId,
            actorType: 'user',
            action: `license.${action}`,
            resource: 'license',
            resourceId: licenseId,
            status,
            metadata,
        });
    }

    /**
     * Log admin event
     */
    async logAdmin(
        action: 'user_create' | 'user_update' | 'user_delete' | 'role_assign' | 'settings_update',
        adminId: string,
        targetResource: string,
        targetId: string,
        status: 'success' | 'failure',
        metadata?: Record<string, any>
    ): Promise<AuditEvent> {
        return this.log({
            actorId: adminId,
            actorType: 'user',
            action: `admin.${action}`,
            resource: targetResource,
            resourceId: targetId,
            status,
            metadata,
        });
    }

    /**
     * Log billing event
     */
    async logBilling(
        action: 'payment' | 'refund' | 'payout' | 'subscription',
        userId: string,
        amount: number,
        currency: string,
        status: 'success' | 'failure',
        metadata?: Record<string, any>
    ): Promise<AuditEvent> {
        return this.log({
            actorId: userId,
            actorType: 'user',
            action: `billing.${action}`,
            resource: 'billing',
            status,
            metadata: {
                ...metadata,
                amount,
                currency,
            },
        });
    }

    /**
     * Log system event
     */
    async logSystem(
        action: 'startup' | 'shutdown' | 'error' | 'maintenance',
        status: 'success' | 'failure',
        metadata?: Record<string, any>
    ): Promise<AuditEvent> {
        return this.log({
            actorId: 'system',
            actorType: 'system',
            action: `system.${action}`,
            resource: 'system',
            status,
            metadata,
        });
    }

    /**
     * Extract category from action
     */
    private extractCategory(action: string): AuditCategory {
        const parts = action.split('.');
        return (parts[0] as AuditCategory) || 'system';
    }

    /**
     * Flush buffer to storage
     */
    async flush(): Promise<void> {
        if (this.buffer.length === 0) return;

        const events = [...this.buffer];
        this.buffer = [];

        this.emit('flush', events);
        console.log(`[Audit] Flushed ${events.length} events`);
    }

    /**
     * Start auto-flush interval
     */
    private startAutoFlush(): void {
        this.flushInterval = setInterval(() => {
            this.flush();
        }, this.flushIntervalMs);
    }

    /**
     * Stop auto-flush
     */
    stop(): void {
        if (this.flushInterval) {
            clearInterval(this.flushInterval);
            this.flushInterval = null;
        }
        this.flush();
    }

    /**
     * Get buffer size
     */
    getBufferSize(): number {
        return this.buffer.length;
    }
}

// Singleton instance
export const auditLogger = new AuditLogger();
