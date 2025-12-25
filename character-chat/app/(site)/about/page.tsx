import Footer from '@/app/components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1 max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">About Agentwood</h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 leading-relaxed mb-4">
            Agentwood is an AI-powered platform that enables users to create, discover, and chat with AI characters.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Our mission is to make AI interactions more engaging, personalized, and meaningful.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}



