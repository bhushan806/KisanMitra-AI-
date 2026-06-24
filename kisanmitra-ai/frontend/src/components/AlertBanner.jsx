import React from 'react';
import { AlertTriangle, TrendingUp } from 'lucide-react';

const AlertBanner = ({ alert }) => {
  const { commodity, mandi, alert_level, trigger_price, avg_price, forecast_date } = alert;
  
  const isCritical = alert_level === 'CRITICAL';
  const isHigh = alert_level === 'HIGH';
  
  const colorClass = isCritical 
    ? 'bg-red-50 border-red-200 text-red-800' 
    : isHigh 
      ? 'bg-orange-50 border-orange-200 text-orange-800'
      : 'bg-yellow-50 border-yellow-200 text-yellow-800';
      
  const badgeClass = isCritical ? 'bg-red-600 text-white pulse-ring' : isHigh ? 'bg-orange-500 text-white' : 'bg-yellow-500 text-white';
  
  const devPct = (((trigger_price - avg_price) / avg_price) * 100).toFixed(1);

  return (
    <div className={`flex items-center p-4 rounded-xl border ${colorClass} mb-3 shadow-sm transition-transform hover:scale-[1.01]`}>
      <div className="flex-shrink-0 mr-4">
        <div className={`p-2 rounded-full ${badgeClass}`}>
          <AlertTriangle className="w-5 h-5" />
        </div>
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-lg capitalize">{commodity} in {mandi}</h4>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${badgeClass}`}>{alert_level}</span>
        </div>
        <div className="mt-1 flex items-center text-sm opacity-90 font-medium">
          <TrendingUp className="w-4 h-4 mr-1" />
          Predicted to hit <span className="font-mono font-bold mx-1">₹{trigger_price}</span> by {new Date(forecast_date).toLocaleDateString()}
          <span className="ml-2 px-2 py-0.5 rounded bg-white/50 text-xs border border-white/50">+{devPct}% vs Avg (₹{avg_price})</span>
        </div>
      </div>
    </div>
  );
};

export default AlertBanner;
