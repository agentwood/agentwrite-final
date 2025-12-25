/**
 * Enhance TTS audio with post-processing
 * - Add natural pauses
 * - Adjust prosody
 * - Reduce artifacts
 */

interface AudioEnhancementOptions {
  addPauses?: boolean;
  prosodyAdjustment?: boolean;
  noiseReduction?: boolean;
}

/**
 * Analyze text to determine optimal pause locations
 */
function analyzePausePoints(text: string): number[] {
  const pausePoints: number[] = [];
  const sentences = text.split(/[.!?]+/);
  let currentPosition = 0;

  sentences.forEach((sentence, index) => {
    if (index < sentences.length - 1) {
      // Add pause after sentence
      currentPosition += sentence.length;
      pausePoints.push(currentPosition);
    }
  });

  // Add pauses after commas in long sentences
  const words = text.split(/\s+/);
  let wordPosition = 0;
  words.forEach((word, index) => {
    if (word.endsWith(',') && index > 0 && index % 8 === 0) {
      pausePoints.push(wordPosition);
    }
    wordPosition += word.length + 1;
  });

  return pausePoints;
}

/**
 * Enhance audio with natural pauses
 */
export async function addNaturalPauses(
  audioBuffer: Buffer,
  sampleRate: number,
  text: string
): Promise<Buffer> {
  const pausePoints = analyzePausePoints(text);
  if (pausePoints.length === 0) return audioBuffer;

  // Convert buffer to samples (16-bit PCM)
  const samples = new Int16Array(audioBuffer.length / 2);
  for (let i = 0; i < samples.length; i++) {
    samples[i] = audioBuffer.readInt16LE(i * 2);
  }

  // Calculate pause duration (200-500ms)
  const pauseDuration = Math.floor(sampleRate * 0.3); // 300ms
  const pauseSamples = new Int16Array(pauseDuration).fill(0);

  // Insert pauses (simplified - in production, use proper audio processing)
  const enhancedSamples: number[] = [];
  let textPosition = 0;

  for (let i = 0; i < samples.length; i++) {
    enhancedSamples.push(samples[i]);
    
    // Check if we should add a pause
    const charPosition = Math.floor((i / samples.length) * text.length);
    if (pausePoints.includes(charPosition)) {
      enhancedSamples.push(...Array.from(pauseSamples));
    }
  }

  // Convert back to buffer
  const enhancedBuffer = Buffer.alloc(enhancedSamples.length * 2);
  for (let i = 0; i < enhancedSamples.length; i++) {
    enhancedBuffer.writeInt16LE(enhancedSamples[i], i * 2);
  }

  return enhancedBuffer;
}

/**
 * Apply prosody adjustments (pitch variation for naturalness)
 */
export async function adjustProsody(
  audioBuffer: Buffer,
  sampleRate: number,
  text: string
): Promise<Buffer> {
  // Simple prosody adjustment: slight pitch variation
  // In production, use more sophisticated algorithms
  
  const samples = new Int16Array(audioBuffer.length / 2);
  for (let i = 0; i < samples.length; i++) {
    samples[i] = audioBuffer.readInt16LE(i * 2);
  }

  // Apply subtle pitch variation (very light)
  const enhancedSamples = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    // Very subtle variation (±2%)
    const variation = Math.sin(i / 1000) * 0.02;
    enhancedSamples[i] = Math.max(-32768, Math.min(32767, samples[i] * (1 + variation)));
  }

  const enhancedBuffer = Buffer.alloc(enhancedSamples.length * 2);
  for (let i = 0; i < enhancedSamples.length; i++) {
    enhancedBuffer.writeInt16LE(enhancedSamples[i], i * 2);
  }

  return enhancedBuffer;
}

/**
 * Main enhancement pipeline
 */
export async function enhanceAudio(
  audioBuffer: Buffer,
  sampleRate: number,
  text: string,
  options: AudioEnhancementOptions = {}
): Promise<Buffer> {
  let enhanced = audioBuffer;

  if (options.addPauses !== false) {
    enhanced = await addNaturalPauses(enhanced, sampleRate, text);
  }

  if (options.prosodyAdjustment !== false) {
    enhanced = await adjustProsody(enhanced, sampleRate, text);
  }

  return enhanced;
}



