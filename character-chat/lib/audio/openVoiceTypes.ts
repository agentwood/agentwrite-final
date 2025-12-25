/**
 * TypeScript types for OpenVoice API
 */

export interface OpenVoiceSynthesizeRequest {
  text: string;
  reference_audio_base64?: string;
  reference_audio_url?: string;
  voice_id?: string;
  speed?: number;
  tone?: string;
  emotion?: string;
  accent?: string;
}

export interface OpenVoiceSynthesizeResponse {
  audio_base64: string;
  sample_rate: number;
  format: string;
  duration?: number;
}

export interface OpenVoiceCloneRequest {
  reference_audio: File | Blob | string; // File, Blob, or base64 string
}

export interface OpenVoiceCloneResponse {
  voice_id: string;
  message: string;
}

export interface OpenVoiceHealthResponse {
  status: string;
  openvoice_ready: boolean;
  version: string;
}

export interface OpenVoiceBatchRequest {
  texts: string[];
  voice_id: string;
  speed?: number;
  tone?: string;
}

export interface OpenVoiceBatchResponse {
  results: Array<{
    text: string;
    audio_base64?: string;
    sample_rate?: number;
    format?: string;
    error?: string;
  }>;
  total: number;
  successful: number;
}

export interface VoiceOptions {
  speed?: number;
  tone?: string;
  emotion?: string;
  accent?: string;
}

export interface AudioResponse {
  audio: string; // Base64 PCM audio
  sampleRate: number;
  format: string;
  duration?: number;
}




