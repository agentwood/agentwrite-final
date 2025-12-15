/**
 * Play PCM audio using Web Audio API
 */

/**
 * Play PCM16 audio at specified sample rate
 */
export async function playPCM(
  base64Audio: string,
  sampleRate: number = 24000
): Promise<void> {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
    sampleRate: sampleRate,
  });

  // Decode PCM16 to Float32Array
  const binaryString = atob(base64Audio);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const int16Array = new Int16Array(bytes.buffer);
  const float32Array = new Float32Array(int16Array.length);
  
  for (let i = 0; i < int16Array.length; i++) {
    float32Array[i] = int16Array[i] / 32768.0;
  }

  // Create audio buffer
  const audioBuffer = audioContext.createBuffer(1, float32Array.length, sampleRate);
  audioBuffer.getChannelData(0).set(float32Array);

  // Play audio
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);

  return new Promise((resolve, reject) => {
    source.onended = () => {
      audioContext.close();
      resolve();
    };
    source.addEventListener('error', (error: Event) => {
      audioContext.close();
      reject(error);
    });
    source.start(0);
  });
}

/**
 * Stop all audio playback
 */
export function stopAllAudio(): void {
  // Note: Web Audio API doesn't have a global stop method
  // This would need to be managed at a higher level
  // by tracking active AudioContext instances
}

