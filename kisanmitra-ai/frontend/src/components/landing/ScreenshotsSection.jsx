import React from 'react';
import { BarChart3, BrainCircuit, Leaf, CloudSun, Sprout, TrendingUp } from 'lucide-react';

const ScreenshotsSection = () => {
  return (
    <section className="bg-gray-50 py-24">
      <div className="section-container max-w-6xl mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">Designed for Clarity</h2>
          <p className="text-gray-600 text-lg">
            A clean, intuitive interface that puts complex data at your fingertips without the clutter. Explore our powerful features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
          
          {/* Large Feature 1 */}
          <div className="md:col-span-2 md:row-span-2 rounded-3xl bg-gradient-to-br from-green-50 to-green-100 p-8 flex flex-col justify-between overflow-hidden relative group border border-green-200 shadow-sm hover:shadow-md transition-all">
            <div className="z-10 relative">
              <div className="bg-green-500 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg text-white">
                <BarChart3 size={28} />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Comprehensive Dashboard</h3>
              <p className="text-gray-600 text-lg max-w-md">
                Get a bird's-eye view of your entire farm. Monitor crop health, track market trends, and make data-driven decisions from one centralized location.
              </p>
            </div>
            {/* Decorative background element */}
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
          </div>

          {/* Feature 2 */}
          <div className="rounded-3xl bg-white p-8 flex flex-col justify-between border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div>
              <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-blue-600">
                <BrainCircuit size={24} />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">AI Predictions</h4>
              <p className="text-gray-600">
                Leverage advanced machine learning to forecast yields and optimize your harvest timing.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="rounded-3xl bg-white p-8 flex flex-col justify-between border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div>
              <div className="bg-amber-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-amber-600">
                <CloudSun size={24} />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Weather Intel</h4>
              <p className="text-gray-600">
                Hyper-local weather forecasts and extreme climate alerts directly to your phone.
              </p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="rounded-3xl bg-emerald-900 p-8 flex flex-col justify-between border border-emerald-800 text-white relative overflow-hidden group shadow-md hover:shadow-xl transition-all">
            <div className="z-10 relative">
              <div className="bg-emerald-800 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-emerald-300">
                <Leaf size={24} />
              </div>
              <h4 className="text-xl font-bold mb-2">Disease Detection</h4>
              <p className="text-emerald-100/80">
                Instantly identify plant diseases by simply snapping a photo of the affected leaf.
              </p>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full filter blur-3xl opacity-20 group-hover:scale-150 transition-transform duration-700"></div>
          </div>

          {/* Feature 5 */}
          <div className="md:col-span-2 rounded-3xl bg-gradient-to-r from-teal-50 to-emerald-50 p-8 flex items-center gap-8 border border-teal-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
            <div className="flex-1">
               <h4 className="text-2xl font-bold text-gray-900 mb-2">Market Price Analysis</h4>
               <p className="text-gray-600">
                 Track historical price trends and get recommendations on the best time and market to sell your produce for maximum profit.
               </p>
            </div>
            <div className="hidden sm:flex bg-teal-500 w-16 h-16 rounded-2xl items-center justify-center text-white shadow-lg flex-shrink-0">
               <TrendingUp size={32} />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ScreenshotsSection;
