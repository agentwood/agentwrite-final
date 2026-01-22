/**
 * Harbor Ads - Client Intake Service
 * Onboard advertisers and collect brand assets
 */

import { v4 as uuidv4 } from 'uuid';
import type {
    ClientAdProject,
    ClientAsset,
    AdGoals,
    Platform
} from '../../models/ad-project.js';

// In-memory store (use database in production)
const projectsStore: Map<string, ClientAdProject> = new Map();

export interface IntakeFormData {
    clientId: string;
    projectName: string;
    platforms: Platform[];
    goals?: AdGoals;
    targetAudience?: {
        demographics?: string[];
        interests?: string[];
        behaviors?: string[];
    };
    brandGuidelines?: {
        primaryColor?: string;
        secondaryColors?: string[];
        fontFamily?: string;
        tone?: 'professional' | 'casual' | 'playful' | 'luxury' | 'bold';
        doNots?: string[];
    };
}

export interface AssetUpload {
    type: 'logo' | 'video' | 'image' | 'font' | 'audio' | 'brandkit';
    name: string;
    url: string;
    mimeType: string;
    sizeBytes: number;
    metadata?: Record<string, any>;
}

/**
 * Client Intake Service
 */
export class ClientIntakeService {

    /**
     * Create a new ad project
     */
    async createProject(data: IntakeFormData): Promise<ClientAdProject> {
        const project: ClientAdProject = {
            id: uuidv4(),
            clientId: data.clientId,
            name: data.projectName,
            platforms: data.platforms,
            goals: data.goals,
            targetAudience: data.targetAudience,
            brandGuidelines: data.brandGuidelines,
            assets: [],
            status: 'draft',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        projectsStore.set(project.id, project);
        console.log(`[Intake] Created project: ${project.id}`);

        return project;
    }

    /**
     * Get project by ID
     */
    async getProject(projectId: string): Promise<ClientAdProject | null> {
        return projectsStore.get(projectId) || null;
    }

    /**
     * List projects for a client
     */
    async listProjects(clientId: string): Promise<ClientAdProject[]> {
        return Array.from(projectsStore.values())
            .filter(p => p.clientId === clientId);
    }

    /**
     * Submit intake form
     */
    async submitIntake(
        projectId: string,
        data: Partial<IntakeFormData>
    ): Promise<ClientAdProject> {
        const project = projectsStore.get(projectId);
        if (!project) {
            throw new Error(`Project not found: ${projectId}`);
        }

        // Update project with intake data
        const updated: ClientAdProject = {
            ...project,
            ...data,
            status: 'intake_complete',
            updatedAt: new Date(),
        };

        projectsStore.set(projectId, updated);
        console.log(`[Intake] Intake completed for project: ${projectId}`);

        return updated;
    }

    /**
     * Upload asset to project
     */
    async uploadAsset(
        projectId: string,
        asset: AssetUpload
    ): Promise<ClientAsset> {
        const project = projectsStore.get(projectId);
        if (!project) {
            throw new Error(`Project not found: ${projectId}`);
        }

        const newAsset: ClientAsset = {
            id: uuidv4(),
            type: asset.type,
            name: asset.name,
            url: asset.url,
            mimeType: asset.mimeType,
            sizeBytes: asset.sizeBytes,
            metadata: asset.metadata,
            uploadedAt: new Date(),
        };

        project.assets.push(newAsset);
        project.updatedAt = new Date();
        projectsStore.set(projectId, project);

        console.log(`[Intake] Asset uploaded: ${newAsset.id} to project: ${projectId}`);
        return newAsset;
    }

    /**
     * Remove asset from project
     */
    async removeAsset(projectId: string, assetId: string): Promise<void> {
        const project = projectsStore.get(projectId);
        if (!project) {
            throw new Error(`Project not found: ${projectId}`);
        }

        project.assets = project.assets.filter(a => a.id !== assetId);
        project.updatedAt = new Date();
        projectsStore.set(projectId, project);
    }

    /**
     * Validate intake completeness
     */
    validateIntake(project: ClientAdProject): { valid: boolean; missing: string[] } {
        const missing: string[] = [];

        if (!project.platforms || project.platforms.length === 0) {
            missing.push('platforms');
        }
        if (!project.goals) {
            missing.push('goals');
        }
        if (project.assets.filter(a => a.type === 'video').length === 0) {
            missing.push('product_video');
        }
        if (project.assets.filter(a => a.type === 'logo').length === 0) {
            missing.push('logo');
        }

        return {
            valid: missing.length === 0,
            missing,
        };
    }

    /**
     * Update project status
     */
    async updateStatus(
        projectId: string,
        status: ClientAdProject['status']
    ): Promise<ClientAdProject> {
        const project = projectsStore.get(projectId);
        if (!project) {
            throw new Error(`Project not found: ${projectId}`);
        }

        project.status = status;
        project.updatedAt = new Date();
        projectsStore.set(projectId, project);

        return project;
    }
}

// Singleton instance
export const clientIntakeService = new ClientIntakeService();
