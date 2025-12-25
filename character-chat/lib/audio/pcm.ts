/**
 * PCM16 encoding/decoding utilities
 */

/**
 * Decode base64 PCM16 audio data to Float32Array
 */
export function decodePCM16(base64: string, sampleRate: number = 24000): Float32Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Convert to Int16Array (little-endian)
  const int16Array = new Int16Array(bytes.buffer);
  
  // Convert to Float32Array (normalized to -1.0 to 1.0)
  const float32Array = new Float32Array(int16Array.length);
  for (let i = 0; i < int16Array.length; i++) {
    float32Array[i] = int16Array[i] / 32768.0;
  }

  return float32Array;
}

/**
 * Encode Float32Array to PCM16 base64
 */
export function encodePCM16(float32Array: Float32Array): string {
  const int16Array = new Int16Array(float32Array.length);
  
  for (let i = 0; i < float32Array.length; i++) {
    // Clamp to [-1, 1] and convert to int16
    const clamped = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = Math.round(clamped * 32767);
  }

  // Convert to base64
  const bytes = new Uint8Array(int16Array.buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary);
}





