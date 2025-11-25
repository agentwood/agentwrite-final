import React from 'react';
import { Lightbulb } from 'lucide-react';

const ProTip: React.FC = () => {
  return (
    <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-5 relative mb-6">
      <div className="flex items-center gap-2 mb-2 text-amber-700">
          <Lightbulb size={16} />
          <h3 className="font-serif font-bold text-sm">Writing Tip</h3>
      </div>
      <p className="text-slate-600 leading-relaxed text-xs font-light italic">
        "Brainstorming works best when you give specific constraints. Instead of 'A scary monster', try 'A monster that lives in a mirror and steals reflections.'"
      </p>
    </div>
  );
};

export default ProTip;