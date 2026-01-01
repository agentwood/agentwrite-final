'use client';

import React from 'react';
import Link from 'next/link';
import { User } from 'lucide-react';

interface Character {
    id: string;
    name: string;
    category: string;
    avatarUrl: string;
    tagline?: string | null;
}

interface CharacterMarqueeProps {
    characters: Character[];
}

const COLORS = [
    'bg-char-pink',
    'bg-char-green',
    'bg-char-orange',
    'bg-char-yellow',
    'bg-char-blue',
    'bg-char-purple',
    'bg-char-teal',
    'bg-char-red'
];

export const CharacterMarquee: React.FC<CharacterMarqueeProps> = ({ characters }) => {
    // Triple the characters to ensure a seamless loop even on ultra-wide screens
    const displayCharacters = [...characters, ...characters, ...characters];

    return (
        <div className="w-full overflow-hidden py-10">
            <div className="animate-marquee hover:pause flex">
                {displayCharacters.map((char, index) => {
                    const colorClass = COLORS[index % COLORS.length];
                    return (
                        <Link
                            key={`${char.id}-${index}`}
                            href={`/c/${char.id}`}
                            className="group relative flex-shrink-0 w-64 h-80 mx-3 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl cursor-pointer shadow-xl border border-white/20"
                        >
                            <div className={`absolute inset-0 ${colorClass} transition-colors duration-500`} />

                            {/* Image with subtle zoom on hover */}
                            <div className="absolute inset-x-0 top-0 h-[65%] overflow-hidden">
                                {char.avatarUrl ? (
                                    <img
                                        src={char.avatarUrl}
                                        alt={char.name}
                                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-5xl">
                                        {char.name.charAt(0)}
                                    </div>
                                )}
                                {/* Gradient overlay to help text readability */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            </div>

                            {/* Content area */}
                            <div className="absolute inset-x-0 bottom-0 h-[35%] p-5 flex flex-col justify-end">
                                <div className="relative z-10">
                                    <span className="inline-block px-2.5 py-1 mb-2 text-[9px] font-bold tracking-widest text-white/90 uppercase bg-black/20 backdrop-blur-md rounded-full border border-white/10">
                                        {char.category}
                                    </span>
                                    <h3 className="text-xl font-serif italic font-bold text-white leading-tight mb-1 group-hover:text-amber-100 transition-colors">
                                        {char.name}
                                    </h3>
                                    {char.tagline && (
                                        <p className="text-[10px] font-medium text-white/80 line-clamp-1 italic">
                                            {char.tagline}
                                        </p>
                                    )}
                                </div>

                                {/* Floating shine effect on hover */}
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                                        <User size={14} />
                                    </div>
                                </div>
                            </div>

                            {/* Glass reflection effect */}
                            <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-50" />
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};
