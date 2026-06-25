import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { ArrowRight, Activity, CloudRain, Cpu, TrendingUp } from 'lucide-react';

const mockData = [
  { value: 10 }, { value: 25 }, { value: 15 }, { value: 40 }, { value: 30 }, { value: 60 }, { value: 45 }, { value: 80 }
];

const FeatureCard = ({ icon: Icon, title, desc, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 hover:bg-zinc-800/50 transition-colors group relative overflow-hidden"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="bg-zinc-800 p-3 rounded-xl inline-block mb-4 border border-white/5">
      <Icon className="w-6 h-6 text-emerald-400" />
    </div>
    <h3 className="text-lg font-bold text-zinc-100 mb-2">{title}</h3>
    <p className="text-zinc-400 text-sm leading-relaxed">{desc}</p>
  </motion.div>
);

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#09090b] text-white relative overflow-hidden selection:bg-emerald-500/30">
      
      {/* Background Gradients & Grid */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-emerald-500/10 to-transparent blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-blue-500/10 to-transparent blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
        
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-8 tracking-wide"
          >
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            KisanMitra AI Engine v2.0 Live
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight"
          >
            AI-Powered <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-600">Farming Intelligence</span> <br className="hidden md:block"/> for Every Farmer
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto font-medium"
          >
            Predict prices. Monitor crops. Get AI advisories. Increase profits. <br/> The operating system for modern agriculture.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <button 
              onClick={() => navigate('/dashboard')}
              className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-zinc-950 bg-emerald-400 rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <span className="relative flex items-center">
                Start Smart Farming
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </motion.div>
        </div>

        {/* Floating Dashboard Preview (Fake Chart) */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-5xl mx-auto bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl shadow-emerald-500/10 mb-32"
        >
          <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
            </div>
            <div className="text-xs font-mono text-zinc-500 flex items-center">
              <Activity className="w-3 h-3 mr-2" /> Live Market Analytics
            </div>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#34d399" 
                  strokeWidth={3} 
                  dot={false}
                  animationDuration={2000}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard 
            icon={TrendingUp}
            title="AI Price Forecasting"
            desc="Bloomberg-grade predictive models for market commodities."
            delay={0.5}
          />
          <FeatureCard 
            icon={Activity}
            title="Crop Health Monitoring"
            desc="Satellite-driven moisture and vegetation index tracking."
            delay={0.6}
          />
          <FeatureCard 
            icon={CloudRain}
            title="Weather Insights"
            desc="Hyper-local microclimate data and rainfall predictions."
            delay={0.7}
          />
          <FeatureCard 
            icon={Cpu}
            title="AI Farmer Advisory"
            desc="Conversational intelligence for disease prevention & fertilizers."
            delay={0.8}
          />
        </div>

      </div>
    </div>
  );
};

export default Landing;
