import React, { useState, useEffect } from 'react';
import { MapPin, Calendar } from 'lucide-react';
import { getDashboardSummary } from '../utils/api';

const COMMODITIES = [
  { id: 'onion', name: 'Onion', emoji: '🧅' },
  { id: 'potato', name: 'Potato', emoji: '🥔' },
  { id: 'tomato', name: 'Tomato', emoji: '🍅' },
  { id: 'garlic', name: 'Garlic', emoji: '🧄' },
  { id: 'cauliflower', name: 'Cauliflower', emoji: '🥦' },
  { id: 'green_chilli', name: 'Green Chilli', emoji: '🌶️' },
  { id: 'brinjal', name: 'Brinjal', emoji: '🍆' },
  { id: 'cabbage', name: 'Cabbage', emoji: '🥬' },
];

const MANDI_GROUPS = [
  {
    state: 'Maharashtra',
    mandis: [
      { value: 'lasalgaon', label: 'Lasalgaon' },
      { value: 'pune', label: 'Pune' },
      { value: 'nashik', label: 'Nashik' },
      { value: 'kolhapur', label: 'Kolhapur' },
    ],
  },
  {
    state: 'Uttar Pradesh',
    mandis: [
      { value: 'agra', label: 'Agra' },
      { value: 'kanpur', label: 'Kanpur' },
      { value: 'lucknow', label: 'Lucknow' },
    ],
  },
  {
    state: 'Karnataka',
    mandis: [
      { value: 'bangalore', label: 'Bangalore' },
      { value: 'mysore', label: 'Mysore' },
      { value: 'hubli', label: 'Hubli' },
    ],
  },
  {
    state: 'Rajasthan',
    mandis: [{ value: 'jaipur', label: 'Jaipur' }],
  },
  {
    state: 'Gujarat',
    mandis: [{ value: 'ahmedabad', label: 'Ahmedabad' }],
  },
];

const HORIZONS = [7, 15, 30];

const Sidebar = ({ commodity, setCommodity, mandi, setMandi, horizon, setHorizon }) => {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    getDashboardSummary().then(setSummary).catch(() => {});
    const interval = setInterval(() => {
      getDashboardSummary().then(setSummary).catch(() => {});
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Market status helpers
  const marketStatus = summary?.market_status || 'closed';
  const freshness = summary?.data_freshness || {};

  const getMarketIcon = () => {
    if (marketStatus === 'open') return '🟢';
    if (marketStatus === 'pre-market') return '🟡';
    return '🔴';
  };
  const getMarketLabel = () => {
    if (marketStatus === 'open') return 'Market Open';
    if (marketStatus === 'pre-market') return 'Pre-Market';
    return 'Market Closed';
  };
  const getNextEvent = () => {
    const now = new Date();
    const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const h = ist.getHours();
    if (h >= 9 && h < 18) {
      const mins = (18 - h) * 60 - ist.getMinutes();
      return `Closes in ${Math.floor(mins / 60)}h ${mins % 60}m`;
    }
    if (h >= 7 && h < 9) {
      const mins = (9 - h) * 60 - ist.getMinutes();
      return `Opens in ${Math.floor(mins / 60)}h ${mins % 60}m`;
    }
    // After 18:00 or before 07:00
    const minsToOpen = h >= 18 ? (24 - h + 9) * 60 - ist.getMinutes() : (9 - h) * 60 - ist.getMinutes();
    return `Opens in ${Math.floor(minsToOpen / 60)}h ${minsToOpen % 60}m`;
  };

  const getFreshnessDot = (mandiVal) => {
    const f = freshness[mandiVal];
    if (!f) return 'bg-gray-300';
    if (f.hours_ago < 24) return 'bg-green-500';
    if (f.hours_ago < 48) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const selectedFreshness = freshness[mandi];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 shadow-sm flex flex-col p-5 space-y-5 overflow-y-auto flex-shrink-0">
      {/* Commodities */}
      <div>
        <h3 className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-3">Commodity</h3>
        <div className="space-y-1">
          {COMMODITIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCommodity(c.id)}
              className={`w-full flex items-center p-2.5 rounded-xl transition-all duration-200 text-sm ${
                commodity === c.id
                  ? 'bg-green-50 border border-green-200 text-green-800 shadow-sm'
                  : 'hover:bg-gray-50 text-gray-700 border border-transparent'
              }`}
            >
              <span className="text-lg mr-2">{c.emoji}</span>
              <span className="font-semibold">{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mandi dropdown grouped by state */}
      <div>
        <h3 className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-3 flex items-center">
          <MapPin className="w-3 h-3 mr-1" /> Mandi / Market
        </h3>
        <select
          value={mandi}
          onChange={(e) => setMandi(e.target.value)}
          className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-400/50"
        >
          {MANDI_GROUPS.map((group) => (
            <optgroup key={group.state} label={`── ${group.state}`}>
              {group.mandis.map((m) => (
                <option key={m.value} value={m.value}>
                  {freshness[m.value]?.hours_ago < 24 ? '● ' : freshness[m.value]?.hours_ago < 48 ? '◐ ' : '○ '}
                  {m.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        {selectedFreshness && (
          <p className="text-[10px] text-gray-400 mt-1.5 flex items-center">
            <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${getFreshnessDot(mandi)}`}></span>
            {mandi.charAt(0).toUpperCase() + mandi.slice(1)} data: Updated {selectedFreshness.hours_ago}h ago
          </p>
        )}
      </div>

      {/* Horizon */}
      <div>
        <h3 className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-3 flex items-center">
          <Calendar className="w-3 h-3 mr-1" /> Forecast Horizon
        </h3>
        <div className="flex space-x-2">
          {HORIZONS.map((h) => (
            <button
              key={h}
              onClick={() => setHorizon(h)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                horizon === h
                  ? 'bg-[#1B6B3A] text-white border-[#1B6B3A] shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {h} Days
            </button>
          ))}
        </div>
      </div>

      {/* Market Status */}
      <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-semibold text-gray-800">{getMarketIcon()} {getMarketLabel()}</span>
        </div>
        <p className="text-[10px] text-gray-400">{getNextEvent()}</p>
      </div>

      {/* System Status */}
      <div className="mt-auto bg-amber-50 rounded-xl p-3 border border-amber-100">
        <h4 className="text-[10px] font-bold text-amber-800 uppercase mb-0.5">System Status</h4>
        <p className="text-xs text-amber-700">Models synced successfully.</p>
      </div>
    </aside>
  );
};

export default Sidebar;
