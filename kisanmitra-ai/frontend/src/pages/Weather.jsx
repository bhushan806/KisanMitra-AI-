import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CloudRain, Wind, Thermometer, Droplets, CloudLightning, Sun } from 'lucide-react';
import { cn } from '../lib/utils';
import { useSettings } from '../contexts/SettingsContext';

const Weather = () => {
  const [loading, setLoading] = useState(true);
  const { mode } = useSettings();
  const isFarmer = mode === 'farmer';

  useEffect(() => {
    // Simulate fetching weather data
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return (
    <div className="w-full h-[600px] bg-white shadow-sm rounded-3xl border border-gray-200 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-900/50 via-zinc-800/50 to-zinc-900/50 animate-[loading_2s_infinite_linear] bg-[length:200%_100%]" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            {isFarmer ? "My Weather" : "Weather Intelligence"}
          </h1>
          <p className="text-gray-500 mt-1 font-medium">
            {isFarmer ? "Weather for Lasalgaon" : "Hyper-local microclimate data & predictions"}
          </p>
        </div>
        <div className="text-right">
          {!isFarmer && <p className="text-xs text-zinc-600 font-mono mb-1">STATION ID: IN-MH-01</p>}
          <div className={cn(
            "inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold border",
            isFarmer ? "bg-gray-100 text-gray-700 border-gray-300" : "bg-blue-500/10 text-blue-400 border-blue-500/20"
          )}>
            <CloudRain className="w-4 h-4 mr-2" />
            {isFarmer ? "It might rain today" : "Monsoon Active"}
          </div>
        </div>
      </div>

      {/* Hero Weather Widget */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-900 to-zinc-950 border border-gray-200 p-8 shadow-2xl"
      >
        <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
          <CloudLightning className="w-64 h-64 text-blue-400" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <h2 className="text-xl font-bold text-blue-100 mb-1">{isFarmer ? "Today's Weather" : "Lasalgaon, MH"}</h2>
            <p className="text-sm text-blue-300 font-medium mb-6">
              {isFarmer ? "Cloudy with chance of rain" : "Partly Cloudy • Severe Thunderstorm Warning"}
            </p>
            
            <div className="flex items-baseline space-x-2">
              <span className="text-7xl font-black text-gray-900 tracking-tighter">28°</span>
              <span className="text-2xl font-bold text-blue-400">C</span>
            </div>
            <p className="text-sm text-blue-300 font-medium mt-2">
              {isFarmer ? "It will feel a bit hot" : "Feels like 31°C • High 32° / Low 24°"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
            {isFarmer ? (
              <>
                <div className="bg-white/5  rounded-2xl p-6 border border-gray-200 text-center flex flex-col items-center justify-center">
                  <CloudRain className="w-8 h-8 text-blue-300 mb-2" />
                  <span className="text-lg font-bold text-gray-900">Rain Expected</span>
                </div>
                <div className="bg-white/5  rounded-2xl p-6 border border-gray-200 text-center flex flex-col items-center justify-center">
                  <Wind className="w-8 h-8 text-blue-300 mb-2" />
                  <span className="text-lg font-bold text-gray-900">Normal Wind</span>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white/5  rounded-2xl p-4 border border-gray-200">
                  <div className="flex items-center text-blue-300 mb-2">
                    <Droplets className="w-4 h-4 mr-2" />
                    <span className="text-xs font-bold uppercase tracking-widest">Humidity</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">78%</span>
                </div>
                
                <div className="bg-white/5  rounded-2xl p-4 border border-gray-200">
                  <div className="flex items-center text-blue-300 mb-2">
                    <Wind className="w-4 h-4 mr-2" />
                    <span className="text-xs font-bold uppercase tracking-widest">Wind</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">14 <span className="text-sm text-blue-300">km/h</span></span>
                </div>
                
                <div className="bg-white/5  rounded-2xl p-4 border border-gray-200">
                  <div className="flex items-center text-blue-300 mb-2">
                    <CloudRain className="w-4 h-4 mr-2" />
                    <span className="text-xs font-bold uppercase tracking-widest">Precipitation</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">45 <span className="text-sm text-blue-300">mm</span></span>
                </div>
                
                <div className="bg-white/5  rounded-2xl p-4 border border-gray-200">
                  <div className="flex items-center text-blue-300 mb-2">
                    <Thermometer className="w-4 h-4 mr-2" />
                    <span className="text-xs font-bold uppercase tracking-widest">Pressure</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">1008 <span className="text-sm text-blue-300">hPa</span></span>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* 7-Day Forecast */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <CalendarDaysIcon className="w-5 h-5 mr-2 text-gray-500" />
          {isFarmer ? "Next 7 Days" : "7-Day Trajectory"}
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
          {[
            { day: 'Mon', temp: 29, icon: Sun },
            { day: 'Tue', temp: 30, icon: Sun },
            { day: 'Wed', temp: 28, icon: CloudRain },
            { day: 'Thu', temp: 26, icon: CloudLightning },
            { day: 'Fri', temp: 27, icon: CloudRain },
            { day: 'Sat', temp: 29, icon: Sun },
            { day: 'Sun', temp: 31, icon: Sun },
          ].map((d) => (
            <div key={d.day} className="bg-white shadow-sm  border border-gray-200 rounded-2xl p-4 flex flex-col items-center hover:bg-gray-100 transition-colors">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{d.day}</span>
              <d.icon className={cn("w-8 h-8 mb-3", d.icon === Sun ? "text-yellow-500" : d.icon === CloudLightning ? "text-red-400" : "text-blue-400")} />
              <span className="text-lg font-bold text-gray-900">{d.temp}°</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

function CalendarDaysIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />
      <path d="M8 18h.01" />
      <path d="M12 18h.01" />
      <path d="M16 18h.01" />
    </svg>
  )
}

export default Weather;
