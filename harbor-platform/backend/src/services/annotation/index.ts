/**
 * Annotation Fabric - Index
 */

export { taskManager, TaskManager } from './task-manager.js';
export { reviewEngine, ReviewEngine } from './review-engine.js';

export type {
    TaskType,
    AnnotationTask,
    AnnotationSubmission,
    AnnotationItem,
    TaskTemplate,
} from './task-manager.js';

export type {
    ReviewDecision,
    AgreementMetrics,
    QualityMetrics,
} from './review-engine.js';
