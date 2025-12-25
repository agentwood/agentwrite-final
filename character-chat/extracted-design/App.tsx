import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Discover from './components/Discover';
import ChatInterface from './components/ChatInterface';
import CreateCharacter from './components/CreateCharacter';
import { Character, ViewState, VoiceConfig } from './types';
import { MOCK_CHARACTERS } from './constants';
import { getVoices, stopSpeaking } from './services/tts';
import { X, Play, Check, Square, SlidersHorizontal, Mic2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DISCOVER);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [customCharacters, setCustomCharacters] = useState<Character[]>([]);
  const [showVoicePicker, setShowVoicePicker] = useState(false);
  
  // Default Voice Configuration
  const [voiceConfig, setVoiceConfig] = useState<VoiceConfig>({
      name: '',
      pitch: 1,
      rate: 1,
      lang: 'en-US'
  });

  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);

  useEffect(() => {
     // Load voices when they become available
     const loadVoices = () => {
         const voices = getVoices();
         setAvailableVoices(voices);
         if (voices.length > 0 && !voiceConfig.name) {
             setVoiceConfig(prev => ({ ...prev, name: voices[0].name }));
         }
     };
     
     loadVoices();
     window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const handleCharacterClick = (character: Character) => {
    stopSpeaking();
    setSelectedCharacter(character);
    setCurrentView(ViewState.CHAT);
  };

  const handleBackToDiscover = () => {
    stopSpeaking();
    setSelectedCharacter(null);
    setCurrentView(ViewState.DISCOVER);
  };

  const handleCreateCharacter = (newChar: Character) => {
    setCustomCharacters(prev => [newChar, ...prev]);
    // Prepend to MOCK for display logic locally (in a real app, this would be backend)
    MOCK_CHARACTERS.unshift(newChar); 
    handleCharacterClick(newChar);
  };
  
  const toggleVoicePicker = () => {
      if (showVoicePicker) {
          stopSpeaking(); // Stop any testing audio when closing
          setPlayingVoice(null);
      }
      setShowVoicePicker(!showVoicePicker);
  };

  const testVoice = (voiceName: string) => {
      // If currently playing this voice, stop it
      if (playingVoice === voiceName) {
          stopSpeaking();
          setPlayingVoice(null);
          return;
      }

      stopSpeaking(); // Stop any previous voice
      setPlayingVoice(voiceName);

      const utterance = new SpeechSynthesisUtterance("Hello! I am ready to chat with you.");
      const voice = availableVoices.find(v => v.name === voiceName);
      if (voice) utterance.voice = voice;
      
      // Use current slider values for the test
      utterance.pitch = voiceConfig.pitch;
      utterance.rate = voiceConfig.rate;

      utterance.onend = () => setPlayingVoice(null);
      utterance.onerror = () => setPlayingVoice(null);
      
      window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] text-[#0f172a] overflow-hidden font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <div className={`${currentView === ViewState.CHAT || currentView === ViewState.CREATE ? 'hidden md:flex' : 'flex'} flex-shrink-0 z-50`}>
        <Sidebar 
          onNavigate={handleBackToDiscover} 
          onCreateClick={() => setCurrentView(ViewState.CREATE)}
          onVoiceClick={toggleVoicePicker}
          recentCharacters={[...customCharacters, ...MOCK_CHARACTERS].slice(0, 3)} 
          onCharacterClick={handleCharacterClick}
        />
      </div>

      <main className="flex-1 overflow-y-auto no-scrollbar relative w-full">
        {currentView === ViewState.DISCOVER && (
          <Discover onCharacterClick={handleCharacterClick} />
        )}
        
        {currentView === ViewState.CREATE && (
          <CreateCharacter 
            onBack={handleBackToDiscover} 
            onCreate={handleCreateCharacter} 
          />
        )}
        
        {currentView === ViewState.CHAT && selectedCharacter && (
          <ChatInterface 
            character={selectedCharacter} 
            onBack={handleBackToDiscover} 
            voiceConfig={voiceConfig}
          />
        )}
      </main>

      {/* Voice Selection Modal */}
      {showVoicePicker && (
          <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-[2rem] w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden border border-white/20">
                  <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                           <Mic2 size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Voice Studio</h2>
                            <p className="text-xs text-gray-500 font-medium">Customize audio experience</p>
                        </div>
                      </div>
                      <button onClick={toggleVoicePicker} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                          <X size={20} />
                      </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8fafc]">
                      {availableVoices.map((voice) => (
                          <div 
                            key={voice.name}
                            onClick={() => setVoiceConfig(prev => ({ ...prev, name: voice.name }))}
                            className={`p-4 rounded-2xl cursor-pointer flex items-center justify-between border transition-all duration-200 group ${
                                voiceConfig.name === voice.name 
                                ? 'bg-white border-indigo-500 shadow-md ring-1 ring-indigo-500' 
                                : 'bg-white text-gray-900 border-gray-100 hover:border-indigo-200 hover:shadow-sm'
                            }`}
                          >
                              <div className="flex items-center gap-3 overflow-hidden min-w-0">
                                  <div className={`w-3 h-3 rounded-full shrink-0 shadow-sm ${voiceConfig.name === voice.name ? 'bg-indigo-500' : 'bg-gray-200'}`} />
                                  <div className="flex flex-col min-w-0">
                                      <span className={`font-bold text-sm truncate ${voiceConfig.name === voice.name ? 'text-indigo-900' : 'text-gray-900'}`}>{voice.name}</span>
                                      <span className={`text-xs truncate ${voiceConfig.name === voice.name ? 'text-indigo-500 font-medium' : 'text-gray-400'}`}>
                                        {voice.lang}
                                      </span>
                                  </div>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); testVoice(voice.name); }}
                                    className={`p-2.5 rounded-full transition-all ${
                                        voiceConfig.name === voice.name 
                                        ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' 
                                        : 'bg-gray-50 hover:bg-gray-100 text-gray-500'
                                    }`}
                                  >
                                      {playingVoice === voice.name ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                                  </button>
                                  {voiceConfig.name === voice.name && <Check size={20} className="text-indigo-500" />}
                              </div>
                          </div>
                      ))}
                      {availableVoices.length === 0 && (
                          <div className="flex flex-col items-center justify-center py-12 text-center">
                              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                  <X size={24} className="text-gray-400" />
                              </div>
                              <p className="text-gray-900 font-medium">No voices found</p>
                              <p className="text-sm text-gray-500 mt-1">Please check your system settings.</p>
                          </div>
                      )}
                  </div>

                  {/* Settings Footer */}
                  <div className="p-6 border-t border-gray-100 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.02)] z-10">
                      <div className="flex items-center gap-2 mb-5 text-gray-900 font-bold text-sm">
                          <SlidersHorizontal size={16} className="text-indigo-600" />
                          <span>Fine Tuning</span>
                      </div>
                      
                      <div className="space-y-6 mb-8">
                          <div>
                              <div className="flex justify-between text-xs font-bold mb-2">
                                  <span className="text-gray-500">Pitch</span>
                                  <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{voiceConfig.pitch.toFixed(1)}</span>
                              </div>
                              <input 
                                  type="range" 
                                  min="0.5" 
                                  max="2" 
                                  step="0.1" 
                                  value={voiceConfig.pitch}
                                  onChange={(e) => setVoiceConfig(prev => ({...prev, pitch: parseFloat(e.target.value)}))}
                                  className="w-full accent-indigo-600 h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer hover:bg-gray-200 transition-colors"
                              />
                          </div>
                          
                          <div>
                              <div className="flex justify-between text-xs font-bold mb-2">
                                  <span className="text-gray-500">Speed</span>
                                  <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{voiceConfig.rate.toFixed(1)}x</span>
                              </div>
                              <input 
                                  type="range" 
                                  min="0.5" 
                                  max="2" 
                                  step="0.1" 
                                  value={voiceConfig.rate}
                                  onChange={(e) => setVoiceConfig(prev => ({...prev, rate: parseFloat(e.target.value)}))}
                                  className="w-full accent-indigo-600 h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer hover:bg-gray-200 transition-colors"
                              />
                          </div>
                      </div>

                      <button 
                        onClick={toggleVoicePicker}
                        className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all hover:shadow-lg hover:shadow-indigo-200 active:scale-[0.98]"
                      >
                          Apply Settings
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default App;