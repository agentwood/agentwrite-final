/**
 * Annotation Fabric - Task Manager
 * Create and manage annotation tasks
 */

import { v4 as uuidv4 } from 'uuid';

export type TaskType = 'classification' | 'bounding_box' | 'segmentation' | 'transcription' | 'keypoint' | 'temporal';

export interface AnnotationTask {
    id: string;
    mediaId: string;
    taskType: TaskType;

    // Task definition
    name: string;
    instructions: string;
    labels?: string[];
    schema?: Record<string, any>;

    // Frame range (for video)
    startMs?: number;
    endMs?: number;

    // Assignment
    assignedTo: string[];
    requiredSubmissions: number;

    // Submissions
    submissions: AnnotationSubmission[];

    // Review
    status: 'open' | 'in_progress' | 'pending_review' | 'resolved' | 'disputed';
    reviewNotes?: string;

    // Quality
    qualityScore?: number;
    agreementScore?: number;

    // Timing
    priority: 'low' | 'normal' | 'high' | 'urgent';
    deadline?: Date;
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
}

export interface AnnotationSubmission {
    id: string;
    taskId: string;
    labelerId: string;

    // Annotation data
    annotations: AnnotationItem[];

    // Timing
    startedAt: Date;
    submittedAt: Date;
    durationMs: number;

    // Review status
    status: 'pending' | 'approved' | 'rejected' | 'revision_requested';
    reviewedBy?: string;
    reviewNotes?: string;
}

export interface AnnotationItem {
    id: string;
    type: TaskType;

    // Temporal (for video)
    startMs?: number;
    endMs?: number;
    frameNumber?: number;

    // Spatial
    bbox?: { x: number; y: number; width: number; height: number };
    polygon?: Array<{ x: number; y: number }>;
    keypoints?: Array<{ name: string; x: number; y: number; visible: boolean }>;

    // Classification
    label?: string;
    labels?: string[];
    confidence?: number;

    // Transcription
    text?: string;

    // Metadata
    metadata?: Record<string, any>;
}

export interface TaskTemplate {
    id: string;
    name: string;
    taskType: TaskType;
    instructions: string;
    labels?: string[];
    schema?: Record<string, any>;
    requiredSubmissions: number;
}

/**
 * Task Manager Service
 */
export class TaskManager {

    private tasks: Map<string, AnnotationTask> = new Map();
    private templates: Map<string, TaskTemplate> = new Map();
    private mediaTaskIndex: Map<string, string[]> = new Map();

    constructor() {
        this.initializeTemplates();
    }

    /**
     * Initialize default templates
     */
    private initializeTemplates(): void {
        const defaultTemplates: TaskTemplate[] = [
            {
                id: 'object-detection',
                name: 'Object Detection',
                taskType: 'bounding_box',
                instructions: 'Draw bounding boxes around all visible objects and label them.',
                labels: ['person', 'vehicle', 'animal', 'object', 'text'],
                requiredSubmissions: 2,
            },
            {
                id: 'scene-classification',
                name: 'Scene Classification',
                taskType: 'classification',
                instructions: 'Classify the scene type and environment.',
                labels: ['indoor', 'outdoor', 'urban', 'rural', 'nature', 'studio'],
                requiredSubmissions: 3,
            },
            {
                id: 'speech-transcription',
                name: 'Speech Transcription',
                taskType: 'transcription',
                instructions: 'Transcribe all spoken words with timestamps.',
                requiredSubmissions: 2,
            },
            {
                id: 'action-recognition',
                name: 'Action Recognition',
                taskType: 'temporal',
                instructions: 'Mark the start and end times of each action.',
                labels: ['walking', 'running', 'sitting', 'standing', 'talking', 'gesturing'],
                requiredSubmissions: 2,
            },
        ];

        for (const template of defaultTemplates) {
            this.templates.set(template.id, template);
        }
    }

    /**
     * Create annotation task
     */
    async createTask(params: {
        mediaId: string;
        taskType: TaskType;
        name?: string;
        instructions?: string;
        labels?: string[];
        startMs?: number;
        endMs?: number;
        priority?: 'low' | 'normal' | 'high' | 'urgent';
        deadline?: Date;
        requiredSubmissions?: number;
        templateId?: string;
    }): Promise<AnnotationTask> {
        // Use template if provided
        let template: TaskTemplate | undefined;
        if (params.templateId) {
            template = this.templates.get(params.templateId);
        }

        const task: AnnotationTask = {
            id: uuidv4(),
            mediaId: params.mediaId,
            taskType: params.taskType,
            name: params.name || template?.name || `${params.taskType} task`,
            instructions: params.instructions || template?.instructions || '',
            labels: params.labels || template?.labels,
            startMs: params.startMs,
            endMs: params.endMs,
            assignedTo: [],
            requiredSubmissions: params.requiredSubmissions || template?.requiredSubmissions || 2,
            submissions: [],
            status: 'open',
            priority: params.priority || 'normal',
            deadline: params.deadline,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        this.tasks.set(task.id, task);

        // Index by media
        const mediaIndex = this.mediaTaskIndex.get(params.mediaId) || [];
        mediaIndex.push(task.id);
        this.mediaTaskIndex.set(params.mediaId, mediaIndex);

        console.log(`[TaskManager] Created task: ${task.id} for media: ${params.mediaId}`);
        return task;
    }

    /**
     * Get task by ID
     */
    async getTask(taskId: string): Promise<AnnotationTask | null> {
        return this.tasks.get(taskId) || null;
    }

    /**
     * List tasks for labeler
     */
    async listAvailableTasks(
        labelerId: string,
        filters?: { taskType?: TaskType; priority?: string; limit?: number }
    ): Promise<AnnotationTask[]> {
        let tasks = Array.from(this.tasks.values())
            .filter(t => t.status === 'open' || t.status === 'in_progress')
            .filter(t => t.submissions.length < t.requiredSubmissions)
            .filter(t => !t.submissions.some(s => s.labelerId === labelerId));

        if (filters?.taskType) {
            tasks = tasks.filter(t => t.taskType === filters.taskType);
        }
        if (filters?.priority) {
            tasks = tasks.filter(t => t.priority === filters.priority);
        }

        // Sort by priority and deadline
        const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
        tasks.sort((a, b) => {
            const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
            if (pDiff !== 0) return pDiff;
            if (a.deadline && b.deadline) {
                return a.deadline.getTime() - b.deadline.getTime();
            }
            return 0;
        });

        return tasks.slice(0, filters?.limit || 20);
    }

    /**
     * Assign task to labeler
     */
    async assignTask(taskId: string, labelerId: string): Promise<AnnotationTask> {
        const task = this.tasks.get(taskId);
        if (!task) {
            throw new Error(`Task not found: ${taskId}`);
        }

        if (!task.assignedTo.includes(labelerId)) {
            task.assignedTo.push(labelerId);
        }

        if (task.status === 'open') {
            task.status = 'in_progress';
        }

        task.updatedAt = new Date();
        this.tasks.set(taskId, task);

        console.log(`[TaskManager] Assigned task ${taskId} to labeler ${labelerId}`);
        return task;
    }

    /**
     * Submit annotation
     */
    async submitAnnotation(
        taskId: string,
        labelerId: string,
        annotations: AnnotationItem[],
        durationMs: number
    ): Promise<AnnotationSubmission> {
        const task = this.tasks.get(taskId);
        if (!task) {
            throw new Error(`Task not found: ${taskId}`);
        }

        // Check for duplicate submission
        if (task.submissions.some(s => s.labelerId === labelerId)) {
            throw new Error(`Labeler ${labelerId} already submitted for task ${taskId}`);
        }

        const submission: AnnotationSubmission = {
            id: uuidv4(),
            taskId,
            labelerId,
            annotations,
            startedAt: new Date(Date.now() - durationMs),
            submittedAt: new Date(),
            durationMs,
            status: 'pending',
        };

        task.submissions.push(submission);
        task.updatedAt = new Date();

        // Check if we have enough submissions
        if (task.submissions.length >= task.requiredSubmissions) {
            task.status = 'pending_review';
        }

        this.tasks.set(taskId, task);
        console.log(`[TaskManager] Submission ${submission.id} for task ${taskId}`);

        return submission;
    }

    /**
     * Get tasks for media
     */
    async getTasksForMedia(mediaId: string): Promise<AnnotationTask[]> {
        const taskIds = this.mediaTaskIndex.get(mediaId) || [];
        return taskIds.map(id => this.tasks.get(id)!).filter(Boolean);
    }

    /**
     * List templates
     */
    async listTemplates(): Promise<TaskTemplate[]> {
        return Array.from(this.templates.values());
    }

    /**
     * Batch create tasks
     */
    async batchCreateTasks(
        mediaIds: string[],
        templateId: string,
        options?: { priority?: 'low' | 'normal' | 'high' | 'urgent' }
    ): Promise<AnnotationTask[]> {
        const template = this.templates.get(templateId);
        if (!template) {
            throw new Error(`Template not found: ${templateId}`);
        }

        const tasks: AnnotationTask[] = [];
        for (const mediaId of mediaIds) {
            const task = await this.createTask({
                mediaId,
                taskType: template.taskType,
                templateId,
                priority: options?.priority,
            });
            tasks.push(task);
        }

        console.log(`[TaskManager] Batch created ${tasks.length} tasks`);
        return tasks;
    }

    /**
     * Get task stats
     */
    async getStats(): Promise<{
        total: number;
        byStatus: Record<string, number>;
        byType: Record<string, number>;
        avgSubmissionsPerTask: number;
    }> {
        const tasks = Array.from(this.tasks.values());

        const byStatus: Record<string, number> = {};
        const byType: Record<string, number> = {};
        let totalSubmissions = 0;

        for (const task of tasks) {
            byStatus[task.status] = (byStatus[task.status] || 0) + 1;
            byType[task.taskType] = (byType[task.taskType] || 0) + 1;
            totalSubmissions += task.submissions.length;
        }

        return {
            total: tasks.length,
            byStatus,
            byType,
            avgSubmissionsPerTask: tasks.length > 0 ? totalSubmissions / tasks.length : 0,
        };
    }
}

// Singleton instance
export const taskManager = new TaskManager();
