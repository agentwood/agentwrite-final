/**
 * Audio resampling utilities
 * Resamples audio from one sample rate to another
 */

/**
 * Resample audio from source sample rate to target sample rate
 * Uses linear interpolation
 */
export function resample(
  input: Float32Array,
  sourceSampleRate: number,
  targetSampleRate: number
): Float32Array {
  if (sourceSampleRate === targetSampleRate) {
    return input;
  }

  const ratio = sourceSampleRate / targetSampleRate;
  const outputLength = Math.round(input.length / ratio);
  const output = new Float32Array(outputLength);

  for (let i = 0; i < outputLength; i++) {
    const sourceIndex = i * ratio;
    const index = Math.floor(sourceIndex);
    const fraction = sourceIndex - index;

    if (index + 1 < input.length) {
      // Linear interpolation
      output[i] = input[index] * (1 - fraction) + input[index + 1] * fraction;
    } else {
      output[i] = input[index];
    }
  }

  return output;
}

/**
 * Resample from 48kHz to 16kHz (for mic input to Live API)
 */
export function resample48kTo16k(input: Float32Array): Float32Array {
  return resample(input, 48000, 16000);
}




