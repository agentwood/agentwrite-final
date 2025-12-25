import { VoiceConfig } from "../types";

let synthesis: SpeechSynthesis | null = null;

if (typeof window !== 'undefined') {
  synthesis = window.speechSynthesis;
}

export const getVoices = (): SpeechSynthesisVoice[] => {
  if (!synthesis) return [];
  return synthesis.getVoices().filter(v => v.lang.startsWith('en'));
};

export const speak = (text: string, config: VoiceConfig) => {
  if (!synthesis) return;

  // Cancel any current speaking
  synthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Find the voice if it exists, otherwise default
  const voices = getVoices();
  const selectedVoice = voices.find(v => v.name === config.name) || voices[0];
  
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  utterance.pitch = config.pitch;
  utterance.rate = config.rate;
  
  synthesis.speak(utterance);
};

export const stopSpeaking = () => {
  if (synthesis) {
    synthesis.cancel();
  }
};
