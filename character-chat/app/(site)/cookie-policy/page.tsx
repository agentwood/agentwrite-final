import Footer from '@/app/components/Footer';

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1 max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Cookie Policy</h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 leading-relaxed mb-4">
            This Cookie Policy explains how we use cookies and similar technologies on our platform.
          </p>
          <p className="text-gray-700 leading-relaxed">
            We use cookies to enhance your experience and analyze site usage.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}



