import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: 'How accurate are the price predictions?',
      answer: 'Our models are trained on over 10 years of historical mandi data from Agmarknet, achieving an average accuracy of 90-95% for 30-day forecasts across major commodities.'
    },
    {
      question: 'Is the platform available in regional languages?',
      answer: 'Currently we support English and Hindi. We are actively working on adding Marathi, Punjabi, and Tamil in the next update.'
    },
    {
      question: 'How do I use the disease detection feature?',
      answer: 'Simply take a clear photo of the affected plant leaf using your smartphone and upload it to the dashboard. Our AI will analyze the image and provide the diagnosis along with treatment recommendations within seconds.'
    },
    {
      question: 'Do I need a reliable internet connection?',
      answer: 'The dashboard requires an internet connection to fetch real-time data, but the platform is highly optimized to load quickly even on 3G networks typical in rural areas.'
    }
  ];

  return (
    <section className="bg-white">
      <div className="section-container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600 text-lg">
            Got questions? We've got answers.
          </p>
        </div>

        <div className="space-y-4 max-w-3xl mx-auto">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className={`border rounded-xl overflow-hidden transition-colors duration-300 ${openIndex === idx ? 'border-primary bg-light-green' : 'border-gray-200 bg-white'}`}
            >
              <button 
                className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
                onClick={() => setOpenIndex(openIndex === idx ? -1 : idx)}
              >
                <span className={`font-bold ${openIndex === idx ? 'text-primary' : 'text-gray-900'}`}>
                  {faq.question}
                </span>
                <ChevronDown 
                  size={20} 
                  className={`transition-transform duration-300 ${openIndex === idx ? 'rotate-180 text-primary' : 'text-gray-500'}`} 
                />
              </button>
              
              <div 
                className={`px-6 pb-5 text-gray-600 transition-all duration-300 ease-in-out overflow-hidden ${
                  openIndex === idx ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 pb-0'
                }`}
              >
                {faq.answer}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
