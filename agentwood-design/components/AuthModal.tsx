
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
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative flex h-[600px] w-full max-w-5xl overflow-hidden rounded-[2.5rem] bg-[#1a1a1a] shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 z-50 rounded-full bg-black/20 p-2 text-white/50 hover:bg-black/40 hover:text-white transition-all"
        >
          <X size={20} />
        </button>

        {/* Left Side: Auth Forms */}
        <div className="flex flex-1 flex-col justify-center px-16 text-white">
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-4xl font-black tracking-tight">Log in/ Sign up</h2>
            <p className="text-lg text-purple-400 font-medium">
              to chat with over 20M characters for Free and enjoy fancy features!
            </p>
          </div>

          <div className="space-y-4">
            <button className="flex w-full items-center justify-center gap-3 rounded-full bg-white py-4 font-bold text-black transition-transform hover:scale-[1.01] active:scale-95">
              <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" className="w-5" alt="Apple" />
              Continue with Apple
            </button>
            <button className="flex w-full items-center justify-center gap-3 rounded-full bg-white py-4 font-bold text-black transition-transform hover:scale-[1.01] active:scale-95">
              <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-5" alt="Google" />
              Continue with Google
            </button>

            <div className="relative py-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#1a1a1a] px-4 text-white/30 font-bold tracking-widest">OR</span>
              </div>
            </div>

            <div className="relative group">
              <input 
                type="email" 
                placeholder="Email address" 
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-6 pr-14 text-sm outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white group-focus-within:bg-purple-600 transition-colors">
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          <p className="mt-12 text-center text-xs text-white/30">
            By continuing, I agree to PolyBuzz's <a href="#" className="text-white/60 hover:text-white underline">Privacy Policy</a> and <a href="#" className="text-white/60 hover:text-white underline">Terms of Use</a>
          </p>
        </div>

        {/* Right Side: Hero Image */}
        <div className="hidden h-full flex-1 lg:block">
          <img 
            src="https://images.unsplash.com/photo-1614728263952-84ea206f25ab?auto=format&fit=crop&q=80&w=1200" 
            className="h-full w-full object-cover"
            alt="Anime Hero"
          />
          <div className="absolute inset-y-0 left-[50%] w-32 bg-gradient-to-r from-[#1a1a1a] to-transparent pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
};
