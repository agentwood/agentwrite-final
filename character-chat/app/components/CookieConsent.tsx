'use client';

import { useState, useEffect } from 'react';

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already made a choice
        const savedConsent = localStorage.getItem('cookie-consent');
        if (!savedConsent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie-consent', 'accepted');
        setIsVisible(false);
    };

    const handleReject = () => {
        localStorage.setItem('cookie-consent', 'rejected');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 max-w-md w-full p-6 mx-4 md:mx-0">
            <div className="bg-[#E5E5EA] dark:bg-[#1C1C1E] rounded-2xl shadow-2xl p-6 text-black dark:text-white border border-black/5 dark:border-white/10 backdrop-blur-xl">
                <p className="text-[15px] leading-relaxed mb-6 font-medium text-gray-800 dark:text-gray-200">
                    We use essential cookies to make our site work. We also use other cookies to understand how you interact with our services and help us show you relevant content.
                </p>

                <p className="text-[15px] leading-relaxed mb-8 text-gray-600 dark:text-gray-400">
                    By clicking "Accept All" below, you consent to our use of cookies as further detailed in our Privacy Policy.
                </p>

                <div className="flex gap-4">
                    <button
                        onClick={handleReject}
                        className="flex-1 py-3 px-4 rounded-full bg-gray-200 dark:bg-white/10 text-black dark:text-white font-semibold text-[17px] hover:bg-gray-300 dark:hover:bg-white/20 transition-colors"
                    >
                        Reject All
                    </button>
                    <button
                        onClick={handleAccept}
                        className="flex-1 py-3 px-4 rounded-full bg-white dark:bg-white text-black font-semibold text-[17px] shadow-sm hover:bg-gray-50 transition-colors"
                    >
                        Accept All
                    </button>
                </div>
            </div>
        </div>
    );
}
