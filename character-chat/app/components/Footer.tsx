'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-12 px-6 mt-auto" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="max-w-7xl mx-auto">
        {/* Top Row - Main Links */}
        <div className="flex flex-wrap justify-center gap-8 mb-8">
          <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium">
            About
          </Link>
          <Link href="/careers" className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium">
            Careers
          </Link>
          <Link href="/safety" className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium">
            Safety Center
          </Link>
          <Link href="/blog" className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium">
            Blog
          </Link>
        </div>

        {/* Bottom Row - Legal Links */}
        <div className="flex flex-wrap justify-center gap-6 pt-6 border-t border-gray-200">
          <Link href="/cookie-policy" className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
            Cookie Policy
          </Link>
          <Link href="/privacy" className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}

