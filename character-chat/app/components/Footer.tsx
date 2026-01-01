'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0f0f0f] px-8 py-10 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-widest">Product</h4>
            <ul className="space-y-3 text-sm text-white/40 font-medium">
              <li><Link href="/home" className="hover:text-white transition-colors">Characters</Link></li>
              <li><Link href="/create" className="hover:text-white transition-colors">Create AI</Link></li>
              <li><Link href="/mobile" className="hover:text-white transition-colors">Mobile App</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-widest">Company</h4>
            <ul className="space-y-3 text-sm text-white/40 font-medium">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/safety" className="hover:text-white transition-colors">Safety Center</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-widest">Legal</h4>
            <ul className="space-y-3 text-sm text-white/40 font-medium">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-widest">Partners</h4>
            <ul className="space-y-3 text-sm text-white/40 font-medium">
              <li>
                <Link href="/settings#payouts" className="hover:text-white transition-colors flex items-center gap-2">
                  Affiliate Program
                  <span className="bg-purple-500 text-white px-1.5 py-0.5 rounded text-[10px] font-bold">NEW</span>
                </Link>
              </li>
              <li><Link href="/create" className="hover:text-white transition-colors">Creator Fund</Link></li>
              <li><Link href="/api" className="hover:text-white transition-colors">API Access</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between text-xs text-white/40 pt-8 border-t border-white/5 font-bold uppercase tracking-widest">
          <p>© 2024 Agentwood AI Inc. Made with ❤️ in SF.</p>
          <div className="flex gap-6 mt-6 md:mt-0">
            <a href="https://twitter.com/agentwood" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Twitter (X)</a>
            <a href="https://discord.gg/agentwood" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Discord</a>
            <a href="https://instagram.com/agentwood" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
