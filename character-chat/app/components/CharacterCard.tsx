'use client';

import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { useState } from 'react';

interface CharacterCardProps {
  id: string;
  name: string;
  tagline?: string | null;
  description?: string | null;
  avatarUrl: string;
  category: string;
  variant?: 'default' | 'horizontal';
}

export default function CharacterCard({
  id,
  name,
  tagline,
  description,
  avatarUrl,
  category,
  variant = 'default',
}: CharacterCardProps) {
  const [imgError, setImgError] = useState(false);
  
  // #region agent log
  if (typeof window !== 'undefined') {
    fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/components/CharacterCard.tsx:24',message:'CharacterCard render',data:{id,name,avatarUrl,hasError:imgError,hasId:!!id,idType:typeof id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  }
  // #endregion
  
  if (variant === 'horizontal') {
    // #region agent log
    const handleHorizontalClick = () => {
      if (typeof window !== 'undefined') {
        fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/components/CharacterCard.tsx:36',message:'CharacterCard click (horizontal)',data:{id,name,href:`/character/${id}`},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      }
    };
    // #endregion
    
    return (
      <Link
        href={`/character/${id}`}
        onClick={handleHorizontalClick}
        className="group relative flex-shrink-0 w-[320px] h-[140px] bg-white border border-gray-100 hover:border-indigo-200 hover:shadow-lg rounded-2xl p-4 cursor-pointer transition-all duration-300 flex gap-4 overflow-hidden"
      >
        <div className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden shadow-sm bg-gray-100">
          {!imgError ? (
            <img
              src={avatarUrl}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                // #region agent log
                fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/components/CharacterCard.tsx:38',message:'Image load error',data:{avatarUrl,name,errorType:e.type},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                // #endregion
                setImgError(true);
              }}
              onLoad={() => {
                // #region agent log
                fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/components/CharacterCard.tsx:45',message:'Image load success',data:{avatarUrl,name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                // #endregion
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
              {name.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex flex-col min-w-0 flex-1 justify-center">
          <h3 className="font-bold text-lg text-gray-900 truncate group-hover:text-indigo-600 transition-colors">{name}</h3>
          <p className="text-xs text-indigo-500 font-medium mb-1 truncate">@{name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 15)}</p>
          {(description?.split('//')[1]?.trim() || tagline) && (
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
              {description?.split('//')[1]?.trim() || tagline}
            </p>
          )}
          <div className="flex items-center gap-1 mt-2 text-gray-400 text-xs font-medium">
            <MessageSquare size={12} fill="currentColor" />
            <span>Chat</span>
          </div>
        </div>
      </Link>
    );
  }

  // Default Vertical Card
  // #region agent log
  const handleClick = () => {
    if (typeof window !== 'undefined') {
      fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/components/CharacterCard.tsx:83',message:'CharacterCard click',data:{id,name,href:`/c/${id}`},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    }
  };
  // #endregion
  
  return (
    <Link
      href={`/c/${id}`}
      onClick={handleClick}
      className="group flex-shrink-0 w-[180px] cursor-pointer"
    >
      <div className="w-full h-[220px] rounded-2xl overflow-hidden mb-3 relative shadow-sm border border-gray-100 bg-gray-100">
        {!imgError ? (
          <img
            src={avatarUrl}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              // #region agent log
              fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/components/CharacterCard.tsx:68',message:'Image load error (default)',data:{avatarUrl,name,errorType:e.type},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
              // #endregion
              setImgError(true);
            }}
            onLoad={() => {
              // #region agent log
              fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/components/CharacterCard.tsx:75',message:'Image load success (default)',data:{avatarUrl,name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
              // #endregion
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-3xl">
            {name.charAt(0)}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
          <span className="text-white text-xs font-medium">Chat now</span>
        </div>
      </div>
      <h3 className="font-bold text-gray-900 truncate pr-2 group-hover:text-indigo-600 transition-colors">{name}</h3>
      <p className="text-xs text-indigo-500 truncate mb-1">@{name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 15)}</p>
      {(description?.split('//')[1]?.trim() || tagline) && (
        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed h-10">
          {description?.split('//')[1]?.trim() || tagline}
        </p>
      )}
      <div className="flex items-center gap-1 mt-2 text-gray-400 text-xs">
        <MessageSquare size={12} fill="currentColor" />
        <span>Chat</span>
      </div>
    </Link>
  );
}
