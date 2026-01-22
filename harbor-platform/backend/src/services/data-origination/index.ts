/**
 * Data Origination - Index
 */

export { ingestionPipeline, IngestionPipeline } from './ingestion-pipeline.js';
export { provenanceTracker, ProvenanceTracker } from './provenance-tracker.js';

export type {
    UploadRequest,
    UploadSession,
    ChunkInfo,
    IngestionJob,
    ProvenanceRecord as IngestionProvenance,
    ProvenanceEntry as IngestionProvenanceEntry,
    RightsDeclaration,
    TranscodedOutput,
} from './ingestion-pipeline.js';

export type {
    ProvenanceRecord,
    ProvenanceEntry,
    ProvenanceAction,
    CaptureInfo,
    ProvenanceQuery,
} from './provenance-tracker.js';
