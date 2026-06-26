import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative pt-[120px] pb-20 overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Content */}
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-light-green text-secondary text-sm font-semibold mb-6 border border-green-200">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              KisanMitra AI Intelligence
            </div>
            
            <h1>
              AI-Powered <span className="text-primary">Agriculture Intelligence</span> for Every Farmer
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed">
              Predict crop prices, receive crop recommendations, detect diseases, analyze weather, and make better farming decisions using real-time AI insights.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-10">
              <button 
                onClick={() => navigate('/dashboard')}
                className="btn-primary"
              >
                Get Started
              </button>
              <button 
                className="btn-secondary gap-2"
              >
                <Play size={20} className="text-accent" fill="currentColor" />
                Watch Demo
              </button>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative lg:ml-auto">
            <div className="absolute inset-0 bg-light-green rounded-full blur-3xl opacity-50 scale-110 -z-10 translate-x-10 translate-y-10"></div>
            <img 
              src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=2000&auto=format&fit=crop" 
              alt="Professional farmer checking crops with technology" 
              loading="lazy"
              className="rounded-2xl shadow-xl object-cover w-full h-[500px] object-center border border-gray-100"
            />
            {/* Simple floating badge */}
            <div className="absolute bottom-6 left-6 bg-white p-4 rounded-xl shadow-lg border border-gray-100 flex items-center gap-4 animate-fade-up">
              <div className="bg-light-green p-3 rounded-lg text-primary">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Profit Increase</p>
                <p className="text-xl font-bold text-gray-900">+34% Expected</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
