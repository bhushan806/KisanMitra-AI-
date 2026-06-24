import React, { useEffect, useState } from 'react';
import ForecastChart from '../components/ForecastChart';
import { getPredict } from '../utils/api';
import { Activity, Zap, CheckCircle2, TrendingUp, BarChart3 } from 'lucide-react';

const Forecast = ({ commodity, mandi, horizon }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForecast = async () => {
      setLoading(true);
      try {
        const pred = await getPredict(commodity, mandi, horizon);
        setData(pred);
      } catch (error) {
        console.error("Forecast error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchForecast();
  }, [commodity, mandi, horizon]);

  if (loading) return <div className="animate-pulse bg-white rounded-xl h-96 w-full border border-gray-100"></div>;
  if (!data) return <div>Failed to load forecast data.</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 capitalize">{commodity} Forecast</h1>
            <p className="text-gray-500 mt-1 flex items-center">
              <Activity className="w-4 h-4 mr-1" /> Ensemble Model Prediction for {mandi}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-1">Horizon</p>
            <p className="text-xl font-bold text-primary">{horizon} Days</p>
          </div>
        </div>
        
        <ForecastChart data={data.forecast} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-2" /> Model Accuracy
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-medium text-gray-700">Mean Absolute Error (MAE)</span>
              <span className="font-mono font-bold text-gray-900">₹{data.accuracy.mae}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-medium text-gray-700">Root Mean Sq. Error (RMSE)</span>
              <span className="font-mono font-bold text-gray-900">₹{data.accuracy.rmse}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">Mean Abs. Pct. Error (MAPE)</span>
              <span className="font-mono font-bold text-primary">{(data.accuracy.mape * 100).toFixed(2)}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
            <BarChart3 className="w-4 h-4 mr-2" /> Ensemble Weights
          </h3>
          <div className="space-y-4">
            {Object.entries(data.model_weights).map(([model, weight]) => (
              <div key={model}>
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span className="text-gray-700">{model}</span>
                  <span className="text-gray-900">{(weight * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className="bg-accent h-2.5 rounded-full" style={{ width: `${weight * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forecast;
