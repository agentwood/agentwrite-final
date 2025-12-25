import CharacterCard from '@/app/components/CharacterCard';
import { db } from '@/lib/db';
import { Filter, TrendingUp, Star } from 'lucide-react';
import Footer from '@/app/components/Footer';

export default async function PersonaGallery() {
  const [allPersonas, featuredPersonas, trendingPersonas, categories] = await Promise.all([
    db.personaTemplate.findMany({
      orderBy: { createdAt: 'desc' },
    }),
    db.personaTemplate.findMany({
      where: { featured: true },
      orderBy: { retentionScore: 'desc' },
      take: 10,
    }),
    db.personaTemplate.findMany({
      where: { trending: true },
      orderBy: { retentionScore: 'desc' },
      take: 10,
    }),
    db.personaTemplate.findMany({
      select: { category: true },
      distinct: ['category'],
    }),
  ]);

  const uniqueCategories = Array.from(new Set(categories.map(c => c.category)));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-gray-900">Persona Library</h1>
          <p className="text-gray-600 mt-1">Choose a persona to chat with</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        {/* Featured Section */}
        {featuredPersonas.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Star className="text-yellow-500" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">Featured</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {featuredPersonas.map((persona) => (
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
          </section>
        )}

        {/* Trending Section */}
        {trendingPersonas.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="text-indigo-500" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">Trending</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {trendingPersonas.map((persona) => (
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
          </section>
        )}

        {/* Category Filters */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Filter className="text-gray-500" size={20} />
            <h2 className="text-2xl font-bold text-gray-900">All Personas</h2>
          </div>
          
          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-medium">
              All
            </button>
            {uniqueCategories.map((category) => (
              <button
                key={category}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50"
              >
                {category}
              </button>
            ))}
          </div>

          {/* All Personas Grid */}
          {allPersonas.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No personas available. Run the seed script to add personas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {allPersonas.map((persona) => (
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
        </section>
      </div>
      <Footer />
    </div>
  );
}
