import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Sprout } from 'lucide-react';
import { getDashboardSummary } from '../utils/api';

const Navbar = () => {
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isStale, setIsStale] = useState(false);

  const fetchTimestamp = async () => {
    try {
      const data = await getDashboardSummary();
      const ts = new Date(data.last_updated);
      setLastUpdated(ts);
      const diffMs = Date.now() - ts.getTime();
      setIsStale(diffMs > 2 * 60 * 60 * 1000); // > 2 hours
    } catch (e) {
      console.error("Navbar poll error:", e);
    }
  };

  useEffect(() => {
    fetchTimestamp();
    const interval = setInterval(fetchTimestamp, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatTimestamp = (d) => {
    if (!d) return "";
    return d.toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata",
    }) + " IST";
  };

  const linkClass = ({ isActive }) =>
    isActive
      ? "text-[#1B6B3A] border-b-2 border-[#1B6B3A] pb-1"
      : "text-gray-500 hover:text-gray-900";

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center shadow-sm flex-shrink-0">
      <div className="flex items-center space-x-2">
        <Sprout className="w-7 h-7 text-[#1B6B3A]" />
        <span className="text-lg font-bold text-gray-900 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>KisanMitra AI</span>
      </div>

      <div className="hidden md:flex space-x-5 text-sm font-medium">
        <NavLink to="/" className={linkClass}>Dashboard</NavLink>
        <NavLink to="/forecast" className={linkClass}>Forecast</NavLink>
        <NavLink to="/alerts" className={linkClass}>Alerts</NavLink>
        <NavLink to="/crop-health" className={linkClass}>Crop Health</NavLink>
        <NavLink to="/farmer-advisory" className={linkClass}>Farmer Advisory</NavLink>
      </div>

      <div className="flex items-center space-x-3">
        {/* Live badge */}
        <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border ${isStale ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-100'}`}>
          <div className={`w-2 h-2 rounded-full animate-pulse ${isStale ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
          <span className={`text-xs font-semibold ${isStale ? 'text-yellow-700' : 'text-green-700'}`}>
            {isStale ? "Updating..." : "Live"}
          </span>
        </div>
        {/* Timestamp */}
        {lastUpdated && (
          <span className="hidden lg:inline text-[10px] text-gray-400 font-medium">
            {formatTimestamp(lastUpdated)}
          </span>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
