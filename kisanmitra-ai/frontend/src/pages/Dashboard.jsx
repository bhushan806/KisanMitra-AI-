import React, { useEffect, useState } from 'react';
import StatCard from '../components/StatCard';
import ForecastChart from '../components/ForecastChart';
import AlertBanner from '../components/AlertBanner';
import { getCommodities, getPredict, getAlerts } from '../utils/api';

const Dashboard = ({ commodity, mandi, horizon }) => {
  const [commodities, setCommodities] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [comms, pred, alrts] = await Promise.all([
          getCommodities(),
          getPredict(commodity, mandi, horizon),
          getAlerts()
        ]);
        setCommodities(comms.commodities);
        setForecast(pred);
        setAlerts(alrts.alerts);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [commodity, mandi, horizon]);

  // Find the selected commodity to show first
  const selectedComm = commodities.find(c => c.id === commodity);
  // Get 3 other commodities to show
  const otherComms = commodities.filter(c => c.id !== commodity).slice(0, 3);
  const displayComms = selectedComm ? [selectedComm, ...otherComms] : commodities.slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayComms.map((c) => (
          <StatCard 
            key={c.id} 
            title={`${c.name} Today`} 
            price={c.price} 
            change={c.change_pct} 
            isLoading={loading}
            lastTraded={c.last_traded_time}
            source={c.source}
          />
        ))}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-900 capitalize">{commodity} Price Forecast ({mandi})</h2>
          <span className="bg-[#1B6B3A]/10 text-[#1B6B3A] px-3 py-1 rounded-full text-xs font-bold">
            {horizon} Day Horizon
          </span>
        </div>
        {loading ? (
          <div className="w-full h-[400px] bg-gray-50 animate-pulse rounded-lg"></div>
        ) : (
          <ForecastChart data={forecast?.forecast} />
        )}
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Critical Market Alerts</h2>
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => <div key={i} className="h-20 bg-gray-50 animate-pulse rounded-xl border border-gray-100"></div>)}
          </div>
        ) : alerts.length > 0 ? (
          alerts.map((a, i) => <AlertBanner key={i} alert={a} />)
        ) : (
          <div className="bg-white rounded-xl p-8 text-center border border-gray-100 shadow-sm">
            <div className="text-4xl mb-3">🌿</div>
            <h3 className="text-gray-900 font-bold">All prices are stable</h3>
            <p className="text-gray-500 text-sm mt-1">No critical or high alerts detected across markets.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
