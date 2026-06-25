import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ForecastChart from '../components/ForecastChart';
import { getPredict } from '../utils/api';
import { Activity, CheckCircle2, BarChart3, TrendingUp, TrendingDown, Target, IndianRupee } from 'lucide-react';
import { cn } from '../lib/utils';
import { useSettings } from '../contexts/SettingsContext';
import { useTranslation } from '../locales/translations';

const Forecast = ({ commodity, mandi, horizon }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const { mode, language } = useSettings();
  const { t } = useTranslation(language);
  const isFarmer = mode === 'farmer';

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

  if (loading) return (
    <div className="w-full h-[600px] bg-zinc-900/50 rounded-3xl border border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-900/50 via-zinc-800/50 to-zinc-900/50 animate-[loading_2s_infinite_linear] bg-[length:200%_100%]" />
    </div>
  );
  if (!data) return <div className="p-8 text-center text-zinc-500 font-medium">Failed to load predictive models. API connection lost.</div>;

  // Calculate trend summary
  const startPrice = data.forecast[0]?.price || 0;
  const endPrice = data.forecast[data.forecast.length - 1]?.price || 0;
  const diff = endPrice - startPrice;
  const percentChange = ((diff / startPrice) * 100).toFixed(1);
  const isUp = diff >= 0;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top terminal bar */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between bg-zinc-950 border border-white/10 rounded-2xl p-4 shadow-xl"
      >
        <div className="flex flex-wrap gap-4 items-center mb-4 md:mb-0">
          <div className="px-3 py-1.5 bg-zinc-900 rounded-lg border border-white/5 flex items-center">
            <span className="text-zinc-500 text-xs font-bold tracking-widest uppercase mr-2">{isFarmer ? "Crop" : "Asset"}</span>
            <span className="text-emerald-400 font-mono font-bold capitalize">{commodity}{!isFarmer && "-INR"}</span>
          </div>
          <div className="px-3 py-1.5 bg-zinc-900 rounded-lg border border-white/5 flex items-center">
            <span className="text-zinc-500 text-xs font-bold tracking-widest uppercase mr-2">{isFarmer ? "Market" : "Market"}</span>
            <span className="text-zinc-200 font-mono font-bold capitalize">{mandi}</span>
          </div>
          <div className="px-3 py-1.5 bg-zinc-900 rounded-lg border border-white/5 flex items-center">
            <span className="text-zinc-500 text-xs font-bold tracking-widest uppercase mr-2">{isFarmer ? "Time" : "Interval"}</span>
            <span className="text-zinc-200 font-mono font-bold">{horizon} {isFarmer ? "Days" : "D"}</span>
          </div>
        </div>

        {/* AI Recommendation Badge */}
        {!isFarmer && (
          <div className="flex items-center space-x-3">
            <span className="text-zinc-500 text-xs font-bold tracking-widest uppercase">AI Signal</span>
            <div className={cn(
              "px-4 py-1.5 rounded-full font-bold text-sm tracking-wide border flex items-center",
              isUp ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
            )}>
              {isUp ? <TrendingUp className="w-4 h-4 mr-2" /> : <TrendingDown className="w-4 h-4 mr-2" />}
              {isUp ? "STRONG BUY" : "SELL/HOLD"}
            </div>
          </div>
        )}
      </motion.div>

      {/* Main Area */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-zinc-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl relative"
      >
        {!isFarmer && (
          <div className="absolute top-6 right-6">
            <div className="flex items-end space-x-4">
              <div className="text-right">
                <p className="text-xs text-zinc-500 font-bold tracking-widest uppercase mb-1">Target Price</p>
                <p className="text-3xl font-mono font-black text-zinc-100">₹{endPrice.toFixed(0)}</p>
              </div>
              <div className={cn(
                "px-3 py-1 rounded-lg text-lg font-mono font-bold flex items-center mb-1",
                isUp ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"
              )}>
                {isUp ? "+" : ""}{percentChange}%
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-xl font-bold text-zinc-100 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-emerald-500" /> 
            {isFarmer ? "What will happen to prices?" : "Price Action & Forecast"}
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            {isFarmer 
              ? `Prices for ${commodity} in ${mandi} are expected to ${isUp ? "increase" : "decrease"} in the next ${horizon} days.` 
              : `${commodity} prices expected to ${isUp ? "rise" : "fall"} by ${Math.abs(percentChange)}% over the next ${horizon} days in ${mandi}.`}
          </p>
        </div>

        {isFarmer ? (
          <div className="flex flex-col items-center justify-center p-8 bg-zinc-950/50 rounded-2xl border border-white/5">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={cn(
                "w-32 h-32 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4",
                isUp ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "bg-red-500/20 border-red-500 text-red-400"
              )}
            >
              {isUp ? <TrendingUp className="w-16 h-16" /> : <TrendingDown className="w-16 h-16" />}
            </motion.div>
            <h3 className="text-4xl font-extrabold text-white mb-2">
              {isUp ? "Prices are going UP" : "Prices are going DOWN"}
            </h3>
            <div className="flex items-center text-3xl font-bold text-zinc-300 mt-4 bg-zinc-900 px-6 py-3 rounded-2xl border border-white/10">
              <IndianRupee className="w-8 h-8 mr-2 text-emerald-500" />
              {endPrice.toFixed(0)} <span className="text-xl text-zinc-500 ml-2">per quintal</span>
            </div>
          </div>
        ) : (
          <div className="w-full bg-zinc-950/50 rounded-2xl p-4 border border-zinc-800">
            <ForecastChart data={data.forecast} />
          </div>
        )}
      </motion.div>

      {/* Metrics Grid (Only for Professional Mode) */}
      {!isFarmer && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Accuracy */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 hover:bg-zinc-900/60 transition-colors group"
          >
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6 flex items-center">
              <Target className="w-4 h-4 mr-2 text-blue-500 group-hover:animate-spin-slow" /> Model Validation
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-xl bg-zinc-950 border border-white/5">
                <span className="font-semibold text-zinc-400 text-sm">Mean Abs. Pct. Error (MAPE)</span>
                <span className="font-mono font-bold text-emerald-400">{(data.accuracy.mape * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-zinc-950 border border-white/5">
                <span className="font-semibold text-zinc-400 text-sm">Root Mean Sq. Error (RMSE)</span>
                <span className="font-mono font-bold text-zinc-200">₹{data.accuracy.rmse.toFixed(0)}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-zinc-950 border border-white/5">
                <span className="font-semibold text-zinc-400 text-sm">Mean Absolute Error (MAE)</span>
                <span className="font-mono font-bold text-zinc-200">₹{data.accuracy.mae.toFixed(0)}</span>
              </div>
            </div>
          </motion.div>

          {/* Weights */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 hover:bg-zinc-900/60 transition-colors"
          >
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6 flex items-center">
              <BarChart3 className="w-4 h-4 mr-2 text-indigo-500" /> Ensemble Configuration
            </h3>
            <div className="space-y-5">
              {Object.entries(data.model_weights).map(([model, weight], index) => (
                <div key={model}>
                  <div className="flex justify-between text-sm font-bold mb-2">
                    <span className="text-zinc-300 uppercase tracking-wide">{model}</span>
                    <span className="text-zinc-100 font-mono">{(weight * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${weight * 100}%` }}
                      transition={{ duration: 1, delay: 0.5 + (index * 0.2) }}
                      className="bg-gradient-to-r from-blue-500 to-indigo-400 h-full rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Forecast;
