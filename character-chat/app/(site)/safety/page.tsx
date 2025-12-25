import Footer from '@/app/components/Footer';

export default function SafetyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1 max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Safety Center</h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 leading-relaxed mb-4">
            Your safety is our priority. We have comprehensive safety measures in place to ensure a positive experience.
          </p>
          <p className="text-gray-700 leading-relaxed">
            If you encounter any issues, please contact our support team.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}




