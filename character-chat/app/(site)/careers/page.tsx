import Footer from '@/app/components/Footer';

export default function CareersPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1 max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Careers</h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 leading-relaxed mb-4">
            Join the Agentwood team and help shape the future of AI interactions.
          </p>
          <p className="text-gray-700 leading-relaxed">
            We're always looking for talented individuals to join our mission.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}




