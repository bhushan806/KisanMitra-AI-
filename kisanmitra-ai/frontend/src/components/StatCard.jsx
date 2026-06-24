import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatCard = ({ title, price, change, isLoading, lastTraded, source }) => {
  if (isLoading) {
    return <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 animate-pulse h-36"></div>;
  }

  const isUp = change > 0;
  const isNeutral = change === 0;

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
      <h3 className="text-sm font-semibold text-gray-500 mb-2">{title}</h3>
      <div className="flex items-end justify-between">
        <div className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          ₹{typeof price === 'number' ? price.toLocaleString() : price}
        </div>
        <div className={`flex items-center text-sm font-bold px-2 py-1 rounded-md ${isUp ? 'bg-green-50 text-green-700' : isNeutral ? 'bg-gray-100 text-gray-600' : 'bg-red-50 text-red-700'}`}>
          {isUp ? <TrendingUp className="w-4 h-4 mr-1" /> : isNeutral ? <Minus className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
          {Math.abs(change)}%
        </div>
      </div>
      <div className="text-xs text-gray-400 mt-2 font-medium">per quintal</div>
      {/* Trust signal: Last traded price with source */}
      {(lastTraded || source) && (
        <div className="mt-2 pt-2 border-t border-gray-50 flex items-center flex-wrap gap-1">
          {lastTraded && (
            <span className="text-[10px] text-gray-400">Last traded: ₹{typeof price === 'number' ? price.toLocaleString() : price} · {lastTraded} IST</span>
          )}
          {source && (
            <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-medium">{source}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;
