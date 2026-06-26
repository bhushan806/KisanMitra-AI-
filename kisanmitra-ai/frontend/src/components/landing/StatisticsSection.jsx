import React from 'react';

const StatisticsSection = () => {
  const stats = [
    { value: '5000+', label: 'Farmers Empowered' },
    { value: '50+', label: 'Commodities Tracked' },
    { value: '95%', label: 'Prediction Accuracy' },
    { value: '24x7', label: 'Platform Availability' },
  ];

  return (
    <section className="bg-primary text-white">
      <div className="section-container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/20">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">
                {stat.value}
              </span>
              <span className="text-light-green font-medium text-sm md:text-base">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatisticsSection;
