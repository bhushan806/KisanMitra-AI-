import React, { useEffect, useState } from 'react';
import { getFarmerAdvisory } from '../utils/api';
import { Lightbulb, CalendarCheck, ShieldCheck, Languages } from 'lucide-react';

const FarmerAdvisory = ({ commodity, mandi }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hindi, setHindi] = useState(false);

  useEffect(() => {
    const fetchAdvisory = async () => {
      setLoading(true);
      try {
        const res = await getFarmerAdvisory(commodity, mandi);
        setData(res);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdvisory();
  }, [commodity, mandi]);

  if (loading) return <div className="animate-pulse bg-white rounded-xl h-64 border border-gray-100"></div>;
  if (!data) return <div>No data available</div>;

  const getTranslated = (eng, hin) => hindi ? hin : eng;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 capitalize">
            {getTranslated('Farmer Advisory', 'किसान सलाह')}
          </h1>
          <p className="text-gray-500 mt-1 capitalize">{commodity} | {mandi}</p>
        </div>
        <button 
          onClick={() => setHindi(!hindi)}
          className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-bold transition-colors"
        >
          <Languages className="w-5 h-5" />
          <span>{hindi ? 'View in English' : 'हिंदी में देखें'}</span>
        </button>
      </div>

      <div className="bg-gradient-to-br from-primary/90 to-primary text-white rounded-2xl p-8 shadow-md">
        <div className="flex items-start space-x-4">
          <div className="bg-white/20 p-3 rounded-xl mt-1">
            <Lightbulb className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-4">
              {getTranslated('Actionable Recommendation', 'कार्रवाई योग्य सलाह')}
            </h2>
            <p className="text-lg leading-relaxed text-white/90 font-medium">
              {hindi ? data.advisory_text_hi : data.advisory_text}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center space-x-5">
          <div className="bg-green-100 p-4 rounded-full">
            <CalendarCheck className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
              {getTranslated('Best Selling Window', 'बेचने का सही समय')}
            </h3>
            <p className="text-xl font-bold text-gray-900">{data.best_sell_window}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center space-x-5">
          <div className="bg-blue-100 p-4 rounded-full">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
              {getTranslated('Expected Price Range', 'अनुमानित मूल्य सीमा')}
            </h3>
            <p className="text-xl font-bold text-gray-900 font-mono">{data.expected_price_range} <span className="text-sm text-gray-500">/ Qtl</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerAdvisory;
