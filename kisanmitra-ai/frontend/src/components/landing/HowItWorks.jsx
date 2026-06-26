import React from 'react';

const HowItWorks = () => {
  const steps = [
    { number: '1', title: 'Collect Live Data', desc: 'We gather real-time data from government mandis, weather stations, and satellites.' },
    { number: '2', title: 'AI Processing', desc: 'Our machine learning models analyze the data to find patterns and trends.' },
    { number: '3', title: 'Prediction Models', desc: 'We generate accurate forecasts for prices, weather, and crop health.' },
    { number: '4', title: 'Farmer Dashboard', desc: 'Insights are delivered to your easy-to-use digital dashboard.' },
    { number: '5', title: 'Better Decisions', desc: 'You make informed choices that increase yield and maximize profit.' },
  ];

  return (
    <section className="bg-white">
      <div className="section-container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="mb-4">How It Works</h2>
          <p className="text-gray-600 text-lg">
            Get actionable insights in three simple steps. No technical expertise required.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative items-stretch max-w-5xl mx-auto">
          {steps.map((step, idx) => (
            <div 
              key={idx} 
              className="relative bg-white p-8 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center text-center h-full"
            >
              <div className="w-16 h-16 bg-light-green text-primary rounded-full flex items-center justify-center mb-6 font-bold text-xl">
                {step.number}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-600 leading-relaxed flex-grow">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
