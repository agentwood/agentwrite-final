'use client';

import Image from 'next/image';
import Link from 'next/link';

interface CharacterCardProps {
  id: string;
  name: string;
  tagline?: string | null;
  avatarUrl: string;
  category: string;
}

export default function CharacterCard({
  id,
  name,
  tagline,
  avatarUrl,
  category,
}: CharacterCardProps) {
  return (
    <Link
      href={`/c/${id}`}
      className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-200"
    >
      <div className="aspect-square relative overflow-hidden bg-gray-100">
        <Image
          src={avatarUrl}
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{name}</h3>
          <span className="text-xs px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full font-medium shrink-0">
            {category}
          </span>
        </div>
        {tagline && (
          <p className="text-sm text-gray-600 line-clamp-2 mt-1">{tagline}</p>
        )}
      </div>
    </Link>
  );
}

