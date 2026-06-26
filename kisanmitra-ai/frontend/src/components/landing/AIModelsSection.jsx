import React from 'react';
import { Cpu, Server, Network } from 'lucide-react';

const AIModelsSection = () => {
  const models = [
    {
      title: 'Price Prediction',
      icon: <Network size={24} />,
      algorithms: ['Random Forest', 'XGBoost', 'LSTM'],
      desc: 'We analyze historical market data to predict future prices with high accuracy.'
    },
    {
      title: 'Crop Recommendation',
      icon: <Cpu size={24} />,
      algorithms: ['Random Forest'],
      desc: 'Recommends the best crop based on your soil type, rainfall, and climate data.'
    },
    {
      title: 'Disease Detection',
      icon: <Server size={24} />,
      algorithms: ['CNN (Convolutional Neural Network)'],
      desc: 'Instantly identifies plant diseases from a simple uploaded photograph.'
    },
    {
      title: 'Weather Analysis',
      icon: <Network size={24} />,
      algorithms: ['Time Series Models'],
      desc: 'Predicts micro-climate weather patterns to help plan farm operations.'
    }
  ];

  return (
    <section className="bg-gray-50 border-y border-gray-100">
      <div className="section-container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="mb-4">Our Technology</h2>
          <p className="text-gray-600 text-lg">
            We use advanced machine learning models trained specifically on Indian agricultural data to provide you with the most accurate insights.
          </p>
        </div>

        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {models.map((model, idx) => (
            <div key={idx} className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
              <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-primary mb-6 border border-gray-100">
                {model.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{model.title}</h3>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed flex-grow">{model.desc}</p>
              <div className="flex flex-wrap gap-2">
                {model.algorithms.map((algo, i) => (
                  <span key={i} className="bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-md">
                    {algo}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AIModelsSection;
