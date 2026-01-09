import { getSortedPostsData } from '@/lib/blog/service';
import Link from 'next/link';
import Footer from '@/app/components/Footer';

export default async function BlogPage() {
  const allPostsData = await getSortedPostsData();

  return (
    <div className="min-h-screen flex flex-col bg-[#0c0f16] text-white">
      <main className="flex-1 max-w-6xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4">The Wood Blog</h1>
          <p className="text-gray-400 text-xl">
            Insights, tutorials, and news from the frontier of AI companionship.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allPostsData.map(({ slug, date, title, excerpt, image, author, tags }) => (
            <Link
              key={slug}
              href={`/blog/${slug}`}
              className="group bg-[#161b22] rounded-2xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] flex flex-col"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={image}
                  alt={title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  {tags.slice(0, 2).map(tag => (
                    <span key={tag} className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                  <span>{new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  <span>•</span>
                  <span>By {author}</span>
                </div>
                <h2 className="text-xl font-bold mb-3 group-hover:text-purple-400 transition-colors line-clamp-2">
                  {title}
                </h2>
                <p className="text-gray-400 text-sm line-clamp-3 mb-6 flex-1 italic">
                  "{excerpt}"
                </p>
                <div className="flex items-center text-purple-400 text-sm font-bold group-hover:gap-2 transition-all">
                  Read Article →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}




