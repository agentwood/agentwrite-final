'use client';

import { useState, useEffect } from 'react';
import { Download, Users, Eye, MessageSquare, Loader2 } from 'lucide-react';

interface CharacterData {
    id: string;
    name: string;
    category: string;
    archetype: string;
    stats: {
        views: number;
        conversations: number;
        followers: number;
    };
}

export default function CharacterDataPage() {
    const [characters, setCharacters] = useState<CharacterData[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const response = await fetch('/api/data/characters');
            if (response.ok) {
                const data = await response.json();
                setCharacters(data.characters);
                setTotalCount(data.count);
            }
        } catch (error) {
            console.error('Error loading character data:', error);
        } finally {
            setLoading(false);
        }
    };

    const downloadJSON = () => {
        const dataStr = JSON.stringify(characters, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `characters_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading character data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Character Data Export</h1>
                            <p className="text-gray-600 mt-2">Training data and character metadata</p>
                        </div>
                        <button
                            onClick={downloadJSON}
                            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                        >
                            <Download className="w-5 h-5" />
                            Download JSON
                        </button>
                    </div>

                    <div className="grid grid-cols-3 gap-6 mt-8">
                        <div className="bg-indigo-50 rounded-lg p-4">
                            <p className="text-sm text-indigo-600 font-medium mb-1">Total Characters</p>
                            <p className="text-3xl font-bold text-indigo-900">{totalCount}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                            <p className="text-sm text-green-600 font-medium mb-1">Total Views</p>
                            <p className="text-3xl font-bold text-green-900">
                                {characters.reduce((sum, c) => sum + c.stats.views, 0).toLocaleString()}
                            </p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4">
                            <p className="text-sm text-purple-600 font-medium mb-1">Total Conversations</p>
                            <p className="text-3xl font-bold text-purple-900">
                                {characters.reduce((sum, c) => sum + c.stats.conversations, 0).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Character</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Archetype</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Views</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Chats</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Followers</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {characters.map((char) => (
                                <tr key={char.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-gray-900">{char.name}</p>
                                        <p className="text-sm text-gray-500">{char.id.substring(0, 8)}...</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                                            {char.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{char.archetype}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 text-gray-700">
                                            <Eye className="w-4 h-4 text-gray-400" />
                                            <span className="font-medium">{char.stats.views.toLocaleString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 text-gray-700">
                                            <MessageSquare className="w-4 h-4 text-gray-400" />
                                            <span className="font-medium">{char.stats.conversations.toLocaleString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 text-gray-700">
                                            <Users className="w-4 h-4 text-gray-400" />
                                            <span className="font-medium">{char.stats.followers.toLocaleString()}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
