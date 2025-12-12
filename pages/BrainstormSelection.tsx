
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Feather, Layout } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { CATEGORIES } from '../constants';
import CategoryCard from '../components/CategoryCard';

const BrainstormSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4">
      <Navigation />
      <div className="max-w-6xl mx-auto">
          {/* Navigation Header */}
          <div className="flex items-center justify-between mb-12">
             <button 
                onClick={() => navigate(-1)} 
                className="text-slate-500 hover:text-slate-900 text-sm font-medium flex items-center gap-2 bg-white px-4 py-2 rounded border border-stone-200 shadow-sm transition"
             >
                <ArrowLeft size={16} /> Back
            </button>

            <div className="flex items-center gap-2 opacity-40">
                <Feather size={18} />
                <span className="font-serif font-bold text-lg">AgentWrite</span>
            </div>

            <button 
                onClick={() => navigate('/dashboard')} 
                className="text-slate-700 hover:text-slate-900 text-sm font-bold flex items-center gap-2 bg-white px-4 py-2 rounded border border-stone-200 shadow-sm hover:shadow-md transition"
             >
                <Layout size={16} /> Dashboard
            </button>
          </div>

          <div className="text-center mb-16">
            <h1 className="font-serif text-4xl md:text-5xl text-slate-900 mb-4">
              Creative Engine
            </h1>
            <p className="text-lg text-slate-500 font-light max-w-xl mx-auto">
              Select a domain to initialize the generative models.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {CATEGORIES.map((cat) => (
              <CategoryCard 
                key={cat.id} 
                category={cat} 
                onClick={(id) => navigate(`/brainstorm/${id}`)} 
              />
            ))}
          </div>
      </div>
      <Footer />
    </div>
  );
};

export default BrainstormSelection;
