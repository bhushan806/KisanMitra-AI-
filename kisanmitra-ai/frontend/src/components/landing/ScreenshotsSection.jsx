import React, { useState } from 'react';

const ScreenshotsSection = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');

  const tabs = [
    { name: 'Dashboard', image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1200&auto=format&fit=crop' },
    { name: 'Prediction Page', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop' },
    { name: 'Disease Detection', image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=1200&auto=format&fit=crop' },
    { name: 'Weather Page', image: 'https://images.unsplash.com/photo-1561484930-998b6a7b22e8?q=80&w=1200&auto=format&fit=crop' }
  ];

  const activeImage = tabs.find(t => t.name === activeTab)?.image;

  return (
    <section className="bg-white">
      <div className="section-container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="mb-4">Designed for Clarity</h2>
          <p className="text-gray-600 text-lg">
            A clean, intuitive interface that puts complex data at your fingertips without the clutter.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`px-6 py-2.5 rounded-full font-medium transition-colors ${
                activeTab === tab.name 
                  ? 'bg-primary text-white shadow-md' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Laptop Mockup */}
        <div className="max-w-5xl mx-auto relative">
          <div className="bg-gray-900 rounded-t-2xl p-3 pb-0 shadow-2xl border-x-4 border-t-4 border-gray-800">
            <div className="bg-white rounded-t-lg overflow-hidden aspect-[16/10] relative">
              <img 
              src={activeImage} 
              alt="Dashboard interface preview" 
              loading="lazy"
              className="w-full h-full object-cover transition-opacity duration-500"
            />
              {/* Fake UI Overlay just for preview */}
              <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]"></div>
            </div>
          </div>
          <div className="bg-gray-300 h-4 rounded-b-2xl shadow-xl w-[105%] -ml-[2.5%] relative flex justify-center">
             <div className="w-32 h-2 bg-gray-400 rounded-b-md absolute top-0"></div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ScreenshotsSection;
