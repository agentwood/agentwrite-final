'use client';

import { useEffect, useState } from 'react';

interface CharacterMatch {
  character: {
    id: string;
    name: string;
    voiceName: string;
    description?: string;
    tagline?: string;
    category: string;
    archetype: string;
  };
  extracted: {
    gender?: string;
    age?: string;
    personality?: string;
  };
  audioFile?: string;
  matchQuality: 'good' | 'warning' | 'poor';
  issues: string[];
}

// Map test audio files to voice names
const TEST_AUDIO_MAP: Record<string, string> = {
  'kore': 'test-1.wav',      // Male, Professional
  'aoede': 'test-2.wav',     // Female, Friendly
  'charon': 'test-3.wav',    // Male, Energetic
  'pulcherrima': 'test-4.wav', // Female, Calm
  'rasalgethi': 'test-5.wav', // Male, Authoritative
};

// Voice gender mapping
const VOICE_GENDER_MAP: Record<string, 'male' | 'female' | 'neutral'> = {
  'kore': 'male',
  'aoede': 'female',
  'charon': 'male',
  'pulcherrima': 'female',
  'rasalgethi': 'male',
};

function extractGender(text: string): string | undefined {
  const lower = text.toLowerCase();
  if (lower.includes('male') || lower.includes('man') || lower.includes('guy') || 
      lower.includes('he ') || lower.includes('his ') || lower.includes('him ')) {
    return 'male';
  }
  if (lower.includes('female') || lower.includes('woman') || lower.includes('girl') ||
      lower.includes('she ') || lower.includes('her ') || lower.includes('hers ')) {
    return 'female';
  }
  return undefined;
}

function extractAge(text: string): string | undefined {
  const lower = text.toLowerCase();
  if (lower.includes('young') || lower.includes('teen') || lower.includes('20s')) {
    return 'young';
  }
  if (lower.includes('middle-aged') || lower.includes('40s') || lower.includes('50s')) {
    return 'middle';
  }
  if (lower.includes('old') || lower.includes('elderly') || lower.includes('senior') ||
      lower.includes('70s') || lower.includes('80s') || lower.includes('retired')) {
    return 'elderly';
  }
  return undefined;
}

function extractPersonality(text: string): string | undefined {
  const lower = text.toLowerCase();
  const traits: string[] = [];
  if (lower.includes('friendly') || lower.includes('warm') || lower.includes('kind')) {
    traits.push('friendly');
  }
  if (lower.includes('professional') || lower.includes('serious') || lower.includes('formal')) {
    traits.push('professional');
  }
  if (lower.includes('energetic') || lower.includes('enthusiastic')) {
    traits.push('energetic');
  }
  if (lower.includes('calm') || lower.includes('soothing')) {
    traits.push('calm');
  }
  if (lower.includes('authoritative') || lower.includes('confident')) {
    traits.push('authoritative');
  }
  return traits.length > 0 ? traits.join(', ') : undefined;
}

function assessMatch(character: any, extracted: any): { quality: 'good' | 'warning' | 'poor'; issues: string[] } {
  const issues: string[] = [];
  const voiceGender = VOICE_GENDER_MAP[character.voiceName.toLowerCase()];
  const charGender = extracted.gender;
  
  if (voiceGender && charGender) {
    if (voiceGender === 'male' && charGender !== 'male') {
      issues.push(`Gender mismatch: Voice is male but character appears ${charGender}`);
    } else if (voiceGender === 'female' && charGender !== 'female') {
      issues.push(`Gender mismatch: Voice is female but character appears ${charGender}`);
    }
  }
  
  let quality: 'good' | 'warning' | 'poor' = 'good';
  if (issues.length > 0) {
    quality = issues.some(i => i.includes('Gender mismatch')) ? 'poor' : 'warning';
  }
  
  return { quality, issues };
}

export default function TestVoicesPage() {
  const [matches, setMatches] = useState<CharacterMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMatches() {
      try {
        const response = await fetch('/api/test-voices');
        const data = await response.json();
        setMatches(data.matches || []);
      } catch (error) {
        console.error('Error loading voice matches:', error);
      } finally {
        setLoading(false);
      }
    }
    loadMatches();
  }, []);

  const good = matches.filter(m => m.matchQuality === 'good').length;
  const warning = matches.filter(m => m.matchQuality === 'warning').length;
  const poor = matches.filter(m => m.matchQuality === 'poor').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading voice-character mappings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 border-b-4 border-green-500 pb-4">
          🎤 Voice-Character Mapping Test
        </h1>

        {/* Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Summary</h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">{good}</div>
              <div className="text-sm text-gray-600 mt-1">Good Matches</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600">{warning}</div>
              <div className="text-sm text-gray-600 mt-1">Warnings</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600">{poor}</div>
              <div className="text-sm text-gray-600 mt-1">Poor Matches</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-800">{matches.length}</div>
              <div className="text-sm text-gray-600 mt-1">Total Characters</div>
            </div>
          </div>
        </div>

        {/* Character Cards */}
        <div className="space-y-6">
          {matches.map((match) => (
            <div
              key={match.character.id}
              className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                match.matchQuality === 'good'
                  ? 'border-green-500'
                  : match.matchQuality === 'warning'
                  ? 'border-orange-500'
                  : 'border-red-500'
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{match.character.name}</h2>
                <span
                  className={`px-4 py-1 rounded-full text-sm font-bold ${
                    match.matchQuality === 'good'
                      ? 'bg-green-500 text-white'
                      : match.matchQuality === 'warning'
                      ? 'bg-orange-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}
                >
                  {match.matchQuality.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-xs font-semibold text-gray-600 mb-1">Voice</div>
                  <div className="text-sm font-medium">{match.character.voiceName}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-xs font-semibold text-gray-600 mb-1">Category</div>
                  <div className="text-sm font-medium">{match.character.category}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-xs font-semibold text-gray-600 mb-1">Archetype</div>
                  <div className="text-sm font-medium">{match.character.archetype}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-xs font-semibold text-gray-600 mb-1">Gender</div>
                  <div className="text-sm font-medium">{match.extracted.gender || 'unknown'}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-xs font-semibold text-gray-600 mb-1">Age</div>
                  <div className="text-sm font-medium">{match.extracted.age || 'unknown'}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-xs font-semibold text-gray-600 mb-1">Personality</div>
                  <div className="text-sm font-medium">{match.extracted.personality || 'unknown'}</div>
                </div>
              </div>

              {/* Audio Player */}
              {match.audioFile && (
                <div className="bg-gray-100 p-4 rounded-lg mb-4">
                  <div className="text-sm font-semibold text-gray-700 mb-2">Reference Audio</div>
                  <audio
                    controls
                    className="w-full"
                    preload="auto"
                    src={`/api/test-voices/audio/${match.audioFile}`}
                    onLoadStart={(e) => {
                      // #region agent log
                      fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'test-voices/page.tsx:onLoadStart',message:'Audio load started',data:{src:e.currentTarget.src,characterName:match.character.name,audioFile:match.audioFile},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                      // #endregion
                    }}
                    onError={(e) => {
                      // #region agent log
                      const audio = e.currentTarget;
                      const errorDetails = {
                        src: audio.src,
                        errorCode: audio.error?.code ?? null,
                        errorMessage: audio.error?.message ?? null,
                        errorType: audio.error ? Object.keys(audio.error).join(',') : 'no error object',
                        networkState: audio.networkState,
                        networkStateText: ['EMPTY', 'IDLE', 'LOADING', 'NO_SOURCE'][audio.networkState] || 'UNKNOWN',
                        readyState: audio.readyState,
                        readyStateText: ['HAVE_NOTHING', 'HAVE_METADATA', 'HAVE_CURRENT_DATA', 'HAVE_FUTURE_DATA', 'HAVE_ENOUGH_DATA'][audio.readyState] || 'UNKNOWN',
                        characterName: match.character.name,
                        audioFile: match.audioFile,
                        currentSrc: audio.currentSrc,
                        canPlay: audio.canPlayType('audio/wav'),
                        canPlayMpeg: audio.canPlayType('audio/mpeg')
                      };
                      console.error('Audio error:', errorDetails);
                      fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'test-voices/page.tsx:onError',message:'Audio error occurred',data:errorDetails,timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                      // #endregion
                    }}
                    onStalled={(e) => {
                      // #region agent log
                      fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'test-voices/page.tsx:onStalled',message:'Audio stalled',data:{src:e.currentTarget.src,networkState:e.currentTarget.networkState,readyState:e.currentTarget.readyState,characterName:match.character.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                      // #endregion
                    }}
                    onAbort={(e) => {
                      // #region agent log
                      fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'test-voices/page.tsx:onAbort',message:'Audio load aborted',data:{src:e.currentTarget.src,characterName:match.character.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                      // #endregion
                    }}
                    onPlay={(e) => {
                      // #region agent log
                      fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'test-voices/page.tsx:onPlay',message:'Audio play event fired',data:{src:e.currentTarget.src,characterName:match.character.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                      // #endregion
                    }}
                    onCanPlay={(e) => {
                      // #region agent log
                      fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'test-voices/page.tsx:onCanPlay',message:'Audio can play',data:{src:e.currentTarget.src,readyState:e.currentTarget.readyState,characterName:match.character.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
                      // #endregion
                    }}
                    onLoadedData={(e) => {
                      // #region agent log
                      fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'test-voices/page.tsx:onLoadedData',message:'Audio data loaded',data:{src:e.currentTarget.src,duration:e.currentTarget.duration,characterName:match.character.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
                      // #endregion
                    }}
                    ref={(audioEl) => {
                      if (audioEl) {
                        // #region agent log
                        fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'test-voices/page.tsx:audioRef',message:'Audio element rendered',data:{src:audioEl.src,characterName:match.character.name,audioFile:match.audioFile,readyState:audioEl.readyState},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                        // #endregion
                      }
                    }}
                  >
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}

              {/* Description */}
              {match.character.description && (
                <div className="bg-gray-50 p-3 rounded mb-4">
                  <div className="text-xs font-semibold text-gray-600 mb-1">Description</div>
                  <div className="text-sm text-gray-700">
                    {match.character.description.substring(0, 200)}
                    {match.character.description.length > 200 ? '...' : ''}
                  </div>
                </div>
              )}

              {/* Issues */}
              {match.issues.length > 0 ? (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                  <div className="font-semibold text-yellow-800 mb-2">⚠️ Issues Found:</div>
                  <ul className="list-disc list-inside text-sm text-yellow-700">
                    {match.issues.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="text-green-600 font-medium">✅ No issues detected</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

