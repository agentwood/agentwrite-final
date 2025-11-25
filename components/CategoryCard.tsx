import React from 'react';
import { BrainstormCategory } from '../types';
import * as LucideIcons from 'lucide-react';

interface CategoryCardProps {
  category: BrainstormCategory;
  onClick: (id: string) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onClick }) => {
  // Dynamically render the icon
  const IconComponent = (LucideIcons as any)[category.iconName] || LucideIcons.HelpCircle;

  return (
    <button
      onClick={() => onClick(category.id)}
      className="flex flex-col items-center justify-center p-6 bg-white border border-stone-200 rounded-lg shadow-sm hover:shadow-md hover:border-amber-200 transition-all duration-200 group h-40 w-full relative overflow-hidden"
    >
      <div className={`p-3 rounded-full mb-4 bg-stone-50 text-slate-500 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors duration-300`}>
        <IconComponent size={24} strokeWidth={1.5} />
      </div>
      <span className="font-serif font-medium text-slate-700 text-lg group-hover:text-slate-900 transition-colors">
        {category.label}
      </span>
    </button>
  );
};

export default CategoryCard;