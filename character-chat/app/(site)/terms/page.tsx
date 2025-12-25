import Footer from '@/app/components/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1 max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Terms of Service</h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 leading-relaxed mb-4">
            By using Agentwood, you agree to these Terms of Service.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Please read these terms carefully before using our platform.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}



