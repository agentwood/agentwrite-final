/**
 * Voice Module Index
 * Clean exports for the voice system
 */

// Assets Layer - Voices are assets
export type { VoiceAsset } from './assets';
export {
    VOICE_REGISTRY,
    getVoiceAsset,
    findVoicesBySpec,
    calculateVoiceCompatibility,
} from './assets';

// Contracts Layer - Characters are contracts
export type {
    CharacterContract,
    PsychProfile,
    VoiceRequirements,
} from './contracts';
export {
    loadContract,
    loadAllContracts,
    saveContract,
    validateContractStructure,
    createContract,
} from './contracts';

// Enforcement Layer - Tests are enforcement
export type {
    EnforcementResult,
    ContractViolation,
    ViolationSeverity,
    AcousticAnalysis,
} from './enforcement';
export {
    validateVoiceForContract,
    validateAudioForContract,
    findBestVoiceForContract,
    generateEnforcementReport,
} from './enforcement';
