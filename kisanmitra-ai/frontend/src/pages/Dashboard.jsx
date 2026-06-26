import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, TrendingUp, TrendingDown } from 'lucide-react';
import StatCard from '../components/StatCard';
import ForecastChart from '../components/ForecastChart';
import AlertBanner from '../components/AlertBanner';
import { getCommodities, getPredict, getAlerts } from '../utils/api';
import { useSettings } from '../contexts/SettingsContext';
import { useTranslation } from '../locales/translations';

const Dashboard = ({ commodity, mandi, horizon }) => {
  const [commodities, setCommodities] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const { mode, language } = useSettings();
  const { t } = useTranslation(language);
  const isFarmer = mode === 'farmer';

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

  const selectedComm = commodities.find(c => c.id === commodity);
  const otherComms = commodities.filter(c => c.id !== commodity).slice(0, 3);
  const displayComms = selectedComm ? [selectedComm, ...otherComms] : commodities.slice(0, 4);

  // Farmer Mode calculations
  const startPrice = forecast?.forecast[0]?.price || 0;
  const endPrice = forecast?.forecast[forecast.forecast.length - 1]?.price || 0;
  const isUp = endPrice >= startPrice;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header section */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
          {isFarmer ? t('nav_farmer_dashboard') : t('nav_command_center')}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {isFarmer ? "Welcome back. Here is the latest data for your farm." : "Real-time agricultural market intelligence and predictions."}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayComms.map((c, idx) => (
          <StatCard 
            key={c.id} 
            title={isFarmer ? `${c.name} (Today)` : `${c.name} Today`} 
            price={c.price} 
            change={c.change_pct} 
            isLoading={loading}
            lastTraded={c.last_traded_time}
            source={c.source}
            delay={idx * 0.1}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart / Farmer Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="lg:col-span-2 bg-white shadow-sm  rounded-3xl p-6 shadow-2xl border border-gray-200 relative overflow-hidden"
        >
          <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
          
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 capitalize flex items-center">
                  {isFarmer ? t('nav_farmer_prices') : `${commodity} Forecast`} <span className="text-zinc-600 font-normal ml-2 text-sm">({mandi})</span>
                </h2>
              </div>
            </div>
            
            {!isFarmer && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-white shadow-sm border border-gray-200">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                  <span className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">Live Model</span>
                </div>
                <span className="bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                  {horizon}D Horizon
                </span>
              </div>
            )}
          </div>
          
          {loading ? (
            <div className="w-full h-[400px] rounded-xl overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-900/50 via-zinc-800/50 to-zinc-900/50 animate-[loading_2s_infinite_linear] bg-[length:200%_100%]" />
            </div>
          ) : isFarmer ? (
            <div className="flex flex-col items-center justify-center h-[400px] bg-white shadow-sm rounded-2xl border border-gray-200">
              <div className={`p-8 rounded-full mb-6 ${isUp ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-400'}`}>
                {isUp ? <TrendingUp className="w-24 h-24" /> : <TrendingDown className="w-24 h-24" />}
              </div>
              <h3 className="text-3xl font-extrabold text-gray-900 mb-2">
                Prices will go {isUp ? "UP" : "DOWN"}
              </h3>
              <p className="text-gray-600 text-lg">
                In {horizon} days, expect prices around <strong className="text-gray-900">₹{endPrice.toFixed(0)}/q</strong>
              </p>
            </div>
          ) : (
            <ForecastChart data={forecast?.forecast} />
          )}
        </motion.div>

        {/* Alerts Column */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <ShieldAlert className="w-5 h-5 mr-2 text-gray-500" />
              {isFarmer ? t('nav_farmer_warnings') : "Active Threats"}
            </h2>
            {alerts.length > 0 && (
              <span className="bg-red-500 text-zinc-950 text-xs font-bold px-2 py-0.5 rounded-full">
                {alerts.length}
              </span>
            )}
          </div>
          
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-white shadow-sm rounded-2xl border border-gray-200 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[loading_1.5s_infinite_linear] bg-[length:200%_100%]" />
                </div>
              ))}
            </div>
          ) : alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.map((a, i) => <AlertBanner key={i} alert={a} index={i} />)}
            </div>
          ) : (
            <div className="bg-white shadow-sm  rounded-3xl p-8 text-center border border-gray-200 h-[400px] flex flex-col justify-center items-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 border border-primary/20">
                <ShieldAlert className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-gray-900 font-bold text-lg mb-1">
                {isFarmer ? "Everything is Safe" : "Market is Stable"}
              </h3>
              <p className="text-gray-500 text-sm max-w-[200px] mx-auto">
                {isFarmer ? "There are no sudden price drops." : "AI models detect no significant price volatility in your tracked markets."}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
