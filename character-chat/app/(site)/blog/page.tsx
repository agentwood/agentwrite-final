import Footer from '@/app/components/Footer';

export default function BlogPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1 max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Blog</h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 leading-relaxed mb-4">
            Stay updated with the latest news, updates, and insights from Agentwood.
          </p>
          <p className="text-gray-500">Coming soon...</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}



