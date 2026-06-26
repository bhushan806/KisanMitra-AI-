import React from 'react';
import { Cloud, TrendingUp, AlertTriangle } from 'lucide-react';

const LiveFeatures = () => {
  return (
    <section className="bg-primary overflow-hidden">
      <div className="section-container">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12">
          <h2 className="text-white mb-4 md:mb-0">Live Platform Data</h2>
          <span className="flex items-center gap-2 text-light-green text-sm font-medium bg-white/10 px-4 py-2 rounded-full">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
            System Online
          </span>
        </div>

        {/* Scrollable Container for Mobile */}
        <div className="overflow-x-auto pb-6 -mx-6 px-6 md:mx-0 md:px-0 scrollbar-hide">
          <div className="flex gap-6 min-w-max md:min-w-0 md:grid md:grid-cols-3 items-stretch">
            
            {/* Weather Card */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 w-[300px] md:w-auto flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-white/20 p-2 rounded-lg text-white">
                  <Cloud size={24} />
                </div>
                <span className="text-white/80 text-sm">Real Time Weather</span>
              </div>
              <p className="text-3xl font-bold text-white mb-1">28°C</p>
              <p className="text-white/80 text-sm">Pune, Maharashtra · Mostly Sunny</p>
            </div>

            {/* Market Prices */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 w-[300px] md:w-auto flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-white/20 p-2 rounded-lg text-white">
                  <TrendingUp size={24} />
                </div>
                <span className="text-white/80 text-sm">Top Commodity</span>
              </div>
              <p className="text-3xl font-bold text-white mb-1">₹2,450</p>
              <p className="text-white/80 text-sm">Onion (Lasalgaon) <span className="text-light-green font-medium">↑ 4.2%</span></p>
            </div>

            {/* AI Prediction */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 w-[300px] md:w-auto flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-white/20 p-2 rounded-lg text-white">
                  <AlertTriangle size={24} />
                </div>
                <span className="text-white/80 text-sm">Latest AI Alert</span>
              </div>
              <p className="text-lg font-bold text-white mb-1 leading-tight">High probability of rain next week.</p>
              <p className="text-white/80 text-sm mt-2">Delay wheat harvesting.</p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveFeatures;
