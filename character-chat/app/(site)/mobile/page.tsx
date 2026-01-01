import Link from 'next/link';
import { Smartphone, Apple, Play } from 'lucide-react';

export const metadata = {
    title: 'Mobile App | Agentwood',
    description: 'Download the Agentwood mobile app for iOS and Android.',
};

export default function MobilePage() {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
            <div className="max-w-xl text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
                    <Smartphone size={40} className="text-white" />
                </div>

                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Agentwood Mobile
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                    Chat with AI characters anytime, anywhere. Our mobile app is coming soon!
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                    <button className="px-8 py-4 bg-black text-white rounded-xl font-semibold flex items-center justify-center gap-3 hover:bg-gray-800 transition-colors">
                        <Apple size={24} />
                        App Store (Coming Soon)
                    </button>
                    <button className="px-8 py-4 bg-black text-white rounded-xl font-semibold flex items-center justify-center gap-3 hover:bg-gray-800 transition-colors">
                        <Play size={24} />
                        Google Play (Coming Soon)
                    </button>
                </div>

                <p className="text-sm text-gray-500">
                    Want early access? <Link href="/signup" className="text-indigo-600 hover:underline font-medium">Sign up</Link> and we'll notify you when it launches.
                </p>
            </div>
        </div>
    );
}
