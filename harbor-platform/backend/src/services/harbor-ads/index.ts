/**
 * Harbor Ads - Service Index
 * Export all Harbor Ads services
 */

export { clientIntakeService, ClientIntakeService } from './client-intake.js';
export { contentSelectionService, ContentSelectionService } from './content-selection.js';
export { creativeAssemblyService, CreativeAssemblyService } from './creative-assembly.js';
export { generationEngineAdapter, GenerationEngineAdapter } from './generation-engine.js';
export { humanReviewService, HumanReviewService } from './human-review.js';
export { performanceFeedbackService, PerformanceFeedbackService } from './performance-feedback.js';

// Re-export types
export type {
    IntakeFormData,
    AssetUpload
} from './client-intake.js';

export type {
    ContentSource,
    SelectionCriteria,
    ContentSelection
} from './content-selection.js';

export type {
    AdBlueprint,
    ShotListItem,
    ScriptFragment,
    PacingPlan
} from './creative-assembly.js';

export type {
    GenerationConfig,
    GenerationRequest,
    GenerationResult
} from './generation-engine.js';

export type {
    ReviewAction,
    RevisionType,
    ReviewSubmission,
    ReviewQueue,
    ReviewStats
} from './human-review.js';

export type {
    PerformanceReport,
    LearningInsight,
    DatasetImprovement
} from './performance-feedback.js';
