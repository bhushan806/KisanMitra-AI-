import React, { useEffect, useState } from 'react';
import { getCropHealth } from '../utils/api';
import { Map, Droplets, Thermometer, Leaf, Satellite } from 'lucide-react';

const CropHealth = ({ mandi }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      setLoading(true);
      try {
        const res = await getCropHealth(mandi);
        setData(res);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchHealth();
  }, [mandi]);

  if (loading) return <div className="animate-pulse bg-white rounded-xl h-64 border border-gray-100"></div>;
  if (!data) return <div>No data available</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 capitalize">Crop Health Analytics</h1>
        <p className="text-gray-500 mt-1 flex items-center">
          <Satellite className="w-4 h-4 mr-2" /> 
          Satellite & Weather Proxy Indicators for {mandi.charAt(0).toUpperCase() + mandi.slice(1)}, {data.state}
        </p>
        <p className="text-xs text-gray-400 mt-1">Coords: {data.coordinates?.lat}, {data.coordinates?.lon} · Source: {data.data_source}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <Leaf className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">NDVI Proxy</h3>
          <div className="text-4xl font-mono font-bold text-gray-900 mb-2">{data.ndvi_proxy.toFixed(2)}</div>
          <div className={`text-sm font-bold px-3 py-1 rounded-full ${
            data.stress_level === 'Low' ? 'bg-green-100 text-green-800' :
            data.stress_level === 'Moderate' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
          }`}>
            {data.stress_level} Stress
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <Droplets className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Rainfall (30d)</h3>
          <div className="text-4xl font-mono font-bold text-gray-900 mb-2">{data.rainfall_30d_mm.toFixed(1)} <span className="text-xl">mm</span></div>
          <div className="text-sm text-gray-500 font-medium">Accumulated Estimated</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <Thermometer className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Avg Temperature</h3>
          <div className="text-4xl font-mono font-bold text-gray-900 mb-2">{data.temperature_avg.toFixed(1)} <span className="text-xl">°C</span></div>
          <div className="text-sm text-gray-500 font-medium">Last 7 days (Mean)</div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex">
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl flex-1 flex items-start space-x-4">
          <div className="bg-amber-200 p-2 rounded-full mt-1">
            <Map className="w-6 h-6 text-amber-800" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-900 mb-2">Agronomic Recommendation</h3>
            <p className="text-amber-800 leading-relaxed font-medium">{data.recommendation}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropHealth;
