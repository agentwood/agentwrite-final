'use client';

import { useState, useEffect } from 'react';
import { Volume2, Loader2, Play, Pause } from 'lucide-react';
import { playPCM } from '@/lib/audio/playPcm';
import Footer from '@/app/components/Footer';

interface Character {
  id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  avatarUrl: string;
  voiceName: string | null;
  styleHint: string | null;
  greeting: string | null;
  category: string;
  archetype: string | null;
}

export default function PreviewCharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loadingAudio, setLoadingAudio] = useState<string | null>(null);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const response = await fetch('/api/characters');
        if (response.ok) {
          const data = await response.json();
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/(site)/preview-characters/page.tsx:29',message:'API response received',data:{personasCount:data.personas?.length||0,firstFewIds:data.personas?.slice(0,3).map((p:any)=>p.id)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          
          // Get the 27 most recently created characters (API already sorts by createdAt desc)
          const allChars = data.personas || [];
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/(site)/preview-characters/page.tsx:35',message:'Filtering characters',data:{totalChars:allChars.length,firstThreeIds:allChars.slice(0,3).map((p:any)=>p.id)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          
          // Get first 27 characters (API already sorts by createdAt desc)
          const newChars = allChars.slice(0, 27);
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/(site)/preview-characters/page.tsx:40',message:'Setting characters',data:{charactersCount:newChars.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          setCharacters(newChars);
        }
      } catch (error) {
        console.error('Error fetching characters:', error);
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/(site)/preview-characters/page.tsx:45',message:'Error fetching characters',data:{error:error instanceof Error?error.message:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
      } finally {
        setLoading(false);
      }
    };
    fetchCharacters();
  }, []);

  const playVoice = async (character: Character) => {
    if (playingId === character.id) {
      // Stop playback
      setPlayingId(null);
      return;
    }

    if (!character.greeting || !character.voiceName) {
      alert('No greeting or voice configured for this character');
      return;
    }

    setLoadingAudio(character.id);
    setPlayingId(character.id);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: character.greeting,
          voiceName: character.voiceName,
          styleHint: character.styleHint,
          characterName: character.name,
          archetype: character.archetype,
          category: character.category,
          tagline: character.tagline,
          description: character.description,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate audio');
      }

      const data = await response.json();
      if (data.audio) {
        await playPCM(data.audio, data.sampleRate || 24000, data.playbackRate || 1.0);
      }
    } catch (error: any) {
      console.error('Error playing voice:', error);
      alert(`Error: ${error.message || 'Failed to play voice'}`);
    } finally {
      setLoadingAudio(null);
      setPlayingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Character Preview - First 27
        </h1>
        <p className="text-gray-600 mb-8">
          View images and hear voices of the newly created characters
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map((character) => (
            <div
              key={character.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Image */}
              <div className="relative h-64 bg-gray-200 overflow-hidden">
                <img
                  src={character.avatarUrl || '/avatars/placeholder.png'}
                  alt={character.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/avatars/placeholder.png';
                  }}
                />
                {character.avatarUrl?.includes('placeholder') && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <span className="text-gray-400 text-sm">No Image</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {character.name}
                </h3>
                {character.tagline && (
                  <p className="text-sm text-gray-600 mb-2 italic">
                    {character.tagline}
                  </p>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                    {character.category}
                  </span>
                  {character.archetype && (
                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">
                      {character.archetype}
                    </span>
                  )}
                </div>
                {character.description && (
                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                    {character.description}
                  </p>
                )}

                {/* Voice Button */}
                {character.greeting && character.voiceName && (
                  <button
                    onClick={() => playVoice(character)}
                    disabled={loadingAudio === character.id}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loadingAudio === character.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : playingId === character.id ? (
                      <>
                        <Pause className="w-4 h-4" />
                        <span>Playing...</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4" />
                        <span>Hear Voice</span>
                      </>
                    )}
                  </button>
                )}
                {character.voiceName && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Voice: {character.voiceName}
                    {character.styleHint && ` • ${character.styleHint}`}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {characters.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No characters found</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
