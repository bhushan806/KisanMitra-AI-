import React from 'react';
import { Users, LineChart, Cpu, CloudRain, Database } from 'lucide-react';

const TrustSection = () => {
  const items = [
    { icon: <Users size={20} />, text: '5000+ Farmers' },
    { icon: <LineChart size={20} />, text: 'Real-time Market Prices' },
    { icon: <Cpu size={20} />, text: 'AI Prediction Models' },
    { icon: <CloudRain size={20} />, text: 'Weather Integrated' },
    { icon: <Database size={20} />, text: 'Government Data Sources' },
  ];

  return (
    <section className="bg-gray-50 border-y border-gray-100">
      <div className="section-container">
        <p className="text-center text-gray-500 font-medium mb-8 uppercase tracking-wider text-sm">
          Trusted by over 5,000+ farmers across India
        </p>
        <div className="flex flex-wrap justify-center md:justify-between items-center gap-6 md:gap-4">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-gray-600 font-medium">
              <span className="text-primary flex-shrink-0">{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
