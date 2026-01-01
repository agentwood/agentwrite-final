/**
 * OpenVoice API Client
 * HTTP client for communicating with OpenVoice server
 */

import {
  OpenVoiceSynthesizeRequest,
  OpenVoiceSynthesizeResponse,
  OpenVoiceCloneRequest,
  OpenVoiceCloneResponse,
  OpenVoiceHealthResponse,
  OpenVoiceBatchRequest,
  OpenVoiceBatchResponse,
  VoiceOptions,
  AudioResponse,
} from './openVoiceTypes';

const DEFAULT_API_URL = process.env.OPENVOICE_API_URL || process.env.OPENVOICE_LOCAL_URL || 'http://localhost:8000';
const DEFAULT_TIMEOUT = 5000; // Reduced to 5 seconds to avoid long wait times
const DEFAULT_RETRIES = 1; // Reduced to 1 retry
const DEFAULT_RETRY_DELAY = 1000; // 1 second

export class OpenVoiceClient {
  private apiUrl: string;
  private timeout: number;
  private retries: number;
  private retryDelay: number;

  private static isServerDown: boolean = false;
  private static lastFailureTime: number = 0;
  private static readonly CIRCUIT_BREAKER_MS = 60000; // 1 minute

  constructor(
    apiUrl: string = DEFAULT_API_URL,
    timeout: number = DEFAULT_TIMEOUT,
    retries: number = DEFAULT_RETRIES,
    retryDelay: number = DEFAULT_RETRY_DELAY
  ) {
    this.apiUrl = apiUrl.replace(/\/$/, ''); // Remove trailing slash
    this.timeout = timeout;
    this.retries = retries;
    this.retryDelay = retryDelay;
  }

  /**
   * Check if OpenVoice server is healthy
   */
  async healthCheck(): Promise<OpenVoiceHealthResponse> {
    const response = await this.fetchWithRetry('/health', {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Clone voice from reference audio
   */
  async cloneVoice(referenceAudio: string | File | Blob): Promise<string> {
    let formData: FormData;

    if (typeof referenceAudio === 'string') {
      // Base64 string - convert to blob
      const binaryString = atob(referenceAudio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'audio/wav' });
      formData = new FormData();
      formData.append('reference_audio', blob, 'reference.wav');
    } else {
      // File or Blob
      formData = new FormData();
      formData.append('reference_audio', referenceAudio, 'reference.wav');
    }

    const response = await this.fetchWithRetry('/clone', {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - browser will set it with boundary
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(error.detail || `Voice cloning failed: ${response.statusText}`);
    }

    const data: OpenVoiceCloneResponse = await response.json();
    return data.voice_id;
  }

  /**
   * Synthesize speech from text using cloned voice
   */
  async synthesize(
    text: string,
    voiceId: string | { referenceAudioBase64: string },
    options: VoiceOptions = {}
  ): Promise<AudioResponse> {
    const requestBody: OpenVoiceSynthesizeRequest = {
      text,
      speed: options.speed || 1.0,
      tone: options.tone,
      emotion: options.emotion,
      accent: options.accent,
    };

    // Handle voice source
    if (typeof voiceId === 'string') {
      requestBody.voice_id = voiceId;
    } else {
      requestBody.reference_audio_base64 = voiceId.referenceAudioBase64;
    }

    const response = await this.fetchWithRetry('/synthesize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(error.detail || `Synthesis failed: ${response.statusText}`);
    }

    const data: OpenVoiceSynthesizeResponse = await response.json();

    return {
      audio: data.audio_base64,
      sampleRate: data.sample_rate,
      format: data.format,
      duration: data.duration,
    };
  }

  /**
   * Batch synthesize multiple texts with same voice
   */
  async synthesizeBatch(
    texts: string[],
    voiceId: string,
    options: VoiceOptions = {}
  ): Promise<AudioResponse[]> {
    const requestBody: OpenVoiceBatchRequest = {
      texts,
      voice_id: voiceId,
      speed: options.speed || 1.0,
      tone: options.tone,
    };

    const response = await this.fetchWithRetry('/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(error.detail || `Batch synthesis failed: ${response.statusText}`);
    }

    const data: OpenVoiceBatchResponse = await response.json();

    return data.results
      .filter(r => r.audio_base64 && !r.error)
      .map(r => ({
        audio: r.audio_base64!,
        sampleRate: r.sample_rate || 24000,
        format: r.format || 'pcm',
      }));
  }

  /**
   * Fetch with retry logic
   */
  private async fetchWithRetry(
    endpoint: string,
    options: RequestInit = {},
    retryCount: number = 0
  ): Promise<Response> {
    const url = `${this.apiUrl}${endpoint}`;

    // Circuit breaker: skip if server is known to be down
    if (OpenVoiceClient.isServerDown && Date.now() - OpenVoiceClient.lastFailureTime < OpenVoiceClient.CIRCUIT_BREAKER_MS) {
      throw new Error('OpenVoice server marked as down (Circuit Breaker)');
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Successfully connected, reset circuit breaker
      OpenVoiceClient.isServerDown = false;

      // Retry on 5xx errors
      if (response.status >= 500 && retryCount < this.retries) {
        await this.delay(this.retryDelay * (retryCount + 1));
        return this.fetchWithRetry(endpoint, options, retryCount + 1);
      }

      return response;
    } catch (error: any) {
      // Mark as down on network errors or timeouts
      OpenVoiceClient.isServerDown = true;
      OpenVoiceClient.lastFailureTime = Date.now();

      // Retry on network errors
      if (retryCount < this.retries && (error.name === 'AbortError' || error.name === 'TypeError')) {
        await this.delay(this.retryDelay * (retryCount + 1));
        return this.fetchWithRetry(endpoint, options, retryCount + 1);
      }
      throw error;
    }
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance
let clientInstance: OpenVoiceClient | null = null;

export function getOpenVoiceClient(): OpenVoiceClient {
  if (!clientInstance) {
    clientInstance = new OpenVoiceClient();
  }
  return clientInstance;
}

// Export singleton
export const openVoiceClient = getOpenVoiceClient();




