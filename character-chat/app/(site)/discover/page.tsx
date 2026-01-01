'use client';

import { useState, useEffect } from 'react';
import { Search, TrendingUp, Star, Filter } from 'lucide-react';
import CharacterCard from '@/app/components/CharacterCard';
import Sidebar from '@/app/components/Sidebar';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import AdBanner from '@/app/components/AdBanner';

interface Persona {
  id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  avatarUrl: string;
  category: string;
  followerCount: number;
  viewCount: number;
  interactionCount: number;
  featured: boolean;
  trending: boolean;
  archetype?: string | null;
}

export default function DiscoverPage() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [filteredPersonas, setFilteredPersonas] = useState<Persona[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all'); // 'all', 'human', 'fantasy'
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    loadPersonas();

    // Check URL params for type filter
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const typeParam = params.get('type');
      if (typeParam === 'human' || typeParam === 'fantasy') {
        setSelectedType(typeParam);
      }
    }
  }, []);

  useEffect(() => {
    if (personas.length > 0) {
      filterPersonas();
    }
  }, [personas, selectedCategory, selectedType, searchQuery]);

  const loadPersonas = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/characters');
      if (response.ok) {
        const data = await response.json();
        setPersonas(data.personas || []);

        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set((data.personas || []).map((p: Persona) => p.category))
        );
        setCategories(uniqueCategories as string[]);
      }
    } catch (error) {
      console.error('Error loading personas:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPersonas = () => {
    let filtered = personas;

    // Type filter (HUMAN vs FANTASY)
    if (selectedType === 'human') {
      filtered = filtered.filter(p => p.category !== 'fantasy');
    } else if (selectedType === 'fantasy') {
      filtered = filtered.filter(p => p.category === 'fantasy');
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Search filter
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(p => {
        const nameMatch = p.name.toLowerCase().includes(query);
        const taglineMatch = p.tagline?.toLowerCase().includes(query);
        const descMatch = p.description?.toLowerCase().includes(query);
        const categoryMatch = p.category?.toLowerCase().includes(query);
        const archetypeMatch = p.archetype?.toLowerCase().includes(query);
        return nameMatch || taglineMatch || descMatch || categoryMatch || archetypeMatch;
      });
    }

    setFilteredPersonas(filtered);
  };

  const featuredPersonas = personas.filter(p => p.featured);
  const trendingPersonas = personas.filter(p => p.trending).sort((a, b) =>
    (b.interactionCount || 0) - (a.interactionCount || 0)
  );

  return (
    <div className="min-h-screen flex bg-[#0f0f0f]">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 overflow-y-auto">
          {/* Ad Banner for Free Users */}
          <AdBanner variant="banner" />

          {/* Hero Section */}
          <section className="bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600 text-white py-16 px-6">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Discover Characters</h1>
              <p className="text-xl text-indigo-100 max-w-2xl">
                Chat with AI characters powered by advanced machine learning
              </p>

              {/* Search Bar */}
              <div className="mt-8 max-w-2xl">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search characters..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Type Filters (HUMAN vs FANTASY) */}
          <section className="bg-white border-b border-zinc-200 sticky top-0 z-20">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center gap-2 overflow-x-auto mb-4">
                <button
                  onClick={() => { setSelectedType('all'); setSelectedCategory('all'); }}
                  className={`px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${selectedType === 'all'
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'bg-white border-2 border-zinc-200 text-zinc-600 hover:border-indigo-300 hover:text-indigo-600'
                    }`}
                >
                  All Characters
                </button>
                <button
                  onClick={() => { setSelectedType('human'); setSelectedCategory('all'); }}
                  className={`px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${selectedType === 'human'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white border-2 border-zinc-200 text-zinc-600 hover:border-blue-300 hover:text-blue-600'
                    }`}
                >
                  👤 Human
                </button>
                <button
                  onClick={() => { setSelectedType('fantasy'); setSelectedCategory('all'); }}
                  className={`px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${selectedType === 'fantasy'
                      ? 'bg-pink-600 text-white shadow-lg'
                      : 'bg-white border-2 border-zinc-200 text-zinc-600 hover:border-pink-300 hover:text-pink-600'
                    }`}
                >
                  ✨ Fantasy
                </button>
              </div>

              {/* Sub-category filters */}
              {selectedType !== 'all' && (
                <div className="flex items-center gap-2 overflow-x-auto">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === 'all'
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-white border border-zinc-200 text-zinc-600 hover:border-indigo-300 hover:text-indigo-600'
                      }`}
                  >
                    All {selectedType === 'human' ? 'Professions' : 'Waifus'}
                  </button>
                  {categories.filter(cat =>
                    selectedType === 'fantasy' ? cat === 'fantasy' : cat !== 'fantasy'
                  ).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === cat
                          ? 'bg-indigo-600 text-white shadow-lg'
                          : 'bg-white border border-zinc-200 text-zinc-600 hover:border-indigo-300 hover:text-indigo-600'
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Featured Section */}
          {selectedCategory === 'all' && featuredPersonas.length > 0 && (
            <section className="py-12 px-6">
              <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-2 mb-6">
                  <Star className="text-yellow-500" size={24} />
                  <h2 className="text-2xl font-bold text-zinc-900">Featured Characters</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                  {featuredPersonas.slice(0, 12).map((persona) => (
                    <CharacterCard
                      key={persona.id}
                      id={persona.id}
                      name={persona.name}
                      tagline={persona.tagline}
                      avatarUrl={persona.avatarUrl}
                      category={persona.category}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Trending Section */}
          {selectedCategory === 'all' && trendingPersonas.length > 0 && (
            <section className="py-12 px-6 bg-zinc-50">
              <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="text-indigo-600" size={24} />
                  <h2 className="text-2xl font-bold text-zinc-900">Trending Now</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                  {trendingPersonas.slice(0, 12).map((persona) => (
                    <CharacterCard
                      key={persona.id}
                      id={persona.id}
                      name={persona.name}
                      tagline={persona.tagline}
                      avatarUrl={persona.avatarUrl}
                      category={persona.category}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Category Results */}
          <section className="py-12 px-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-zinc-900">
                  {selectedCategory === 'all' ? 'All Characters' : selectedCategory}
                </h2>
                <span className="text-sm text-zinc-500">
                  {filteredPersonas.length} {filteredPersonas.length === 1 ? 'character' : 'characters'}
                </span>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredPersonas.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-zinc-500">No characters found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                  {filteredPersonas.map((persona) => (
                    <CharacterCard
                      key={persona.id}
                      id={persona.id}
                      name={persona.name}
                      tagline={persona.tagline}
                      avatarUrl={persona.avatarUrl}
                      category={persona.category}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}
