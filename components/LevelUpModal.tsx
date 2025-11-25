import React, { useEffect, useState } from 'react';
import { X, Award, Star, ArrowRight } from 'lucide-react';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  level: number;
}

const LevelUpModal: React.FC<LevelUpModalProps> = ({ isOpen, onClose, level }) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAnimate(true);
    } else {
      setAnimate(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Modal Content - Elegant Dark Mode Card */}
      <div className={`
        relative bg-white w-full max-w-md rounded-lg shadow-2xl overflow-hidden transform transition-all duration-500 border border-stone-200
        ${animate ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'}
      `}>
        
        <div className="relative z-10 p-10 text-center">
          <div className="mx-auto w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-stone-100">
            <Award size={40} className="text-amber-600" strokeWidth={1.5} />
          </div>
          
          <h2 className="font-serif text-3xl text-slate-900 mb-2">
            Milestone Reached
          </h2>
          
          <div className="text-amber-600 text-sm font-semibold tracking-widest uppercase mb-8">
            Rank {level}: Journeyman
          </div>
          
          <p className="text-slate-500 mb-8 leading-relaxed font-light">
            You have demonstrated exceptional consistency. Your dedication to the craft has unlocked the <span className="text-slate-900 font-medium">Noir Theme</span> and <span className="text-slate-900 font-medium">500 Credits</span>.
          </p>

          <button 
            onClick={onClose}
            className="w-full bg-slate-900 text-white py-3 rounded-md font-medium text-sm hover:bg-slate-800 transition flex items-center justify-center gap-2"
          >
            Collect Rewards <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LevelUpModal;