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
  isOfficial?: boolean;
}

export default function CharacterCard({
  id,
  name,
  tagline,
  description,
  avatarUrl,
  category,
  variant = 'default',
  isOfficial = false,
}: CharacterCardProps) {
  const [imgError, setImgError] = useState(false);

  if (variant === 'horizontal') {
    return (
      <Link
        href={`/character/${id}`}
        className="group relative flex-shrink-0 w-[320px] h-[140px] bg-white border border-gray-100 hover:border-indigo-200 hover:shadow-lg rounded-2xl p-4 cursor-pointer transition-all duration-300 flex gap-4 overflow-hidden"
      >
        <div className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden shadow-sm bg-gray-100 relative">
          {!imgError ? (
            <img
              src={avatarUrl}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
              {name.charAt(0)}
            </div>
          )}
          {/* AW Official Badge */}
          {isOfficial && (
            <div className="absolute top-1 left-1 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center shadow-lg border border-white" title="Official Agentwood Character">
              <span className="text-white text-[7px] font-bold">AW</span>
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
  return (
    <Link
      href={`/c/${id}`}
      className="group flex-shrink-0 w-[180px] cursor-pointer"
    >
      <div className="w-full h-[220px] rounded-2xl overflow-hidden mb-3 relative shadow-sm border border-gray-100 bg-gray-100">
        {!imgError ? (
          <img
            src={avatarUrl}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-3xl">
            {name.charAt(0)}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
          <span className="text-white text-xs font-medium">Chat now</span>
        </div>
        {/* AW Official Badge */}
        {isOfficial && (
          <div className="absolute top-2 left-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white" title="Official Agentwood Character">
            <span className="text-white text-[8px] font-bold">AW</span>
          </div>
        )}
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
