import { useState, useEffect } from 'react';
import { MapPin, Calendar, Database, Activity, Server, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { getDashboardSummary } from '../utils/api';
import { cn } from '../lib/utils';

const COMMODITIES = [
  { id: 'onion', name: 'Onion', emoji: '🧅' },
  { id: 'potato', name: 'Potato', emoji: '🥔' },
  { id: 'tomato', name: 'Tomato', emoji: '🍅' },
  { id: 'garlic', name: 'Garlic', emoji: '🧄' },
];

const MANDI_GROUPS = [
  {
    state: 'Maharashtra',
    mandis: [
      { value: 'lasalgaon', label: 'Lasalgaon' },
      { value: 'pune', label: 'Pune' },
      { value: 'nashik', label: 'Nashik' },
    ],
  },
  {
    state: 'Karnataka',
    mandis: [
      { value: 'bangalore', label: 'Bangalore' },
    ],
  },
];

const HORIZONS = [7, 15, 30];

const Sidebar = ({ commodity, setCommodity, mandi, setMandi, horizon, setHorizon }) => {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    getDashboardSummary().then(setSummary).catch(() => {});
  }, []);

  const marketStatus = summary?.market_status || 'closed';

  return (
    <aside className="w-72 bg-zinc-950/80 backdrop-blur-2xl border-r border-white/5 flex flex-col p-5 space-y-8 overflow-y-auto flex-shrink-0 z-40 relative">
      
      {/* Background glow effect */}
      <div className="absolute top-0 left-0 w-full h-64 bg-emerald-500/5 blur-[100px] pointer-events-none"></div>

      {/* Commodities */}
      <div className="relative z-10">
        <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-3 flex items-center">
          <Database className="w-3 h-3 mr-2" /> Target Commodity
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {COMMODITIES.map((c) => {
            const isActive = commodity === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setCommodity(c.id)}
                className={cn(
                  "relative flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 border",
                  isActive 
                    ? "bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                    : "bg-zinc-900 border-white/5 hover:border-white/10 hover:bg-zinc-800"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="commodity-active"
                    className="absolute inset-0 rounded-xl bg-emerald-500/5"
                  />
                )}
                <span className="text-2xl mb-1 filter drop-shadow-md">{c.emoji}</span>
                <span className={cn(
                  "text-xs font-semibold z-10",
                  isActive ? "text-emerald-400" : "text-zinc-400"
                )}>{c.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Market Selector */}
      <div className="relative z-10">
        <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-3 flex items-center">
          <MapPin className="w-3 h-3 mr-2" /> Primary Market
        </h3>
        <div className="relative group">
          <select
            value={mandi}
            onChange={(e) => setMandi(e.target.value)}
            className="w-full appearance-none bg-zinc-900 border border-white/5 rounded-xl p-3 text-sm font-medium text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all cursor-pointer group-hover:border-white/10"
          >
            {MANDI_GROUPS.map((group) => (
              <optgroup key={group.state} label={group.state} className="bg-zinc-900 text-zinc-400">
                {group.mandis.map((m) => (
                  <option key={m.value} value={m.value} className="text-zinc-100">
                    {m.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-zinc-500">
            ▼
          </div>
        </div>
      </div>

      {/* Forecast Horizon */}
      <div className="relative z-10">
        <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-3 flex items-center">
          <Calendar className="w-3 h-3 mr-2" /> Predictive Horizon
        </h3>
        <div className="flex bg-zinc-900 p-1 rounded-xl border border-white/5">
          {HORIZONS.map((h) => {
            const isActive = horizon === h;
            return (
              <button
                key={h}
                onClick={() => setHorizon(h)}
                className={cn(
                  "relative flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors z-10",
                  isActive ? "text-zinc-950" : "text-zinc-400 hover:text-zinc-200"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="horizon-active"
                    className="absolute inset-0 bg-emerald-400 rounded-lg -z-10 shadow-[0_0_10px_rgba(52,211,153,0.3)]"
                  />
                )}
                {h}d
              </button>
            )
          })}
        </div>
      </div>

      {/* Node Status */}
      <div className="mt-auto relative z-10">
        <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4">
          <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-4 flex items-center">
            <Server className="w-3 h-3 mr-2" /> Node Status
          </h4>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-zinc-400 flex items-center"><Activity className="w-3 h-3 mr-1.5" /> Market API</span>
              <span className={cn("text-[10px] font-mono px-1.5 py-0.5 rounded", marketStatus === 'open' ? "bg-emerald-500/10 text-emerald-400" : "bg-orange-500/10 text-orange-400")}>
                {marketStatus.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-zinc-400 flex items-center"><Zap className="w-3 h-3 mr-1.5" /> Inference Engine</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                ONLINE
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
