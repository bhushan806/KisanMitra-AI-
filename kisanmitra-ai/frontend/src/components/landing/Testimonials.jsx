import React from 'react';
import { Star } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Ramesh Patil',
      village: 'Nashik, Maharashtra',
      photo: 'https://images.unsplash.com/photo-1506869640319-fea1a2753086?q=80&w=200&auto=format&fit=crop',
      feedback: "The price prediction feature helped me decide the best time to sell my onion crop. I made 20% more profit this season."
    },
    {
      name: 'Gurpreet Singh',
      village: 'Ludhiana, Punjab',
      photo: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?q=80&w=200&auto=format&fit=crop',
      feedback: "I uploaded a photo of my wheat crop, and the AI correctly identified the rust disease. The recommended treatment saved my entire field."
    },
    {
      name: 'Suresh Kumar',
      village: 'Coimbatore, Tamil Nadu',
      photo: 'https://images.unsplash.com/photo-1534346911674-0414b2d9d1eb?q=80&w=200&auto=format&fit=crop',
      quote: "The hyper-local weather alerts are very accurate. I now plan my irrigation schedules entirely based on KisanMitra's dashboard."
    }
  ];

  return (
    <section className="bg-gray-50 border-y border-gray-100">
      <div className="section-container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="mb-4">Voices from the Field</h2>
          <p className="text-gray-600 text-lg">
            Hear how KisanMitra AI is transforming lives and businesses across the country.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          {testimonials.map((testimonial, idx) => (
            <div key={idx} className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 h-full flex flex-col">
              <div className="flex text-accent mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={18} fill="currentColor" />
                ))}
              </div>
              <p className="text-gray-700 italic mb-8 leading-relaxed flex-grow">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-4 border-t border-gray-50 pt-6">
                <img src={testimonial.photo} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover border-2 border-gray-100" />
                <div>
                  <h5 className="font-bold text-gray-900">{testimonial.name}</h5>
                  <p className="text-sm text-gray-500">{testimonial.village}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
