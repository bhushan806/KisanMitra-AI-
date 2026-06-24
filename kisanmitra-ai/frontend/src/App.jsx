import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Forecast from './pages/Forecast';
import Alerts from './pages/Alerts';
import CropHealth from './pages/CropHealth';
import FarmerAdvisory from './pages/FarmerAdvisory';

import { getDashboardSummary } from './utils/api';

const DataSourceStrip = () => {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    getDashboardSummary().then(setSummary).catch(console.error);
  }, []);

  return (
    <div className="bg-[#F0FDF4] border-b border-green-200 px-4 py-1.5 text-center flex-shrink-0">
      <p className="text-[11px] text-green-800 font-medium flex items-center justify-center">
        <span className="mr-1">📡</span> Data sourced from:{' '}
        <a href="https://agmarknet.gov.in" target="_blank" rel="noopener noreferrer" className="underline decoration-green-300 hover:text-green-600 mx-1">Agmarknet (data.gov.in)</a> ·
        <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer" className="underline decoration-green-300 hover:text-green-600 mx-1">Open-Meteo Weather API</a> ·
        <a href="https://modis.gsfc.nasa.gov" target="_blank" rel="noopener noreferrer" className="underline decoration-green-300 hover:text-green-600 mx-1">NASA MODIS Satellite</a> ·
        <a href="https://www.digitalapmc.com" target="_blank" rel="noopener noreferrer" className="underline decoration-green-300 hover:text-green-600 mx-1">APMC Market Records</a>
        
        {summary && (
          <span className="ml-3 pl-3 border-l border-green-300 inline-block font-bold">
            {summary.live_data_active 
              ? `✅ Agmarknet Live Feed Active — ${summary.real_data_coverage}`
              : `⚠️ Using historical synthetic data — connect API for live feed`}
          </span>
        )}
      </p>
    </div>
  );
};

function App() {
  const [commodity, setCommodity] = useState('onion');
  const [mandi, setMandi] = useState('lasalgaon');
  const [horizon, setHorizon] = useState(7);

  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#F8FAF5' }}>
        <Sidebar
          commodity={commodity} setCommodity={setCommodity}
          mandi={mandi} setMandi={setMandi}
          horizon={horizon} setHorizon={setHorizon}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          <DataSourceStrip />
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-6" style={{ backgroundColor: '#F8FAF5' }}>
            <Routes>
              <Route path="/" element={<Dashboard commodity={commodity} mandi={mandi} horizon={horizon} />} />
              <Route path="/forecast" element={<Forecast commodity={commodity} mandi={mandi} horizon={horizon} />} />
              <Route path="/alerts" element={<Alerts commodity={commodity} mandi={mandi} />} />
              <Route path="/crop-health" element={<CropHealth mandi={mandi} />} />
              <Route path="/farmer-advisory" element={<FarmerAdvisory commodity={commodity} mandi={mandi} />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
