import Footer from '@/app/components/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1 max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 leading-relaxed mb-4">
            Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information.
          </p>
          <p className="text-gray-700 leading-relaxed">
            We are committed to protecting your personal data and ensuring transparency in our data practices.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}




