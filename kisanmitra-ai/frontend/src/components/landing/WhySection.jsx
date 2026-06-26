import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const WhySection = () => {
  const benefits = [
    'Live Market Intelligence',
    'Accurate AI Predictions',
    'Data Driven Decisions',
    'Save Time',
    'Increase Profit',
    'Reduce Risk',
  ];

  return (
    <section className="bg-gray-50">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?q=80&w=1000&auto=format&fit=crop" 
              alt="Farmer using mobile app" 
              loading="lazy"
              className="rounded-2xl shadow-lg w-full h-[500px] object-cover border border-gray-200"
            />
          </div>

          <div>
            <h2 className="mb-6">Why Choose KisanMitra?</h2>
            <p className="text-gray-600 text-lg mb-8">
              We bridge the gap between traditional farming wisdom and modern data science. Our platform is built specifically for the Indian agricultural context.
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <CheckCircle2 size={24} className="text-primary flex-shrink-0" />
                  <span className="text-gray-800 font-medium">{benefit}</span>
                </div>
              ))}
            </div>

            <button className="mt-12 btn-secondary">
              Learn More About Us
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};

export default WhySection;
