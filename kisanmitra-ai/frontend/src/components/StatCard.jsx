import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

const StatCard = ({ title, price, change, isLoading, lastTraded, source, delay = 0 }) => {
  if (isLoading) {
    return (
      <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5 shadow-sm relative overflow-hidden h-40">
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-900/50 via-zinc-800/50 to-zinc-900/50 animate-[loading_2s_infinite_linear] bg-[length:200%_100%]" />
      </div>
    );
  }

  const isUp = change > 0;
  const isNeutral = change === 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="group relative bg-zinc-900/40 backdrop-blur-md rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all overflow-hidden"
    >
      {/* Background Glow */}
      <div className={cn(
        "absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity",
        isUp ? "bg-emerald-500" : isNeutral ? "bg-zinc-500" : "bg-red-500"
      )}></div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xs font-bold tracking-wider uppercase text-zinc-500 flex items-center">
            {title}
            {source === 'agmarknet' && <Activity className="w-3 h-3 ml-2 text-emerald-500 animate-pulse" />}
          </h3>
          <div className={cn(
            "flex items-center text-xs font-bold px-2 py-1 rounded-md border",
            isUp ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : 
            isNeutral ? "bg-zinc-800 text-zinc-400 border-zinc-700" : 
            "bg-red-500/10 text-red-400 border-red-500/20"
          )}>
            {isUp ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : 
             isNeutral ? <Minus className="w-3.5 h-3.5 mr-1" /> : 
             <TrendingDown className="w-3.5 h-3.5 mr-1" />}
            {Math.abs(change)}%
          </div>
        </div>
        
        <div className="flex items-baseline mb-1">
          <span className="text-lg text-zinc-400 font-medium mr-1">₹</span>
          <div className="text-4xl font-black text-zinc-100 tracking-tight font-mono">
            {typeof price === 'number' ? price.toLocaleString() : price}
          </div>
        </div>
        
        <div className="flex items-center text-xs text-zinc-500 font-medium">
          <span>per quintal</span>
          {typeof price === 'number' && (
            <>
              <span className="mx-2">•</span>
              <span className="text-zinc-400">₹{(price / 100).toFixed(2)} / kg</span>
            </>
          )}
        </div>
        
        {/* Trust signal: Last traded price with source */}
        {(lastTraded || source) && (
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
            {lastTraded && (
              <span className="text-[10px] text-zinc-600 font-mono">
                {lastTraded} IST
              </span>
            )}
            {source && (
              <span className="text-[9px] uppercase tracking-widest bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-bold">
                {source}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;
