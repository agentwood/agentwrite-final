import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { Metadata } from 'next';
import { generateCategoryMetadata } from '@/lib/seo/metadata';
import { generateCharacterListSchema } from '@/lib/seo/structured-data';
import StructuredData from '@/app/components/StructuredData';
import CharacterCard from '@/app/components/CharacterCard';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

interface PageProps {
  params: Promise<{ archetype: string }>;
  searchParams: Promise<{ page?: string }>;
}

// ISR: Regenerate every 24 hours
export const revalidate = 86400;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { archetype } = await params;
  const decodedArchetype = decodeURIComponent(archetype);
  return generateCategoryMetadata(decodedArchetype, 'archetype');
}

export async function generateStaticParams() {
  const archetypes = await db.personaTemplate.groupBy({
    by: ['archetype'],
    where: {
      archetype: { not: null },
    },
  });

  return archetypes.map((arch) => ({
    archetype: encodeURIComponent(arch.archetype || ''),
  }));
}

export default async function ArchetypePage({ params, searchParams }: PageProps) {
  const { archetype } = await params;
  const { page = '1' } = await searchParams;
  const decodedArchetype = decodeURIComponent(archetype);
  const pageNum = parseInt(page, 10) || 1;
  const itemsPerPage = 48;
  const skip = (pageNum - 1) * itemsPerPage;

  const [characters, totalCount] = await Promise.all([
    db.personaTemplate.findMany({
      where: {
        archetype: decodedArchetype,
        viewCount: { gte: 0 },
      },
      take: itemsPerPage,
      skip,
      orderBy: [
        { viewCount: 'desc' },
        { interactionCount: 'desc' },
      ],
      select: {
        id: true,
        name: true,
        tagline: true,
        description: true,
        avatarUrl: true,
        category: true,
        viewCount: true,
        interactionCount: true,
      },
    }),
    db.personaTemplate.count({
      where: {
        archetype: decodedArchetype,
      },
    }),
  ]);

  if (characters.length === 0) {
    notFound();
  }

  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const baseUrl = `/archetype/${archetype}`;

  const characterListSchema = generateCharacterListSchema(
    characters.map((char) => ({
      id: char.id,
      name: char.name,
      url: `/character/${char.id}`,
      description: char.description || undefined,
      image: char.avatarUrl || undefined,
    }))
  );

  return (
    <>
      <StructuredData data={characterListSchema} />
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <main className="flex-1">
          <section className="bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600 text-white py-16 px-6">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {decodedArchetype} AI Characters
              </h1>
              <p className="text-xl text-indigo-100 max-w-2xl">
                Discover {totalCount.toLocaleString()} {decodedArchetype.toLowerCase()} AI characters
              </p>
            </div>
          </section>

          <section className="py-12 px-6">
            <div className="max-w-7xl mx-auto">
              <div className="mb-6 flex items-center justify-between">
                <p className="text-zinc-600">
                  Showing {skip + 1}-{Math.min(skip + itemsPerPage, totalCount)} of {totalCount.toLocaleString()} characters
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {characters.map((character) => (
                  <CharacterCard
                    key={character.id}
                    id={character.id}
                    name={character.name}
                    tagline={character.tagline}
                    avatarUrl={character.avatarUrl}
                    category={character.category}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-12 flex justify-center gap-2">
                  {pageNum > 1 && (
                    <a
                      href={`${baseUrl}?page=${pageNum - 1}`}
                      className="px-4 py-2 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50"
                    >
                      Previous
                    </a>
                  )}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <a
                        key={page}
                        href={`${baseUrl}${page > 1 ? `?page=${page}` : ''}`}
                        className={`px-4 py-2 rounded-lg ${
                          page === pageNum
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white border border-zinc-200 hover:bg-zinc-50'
                        }`}
                      >
                        {page}
                      </a>
                    );
                  })}
                  {pageNum < totalPages && (
                    <a
                      href={`${baseUrl}?page=${pageNum + 1}`}
                      className="px-4 py-2 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50"
                    >
                      Next
                    </a>
                  )}
                </div>
              )}
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}

