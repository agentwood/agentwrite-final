import React from 'react';
import { X, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-dipsea-bg/90 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative flex h-[600px] w-full max-w-5xl overflow-hidden rounded-sm bg-dipsea-surface shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute right-8 top-8 z-50 text-white/30 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        {/* Left Side: Auth Forms */}
        <div className="flex flex-1 flex-col justify-center px-16 text-dipsea-cream">
          <div className="mb-12">
            <h2 className="mb-4 text-5xl font-serif italic tracking-tight">Welcome.</h2>
            <p className="text-lg text-dipsea-accent font-light italic opacity-80">
              Join the wood for exclusive stories and intimate connections.
            </p>
          </div>

          <div className="space-y-6">
            <button className="flex w-full items-center justify-center gap-4 border border-white/10 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white/5 transition-all">
              Continue with Apple
            </button>
            <button className="flex w-full items-center justify-center gap-4 border border-white/10 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white/5 transition-all">
              Continue with Google
            </button>

            <div className="relative py-4 flex items-center gap-4">
              <div className="flex-1 border-t border-white/5"></div>
              <span className="text-[9px] font-bold tracking-[0.3em] text-white/20">OR</span>
              <div className="flex-1 border-t border-white/5"></div>
            </div>

            <div className="relative">
              <input 
                type="email" 
                placeholder="Email Address" 
                className="w-full bg-transparent border-b border-white/10 py-4 pr-12 text-sm font-light italic outline-none focus:border-dipsea-accent transition-all placeholder:text-white/20"
              />
              <button className="absolute right-0 top-1/2 -translate-y-1/2 text-dipsea-accent">
                <ArrowRight size={20} />
              </button>
            </div>
          </div>

          <p className="mt-12 text-[9px] text-white/20 uppercase tracking-widest font-bold text-center">
            By entering, you agree to our <a href="#" className="underline">Terms</a> & <a href="#" className="underline">Privacy</a>
          </p>
        </div>

        {/* Right Side: Hero Image */}
        <div className="hidden h-full flex-1 lg:block relative">
          <img 
            src="https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?auto=format&fit=crop&q=80&w=1200" 
            className="h-full w-full object-cover grayscale opacity-60"
            alt="Atmospheric"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-dipsea-surface to-transparent"></div>
        </div>
      </div>
    </div>
  );
};