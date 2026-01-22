/**
 * Workflow Orchestration Engine
 * n8n-style workflow execution with state management
 */

import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';
import type {
    WorkflowRun,
    WorkflowStep,
    WorkflowLog,
    StepType,
    StepStatus
} from '../../models/ad-project.js';

export interface WorkflowDefinition {
    type: 'ad_production' | 'revision' | 'batch_generation';
    steps: {
        name: string;
        type: StepType;
        handler: string;
        dependsOn?: string[];
        config?: Record<string, any>;
    }[];
}

export interface StepHandler {
    execute(input: Record<string, any>, config?: Record<string, any>): Promise<Record<string, any>>;
    rollback?(input: Record<string, any>): Promise<void>;
}

/**
 * Workflow Engine
 */
export class WorkflowEngine extends EventEmitter {

    private runsStore: Map<string, WorkflowRun> = new Map();
    private handlers: Map<string, StepHandler> = new Map();

    // Standard workflow definitions
    private workflows: Map<string, WorkflowDefinition> = new Map([
        ['ad_production', {
            type: 'ad_production',
            steps: [
                { name: 'Client Intake', type: 'intake', handler: 'intake' },
                { name: 'Content Selection', type: 'content_selection', handler: 'content_selection', dependsOn: ['intake'] },
                { name: 'Creative Assembly', type: 'creative_assembly', handler: 'creative_assembly', dependsOn: ['content_selection'] },
                { name: 'Generation', type: 'generation', handler: 'generation', dependsOn: ['creative_assembly'] },
                { name: 'Human Review', type: 'human_review', handler: 'human_review', dependsOn: ['generation'] },
                { name: 'Delivery', type: 'delivery', handler: 'delivery', dependsOn: ['human_review'] },
                { name: 'Feedback Collection', type: 'feedback_collection', handler: 'feedback', dependsOn: ['delivery'] },
            ],
        }],
        ['revision', {
            type: 'revision',
            steps: [
                { name: 'Apply Revision', type: 'revision', handler: 'revision' },
                { name: 'Regeneration', type: 'generation', handler: 'generation', dependsOn: ['revision'] },
                { name: 'Review', type: 'human_review', handler: 'human_review', dependsOn: ['generation'] },
            ],
        }],
    ]);

    constructor() {
        super();
        this.registerDefaultHandlers();
    }

    /**
     * Register default step handlers
     */
    private registerDefaultHandlers(): void {
        // Intake handler
        this.registerHandler('intake', {
            execute: async (input) => {
                console.log('[Workflow] Executing intake step');
                return { intakeComplete: true, projectId: input.projectId };
            },
        });

        // Content selection handler
        this.registerHandler('content_selection', {
            execute: async (input) => {
                console.log('[Workflow] Executing content selection step');
                return {
                    selectionComplete: true,
                    selectedSources: input.sources || [],
                };
            },
        });

        // Creative assembly handler
        this.registerHandler('creative_assembly', {
            execute: async (input) => {
                console.log('[Workflow] Executing creative assembly step');
                return {
                    blueprintId: uuidv4(),
                    assemblyComplete: true,
                };
            },
        });

        // Generation handler
        this.registerHandler('generation', {
            execute: async (input) => {
                console.log('[Workflow] Executing generation step');
                // Simulate generation time
                await new Promise(resolve => setTimeout(resolve, 1000));
                return {
                    generationComplete: true,
                    variants: [{ id: uuidv4(), status: 'generated' }],
                };
            },
        });

        // Human review handler
        this.registerHandler('human_review', {
            execute: async (input) => {
                console.log('[Workflow] Executing human review step');
                return {
                    reviewStatus: 'pending_human',
                    requiresAction: true,
                };
            },
        });

        // Delivery handler
        this.registerHandler('delivery', {
            execute: async (input) => {
                console.log('[Workflow] Executing delivery step');
                return {
                    delivered: true,
                    deliveryUrl: `https://delivery.harbor.ai/${input.creativeId}`,
                };
            },
        });

        // Feedback handler
        this.registerHandler('feedback', {
            execute: async (input) => {
                console.log('[Workflow] Executing feedback collection step');
                return { feedbackScheduled: true };
            },
        });

        // Revision handler
        this.registerHandler('revision', {
            execute: async (input) => {
                console.log('[Workflow] Executing revision step');
                return {
                    revisionApplied: true,
                    revisionType: input.revisionType,
                };
            },
        });
    }

    /**
     * Register a step handler
     */
    registerHandler(name: string, handler: StepHandler): void {
        this.handlers.set(name, handler);
    }

    /**
     * Start a workflow run
     */
    async startRun(
        workflowType: WorkflowRun['workflowType'],
        projectId: string,
        initialInput: Record<string, any> = {},
        webhookUrl?: string
    ): Promise<WorkflowRun> {
        const definition = this.workflows.get(workflowType);
        if (!definition) {
            throw new Error(`Unknown workflow type: ${workflowType}`);
        }

        // Create steps from definition
        const steps: WorkflowStep[] = definition.steps.map(stepDef => ({
            id: uuidv4(),
            name: stepDef.name,
            type: stepDef.type,
            status: 'pending' as StepStatus,
            input: {},
            retries: 0,
            maxRetries: 3,
        }));

        // Create run
        const run: WorkflowRun = {
            id: uuidv4(),
            projectId,
            workflowType,
            steps,
            currentState: 'started',
            logs: [],
            webhookUrl,
            startedAt: new Date(),
            status: 'running',
        };

        // Store initial input in first step
        if (steps.length > 0) {
            steps[0].input = initialInput;
            run.currentStepId = steps[0].id;
        }

        this.runsStore.set(run.id, run);
        this.log(run, 'info', 'Workflow started', { workflowType, projectId });

        // Start execution
        this.executeRun(run.id);

        return run;
    }

    /**
     * Execute workflow run
     */
    private async executeRun(runId: string): Promise<void> {
        const run = this.runsStore.get(runId);
        if (!run || run.status !== 'running') return;

        const definition = this.workflows.get(run.workflowType);
        if (!definition) return;

        for (let i = 0; i < run.steps.length; i++) {
            const step = run.steps[i];
            const stepDef = definition.steps[i];

            // Skip completed or skipped steps
            if (step.status === 'completed' || step.status === 'skipped') {
                continue;
            }

            // Check if waiting for human action
            if (step.status === 'waiting_human') {
                run.currentState = 'waiting_human';
                this.runsStore.set(runId, run);
                return;
            }

            // Get handler
            const handler = this.handlers.get(stepDef.handler);
            if (!handler) {
                this.log(run, 'error', `Handler not found: ${stepDef.handler}`, { stepId: step.id });
                step.status = 'failed';
                step.error = `Handler not found: ${stepDef.handler}`;
                run.status = 'failed';
                break;
            }

            // Execute step
            try {
                step.status = 'running';
                step.startedAt = new Date();
                run.currentStepId = step.id;
                run.currentState = step.type;
                this.runsStore.set(runId, run);

                this.log(run, 'info', `Starting step: ${step.name}`, { stepId: step.id });

                const output = await handler.execute(step.input, stepDef.config);

                step.output = output;
                step.status = output.requiresAction ? 'waiting_human' : 'completed';
                step.completedAt = new Date();
                step.durationMs = step.completedAt.getTime() - step.startedAt.getTime();

                this.log(run, 'info', `Completed step: ${step.name}`, { stepId: step.id, durationMs: step.durationMs });

                // Pass output to next step as input
                if (i + 1 < run.steps.length) {
                    run.steps[i + 1].input = { ...run.steps[i + 1].input, ...output };
                }

                // If waiting for human, pause here
                if (step.status === 'waiting_human') {
                    run.currentState = 'waiting_human';
                    this.runsStore.set(runId, run);
                    return;
                }

            } catch (error) {
                step.retries++;
                step.error = error instanceof Error ? error.message : 'Unknown error';

                this.log(run, 'error', `Step failed: ${step.name}`, { stepId: step.id, error: step.error, retries: step.retries });

                if (step.retries >= step.maxRetries) {
                    step.status = 'failed';
                    run.status = 'failed';
                    this.emit('run:failed', run);
                    break;
                } else {
                    // Retry
                    step.status = 'pending';
                    i--; // Retry same step
                    await new Promise(resolve => setTimeout(resolve, 1000 * step.retries)); // Backoff
                }
            }
        }

        // Check if all steps completed
        const allCompleted = run.steps.every(s => s.status === 'completed' || s.status === 'skipped');
        if (allCompleted) {
            run.status = 'completed';
            run.completedAt = new Date();
            run.currentState = 'completed';
            this.log(run, 'info', 'Workflow completed');
            this.emit('run:completed', run);
        }

        this.runsStore.set(runId, run);

        // Send webhook if configured
        if (run.webhookUrl) {
            this.sendWebhook(run);
        }
    }

    /**
     * Resume run after human action
     */
    async resumeRun(runId: string, stepOutput: Record<string, any> = {}): Promise<WorkflowRun> {
        const run = this.runsStore.get(runId);
        if (!run) {
            throw new Error(`Run not found: ${runId}`);
        }

        // Find waiting step
        const waitingStep = run.steps.find(s => s.status === 'waiting_human');
        if (!waitingStep) {
            throw new Error('No step waiting for human action');
        }

        // Complete the waiting step
        waitingStep.output = { ...waitingStep.output, ...stepOutput };
        waitingStep.status = 'completed';
        waitingStep.completedAt = new Date();

        // Pass output to next step
        const waitingIndex = run.steps.indexOf(waitingStep);
        if (waitingIndex + 1 < run.steps.length) {
            run.steps[waitingIndex + 1].input = {
                ...run.steps[waitingIndex + 1].input,
                ...waitingStep.output,
            };
        }

        run.status = 'running';
        this.runsStore.set(runId, run);

        this.log(run, 'info', 'Workflow resumed', { stepId: waitingStep.id });

        // Continue execution
        this.executeRun(runId);

        return run;
    }

    /**
     * Get run status
     */
    async getRun(runId: string): Promise<WorkflowRun | null> {
        return this.runsStore.get(runId) || null;
    }

    /**
     * List runs for project
     */
    async listRuns(projectId: string): Promise<WorkflowRun[]> {
        return Array.from(this.runsStore.values())
            .filter(r => r.projectId === projectId);
    }

    /**
     * Retry failed step
     */
    async retryStep(runId: string, stepId: string): Promise<WorkflowRun> {
        const run = this.runsStore.get(runId);
        if (!run) {
            throw new Error(`Run not found: ${runId}`);
        }

        const step = run.steps.find(s => s.id === stepId);
        if (!step) {
            throw new Error(`Step not found: ${stepId}`);
        }

        if (step.status !== 'failed') {
            throw new Error('Can only retry failed steps');
        }

        step.status = 'pending';
        step.error = undefined;
        run.status = 'running';

        this.runsStore.set(runId, run);
        this.log(run, 'info', 'Retrying step', { stepId });

        this.executeRun(runId);
        return run;
    }

    /**
     * Cancel run
     */
    async cancelRun(runId: string): Promise<WorkflowRun> {
        const run = this.runsStore.get(runId);
        if (!run) {
            throw new Error(`Run not found: ${runId}`);
        }

        run.status = 'cancelled';
        run.completedAt = new Date();
        this.runsStore.set(runId, run);

        this.log(run, 'info', 'Workflow cancelled');
        this.emit('run:cancelled', run);

        return run;
    }

    /**
     * Add log entry
     */
    private log(
        run: WorkflowRun,
        level: WorkflowLog['level'],
        message: string,
        data?: Record<string, any>
    ): void {
        run.logs.push({
            timestamp: new Date(),
            level,
            stepId: run.currentStepId,
            message,
            data,
        });
    }

    /**
     * Send webhook notification
     */
    private async sendWebhook(run: WorkflowRun): Promise<void> {
        if (!run.webhookUrl) return;

        try {
            // In production, use fetch to POST to webhook
            console.log(`[Workflow] Webhook: ${run.webhookUrl}`, {
                runId: run.id,
                status: run.status,
                currentState: run.currentState,
            });
        } catch (error) {
            console.error('[Workflow] Webhook failed:', error);
        }
    }
}

// Singleton instance
export const workflowEngine = new WorkflowEngine();
