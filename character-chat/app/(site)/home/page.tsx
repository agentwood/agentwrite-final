import Link from 'next/link';
import { Search } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import SafeImage from '../../components/SafeImage';
import AgeVerificationWrapper from '../../components/AgeVerificationWrapper';
import { db } from '@/lib/db';

export default async function HomePage() {
  const [allPersonas, featuredPersonas] = await Promise.all([
    db.personaTemplate.findMany({
      orderBy: { createdAt: 'desc' },
    }),
    db.personaTemplate.findMany({
      where: { featured: true },
      orderBy: { retentionScore: 'desc' },
      take: 6,
    }),
  ]);

  // If no featured personas, use first 6
  const displayFeatured = featuredPersonas.length > 0 
    ? featuredPersonas.slice(0, 6)
    : allPersonas.slice(0, 6);

  const uniqueCategories = Array.from(new Set(allPersonas.map(p => p.category)));

  return (
    <AgeVerificationWrapper>
      <div className="flex h-screen overflow-hidden bg-white text-zinc-900 selection:bg-zinc-200">
        <Sidebar 
          recentCharacters={allPersonas.slice(0, 3).map(p => ({
            id: p.id,
            name: p.name,
            avatarUrl: p.avatarUrl,
            category: p.category,
          }))}
          categories={uniqueCategories}
        />
        
        <main className="flex-1 flex flex-col h-full overflow-y-auto no-scrollbar scroll-smooth">
        {/* Unified Hero Section */}
        <section className="py-24 px-6 md:px-12 flex flex-col items-center text-center fade-in bg-white">
          <h1 className="text-display mb-10">
            Talk. Create.<br />
            <span className="text-zinc-400">Discover.</span>
          </h1>

          <p className="text-h2 text-zinc-500 max-w-2xl mb-12 font-medium">
            Have conversations with different characters, create and discover unique content curated on Agentwood.
          </p>

          <div className="w-full max-w-2xl relative">
            <div className="flex items-center bg-zinc-50 border border-zinc-200 rounded-[2rem] p-1.5 shadow-sm hover:shadow-md transition-all focus-within:ring-2 focus-within:ring-black/5">
              <div className="pl-6 text-zinc-400">
                <Search className="w-5 h-5" />
              </div>
              <input 
                type="text" 
                placeholder="Find a personality..."
                className="w-full px-6 py-4 bg-transparent border-none text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-0 text-lg font-bold"
              />
            </div>
          </div>
        </section>

        {/* Featured Section - 6 in a row */}
        <section className="px-6 md:px-12 py-16 bg-white border-y border-zinc-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-h1 mb-10">Featured</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
              {displayFeatured.map(persona => (
                <Link 
                  key={persona.id} 
                  href={`/character/${persona.id}`}
                  className="group relative aspect-[3/4] rounded-[2.5rem] overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-1.5 border border-zinc-100"
                >
                  <SafeImage 
                    src={persona.avatarUrl} 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-700" 
                    alt={persona.name}
                    fallback={`https://api.dicebear.com/7.x/avataaars/svg?seed=${persona.name}&backgroundColor=b6e3f4,c0aede,ffd5dc,ffdfbf&radius=20`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <p className="text-[9px] uppercase mb-1.5 opacity-60 font-black tracking-widest">
                      @{persona.name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 15)}
                    </p>
                    <h3 className="text-base font-bold mb-1 leading-tight">{persona.name}</h3>
                    <p className="text-[11px] opacity-70 line-clamp-2 leading-snug">
                      {persona.description?.split('//')[1]?.trim() || persona.tagline || ''}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* All Characters Grid */}
        <section className="px-6 md:px-12 py-24 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
              <div className="space-y-3">
                <h2 className="text-h1">All Characters</h2>
                <p className="text-zinc-500 font-medium">Browse the complete library of autonomous agents.</p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="relative group min-w-[200px]">
                  <select 
                    className="w-full appearance-none bg-zinc-50 border border-zinc-200 text-zinc-900 px-6 py-4 rounded-3xl text-xs font-black uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-black/5 hover:border-zinc-400 hover:bg-white transition-all cursor-pointer pr-12 shadow-sm"
                  >
                    <option value="all">All</option>
                    {uniqueCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 group-hover:text-zinc-900 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-x-8 gap-y-12">
              {allPersonas.map(persona => (
                <Link 
                  key={persona.id} 
                  href={`/character/${persona.id}`}
                  className="group cursor-pointer"
                >
                  <div className="aspect-square w-full rounded-[2.5rem] bg-zinc-50 overflow-hidden mb-4 border border-zinc-100 transition-all group-hover:border-zinc-300 group-hover:shadow-xl group-hover:-translate-y-1 duration-300">
                    <SafeImage 
                      src={persona.avatarUrl} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      alt={persona.name}
                      fallback={`https://api.dicebear.com/7.x/avataaars/svg?seed=${persona.name}&backgroundColor=b6e3f4,c0aede,ffd5dc,ffdfbf&radius=20`}
                    />
                  </div>
                  <h3 className="text-base font-bold text-zinc-900 mb-1.5 line-clamp-1">{persona.name}</h3>
                  <p className="text-[11px] text-zinc-400 font-black uppercase tracking-wider mb-2">
                    @{persona.name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 15)}
                  </p>
                  <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed min-h-[2.5rem]">
                    {persona.description?.split('//')[1]?.trim() || persona.tagline || ''}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
    </AgeVerificationWrapper>
  );
}

