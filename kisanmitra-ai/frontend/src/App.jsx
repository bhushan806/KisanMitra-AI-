import { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import VoiceAssistant from './components/VoiceAssistant';
import { motion, AnimatePresence } from 'framer-motion';
import { getDashboardSummary } from './utils/api';

// Lazy loading components for performance optimization
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Forecast = lazy(() => import('./pages/Forecast'));
const Alerts = lazy(() => import('./pages/Alerts'));
const CropHealth = lazy(() => import('./pages/CropHealth'));
const FarmerAdvisory = lazy(() => import('./pages/FarmerAdvisory'));
const Landing = lazy(() => import('./pages/Landing'));
const Weather = lazy(() => import('./pages/Weather'));

const DataSourceStrip = () => {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    getDashboardSummary().then(setSummary).catch(console.error);
  }, []);

  return (
    <div className="bg-emerald-900/5 backdrop-blur-sm border-b border-emerald-900/10 px-6 py-2 flex-shrink-0 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] animate-[loading_3s_infinite_linear]"></div>
      <p className="text-[11px] text-slate-600 font-medium flex items-center justify-center tracking-wide">
        <span className="mr-2">📡</span> Data Partners:{' '}
        <a href="https://agmarknet.gov.in" target="_blank" rel="noopener noreferrer" className="mx-2 hover:text-teal-600 font-semibold transition-colors">Agmarknet (Gov.in)</a> ·
        <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer" className="mx-2 hover:text-teal-600 font-semibold transition-colors">Open-Meteo API</a> ·
        <a href="https://modis.gsfc.nasa.gov" target="_blank" rel="noopener noreferrer" className="mx-2 hover:text-teal-600 font-semibold transition-colors">NASA MODIS</a>
        
        {summary && (
          <span className="ml-4 pl-4 border-l border-slate-300 inline-block font-bold">
            {summary.live_data_active 
              ? <span className="text-emerald-700">✓ Live Feed Active — {summary.real_data_coverage}</span>
              : <span className="text-orange-600">⚠️ Using historical synthetic data — API Down</span>}
          </span>
        )}
      </p>
    </div>
  );
};

// Loading Fallback (Skeleton)
const PageLoader = () => (
  <div className="w-full h-full flex flex-col space-y-6 p-4">
    <div className="skeleton-box h-32 w-full"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="skeleton-box h-64 w-full"></div>
      <div className="skeleton-box h-64 w-full"></div>
    </div>
  </div>
);

function App() {
  const [commodity, setCommodity] = useState('onion');
  const [mandi, setMandi] = useState('lasalgaon');
  const [horizon, setHorizon] = useState(7);

  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden bg-background text-foreground selection:bg-primary/30">
        <Routes>
          <Route path="/" element={
            <Suspense fallback={<PageLoader />}><Landing /></Suspense>
          } />
          
          {/* Dashboard Application Layout */}
          <Route path="/*" element={
            <div className="flex w-full h-full overflow-hidden">
              <Sidebar
                commodity={commodity} setCommodity={setCommodity}
                mandi={mandi} setMandi={setMandi}
                horizon={horizon} setHorizon={setHorizon}
              />
              <div className="flex-1 flex flex-col overflow-hidden relative">
                <Navbar />
                
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-8 relative scroll-smooth">
                  <div className="max-w-[1600px] mx-auto w-full h-full">
                    <AnimatePresence mode="wait">
                      <Suspense fallback={<PageLoader />}>
                        <Routes>
                          <Route path="/dashboard" element={<Dashboard commodity={commodity} mandi={mandi} horizon={horizon} />} />
                          <Route path="/forecast" element={<Forecast commodity={commodity} mandi={mandi} horizon={horizon} />} />
                          <Route path="/alerts" element={<Alerts commodity={commodity} mandi={mandi} />} />
                          <Route path="/weather" element={<Weather />} />
                          <Route path="/crop-health" element={<CropHealth mandi={mandi} />} />
                          <Route path="/farmer-advisory" element={<FarmerAdvisory commodity={commodity} mandi={mandi} />} />
                        </Routes>
                      </Suspense>
                    </AnimatePresence>
                  </div>
                </main>
              </div>
              <VoiceAssistant />
            </div>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
