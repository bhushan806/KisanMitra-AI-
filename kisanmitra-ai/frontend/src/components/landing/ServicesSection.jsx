import React from 'react';
import { TrendingUp, Sprout, Bug, CloudSun, BarChart3, PieChart } from 'lucide-react';

const ServicesSection = () => {
  const services = [
    {
      icon: <TrendingUp size={28} className="text-primary" />,
      title: 'Market Price Prediction',
      desc: 'Predict future commodity prices up to 30 days ahead using advanced AI models.',
    },
    {
      icon: <Sprout size={28} className="text-primary" />,
      title: 'Crop Recommendation',
      desc: 'Find the most profitable and suitable crop for your soil and weather conditions.',
    },
    {
      icon: <Bug size={28} className="text-primary" />,
      title: 'Disease Detection',
      desc: 'Identify crop diseases instantly by uploading a photo of the affected plant.',
    },
    {
      icon: <CloudSun size={28} className="text-primary" />,
      title: 'Weather Forecast',
      desc: 'Hyper-local 7-day microclimate data to plan your sowing and harvesting.',
    },
    {
      icon: <BarChart3 size={28} className="text-primary" />,
      title: 'Yield Prediction',
      desc: 'Estimate your crop yield before harvest based on historical data and current health.',
    },
    {
      icon: <PieChart size={28} className="text-primary" />,
      title: 'Market Analytics',
      desc: 'Analyze trends across different mandis to decide where and when to sell.',
    },
  ];

  return (
    <section className="bg-white" id="services">
      <div className="section-container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="mb-4">Everything You Need to Succeed</h2>
          <p className="text-gray-600 text-lg">
            Our comprehensive suite of AI tools covers every aspect of your farming journey, from pre-sowing decisions to post-harvest sales.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {services.map((service, idx) => (
            <div 
              key={idx} 
              className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col"
            >
              <div className="bg-light-green w-12 h-12 rounded-lg flex items-center justify-center text-primary mb-6">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
              <p className="text-gray-600 leading-relaxed flex-grow">{service.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
